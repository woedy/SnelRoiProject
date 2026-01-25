from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from celery import shared_task
from django.contrib.auth import get_user_model

User = get_user_model()

@shared_task
def send_welcome_email(user_id, password):
    """Notify a manually created user of their new account and temporary password."""
    try:
        user = User.objects.get(id=user_id)
        subject = 'Welcome to SnelROI'
        
        context = {
            'user': user,
            'password': password,
        }
        
        html_message = render_to_string('emails/welcome.html', context)
        plain_message = strip_tags(html_message)
        
        print(f"Sending welcome email to {user.email}")
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
            html_message=html_message
        )
    except User.DoesNotExist:
        print(f"User {user_id} not found for welcome email")

@shared_task
def send_crypto_approval_email(crypto_deposit_id):
    """Notify user that their crypto deposit has been approved and funded."""
    from .models import CryptoDeposit
    try:
        crypto_deposit = CryptoDeposit.objects.get(id=crypto_deposit_id)
        user = crypto_deposit.customer.user
        subject = 'Crypto Deposit Approved'
        
        context = {
            'user': user,
            'amount_usd': crypto_deposit.amount_usd,
            'wallet_type': crypto_deposit.crypto_wallet.get_crypto_type_display(),
        }
        
        html_message = render_to_string('emails/crypto_deposit_approved.html', context)
        plain_message = strip_tags(html_message)

        print(f"Sending crypto approval email to {user.email}")
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
            html_message=html_message
        )
    except CryptoDeposit.DoesNotExist:
        print(f"CryptoDeposit {crypto_deposit_id} not found")

@shared_task
def send_crypto_rejection_email(crypto_deposit_id, notes=''):
    """Notify user that their crypto deposit was rejected."""
    from .models import CryptoDeposit
    try:
        crypto_deposit = CryptoDeposit.objects.get(id=crypto_deposit_id)
        user = crypto_deposit.customer.user
        subject = 'Crypto Deposit Rejected'
        
        context = {
            'user': user,
            'amount_usd': crypto_deposit.amount_usd,
            'wallet_type': crypto_deposit.crypto_wallet.get_crypto_type_display(),
            'notes': notes
        }
        
        html_message = render_to_string('emails/crypto_deposit_rejected.html', context)
        plain_message = strip_tags(html_message)

        print(f"Sending crypto rejection email to {user.email}")
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
            html_message=html_message
        )
    except CryptoDeposit.DoesNotExist:
        print(f"CryptoDeposit {crypto_deposit_id} not found")

@shared_task
def send_transfer_received_email(to_user_id, amount, from_desc, memo=''):
    """Notify recipient of incoming funds."""
    try:
        to_user = User.objects.get(id=to_user_id)
        subject = 'Funds Received'
        
        context = {
            'user': to_user,
            'amount': amount,
            'from_desc': from_desc,
            'memo': memo
        }
        
        html_message = render_to_string('emails/transfer_received.html', context)
        plain_message = strip_tags(html_message)

        print(f"Sending transfer receipt email to {to_user.email}")
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [to_user.email],
            fail_silently=False,
            html_message=html_message
        )
    except User.DoesNotExist:
        print(f"User {to_user_id} not found for transfer receipt")

@shared_task
def send_account_status_email(account_id, status, reference=None):
    """Notify user of account status changes (Frozen/Active)."""
    from .models import Account
    try:
        account = Account.objects.get(id=account_id)
        user = account.customer.user
        
        if status.upper() == 'FROZEN':
            subject = 'Important Information Regarding Your Account'
            template = 'emails/account_frozen.html'
        else:
            subject = f'Account {status.capitalize()}'
            template = 'emails/account_active.html'
            
        context = {
            'user': user,
            'account_number': account.account_number,
            'reference': reference
        }
        
        html_message = render_to_string(template, context)
        plain_message = strip_tags(html_message)

        print(f"Sending account {status} status email to {user.email}")
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
            html_message=html_message
        )
    except Account.DoesNotExist:
        print(f"Account {account_id} not found for status email")

@shared_task
def send_verification_email(user_id, code):
    """Notify user of their account verification code."""
    try:
        user = User.objects.get(id=user_id)
        subject = 'Verify your SnelROI account'
        
        context = {
            'user': user,
            'code': code
        }
        
        html_message = render_to_string('emails/verification_code.html', context)
        plain_message = strip_tags(html_message)
        
        print(f"Sending verification email to {user.email}")
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
            html_message=html_message
        )
    except User.DoesNotExist:
        print(f"User {user_id} not found for verification email")

@shared_task
def send_password_reset_email(user_id, code):
    """Notify user of their password reset code."""
    try:
        user = User.objects.get(id=user_id)
        subject = 'Reset your SnelROI password'
        
        context = {
            'user': user,
            'code': code
        }
        
        html_message = render_to_string('emails/password_reset_code.html', context)
        plain_message = strip_tags(html_message)
        
        print(f"Sending password reset email to {user.email}")
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
            html_message=html_message
        )
    except User.DoesNotExist:
        print(f"User {user_id} not found for password reset email")

@shared_task
def send_transaction_status_email(entry_id, status):
    """Notify user of general transaction approval or decline (Transfer, Withdrawal, etc.)."""
    from .models import LedgerEntry
    try:
        entry = LedgerEntry.objects.get(id=entry_id)
        # Find the user associated with this entry (usually from a debit posting for transfers/withdrawals)
        posting = entry.postings.filter(direction='DEBIT').first()
        if not posting:
            # Fallback to any posting if no debit found (e.g. specialized entries)
            posting = entry.postings.first()
        
        if not posting:
            print(f"Cannot determine recipient for entry {entry_id}")
            return
            
        user = posting.account.customer.user
        subject = f'Transaction {status.capitalize()}'
        
        context = {
            'user': user,
            'status': status.upper(),
            'entry_type': entry.entry_type.replace('_', ' ').title(),
            'reference': entry.reference,
            'amount': posting.amount
        }
        
        html_message = render_to_string('emails/transaction_status.html', context)
        plain_message = strip_tags(html_message)

        print(f"Sending transaction {status} email to {user.email}")
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
            html_message=html_message
        )
    except LedgerEntry.DoesNotExist:
        print(f"LedgerEntry {entry_id} not found for status email")
