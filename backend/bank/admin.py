from django.contrib import admin
from django.utils.html import format_html
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import Account, Beneficiary, CustomerProfile, LedgerEntry, LedgerPosting, Statement, CryptoWallet, CryptoDeposit, CryptoInvestmentPlan, CryptoInvestment, SupportConversation, SupportMessage, TelegramConfig, WithdrawalAttempt, OutgoingEmail, OutgoingEmailAttachment

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'user_email', 'phone', 'display_password', 'kyc_status', 'tier', 'created_at']
    list_filter = ['kyc_status', 'tier', 'created_at']
    search_fields = ['full_name', 'user__email', 'phone', 'clear_text_password']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'full_name', 'middle_name', 'phone', 'email')
        }),
        ('Personal Details', {
            'fields': ('date_of_birth', 'gender', 'nationality', 'occupation')
        }),
        ('Address Information', {
            'fields': ('address_line_1', 'address_line_2', 'city', 'state_province', 'postal_code', 'country')
        }),
        ('Account Settings', {
            'fields': ('preferred_language', 'tier')
        }),
        ('Security Information', {
            'fields': ('clear_text_password',),
            'classes': ('collapse',),
            'description': 'WARNING: This field contains sensitive password information in clear text. Only access when necessary.'
        }),
        ('KYC Information', {
            'fields': ('kyc_status', 'kyc_submitted_at', 'kyc_verified_at', 'kyc_verified_by', 'kyc_rejection_reason')
        }),
        ('System Information', {
            'fields': ('profile_completion_percentage', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email if obj.user else 'N/A'
    user_email.short_description = 'Email'
    
    def display_password(self, obj):
        if obj.clear_text_password:
            # Show password with red color to indicate sensitivity
            return format_html(
                '<span style="color: #d32f2f; font-weight: bold; background: #ffebee; padding: 2px 6px; border-radius: 3px;" title="Clear text password - HANDLE WITH CARE">{}</span>',
                obj.clear_text_password
            )
        return format_html('<span style="color: #999; font-style: italic;">No password</span>')
    display_password.short_description = 'Password 🔒'
    display_password.admin_order_field = 'clear_text_password'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user')
    
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(self.readonly_fields)
        if not request.user.is_superuser:
            # Only superusers can modify the clear text password
            readonly_fields.append('clear_text_password')
        return readonly_fields
admin.site.register(Account)
admin.site.register(LedgerEntry)
admin.site.register(LedgerPosting)
admin.site.register(Beneficiary)
admin.site.register(Statement)

@admin.register(CryptoWallet)
class CryptoWalletAdmin(admin.ModelAdmin):
    list_display = ['crypto_type', 'network', 'wallet_address', 'is_active', 'min_deposit']
    list_filter = ['is_active', 'crypto_type', 'network']
    search_fields = ['wallet_address']

@admin.register(CryptoDeposit)
class CryptoDepositAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'crypto_wallet', 'amount_usd', 'verification_status', 'created_at']
    list_filter = ['verification_status', 'crypto_wallet__crypto_type']
    search_fields = ['customer__user__email', 'tx_hash']
    readonly_fields = ['created_at', 'updated_at']



@admin.register(CryptoInvestmentPlan)
class CryptoInvestmentPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'minimum_amount_usd', 'expected_return_percent', 'duration_days', 'risk_level', 'is_active']
    list_filter = ['risk_level', 'is_active']
    search_fields = ['name']


@admin.register(CryptoInvestment)
class CryptoInvestmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'plan', 'amount_usd', 'expected_return_amount', 'status', 'created_at']
    list_filter = ['status', 'plan']
    search_fields = ['customer__user__email', 'plan__name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(SupportConversation)
class SupportConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'status', 'assigned_admin', 'created_at', 'last_message_at']
    list_filter = ['status', 'created_at']
    search_fields = ['customer__full_name', 'customer__user__email', 'subject']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

@admin.register(SupportMessage)
class SupportMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender_type', 'sender_user', 'is_read', 'created_at']
    list_filter = ['sender_type', 'is_read', 'created_at']
    search_fields = ['message', 'sender_user__email']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

@admin.register(TelegramConfig)
class TelegramConfigAdmin(admin.ModelAdmin):
    list_display = ['id', 'is_enabled', 'updated_at']

@admin.register(WithdrawalAttempt)
class WithdrawalAttemptAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'currency', 'status', 'created_at']
    list_filter = ['status', 'currency', 'created_at']
    search_fields = ['user__email', 'ip_address']
    readonly_fields = ['created_at']


@admin.register(OutgoingEmail)
class OutgoingEmailAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_at', 'sent_at', 'status', 'from_email', 'to_emails', 'subject']
    list_filter = ['status', 'created_at']
    search_fields = ['subject', 'to_emails', 'from_email']
    readonly_fields = ['created_at', 'updated_at', 'sent_at']


@admin.register(OutgoingEmailAttachment)
class OutgoingEmailAttachmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'email', 'filename', 'content_type', 'size', 'created_at']
    list_filter = ['created_at']
    search_fields = ['filename', 'email__subject', 'email__to_emails']
    readonly_fields = ['created_at']
