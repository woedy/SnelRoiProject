from django.contrib import admin

from .models import Account, Beneficiary, CustomerProfile, LedgerEntry, LedgerPosting, Statement

admin.site.register(CustomerProfile)
admin.site.register(Account)
admin.site.register(LedgerEntry)
admin.site.register(LedgerPosting)
admin.site.register(Beneficiary)
admin.site.register(Statement)
