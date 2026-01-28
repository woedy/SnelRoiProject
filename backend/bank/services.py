import uuid
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from .models import Account, CustomerProfile, LedgerEntry, LedgerPosting

User = get_user_model()


def generate_reference():
    return uuid.uuid4().hex[:12].upper()


def get_system_user():
    user, _ = User.objects.get_or_create(
        username='system',
        defaults={'email': settings.SYSTEM_USER_EMAIL, 'is_staff': True, 'is_superuser': False},
    )
    return user


def get_system_accounts():
    system_user = get_system_user()
    profile, _ = CustomerProfile.objects.get_or_create(
        user=system_user,
        defaults={'full_name': 'System Account', 'phone': ''},
    )
    funding, _ = Account.objects.get_or_create(
        account_number=settings.SYSTEM_ACCOUNT_NUMBER,
        defaults={'customer': profile, 'type': 'SYSTEM', 'currency': 'USD', 'status': 'ACTIVE'},
    )
    payout, _ = Account.objects.get_or_create(
        account_number=settings.PAYOUT_ACCOUNT_NUMBER,
        defaults={'customer': profile, 'type': 'SYSTEM', 'currency': 'USD', 'status': 'ACTIVE'},
    )
    return funding, payout


def create_customer_account(user, account_type='CHECKING', currency='USD'):
    profile, _ = CustomerProfile.objects.get_or_create(
        user=user,
        defaults={'full_name': user.get_full_name() or user.username, 'phone': ''},
    )
    account_number = f"ACCT-{user.id:06d}-{account_type[:2]}"
    account, _ = Account.objects.get_or_create(
        customer=profile,
        type=account_type,
        defaults={'account_number': account_number, 'currency': currency},
    )
    return account


def create_entry(entry_type, created_by, memo=''):
    return LedgerEntry.objects.create(
        reference=generate_reference(),
        entry_type=entry_type,
        created_by=created_by,
        memo=memo,
    )


def add_posting(entry, account, direction, amount, description=''):
    LedgerPosting.objects.create(
        entry=entry,
        account=account,
        direction=direction,
        amount=Decimal(amount),
        description=description,
    )


def approve_entry(entry, approver):
    with transaction.atomic():
        entry.status = 'POSTED'
        entry.approved_by = approver
        entry.approved_at = timezone.now()
        entry.save(update_fields=['status', 'approved_by', 'approved_at'])


def decline_entry(entry, approver):
    entry.status = 'DECLINED'
    entry.approved_by = approver
    entry.approved_at = timezone.now()
    entry.save(update_fields=['status', 'approved_by', 'approved_at'])


def create_external_transfer(user, amount, memo, recipient_details, fee):
    """Create an external transfer transaction"""
    from django.conf import settings
    from decimal import Decimal
    
    # Get user's primary account
    profile = user.profile
    source_account = Account.objects.filter(
        customer=profile,
        type='CHECKING',
        status='ACTIVE'
    ).first()
    
    if not source_account:
        raise ValueError('No active checking account found or account is frozen. Please contact customer care.')
    
    # Check sufficient balance (amount + fee)
    total_amount = Decimal(str(amount)) + Decimal(str(fee))
    if Decimal(str(source_account.balance())) < total_amount:
        raise ValueError('Insufficient balance')
    
    # Create external transfer transaction
    reference = f"EXT-{timezone.now().strftime('%Y%m%d%H%M%S')}"
    
    entry = create_entry('EXTERNAL_TRANSFER', user, memo=memo or f"External transfer to {recipient_details['recipientName']} - {recipient_details['bankName']}")
    
    # Create postings
    # Debit user account (amount + fee)
    add_posting(entry, source_account, 'DEBIT', total_amount, f"External transfer to {recipient_details['recipientName']}")
    
    # Credit system account (amount only, fee goes to revenue)
    system_account = Account.objects.get(account_number=settings.SYSTEM_ACCOUNT_NUMBER)
    add_posting(entry, system_account, 'CREDIT', Decimal(str(amount)), f"External transfer from {source_account.account_number}")
    
    # Store external transfer metadata
    entry.external_data = {
        'recipient_details': recipient_details,
        'fee': float(fee),
        'total_amount': float(total_amount),
        'source_account': source_account.account_number
    }
    entry.save()
    
    return entry
