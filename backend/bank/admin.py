from django.contrib import admin

from .models import Account, Beneficiary, CustomerProfile, LedgerEntry, LedgerPosting, Statement, CryptoWallet, CryptoDeposit

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
