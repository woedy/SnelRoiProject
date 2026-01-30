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

# ============ Notification Services ============

def create_notification(customer, notification_type, title, message, priority='MEDIUM', action_url='', metadata=None):
    """Create a notification for a customer"""
    from .models import Notification
    
    if metadata is None:
        metadata = {}
    
    notification = Notification.objects.create(
        customer=customer,
        notification_type=notification_type,
        priority=priority,
        title=title,
        message=message,
        action_url=action_url,
        metadata=metadata
    )
    
    # Send real-time notification via WebSocket
    send_realtime_notification(customer.user.id, notification)
    
    return notification


def send_realtime_notification(user_id, notification):
    """Send real-time notification via WebSocket"""
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    from .serializers import NotificationSerializer
    
    channel_layer = get_channel_layer()
    if channel_layer:
        # Send to user's notification channel
        async_to_sync(channel_layer.group_send)(
            f'notifications_{user_id}',
            {
                'type': 'notification_message',
                'notification': NotificationSerializer(notification).data
            }
        )


# ============ Loan Services ============

def create_loan_application(customer, loan_data):
    """Create a new loan application"""
    from .models import Loan
    
    loan = Loan.objects.create(
        customer=customer,
        loan_type=loan_data['loan_type'],
        requested_amount=loan_data['requested_amount'],
        term_months=loan_data['term_months'],
        purpose=loan_data['purpose'],
        employment_status=loan_data.get('employment_status', ''),
        annual_income=loan_data.get('annual_income'),
        monthly_expenses=loan_data.get('monthly_expenses'),
        repayment_frequency=loan_data.get('repayment_frequency', 'MONTHLY'),
        application_data=loan_data.get('additional_data', {})
    )
    
    # Create notification for loan application
    create_notification(
        customer=customer,
        notification_type='LOAN',
        title='Loan Application Submitted',
        message=f'Your {loan.get_loan_type_display()} application for ${loan.requested_amount} has been submitted for review.',
        priority='MEDIUM',
        action_url=f'/app/loans/{loan.id}',
        metadata={'loan_id': loan.id, 'loan_type': loan.loan_type}
    )
    
    return loan


def approve_loan(loan, approver, approved_amount, interest_rate, approval_notes=''):
    """Approve a loan application"""
    from decimal import Decimal
    from datetime import date, timedelta
    from .models import LoanPayment
    
    with transaction.atomic():
        loan.status = 'APPROVED'
        loan.approved_amount = Decimal(str(approved_amount))
        loan.interest_rate = Decimal(str(interest_rate))
        loan.reviewed_by = approver
        loan.reviewed_at = timezone.now()
        loan.approval_notes = approval_notes
        
        # Calculate payment details
        loan.monthly_payment = loan.calculate_monthly_payment()
        loan.total_interest, loan.total_amount = loan.calculate_totals()
        
        # Set loan dates
        loan.first_payment_date = date.today() + timedelta(days=30)  # First payment in 30 days
        loan.maturity_date = loan.first_payment_date + timedelta(days=30 * (loan.term_months - 1))
        
        loan.save()
        
        # Generate payment schedule
        generate_loan_payment_schedule(loan)
        
        # Create notification
        create_notification(
            customer=loan.customer,
            notification_type='LOAN',
            title='Loan Approved!',
            message=f'Your {loan.get_loan_type_display()} for ${loan.approved_amount} has been approved. Monthly payment: ${loan.monthly_payment}',
            priority='HIGH',
            action_url=f'/app/loans/{loan.id}',
            metadata={'loan_id': loan.id, 'approved_amount': float(loan.approved_amount)}
        )
    
    return loan


def reject_loan(loan, approver, rejection_reason):
    """Reject a loan application"""
    loan.status = 'REJECTED'
    loan.reviewed_by = approver
    loan.reviewed_at = timezone.now()
    loan.rejection_reason = rejection_reason
    loan.save()
    
    # Create notification
    create_notification(
        customer=loan.customer,
        notification_type='LOAN',
        title='Loan Application Update',
        message=f'Your {loan.get_loan_type_display()} application has been reviewed. Please check your loan details for more information.',
        priority='HIGH',
        action_url=f'/app/loans/{loan.id}',
        metadata={'loan_id': loan.id, 'status': 'rejected'}
    )
    
    return loan


def disburse_loan(loan, approver):
    """Disburse approved loan funds to customer account"""
    if loan.status != 'APPROVED':
        raise ValueError('Loan must be approved before disbursement')
    
    # Get customer's primary account
    customer_account = Account.objects.filter(
        customer=loan.customer,
        type='CHECKING',
        status='ACTIVE'
    ).first()
    
    if not customer_account:
        raise ValueError('Customer does not have an active checking account')
    
    # Get system accounts
    system_account, _ = get_system_accounts()
    
    with transaction.atomic():
        # Create loan disbursement entry
        entry = create_entry('LOAN_DISBURSEMENT', approver, f'Loan disbursement - {loan.get_loan_type_display()}')
        
        # Debit system account (loan funds out)
        add_posting(entry, system_account, 'DEBIT', loan.approved_amount, f'Loan disbursement to {customer_account.account_number}')
        
        # Credit customer account (loan funds in)
        add_posting(entry, customer_account, 'CREDIT', loan.approved_amount, f'Loan disbursement - {loan.get_loan_type_display()}')
        
        # Store loan metadata
        entry.external_data = {
            'loan_id': loan.id,
            'loan_type': loan.loan_type,
            'customer_account': customer_account.account_number,
            'disbursement_details': {
                'approved_amount': float(loan.approved_amount),
                'interest_rate': float(loan.interest_rate),
                'term_months': loan.term_months,
                'monthly_payment': float(loan.monthly_payment)
            }
        }
        entry.save()
        
        # Auto-approve the disbursement
        approve_entry(entry, approver)
        
        # Update loan status
        loan.status = 'ACTIVE'
        loan.disbursed_at = timezone.now()
        loan.save()
        
        # Create notification
        create_notification(
            customer=loan.customer,
            notification_type='LOAN',
            title='Loan Funds Disbursed',
            message=f'Your loan funds of ${loan.approved_amount} have been deposited to your account. First payment due: {loan.first_payment_date}',
            priority='HIGH',
            action_url=f'/app/loans/{loan.id}',
            metadata={'loan_id': loan.id, 'disbursed_amount': float(loan.approved_amount)}
        )
    
    return entry


def generate_loan_payment_schedule(loan):
    """Generate payment schedule for an approved loan"""
    from .models import LoanPayment
    from datetime import date, timedelta
    from decimal import Decimal
    
    if not loan.monthly_payment or not loan.first_payment_date:
        return
    
    # Clear existing schedule
    loan.payments.all().delete()
    
    current_date = loan.first_payment_date
    remaining_principal = loan.approved_amount
    monthly_rate = (loan.interest_rate / 100) / 12
    
    for payment_num in range(1, loan.term_months + 1):
        # Calculate interest and principal for this payment
        interest_amount = remaining_principal * monthly_rate
        principal_amount = loan.monthly_payment - interest_amount
        
        # Adjust last payment for any rounding differences
        if payment_num == loan.term_months:
            principal_amount = remaining_principal
            scheduled_amount = principal_amount + interest_amount
        else:
            scheduled_amount = loan.monthly_payment
        
        LoanPayment.objects.create(
            loan=loan,
            payment_number=payment_num,
            due_date=current_date,
            scheduled_amount=scheduled_amount,
            principal_amount=principal_amount,
            interest_amount=interest_amount
        )
        
        remaining_principal -= principal_amount
        current_date += timedelta(days=30)  # Approximate monthly


def process_loan_payment(loan, payment_amount, payment_method='MANUAL'):
    """Process a loan payment"""
    from .models import LoanPayment
    
    # Get customer's primary account
    customer_account = Account.objects.filter(
        customer=loan.customer,
        type='CHECKING',
        status='ACTIVE'
    ).first()
    
    if not customer_account:
        raise ValueError('Customer does not have an active checking account')
    
    # Check sufficient balance
    if customer_account.balance() < payment_amount:
        raise ValueError('Insufficient balance for loan payment')
    
    # Get system accounts
    system_account, _ = get_system_accounts()
    
    with transaction.atomic():
        # Create loan payment entry
        entry = create_entry('LOAN_PAYMENT', loan.customer.user, f'Loan payment - {loan.get_loan_type_display()}')
        
        # Debit customer account (payment out)
        add_posting(entry, customer_account, 'DEBIT', payment_amount, f'Loan payment for loan #{loan.id}')
        
        # Credit system account (payment in)
        add_posting(entry, system_account, 'CREDIT', payment_amount, f'Loan payment from {customer_account.account_number}')
        
        # Store payment metadata
        entry.external_data = {
            'loan_id': loan.id,
            'payment_method': payment_method,
            'customer_account': customer_account.account_number,
            'payment_details': {
                'amount': float(payment_amount),
                'outstanding_balance_before': float(loan.outstanding_balance),
            }
        }
        entry.save()
        
        # Auto-approve the payment
        system_user = get_system_user()
        approve_entry(entry, system_user)
        
        # Update payment records
        update_loan_payment_records(loan, payment_amount, entry)
        
        # Create notification
        create_notification(
            customer=loan.customer,
            notification_type='LOAN',
            title='Loan Payment Processed',
            message=f'Your loan payment of ${payment_amount} has been processed successfully.',
            priority='MEDIUM',
            action_url=f'/app/loans/{loan.id}',
            metadata={'loan_id': loan.id, 'payment_amount': float(payment_amount)}
        )
    
    return entry


def update_loan_payment_records(loan, payment_amount, ledger_entry):
    """Update loan payment records after a payment is made"""
    from .models import LoanPayment
    from decimal import Decimal
    
    remaining_payment = Decimal(str(payment_amount))
    
    # Get unpaid/partial payments in order
    unpaid_payments = loan.payments.filter(
        status__in=['SCHEDULED', 'OVERDUE', 'PARTIAL']
    ).order_by('payment_number')
    
    for payment in unpaid_payments:
        if remaining_payment <= 0:
            break
        
        amount_due = payment.scheduled_amount - payment.paid_amount
        payment_applied = min(remaining_payment, amount_due)
        
        payment.paid_amount += payment_applied
        remaining_payment -= payment_applied
        
        # Update payment status
        if payment.paid_amount >= payment.scheduled_amount:
            payment.status = 'PAID'
            payment.paid_at = timezone.now()
        elif payment.paid_amount > 0:
            payment.status = 'PARTIAL'
        
        payment.ledger_entry = ledger_entry
        payment.save()
    
    # Check if loan is fully paid off
    if loan.outstanding_balance <= 0:
        loan.status = 'PAID_OFF'
        loan.save()
        
        # Create notification for loan payoff
        create_notification(
            customer=loan.customer,
            notification_type='LOAN',
            title='Loan Paid Off!',
            message=f'Congratulations! Your {loan.get_loan_type_display()} has been fully paid off.',
            priority='HIGH',
            action_url=f'/app/loans/{loan.id}',
            metadata={'loan_id': loan.id, 'status': 'paid_off'}
        )


def create_transaction_notification(customer, transaction_type, amount, status, reference=None):
    """Create transaction-related notifications"""
    
    if transaction_type == 'DEPOSIT':
        if status == 'POSTED':
            title = "Deposit Confirmed"
            message = f"Your deposit of ${amount} has been confirmed and added to your account."
            priority = 'MEDIUM'
        elif status == 'PENDING':
            title = "Deposit Received"
            message = f"Your deposit of ${amount} is being processed and will be available shortly."
            priority = 'LOW'
    
    elif transaction_type == 'TRANSFER':
        if status == 'APPROVED':
            title = "Transfer Approved"
            message = f"Your transfer of ${amount} has been approved and processed."
            priority = 'MEDIUM'
        elif status == 'DECLINED':
            title = "Transfer Declined"
            message = f"Your transfer of ${amount} has been declined. Please contact support for details."
            priority = 'HIGH'
        elif status == 'PENDING':
            title = "Transfer Pending"
            message = f"Your transfer of ${amount} is pending approval."
            priority = 'LOW'
    
    elif transaction_type == 'WITHDRAWAL':
        if status == 'APPROVED':
            title = "Withdrawal Approved"
            message = f"Your withdrawal of ${amount} has been approved and processed."
            priority = 'MEDIUM'
        elif status == 'DECLINED':
            title = "Withdrawal Declined"
            message = f"Your withdrawal of ${amount} has been declined. Please contact support for details."
            priority = 'HIGH'
        elif status == 'PENDING':
            title = "Withdrawal Pending"
            message = f"Your withdrawal of ${amount} is pending approval."
            priority = 'LOW'
    
    else:
        title = f"{transaction_type.title()} Update"
        message = f"Your {transaction_type.lower()} of ${amount} status: {status.lower()}"
        priority = 'MEDIUM'
    
    metadata = {
        'transaction_type': transaction_type,
        'amount': str(amount),
        'status': status
    }
    
    if reference:
        metadata['reference'] = reference
        action_url = f'/app/transactions?ref={reference}'
    else:
        action_url = '/app/transactions'
    
    return create_notification(
        customer=customer,
        notification_type='TRANSACTION',
        title=title,
        message=message,
        priority=priority,
        action_url=action_url,
        metadata=metadata
    )


def create_kyc_notification(customer, status, rejection_reason=None):
    """Create KYC-related notifications"""
    
    if status == 'VERIFIED':
        title = "KYC Verification Complete"
        message = "Your identity verification has been completed successfully. You now have full access to all banking features."
        priority = 'HIGH'
        action_url = '/app/profile'
    
    elif status == 'REJECTED':
        title = "KYC Verification Required"
        message = f"Your identity verification needs attention. {rejection_reason or 'Please review and resubmit your documents.'}"
        priority = 'HIGH'
        action_url = '/app/profile'
    
    elif status == 'UNDER_REVIEW':
        title = "KYC Under Review"
        message = "Your identity verification documents are being reviewed. We'll notify you once the review is complete."
        priority = 'MEDIUM'
        action_url = '/app/profile'
    
    else:
        title = "KYC Status Update"
        message = f"Your KYC status has been updated to: {status}"
        priority = 'MEDIUM'
        action_url = '/app/profile'
    
    metadata = {
        'kyc_status': status
    }
    
    if rejection_reason:
        metadata['rejection_reason'] = rejection_reason
    
    return create_notification(
        customer=customer,
        notification_type='KYC',
        title=title,
        message=message,
        priority=priority,
        action_url=action_url,
        metadata=metadata
    )


def create_virtual_card_notification(customer, card_status, card_last_four=None):
    """Create virtual card related notifications"""
    
    if card_status == 'ACTIVE':
        title = "Virtual Card Approved"
        message = f"Your virtual card application has been approved. Your card ending in {card_last_four} is now active."
        priority = 'MEDIUM'
    
    elif card_status == 'CANCELLED':
        title = "Virtual Card Application Declined"
        message = "Your virtual card application has been declined. Please contact support for more information."
        priority = 'HIGH'
    
    elif card_status == 'FROZEN':
        title = "Virtual Card Frozen"
        message = f"Your virtual card ending in {card_last_four} has been frozen for security reasons."
        priority = 'HIGH'
    
    else:
        title = "Virtual Card Update"
        message = f"Your virtual card status has been updated to: {card_status}"
        priority = 'MEDIUM'
    
    metadata = {
        'card_status': card_status
    }
    
    if card_last_four:
        metadata['card_last_four'] = card_last_four
    
    return create_notification(
        customer=customer,
        notification_type='VIRTUAL_CARD',
        title=title,
        message=message,
        priority=priority,
        action_url='/app/virtual-cards',
        metadata=metadata
    )


def create_crypto_deposit_notification(customer, status, amount, crypto_type):
    """Create crypto deposit related notifications"""
    
    if status == 'APPROVED':
        title = "Crypto Deposit Approved"
        message = f"Your {crypto_type} deposit of ${amount} has been approved and added to your account."
        priority = 'MEDIUM'
    
    elif status == 'REJECTED':
        title = "Crypto Deposit Rejected"
        message = f"Your {crypto_type} deposit of ${amount} has been rejected. Please contact support for details."
        priority = 'HIGH'
    
    elif status == 'PENDING_VERIFICATION':
        title = "Crypto Deposit Under Review"
        message = f"Your {crypto_type} deposit of ${amount} is being verified. We'll notify you once the review is complete."
        priority = 'LOW'
    
    else:
        title = "Crypto Deposit Update"
        message = f"Your {crypto_type} deposit status has been updated."
        priority = 'MEDIUM'
    
    metadata = {
        'crypto_type': crypto_type,
        'amount': str(amount),
        'status': status
    }
    
    return create_notification(
        customer=customer,
        notification_type='CRYPTO',
        title=title,
        message=message,
        priority=priority,
        action_url='/app/deposit',
        metadata=metadata
    )


def create_security_notification(customer, event_type, details=None):
    """Create security-related notifications"""
    
    if event_type == 'LOGIN':
        title = "New Login Detected"
        message = f"A new login to your account was detected. {details or ''}"
        priority = 'MEDIUM'
    
    elif event_type == 'PASSWORD_CHANGE':
        title = "Password Changed"
        message = "Your account password has been successfully changed."
        priority = 'HIGH'
    
    elif event_type == 'ACCOUNT_FROZEN':
        title = "Account Frozen"
        message = f"Your account has been frozen for security reasons. {details or 'Please contact support immediately.'}"
        priority = 'URGENT'
    
    elif event_type == 'ACCOUNT_UNFROZEN':
        title = "Account Reactivated"
        message = "Your account has been reactivated and is now fully functional."
        priority = 'HIGH'
    
    else:
        title = "Security Alert"
        message = f"Security event: {event_type}. {details or ''}"
        priority = 'HIGH'
    
    metadata = {
        'event_type': event_type
    }
    
    if details:
        metadata['details'] = details
    
    return create_notification(
        customer=customer,
        notification_type='SECURITY',
        title=title,
        message=message,
        priority=priority,
        action_url='/app/settings',
        metadata=metadata
    )


def create_system_notification(customer, title, message, priority='MEDIUM', action_url=''):
    """Create system/general notifications"""
    
    return create_notification(
        customer=customer,
        notification_type='SYSTEM',
        title=title,
        message=message,
        priority=priority,
        action_url=action_url,
        metadata={}
    )

# ============ Tax Refund Services ============

def create_tax_refund_application(customer, application_data):
    """Create a new tax refund application"""
    from .models import TaxRefundApplication
    
    # Create the application
    application = TaxRefundApplication.objects.create(
        customer=customer,
        **application_data
    )
    
    # Calculate estimated refund
    application.calculate_estimated_refund()
    application.save(update_fields=['estimated_refund'])
    
    # Create notification for application creation
    create_notification(
        customer=customer,
        notification_type='TAX_REFUND',
        title='Tax Refund Application Created',
        message=f'Your tax refund application for {application.tax_year} has been saved as a draft. Complete and submit it to begin processing.',
        priority='MEDIUM',
        action_url=f'/app/tax-refund?application={application.id}',
        metadata={
            'application_id': application.id,
            'application_number': application.application_number,
            'tax_year': application.tax_year,
            'status': 'draft'
        }
    )
    
    return application


def submit_tax_refund_application(application):
    """Submit a tax refund application for review"""
    with transaction.atomic():
        application.status = 'SUBMITTED'
        application.submitted_at = timezone.now()
        application.save(update_fields=['status', 'submitted_at'])
        
        # Create notification for submission
        create_notification(
            customer=application.customer,
            notification_type='TAX_REFUND',
            title='Tax Refund Application Submitted',
            message=f'Your tax refund application {application.application_number} has been submitted for review. Processing time: {application.processing_time_estimate}',
            priority='MEDIUM',
            action_url=f'/app/tax-refund?application={application.id}',
            metadata={
                'application_id': application.id,
                'application_number': application.application_number,
                'tax_year': application.tax_year,
                'status': 'submitted',
                'estimated_refund': str(application.estimated_refund) if application.estimated_refund else None
            }
        )
    
    return application


def approve_tax_refund_application(application, approver, approved_refund, admin_notes=''):
    """Approve a tax refund application and process the refund"""
    from decimal import Decimal
    
    # Get customer's primary account
    customer_account = Account.objects.filter(
        customer=application.customer,
        type='CHECKING',
        status='ACTIVE'
    ).first()
    
    if not customer_account:
        raise ValueError('Customer does not have an active checking account')
    
    # Get system accounts
    system_account, _ = get_system_accounts()
    
    with transaction.atomic():
        # Update application status
        application.status = 'APPROVED'
        application.approved_refund = Decimal(str(approved_refund))
        application.reviewed_by = approver
        application.reviewed_at = timezone.now()
        application.admin_notes = admin_notes
        application.save(update_fields=[
            'status', 'approved_refund', 'reviewed_by', 'reviewed_at', 'admin_notes'
        ])
        
        # Create tax refund ledger entry
        entry = create_entry('TAX_REFUND', approver, f'Tax refund for {application.tax_year} - {application.application_number}')
        
        # Debit system account (refund funds out)
        add_posting(entry, system_account, 'DEBIT', approved_refund, f'Tax refund to {customer_account.account_number}')
        
        # Credit customer account (refund funds in)
        add_posting(entry, customer_account, 'CREDIT', approved_refund, f'Tax refund for {application.tax_year}')
        
        # Store tax refund metadata
        entry.external_data = {
            'tax_refund_application_id': application.id,
            'application_number': application.application_number,
            'tax_year': application.tax_year,
            'customer_account': customer_account.account_number,
            'refund_details': {
                'estimated_refund': str(application.estimated_refund) if application.estimated_refund else None,
                'approved_refund': str(approved_refund),
                'filing_status': application.filing_status,
                'total_income': str(application.total_income),
                'federal_tax_withheld': str(application.federal_tax_withheld)
            }
        }
        entry.save()
        
        # Auto-approve the refund entry
        approve_entry(entry, approver)
        
        # Update application status to processed
        application.status = 'PROCESSED'
        application.processed_at = timezone.now()
        application.save(update_fields=['status', 'processed_at'])
        
        # Create notification for approval
        create_notification(
            customer=application.customer,
            notification_type='TAX_REFUND',
            title='Tax Refund Approved!',
            message=f'Your tax refund of ${approved_refund} has been approved and deposited to your account.',
            priority='HIGH',
            action_url=f'/app/tax-refund?application={application.id}',
            metadata={
                'application_id': application.id,
                'application_number': application.application_number,
                'tax_year': application.tax_year,
                'approved_refund': str(approved_refund),
                'status': 'processed'
            }
        )
    
    return entry


def reject_tax_refund_application(application, approver, rejection_reason, admin_notes=''):
    """Reject a tax refund application"""
    application.status = 'REJECTED'
    application.reviewed_by = approver
    application.reviewed_at = timezone.now()
    application.rejection_reason = rejection_reason
    application.admin_notes = admin_notes
    application.save(update_fields=[
        'status', 'reviewed_by', 'reviewed_at', 'rejection_reason', 'admin_notes'
    ])
    
    # Create notification for rejection
    create_notification(
        customer=application.customer,
        notification_type='TAX_REFUND',
        title='Tax Refund Application Update',
        message=f'Your tax refund application {application.application_number} requires attention. Please review the details and resubmit if necessary.',
        priority='HIGH',
        action_url=f'/app/tax-refund?application={application.id}',
        metadata={
            'application_id': application.id,
            'application_number': application.application_number,
            'tax_year': application.tax_year,
            'status': 'rejected'
        }
    )
    
    return application


def calculate_tax_refund_estimate(calculator_data):
    """Calculate estimated tax refund based on provided data"""
    from decimal import Decimal
    
    # Standard deduction amounts for 2024
    standard_deductions = {
        'SINGLE': Decimal('13850'),
        'MARRIED_JOINT': Decimal('27700'),
        'MARRIED_SEPARATE': Decimal('13850'),
        'HEAD_HOUSEHOLD': Decimal('20800'),
        'QUALIFYING_WIDOW': Decimal('27700'),
    }
    
    filing_status = calculator_data['filing_status']
    total_income = Decimal(str(calculator_data['total_income']))
    federal_tax_withheld = Decimal(str(calculator_data['federal_tax_withheld']))
    estimated_tax_paid = Decimal(str(calculator_data.get('estimated_tax_paid', 0)))
    number_of_dependents = calculator_data.get('number_of_dependents', 0)
    use_standard_deduction = calculator_data.get('use_standard_deduction', True)
    
    # Calculate total deductions
    if use_standard_deduction:
        total_deductions = standard_deductions.get(filing_status, Decimal('13850'))
    else:
        total_deductions = (
            Decimal(str(calculator_data.get('mortgage_interest', 0))) +
            Decimal(str(calculator_data.get('charitable_donations', 0))) +
            Decimal(str(calculator_data.get('medical_expenses', 0))) +
            Decimal(str(calculator_data.get('business_expenses', 0))) +
            Decimal(str(calculator_data.get('education_expenses', 0))) +
            Decimal(str(calculator_data.get('other_deductions', 0)))
        )
    
    # Calculate taxable income
    taxable_income = max(Decimal('0'), total_income - total_deductions)
    
    # Simplified tax calculation (2024 tax brackets)
    calculated_tax = Decimal('0')
    
    if filing_status == 'SINGLE':
        if taxable_income <= 11000:
            calculated_tax = taxable_income * Decimal('0.10')
        elif taxable_income <= 44725:
            calculated_tax = Decimal('1100') + (taxable_income - Decimal('11000')) * Decimal('0.12')
        elif taxable_income <= 95375:
            calculated_tax = Decimal('5147') + (taxable_income - Decimal('44725')) * Decimal('0.22')
        elif taxable_income <= 182050:
            calculated_tax = Decimal('16290') + (taxable_income - Decimal('95375')) * Decimal('0.24')
        else:
            calculated_tax = Decimal('37104') + (taxable_income - Decimal('182050')) * Decimal('0.32')
    else:
        # Simplified calculation for other filing statuses
        if taxable_income <= 22000:
            calculated_tax = taxable_income * Decimal('0.10')
        elif taxable_income <= 89450:
            calculated_tax = Decimal('2200') + (taxable_income - Decimal('22000')) * Decimal('0.12')
        else:
            calculated_tax = Decimal('10294') + (taxable_income - Decimal('89450')) * Decimal('0.22')
    
    # Add dependent tax credits (simplified)
    child_tax_credit = min(number_of_dependents * Decimal('2000'), calculated_tax)
    calculated_tax = max(Decimal('0'), calculated_tax - child_tax_credit)
    
    # Calculate refund
    total_tax_paid = federal_tax_withheld + estimated_tax_paid
    estimated_refund = max(Decimal('0'), total_tax_paid - calculated_tax)
    
    return {
        'estimated_refund': float(estimated_refund),
        'total_deductions': float(total_deductions),
        'taxable_income': float(taxable_income),
        'calculated_tax': float(calculated_tax),
        'child_tax_credit': float(child_tax_credit),
        'total_tax_paid': float(total_tax_paid),
        'breakdown': {
            'income': float(total_income),
            'deductions': float(total_deductions),
            'taxable_income': float(taxable_income),
            'tax_owed': float(calculated_tax),
            'tax_paid': float(total_tax_paid),
            'refund': float(estimated_refund)
        }
    }


def upload_tax_refund_document(application, document_data, document_file):
    """Upload a document for a tax refund application"""
    from .models import TaxRefundDocument
    
    document = TaxRefundDocument.objects.create(
        application=application,
        document_type=document_data['document_type'],
        document_file=document_file,
        document_name=document_data.get('document_name', document_file.name),
        file_size=document_file.size
    )
    
    # Create notification for document upload
    create_notification(
        customer=application.customer,
        notification_type='TAX_REFUND',
        title='Document Uploaded',
        message=f'Document "{document.document_name}" has been uploaded to your tax refund application {application.application_number}.',
        priority='LOW',
        action_url=f'/app/tax-refund?application={application.id}',
        metadata={
            'application_id': application.id,
            'document_id': document.id,
            'document_type': document.document_type
        }
    )
    
    return document


def create_tax_refund_notification(customer, status, application_number, amount=None, tax_year=None):
    """Create tax refund related notifications"""
    
    if status == 'SUBMITTED':
        title = "Tax Refund Application Submitted"
        message = f"Your tax refund application {application_number} has been submitted for review."
        priority = 'MEDIUM'
    
    elif status == 'APPROVED':
        title = "Tax Refund Approved!"
        message = f"Your tax refund of ${amount} has been approved and deposited to your account."
        priority = 'HIGH'
    
    elif status == 'REJECTED':
        title = "Tax Refund Application Update"
        message = f"Your tax refund application {application_number} requires attention. Please review the details."
        priority = 'HIGH'
    
    elif status == 'UNDER_REVIEW':
        title = "Tax Refund Under Review"
        message = f"Your tax refund application {application_number} is being reviewed by our team."
        priority = 'LOW'
    
    else:
        title = "Tax Refund Update"
        message = f"Your tax refund application {application_number} status has been updated."
        priority = 'MEDIUM'
    
    metadata = {
        'application_number': application_number,
        'status': status
    }
    
    if amount:
        metadata['amount'] = str(amount)
    if tax_year:
        metadata['tax_year'] = tax_year
    
    return create_notification(
        customer=customer,
        notification_type='TAX_REFUND',
        title=title,
        message=message,
        priority=priority,
        action_url='/app/tax-refund',
        metadata=metadata
    )