#!/usr/bin/env python
"""
Simple test script to verify KYC system functionality
Run with: python test_kyc_system.py
"""

import os
import sys
import django
from django.conf import settings

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking.settings')
django.setup()

from django.contrib.auth import get_user_model
from bank.models import CustomerProfile, KYCDocument
from bank.services import create_notification

User = get_user_model()

def test_kyc_system():
    """Test the KYC system functionality"""
    print("🧪 Testing KYC System...")
    
    # Create a test user
    test_email = "kyc_test@example.com"
    
    # Clean up any existing test user
    User.objects.filter(email=test_email).delete()
    
    # Create new test user
    user = User.objects.create_user(
        username=test_email,
        email=test_email,
        password="testpass123"
    )
    
    # Get or create profile
    profile, created = CustomerProfile.objects.get_or_create(
        user=user,
        defaults={
            'full_name': 'Test User',
            'phone': '+1234567890',
            'country': 'United States',
            'date_of_birth': '1990-01-01',
            'address_line_1': '123 Test Street',
            'city': 'Test City',
            'state_province': 'Test State',
            'postal_code': '12345',
            'kyc_status': 'PENDING'
        }
    )
    
    print(f"✅ Created test user: {user.email}")
    print(f"✅ Profile KYC status: {profile.kyc_status}")
    print(f"✅ Profile completion: {profile.profile_completion_percentage}%")
    
    # Test profile completion calculation
    completion = profile.calculate_profile_completion()
    print(f"✅ Calculated completion: {completion}%")
    
    # Test notification creation
    create_notification(
        profile,
        'Test KYC Notification',
        'This is a test notification for KYC system',
        'KYC'
    )
    print("✅ Created test notification")
    
    # Test KYC status changes
    original_status = profile.kyc_status
    
    # Test status change to UNDER_REVIEW
    profile.kyc_status = 'UNDER_REVIEW'
    profile.save()
    print(f"✅ Changed KYC status to: {profile.kyc_status}")
    
    # Test status change to VERIFIED
    profile.kyc_status = 'VERIFIED'
    profile.save()
    print(f"✅ Changed KYC status to: {profile.kyc_status}")
    
    # Test status change to REJECTED
    profile.kyc_status = 'REJECTED'
    profile.kyc_rejection_reason = 'Test rejection reason'
    profile.save()
    print(f"✅ Changed KYC status to: {profile.kyc_status}")
    print(f"✅ Rejection reason: {profile.kyc_rejection_reason}")
    
    # Check notifications
    notifications = profile.notifications.all()
    print(f"✅ Total notifications: {notifications.count()}")
    
    # Clean up
    print("\n🧹 Cleaning up test data...")
    user.delete()  # This will cascade delete the profile and notifications
    print("✅ Test data cleaned up")
    
    print("\n🎉 KYC System test completed successfully!")

if __name__ == "__main__":
    test_kyc_system()