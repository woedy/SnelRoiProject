#!/usr/bin/env python
import os
import sys
import django
import json

# Setup Django
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from bank.models import TaxRefundApplication

User = get_user_model()

# Get admin user
admin_user = User.objects.get(email='admin@example.com')
admin_refresh = RefreshToken.for_user(admin_user)
admin_token = str(admin_refresh.access_token)

# Get the test application
app = TaxRefundApplication.objects.first()
if not app:
    print("No tax refund application found!")
    sys.exit(1)

print(f"Testing admin approval workflow for application: {app.application_number}")
print(f"Current status: {app.status}")
print(f"Estimated refund: ${app.estimated_refund}")

# Test submitting the application first (as customer)
user = User.objects.get(email='test@example.com')
user_refresh = RefreshToken.for_user(user)
user_token = str(user_refresh.access_token)

client = Client()

# Submit application for review
submit_response = client.patch(
    f'/api/tax-refunds/{app.id}/',
    data=json.dumps({'action': 'submit'}),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Bearer {user_token}'
)

print(f'Submit application status: {submit_response.status_code}')
if submit_response.status_code == 200:
    data = submit_response.json()
    print(f'Application status after submit: {data.get("status")}')
    print('✅ Application submission working!')
else:
    print(f'Submit error: {submit_response.content.decode()}')

# Now test admin approval
approval_data = {
    'action': 'approve',
    'approved_refund': 3500.00,
    'admin_notes': 'Application approved after review. All documents verified.'
}

approve_response = client.patch(
    f'/api/admin/tax-refunds/{app.id}/',
    data=json.dumps(approval_data),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Bearer {admin_token}'
)

print(f'Admin approval status: {approve_response.status_code}')
if approve_response.status_code == 200:
    data = approve_response.json()
    print(f'Application status after approval: {data.get("status")}')
    print(f'Approved refund: ${data.get("approved_refund")}')
    print('✅ Admin approval working!')
    
    # Check if ledger entry was created
    from bank.models import LedgerEntry
    refund_entries = LedgerEntry.objects.filter(
        entry_type='TAX_REFUND',
        external_data__tax_refund_application_id=app.id
    )
    print(f'Ledger entries created: {refund_entries.count()}')
    if refund_entries.exists():
        entry = refund_entries.first()
        print(f'Ledger entry status: {entry.status}')
        print(f'Ledger entry amount: ${sum(p.amount for p in entry.postings.filter(direction="CREDIT"))}')
        print('✅ Ledger integration working!')
    
else:
    print(f'Approval error: {approve_response.content.decode()}')

# Test admin stats endpoint
stats_response = client.get(
    '/api/admin/tax-refunds/stats/',
    HTTP_AUTHORIZATION=f'Bearer {admin_token}'
)

print(f'Admin stats status: {stats_response.status_code}')
if stats_response.status_code == 200:
    stats = stats_response.json()
    print(f'Total applications: {stats.get("total_applications", 0)}')
    print(f'Total refunds approved: ${stats.get("total_refunds_approved", 0)}')
    print('✅ Admin stats working!')

print("\n=== Tax Refund Admin Test Summary ===")
print("✅ Application submission: Working" if submit_response.status_code == 200 else "❌ Application submission: Failed")
print("✅ Admin approval: Working" if approve_response.status_code == 200 else "❌ Admin approval: Failed")
print("✅ Ledger integration: Working" if refund_entries.exists() else "❌ Ledger integration: Failed")
print("✅ Admin stats: Working" if stats_response.status_code == 200 else "❌ Admin stats: Failed")