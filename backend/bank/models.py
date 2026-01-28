from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Sum
from django.utils import timezone

User = get_user_model()


class CustomerProfile(models.Model):
    KYC_CHOICES = [
        ('PENDING', 'Pending'),
        ('VERIFIED', 'Verified'),
    ]
    TIER_CHOICES = [
        ('STANDARD', 'Standard'),
        ('PREMIUM', 'Premium'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255)
    middle_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    country = models.CharField(max_length=100, blank=True)
    preferred_language = models.CharField(max_length=10, default='en')
    kyc_status = models.CharField(max_length=20, choices=KYC_CHOICES, default='PENDING')
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='STANDARD')

    def __str__(self):
        return self.full_name


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


class CryptoDeposit(models.Model):
    """Crypto deposit requests with proof of payment for manual verification"""
    VERIFICATION_STATUS_CHOICES = [
        ('PENDING_PAYMENT', 'Pending Payment'),
        ('PENDING_VERIFICATION', 'Pending Verification'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
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

