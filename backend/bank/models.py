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
    phone = models.CharField(max_length=40, blank=True)
    preferred_language = models.CharField(max_length=10, default='en')
    kyc_status = models.CharField(max_length=20, choices=KYC_CHOICES, default='PENDING')
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='STANDARD')

    def __str__(self):
        return self.full_name


class Account(models.Model):
    TYPE_CHOICES = [
        ('CHECKING', 'Checking'),
        ('SAVINGS', 'Savings'),
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
        totals = self.postings.aggregate(
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
