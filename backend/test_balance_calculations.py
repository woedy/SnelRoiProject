#!/usr/bin/env python3
"""
Test script to verify balance calculations are working correctly.
Run this script to test the dashboard balance calculations.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking.settings')
django.setup()

from django.contrib.auth import get_user_model
from bank.models import Account, LedgerEntry, LedgerPosting, CustomerProfile
from bank.services import create_entry, add_posting
from decimal import Decimal

User = get_user_model()

def test_balance_calculations():
    print("🧪 Testing Balance Calculations...")
    
    # Create or get test user
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Created test user: {user.email}")
    else:
        print(f"📋 Using existing test user: {user.email}")
    
    # Get or create customer profile
    profile, created = CustomerProfile.objects.get_or_create(
        user=user,
        defaults={
            'phone': '+1234567890',
            'date_of_birth': '1990-01-01',
            'kyc_status': 'VERIFIED'
        }
    )
    
    # Get or create checking account
    account, created = Account.objects.get_or_create(
        customer=profile,
        type='CHECKING',
        defaults={
            'currency': 'USD',
            'status': 'ACTIVE',
            'account_number': f'ACCT-{user.id:06d}'
        }
    )
    
    if created:
        print(f"✅ Created test account: {account.account_number}")
    else:
        print(f"📋 Using existing test account: {account.account_number}")
    
    # Clear existing transactions for clean test
    LedgerEntry.objects.filter(postings__account=account).delete()
    
    print("\n💰 Creating test transactions...")
    
    # Create a POSTED deposit (should appear in available balance)
    posted_deposit = create_entry(
        entry_type='DEPOSIT',
        memo='Test Posted Deposit',
        created_by=user
    )
    add_posting(posted_deposit, account, 'CREDIT', Decimal('1000.00'))
    posted_deposit.status = 'POSTED'
    posted_deposit.save()
    print(f"✅ Created POSTED deposit: $1000.00")
    
    # Create a PENDING deposit (should appear in pending balance)
    pending_deposit = create_entry(
        entry_type='DEPOSIT',
        memo='Test Pending Deposit',
        created_by=user
    )
    add_posting(pending_deposit, account, 'CREDIT', Decimal('500.00'))
    # Keep status as PENDING
    print(f"⏳ Created PENDING deposit: $500.00")
    
    # Create a PENDING withdrawal (should appear as negative in pending balance)
    pending_withdrawal = create_entry(
        entry_type='WITHDRAWAL',
        memo='Test Pending Withdrawal',
        created_by=user
    )
    add_posting(pending_withdrawal, account, 'DEBIT', Decimal('200.00'))
    # Keep status as PENDING
    print(f"⏳ Created PENDING withdrawal: $200.00")
    
    print("\n📊 Calculating balances...")
    
    # Calculate balances manually to verify
    available_balance = account.balance()  # Only POSTED transactions
    print(f"Available Balance (POSTED only): ${available_balance}")
    
    # Calculate pending balance
    from django.db.models import Q, Sum
    pending_postings = LedgerPosting.objects.filter(
        entry__status='PENDING',
        account=account,
    ).aggregate(
        pending_debits=Sum('amount', filter=Q(direction='DEBIT')),
        pending_credits=Sum('amount', filter=Q(direction='CREDIT')),
    )
    
    pending_credits = pending_postings['pending_credits'] or 0
    pending_debits = pending_postings['pending_debits'] or 0
    pending_balance = pending_credits - pending_debits
    print(f"Pending Balance: ${pending_balance}")
    
    total_balance = available_balance + pending_balance
    print(f"Total Balance: ${total_balance}")
    
    print("\n🌐 Testing Dashboard API...")
    
    # Test the dashboard API
    from django.test import RequestFactory
    from bank.views import DashboardView
    
    factory = RequestFactory()
    request = factory.get('/dashboard/')
    request.user = user
    
    view = DashboardView()
    response = view.get(request)
    
    if response.status_code == 200:
        data = response.data
        print(f"✅ Dashboard API Response:")
        print(f"   Total Balance: ${data['total_balance']}")
        print(f"   Available Balance: ${data['available_balance']}")
        print(f"   Pending Balance: ${data['pending_balance']}")
        
        # Verify calculations
        expected_available = Decimal('1000.00')
        expected_pending = Decimal('300.00')  # 500 - 200
        expected_total = expected_available
        
        if (abs(data['available_balance'] - expected_available) < Decimal('0.01') and
            abs(data['pending_balance'] - expected_pending) < Decimal('0.01')):
            print("✅ Balance calculations are CORRECT!")
        else:
            print("❌ Balance calculations are INCORRECT!")
            print(f"   Expected Available: ${expected_available}")
            print(f"   Expected Pending: ${expected_pending}")
    else:
        print(f"❌ Dashboard API failed with status: {response.status_code}")
    
    print("\n🧹 Cleaning up test data...")
    # Clean up test transactions
    LedgerEntry.objects.filter(postings__account=account).delete()
    print("✅ Test completed!")

if __name__ == '__main__':
    test_balance_calculations()