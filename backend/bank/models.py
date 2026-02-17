from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Sum
from django.utils import timezone
import random
import string

User = get_user_model()


class CustomerProfile(models.Model):
    KYC_CHOICES = [
        ('PENDING', 'Pending'),
        ('UNDER_REVIEW', 'Under Review'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
    ]
    TIER_CHOICES = [
        ('STANDARD', 'Standard'),
        ('PREMIUM', 'Premium'),
        ('VIP', 'VIP'),
    ]
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('', 'Prefer not to say'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Basic Information
    full_name = models.CharField(max_length=255)
    middle_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    country = models.CharField(max_length=100, blank=True)
    preferred_language = models.CharField(max_length=10, default='en')
    
    # Extended Profile Information
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    
    # Address Information
    address_line_1 = models.CharField(max_length=255, blank=True)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state_province = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # KYC and Account Status
    kyc_status = models.CharField(max_length=20, choices=KYC_CHOICES, default='PENDING')
    kyc_submitted_at = models.DateTimeField(null=True, blank=True)
    kyc_verified_at = models.DateTimeField(null=True, blank=True)
    kyc_verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_profiles')
    kyc_rejection_reason = models.TextField(blank=True)
    
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='STANDARD')
    
    # Profile completion tracking
    profile_completion_percentage = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name
    
    def calculate_profile_completion(self):
        """Calculate profile completion percentage"""
        fields_to_check = [
            'full_name', 'phone', 'country', 'date_of_birth', 'gender',
            'nationality', 'occupation', 'address_line_1', 'city',
            'state_province', 'postal_code'
        ]
        
        completed_fields = 0
        for field in fields_to_check:
            if getattr(self, field):
                completed_fields += 1
        
        # Add KYC documents check
        if self.kyc_documents.filter(status='APPROVED').exists():
            completed_fields += 2  # Weight KYC documents more
            
        total_fields = len(fields_to_check) + 2
        percentage = int((completed_fields / total_fields) * 100)
        
        if percentage != self.profile_completion_percentage:
            self.profile_completion_percentage = percentage
            self.save(update_fields=['profile_completion_percentage'])
            
        return percentage


class KYCDocument(models.Model):
    """KYC documents uploaded by customers for verification"""
    DOCUMENT_TYPE_CHOICES = [
        ('PASSPORT', 'Passport'),
        ('NATIONAL_ID', 'National ID Card'),
        ('DRIVERS_LICENSE', 'Driver\'s License'),
        ('UTILITY_BILL', 'Utility Bill'),
        ('BANK_STATEMENT', 'Bank Statement'),
        ('PROOF_OF_ADDRESS', 'Proof of Address'),
        ('SELFIE', 'Selfie with ID'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('EXPIRED', 'Expired'),
    ]
    
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='kyc_documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    document_file = models.FileField(upload_to='kyc_documents/')
    document_number = models.CharField(max_length=100, blank=True, help_text="Document ID/Number if applicable")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    rejection_reason = models.TextField(blank=True)
    
    # Admin verification fields
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_documents')
    verified_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True)
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="Document expiry date if applicable")
    
    class Meta:
        ordering = ['-uploaded_at']
        unique_together = ['customer', 'document_type']  # One document per type per customer
    
    def __str__(self):
        return f"{self.customer.full_name} - {self.get_document_type_display()}"


class Account(models.Model):
    TYPE_CHOICES = [
        ('CHECKING', 'Checking Account'),
        ('SAVINGS', 'Savings Account'),
        ('FIXED_DEPOSIT', 'Fixed Deposit Account'),
        ('CURRENT', 'Current Account'),
        ('BUSINESS', 'Business Account'),
        ('INVESTMENT', 'Investment Account'),
        ('SYSTEM', 'System'),
    ]
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('FROZEN', 'Frozen'),
    ]

    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='accounts', null=True, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='CHECKING')
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    account_number = models.CharField(max_length=32, unique=True)

    def balance(self):
        totals = self.postings.filter(entry__status='POSTED').aggregate(
            debit=Sum('amount', filter=models.Q(direction='DEBIT')),
            credit=Sum('amount', filter=models.Q(direction='CREDIT')),
        )
        debit = totals['debit'] or 0
        credit = totals['credit'] or 0
        return credit - debit

    def __str__(self):
        return f"{self.account_number} ({self.get_type_display()})"


class LedgerEntry(models.Model):
    TYPE_CHOICES = [
        ('DEPOSIT', 'Deposit'),
        ('TRANSFER', 'Transfer'),
        ('WITHDRAWAL', 'Withdrawal'),
        ('EXTERNAL_TRANSFER', 'External Transfer'),
        ('LOAN_DISBURSEMENT', 'Loan Disbursement'),
        ('LOAN_PAYMENT', 'Loan Payment'),
        ('TAX_REFUND', 'Tax Refund'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('DECLINED', 'Declined'),
        ('POSTED', 'Posted'),
        ('REVERSED', 'Reversed'),
    ]

    reference = models.CharField(max_length=64, unique=True)
    entry_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='entries_created')
    created_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='entries_approved')
    approved_at = models.DateTimeField(null=True, blank=True)
    memo = models.CharField(max_length=255, blank=True)
    external_data = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.reference} ({self.entry_type})"


class LedgerPosting(models.Model):
    DIRECTION_CHOICES = [
        ('DEBIT', 'Debit'),
        ('CREDIT', 'Credit'),
    ]

    entry = models.ForeignKey(LedgerEntry, on_delete=models.CASCADE, related_name='postings')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='postings')
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.entry.reference} {self.direction} {self.amount}"


class Beneficiary(models.Model):
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='beneficiaries')
    name = models.CharField(max_length=255)
    bank_label = models.CharField(max_length=120)
    account_number = models.CharField(max_length=64)
    favorite = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Statement(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('READY', 'Ready'),
    ]

    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='statements')
    period_start = models.DateField()
    period_end = models.DateField()
    generated_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    content = models.TextField(blank=True)

    def __str__(self):
        return f"Statement {self.period_start} - {self.period_end}"


class VerificationCode(models.Model):
    PURPOSE_CHOICES = [
        ('EMAIL_VERIFICATION', 'Email Verification'),
        ('PASSWORD_RESET', 'Password Reset'),
        ('WITHDRAWAL_VERIFICATION', 'Withdrawal Verification'),
        ('TRANSFER_VERIFICATION', 'Transfer Verification'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_codes')
    code = models.CharField(max_length=4)
    purpose = models.CharField(max_length=30, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.purpose}"


class CryptoWallet(models.Model):
    """Admin-configured cryptocurrency wallets for receiving deposits"""
    CRYPTO_TYPE_CHOICES = [
        ('BTC', 'Bitcoin'),
        ('USDT', 'Tether (USDT)'),
        ('ETH', 'Ethereum'),
    ]
    NETWORK_CHOICES = [
        ('BITCOIN', 'Bitcoin Network'),
        ('ERC20', 'Ethereum (ERC-20)'),
        ('TRC20', 'Tron (TRC-20)'),
        ('BEP20', 'Binance Smart Chain (BEP-20)'),
        ('ETHEREUM', 'Ethereum Network'),
    ]

    crypto_type = models.CharField(max_length=10, choices=CRYPTO_TYPE_CHOICES)
    network = models.CharField(max_length=20, choices=NETWORK_CHOICES)
    wallet_address = models.CharField(max_length=255)
    qr_code_image = models.ImageField(upload_to='crypto_qr_codes/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    min_deposit = models.DecimalField(max_digits=12, decimal_places=2, default=10.00)
    instructions = models.TextField(blank=True, help_text="Custom instructions for users")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['crypto_type', 'network']
        ordering = ['crypto_type', 'network']

    def __str__(self):
        return f"{self.get_crypto_type_display()} ({self.get_network_display()})"


class Loan(models.Model):
    """Customer loan applications and management"""
    LOAN_TYPE_CHOICES = [
        ('PERSONAL', 'Personal Loan'),
        ('BUSINESS', 'Business Loan'),
        ('MORTGAGE', 'Mortgage'),
        ('AUTO', 'Auto Loan'),
        ('EDUCATION', 'Education Loan'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('ACTIVE', 'Active'),
        ('PAID_OFF', 'Paid Off'),
        ('DEFAULTED', 'Defaulted'),
    ]
    
    REPAYMENT_FREQUENCY_CHOICES = [
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('SEMI_ANNUAL', 'Semi-Annual'),
        ('ANNUAL', 'Annual'),
    ]
    
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='loans')
    loan_type = models.CharField(max_length=20, choices=LOAN_TYPE_CHOICES)
    
    # Loan Details
    requested_amount = models.DecimalField(max_digits=12, decimal_places=2)
    approved_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Annual interest rate percentage")
    term_months = models.IntegerField(help_text="Loan term in months")
    repayment_frequency = models.CharField(max_length=20, choices=REPAYMENT_FREQUENCY_CHOICES, default='MONTHLY')
    
    # Application Details
    purpose = models.TextField(help_text="Purpose of the loan")
    employment_status = models.CharField(max_length=100, blank=True)
    annual_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    monthly_expenses = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Status and Approval
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    application_date = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_loans')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approval_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Active Loan Details
    disbursed_at = models.DateTimeField(null=True, blank=True)
    first_payment_date = models.DateField(null=True, blank=True)
    maturity_date = models.DateField(null=True, blank=True)
    
    # Calculated Fields
    monthly_payment = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_interest = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Metadata
    application_data = models.JSONField(default=dict, blank=True, help_text="Additional application data")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer.full_name} - {self.get_loan_type_display()} - ${self.requested_amount}"
    
    def calculate_monthly_payment(self):
        """Calculate monthly payment using standard loan formula"""
        if not self.approved_amount or not self.interest_rate or not self.term_months:
            return None
        
        from decimal import Decimal
        import math
        
        principal = float(self.approved_amount)
        annual_rate = float(self.interest_rate) / 100
        monthly_rate = annual_rate / 12
        num_payments = self.term_months
        
        if monthly_rate == 0:
            return Decimal(str(principal / num_payments))
        
        monthly_payment = principal * (monthly_rate * (1 + monthly_rate) ** num_payments) / ((1 + monthly_rate) ** num_payments - 1)
        return Decimal(str(round(monthly_payment, 2)))
    
    def calculate_totals(self):
        """Calculate total interest and total amount"""
        if self.monthly_payment and self.term_months:
            total_amount = self.monthly_payment * self.term_months
            total_interest = total_amount - (self.approved_amount or 0)
            return total_interest, total_amount
        return None, None
    
    @property
    def outstanding_balance(self):
        """Calculate outstanding loan balance based on payments made"""
        if self.status != 'ACTIVE' or not self.approved_amount:
            return 0
        
        # Sum all loan payments made
        payments_made = LedgerEntry.objects.filter(
            entry_type='LOAN_PAYMENT',
            external_data__loan_id=self.id,
            status='POSTED'
        ).aggregate(
            total=Sum('postings__amount', filter=models.Q(postings__direction='CREDIT'))
        )['total'] or 0
        
        return self.approved_amount - payments_made


class LoanPayment(models.Model):
    """Individual loan payment records"""
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('PARTIAL', 'Partial Payment'),
    ]
    
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='payments')
    payment_number = models.IntegerField()
    due_date = models.DateField()
    scheduled_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    principal_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    interest_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    paid_at = models.DateTimeField(null=True, blank=True)
    ledger_entry = models.ForeignKey(LedgerEntry, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['payment_number']
        unique_together = ['loan', 'payment_number']
    
    def __str__(self):
        return f"Payment {self.payment_number} for Loan {self.loan.id}"


class CryptoDeposit(models.Model):
    """Crypto deposit requests with proof of payment for manual verification"""
    VERIFICATION_STATUS_CHOICES = [
        ('PENDING_PAYMENT', 'Pending Payment'),
        ('PENDING_VERIFICATION', 'Pending Verification'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    PURPOSE_CHOICES = [
        ('DEPOSIT', 'Wallet Deposit'),
        ('VIRTUAL_CARD', 'Virtual Card Fee'),
    ]

    # Link to ledger entry
    ledger_entry = models.OneToOneField(
        LedgerEntry, 
        on_delete=models.CASCADE, 
        related_name='crypto_deposit',
        null=True,
        blank=True
    )
    
    # User and wallet info
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='crypto_deposits')
    crypto_wallet = models.ForeignKey(CryptoWallet, on_delete=models.PROTECT, related_name='deposits')
    
    # Deposit details
    amount_usd = models.DecimalField(max_digits=12, decimal_places=2)
    crypto_amount = models.DecimalField(max_digits=18, decimal_places=8, null=True, blank=True)
    exchange_rate = models.DecimalField(max_digits=18, decimal_places=8, null=True, blank=True)
    
    # Purpose and Linking
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='DEPOSIT')
    related_virtual_card = models.ForeignKey(
        'VirtualCard', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='fee_payments',
        help_text="Virtual card associated with this fee payment"
    )

    # Transaction details
    tx_hash = models.CharField(max_length=255, blank=True, help_text="Blockchain transaction hash")
    proof_of_payment = models.ImageField(upload_to='crypto_proofs/', null=True, blank=True)
    
    # Verification
    verification_status = models.CharField(
        max_length=30, 
        choices=VERIFICATION_STATUS_CHOICES, 
        default='PENDING_PAYMENT'
    )
    admin_notes = models.TextField(blank=True)
    verified_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='verified_crypto_deposits'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer.full_name} - {self.crypto_wallet.crypto_type} ${self.amount_usd}"


class SupportConversation(models.Model):
    """Represents a support conversation between a customer and admin"""
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]
    
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='support_conversations')
    assigned_admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_conversations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    subject = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-last_message_at', '-created_at']
    
    def __str__(self):
        return f"{self.customer.full_name} - {self.get_status_display()}"


class SupportMessage(models.Model):
    """Individual messages within a support conversation"""
    SENDER_TYPE_CHOICES = [
        ('CUSTOMER', 'Customer'),
        ('ADMIN', 'Admin'),
    ]
    
    conversation = models.ForeignKey(SupportConversation, on_delete=models.CASCADE, related_name='messages')
    sender_type = models.CharField(max_length=10, choices=SENDER_TYPE_CHOICES)
    sender_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_messages')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.conversation.id} - {self.sender_type} - {self.created_at}"


class Notification(models.Model):
    """User notifications for banking events"""
    TYPE_CHOICES = [
        ('TRANSACTION', 'Transaction'),
        ('DEPOSIT', 'Deposit'),
        ('WITHDRAWAL', 'Withdrawal'),
        ('TRANSFER', 'Transfer'),
        ('KYC', 'KYC Update'),
        ('SECURITY', 'Security Alert'),
        ('SYSTEM', 'System Notification'),
        ('VIRTUAL_CARD', 'Virtual Card'),
        ('CRYPTO', 'Crypto Deposit'),
        ('SUPPORT', 'Support Message'),
        ('LOAN', 'Loan'),
        ('TAX_REFUND', 'Tax Refund'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]
    
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Optional data for rich notifications
    action_url = models.CharField(max_length=255, blank=True, help_text="URL to navigate when clicked")
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional data for the notification")
    
    # Status tracking
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', '-created_at']),
            models.Index(fields=['customer', 'is_read']),
        ]
    
    def __str__(self):
        return f"{self.customer.full_name} - {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])


class VirtualCard(models.Model):
    """Virtual debit cards linked to customer accounts"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending Approval'),
        ('ACTIVE', 'Active'),
        ('FROZEN', 'Frozen'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    ]
    
    CARD_TYPE_CHOICES = [
        ('STANDARD', 'Standard'),
        ('PREMIUM', 'Premium'),
        ('BUSINESS', 'Business'),
    ]
    
    # Core relationships
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='virtual_cards')
    linked_account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='virtual_cards')
    
    # Card details
    card_number = models.CharField(max_length=19, unique=True)  # 16 digits with spaces
    card_holder_name = models.CharField(max_length=255)
    expiry_month = models.IntegerField()
    expiry_year = models.IntegerField()
    cvv = models.CharField(max_length=3)
    
    # Card configuration
    card_type = models.CharField(max_length=20, choices=CARD_TYPE_CHOICES, default='STANDARD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    daily_limit = models.DecimalField(max_digits=12, decimal_places=2, default=1000.00)
    monthly_limit = models.DecimalField(max_digits=12, decimal_places=2, default=10000.00)
    
    # Security and controls
    is_online_enabled = models.BooleanField(default=True)
    is_contactless_enabled = models.BooleanField(default=True)
    is_international_enabled = models.BooleanField(default=False)
    
    # Admin fields
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_virtual_cards')
    approved_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer.full_name} - **** {self.card_number[-4:]}"
    
    @property
    def last_four(self):
        """Return last 4 digits of card number"""
        return self.card_number.replace(' ', '')[-4:]
    
    @property
    def masked_number(self):
        """Return masked card number showing only last 4 digits"""
        return f"**** **** **** {self.last_four}"
    
    @property
    def is_expired(self):
        """Check if card is expired"""
        from datetime import date
        today = date.today()
        return today.year > self.expiry_year or (today.year == self.expiry_year and today.month > self.expiry_month)
    
    def save(self, *args, **kwargs):
        # Auto-generate card details if not provided
        if not self.card_number:
            self.card_number = self._generate_card_number()
        if not self.cvv:
            self.cvv = self._generate_cvv()
        if not self.expiry_month or not self.expiry_year:
            self._set_expiry_date()
        if not self.card_holder_name:
            self.card_holder_name = self.customer.full_name.upper()
        
        super().save(*args, **kwargs)
    
    def _generate_card_number(self):
        """Generate a valid-looking card number (not real Visa/Mastercard)"""
        # Use 5555 prefix for demo cards
        prefix = "5555"
        # Generate 12 random digits
        middle = ''.join([str(random.randint(0, 9)) for _ in range(12)])
        # Format with spaces
        full_number = prefix + middle
        return f"{full_number[:4]} {full_number[4:8]} {full_number[8:12]} {full_number[12:16]}"
    
    def _generate_cvv(self):
        """Generate a 3-digit CVV"""
        return ''.join([str(random.randint(0, 9)) for _ in range(3)])
    
    def _set_expiry_date(self):
        """Set expiry date to 4 years from now"""
        from datetime import date
        today = date.today()
        self.expiry_year = today.year + 4
        self.expiry_month = today.month


class TaxRefundApplication(models.Model):
    """Tax refund applications submitted by customers"""
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('PROCESSED', 'Processed'),
    ]
    
    FILING_STATUS_CHOICES = [
        ('SINGLE', 'Single'),
        ('MARRIED_JOINT', 'Married Filing Jointly'),
        ('MARRIED_SEPARATE', 'Married Filing Separately'),
        ('HEAD_HOUSEHOLD', 'Head of Household'),
        ('QUALIFYING_WIDOW', 'Qualifying Widow(er)'),
    ]
    
    # Core relationships
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='tax_refund_applications')
    
    # Application identification
    application_number = models.CharField(max_length=20, unique=True)
    tax_year = models.IntegerField(default=2024)
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    ssn = models.CharField(max_length=11, help_text="Format: XXX-XX-XXXX")  # Encrypted in production
    date_of_birth = models.DateField()
    
    # Address Information
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    phone_number = models.CharField(max_length=20, blank=True)
    email_address = models.EmailField()
    
    # Tax Information
    filing_status = models.CharField(max_length=20, choices=FILING_STATUS_CHOICES)
    total_income = models.DecimalField(max_digits=12, decimal_places=2)
    federal_tax_withheld = models.DecimalField(max_digits=12, decimal_places=2)
    state_tax_withheld = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estimated_tax_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    number_of_dependents = models.IntegerField(default=0)
    
    # Deductions
    use_standard_deduction = models.BooleanField(default=True)
    mortgage_interest = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    charitable_donations = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    medical_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    business_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    education_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Calculated amounts
    estimated_refund = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    approved_refund = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Application status and processing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_tax_applications')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Admin notes and rejection reason
    admin_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Processing information
    processing_time_estimate = models.CharField(max_length=50, default='7-14 business days')
    refund_method = models.CharField(max_length=20, default='DIRECT_DEPOSIT')
    
    # Metadata
    application_data = models.JSONField(default=dict, blank=True, help_text="Additional application data")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', '-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['tax_year', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.application_number} - {self.first_name} {self.last_name} ({self.tax_year})"
    
    def save(self, *args, **kwargs):
        if not self.application_number:
            self.application_number = self._generate_application_number()
        super().save(*args, **kwargs)
    
    def _generate_application_number(self):
        """Generate unique application number"""
        import uuid
        return f"TR-{self.tax_year}-{uuid.uuid4().hex[:6].upper()}"
    
    def calculate_estimated_refund(self):
        """Calculate estimated tax refund based on provided information"""
        from decimal import Decimal
        
        # Standard deduction amounts for 2024
        standard_deductions = {
            'SINGLE': Decimal('13850'),
            'MARRIED_JOINT': Decimal('27700'),
            'MARRIED_SEPARATE': Decimal('13850'),
            'HEAD_HOUSEHOLD': Decimal('20800'),
            'QUALIFYING_WIDOW': Decimal('27700'),
        }
        
        # Calculate total deductions
        if self.use_standard_deduction:
            total_deductions = standard_deductions.get(self.filing_status, Decimal('13850'))
        else:
            total_deductions = (
                self.mortgage_interest + self.charitable_donations + 
                self.medical_expenses + self.business_expenses + 
                self.education_expenses + self.other_deductions
            )
        
        # Calculate taxable income
        taxable_income = max(Decimal('0'), self.total_income - total_deductions)
        
        # Simplified tax calculation (2024 tax brackets for single filers)
        calculated_tax = Decimal('0')
        
        if self.filing_status == 'SINGLE':
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
            # In a real system, you'd have proper tax tables
            if taxable_income <= 22000:
                calculated_tax = taxable_income * Decimal('0.10')
            elif taxable_income <= 89450:
                calculated_tax = Decimal('2200') + (taxable_income - Decimal('22000')) * Decimal('0.12')
            else:
                calculated_tax = Decimal('10294') + (taxable_income - Decimal('89450')) * Decimal('0.22')
        
        # Add dependent tax credits (simplified)
        child_tax_credit = min(self.number_of_dependents * Decimal('2000'), calculated_tax)
        calculated_tax = max(Decimal('0'), calculated_tax - child_tax_credit)
        
        # Calculate refund
        total_tax_paid = self.federal_tax_withheld + self.estimated_tax_paid
        estimated_refund = max(Decimal('0'), total_tax_paid - calculated_tax)
        
        self.estimated_refund = estimated_refund
        return estimated_refund
    
    @property
    def total_deductions(self):
        """Calculate total deductions"""
        if self.use_standard_deduction:
            standard_deductions = {
                'SINGLE': 13850,
                'MARRIED_JOINT': 27700,
                'MARRIED_SEPARATE': 13850,
                'HEAD_HOUSEHOLD': 20800,
                'QUALIFYING_WIDOW': 27700,
            }
            return standard_deductions.get(self.filing_status, 13850)
        else:
            return (
                self.mortgage_interest + self.charitable_donations + 
                self.medical_expenses + self.business_expenses + 
                self.education_expenses + self.other_deductions
            )


class TaxRefundDocument(models.Model):
    """Documents uploaded for tax refund applications"""
    DOCUMENT_TYPE_CHOICES = [
        ('W2', 'W-2 Form'),
        ('1099', '1099 Form'),
        ('1098', '1098 Form (Mortgage Interest)'),
        ('RECEIPTS', 'Receipts/Supporting Documents'),
        ('PREVIOUS_RETURN', 'Previous Year Tax Return'),
        ('ID_DOCUMENT', 'Identification Document'),
        ('OTHER', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    application = models.ForeignKey(TaxRefundApplication, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    document_file = models.FileField(upload_to='tax_documents/')
    document_name = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text="File size in bytes")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    rejection_reason = models.TextField(blank=True)
    
    # Admin verification
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_tax_documents')
    verified_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True)
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.application.application_number} - {self.get_document_type_display()}"


class Grant(models.Model):
    """Grant opportunities available to customers"""
    CATEGORY_CHOICES = [
        ('BUSINESS', 'Business'),
        ('EDUCATION', 'Education'),
        ('HEALTHCARE', 'Healthcare'),
        ('TECHNOLOGY', 'Technology'),
        ('ENVIRONMENT', 'Environment'),
        ('ARTS', 'Arts & Culture'),
    ]
    
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('CLOSED', 'Closed'),
        ('SUSPENDED', 'Suspended'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    provider = models.CharField(max_length=255)
    
    # Grant Details
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    deadline = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    
    # Eligibility
    eligibility_requirements = models.JSONField(default=list, help_text="List of eligibility requirements")
    
    # Admin fields
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_grants')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - ${self.amount}"
    
    @property
    def is_deadline_soon(self):
        """Check if deadline is within 30 days"""
        from datetime import date, timedelta
        return self.deadline <= date.today() + timedelta(days=30)


class GrantApplication(models.Model):
    """Grant applications submitted by customers"""
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    # Core relationships
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='grant_applications')
    grant = models.ForeignKey(Grant, on_delete=models.CASCADE, related_name='applications')
    
    # Application Details
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    organization = models.CharField(max_length=255, blank=True)
    project_title = models.CharField(max_length=255)
    project_description = models.TextField()
    requested_amount = models.DecimalField(max_digits=12, decimal_places=2)
    project_timeline = models.TextField()
    
    # Status and Processing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_grant_applications')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Admin fields
    admin_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['customer', 'grant']  # One application per grant per customer
    
    def __str__(self):
        return f"{self.customer.full_name} - {self.grant.title}"

class TelegramConfig(models.Model):
    """Configuration for Telegram bot notifications"""
    bot_token = models.CharField(max_length=255)
    chat_id = models.CharField(max_length=255)
    is_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Telegram Config ({'Enabled' if self.is_enabled else 'Disabled'})"


class WithdrawalAttempt(models.Model):
    """Log of all withdrawal attempts, successful or not"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='withdrawal_attempts')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, default='ATTEMPTED') # ATTEMPTED, FAILED, etc.
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.amount} {self.currency} at {self.created_at}"
