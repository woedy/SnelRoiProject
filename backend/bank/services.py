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
        defaults={'customer': profile, 'type': 'SYSTEM', 'currency': 'GHS', 'status': 'ACTIVE'},
    )
    payout, _ = Account.objects.get_or_create(
        account_number=settings.PAYOUT_ACCOUNT_NUMBER,
        defaults={'customer': profile, 'type': 'SYSTEM', 'currency': 'GHS', 'status': 'ACTIVE'},
    )
    return funding, payout


def create_customer_account(user, account_type='CHECKING'):
    profile, _ = CustomerProfile.objects.get_or_create(
        user=user,
        defaults={'full_name': user.get_full_name() or user.username, 'phone': ''},
    )
    account_number = f"ACCT-{user.id:06d}-{account_type[:2]}"
    account, _ = Account.objects.get_or_create(
        customer=profile,
        type=account_type,
        defaults={'account_number': account_number, 'currency': 'GHS'},
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
