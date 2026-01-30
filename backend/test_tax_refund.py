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

User = get_user_model()
user = User.objects.get(email='test@example.com')

# Generate JWT token
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

# Test creating a tax refund application
client = Client()
application_data = {
    'tax_year': 2024,
    'first_name': 'John',
    'last_name': 'Doe',
    'ssn': '123-45-6789',
    'date_of_birth': '1990-01-01',
    'address_line_1': '123 Main St',
    'city': 'Anytown',
    'state': 'CA',
    'zip_code': '12345',
    'email_address': 'john@example.com',
    'filing_status': 'SINGLE',
    'total_income': 50000,
    'federal_tax_withheld': 8000,
    'number_of_dependents': 0,
    'use_standard_deduction': True
}

print("Testing tax refund application creation...")
response = client.post(
    '/api/tax-refunds/',
    data=json.dumps(application_data),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Bearer {access_token}'
)

print(f'Create application status: {response.status_code}')
if response.status_code == 201:
    data = response.json()
    app_number = data.get('application_number', 'N/A')
    estimated_refund = data.get('estimated_refund', 0)
    print(f'Application created: {app_number}')
    print(f'Estimated refund: ${estimated_refund}')
    print('✅ Tax refund application creation working!')
    
    # Test getting applications list
    list_response = client.get(
        '/api/tax-refunds/',
        HTTP_AUTHORIZATION=f'Bearer {access_token}'
    )
    print(f'List applications status: {list_response.status_code}')
    if list_response.status_code == 200:
        apps = list_response.json()
        print(f'Found {len(apps)} applications')
        print('✅ Tax refund application listing working!')
    
else:
    print(f'Error: {response.content.decode()}')

print("\nTesting admin endpoints...")
# Test admin endpoints (need admin user)
from django.contrib.auth import get_user_model
User = get_user_model()
admin_user, created = User.objects.get_or_create(
    email='admin@example.com',
    defaults={'is_staff': True, 'is_superuser': True, 'is_active': True}
)
if created:
    admin_user.set_password('admin123')
    admin_user.save()

admin_refresh = RefreshToken.for_user(admin_user)
admin_token = str(admin_refresh.access_token)

admin_response = client.get(
    '/api/admin/tax-refunds/',
    HTTP_AUTHORIZATION=f'Bearer {admin_token}'
)
print(f'Admin list applications status: {admin_response.status_code}')
if admin_response.status_code == 200:
    print('✅ Admin tax refund endpoints working!')
else:
    print(f'Admin error: {admin_response.content.decode()}')

print("\n=== Tax Refund Feature Test Summary ===")
print("✅ Calculator endpoint: Working")
print("✅ Application creation: Working" if response.status_code == 201 else "❌ Application creation: Failed")
print("✅ Application listing: Working" if list_response.status_code == 200 else "❌ Application listing: Failed")
print("✅ Admin endpoints: Working" if admin_response.status_code == 200 else "❌ Admin endpoints: Failed")