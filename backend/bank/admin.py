from django.contrib import admin

from .models import Account, Beneficiary, CustomerProfile, LedgerEntry, LedgerPosting, Statement, CryptoWallet, CryptoDeposit, SupportConversation, SupportMessage

admin.site.register(CustomerProfile)
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
