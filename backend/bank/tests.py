from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Account, LedgerEntry
from .services import create_customer_account, get_system_accounts


class LedgerTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='user@example.com', email='user@example.com', password='pass1234')
        create_customer_account(self.user)
        get_system_accounts()

    def test_balance_updates_from_postings(self):
        account = self.user.profile.accounts.first()
        funding, _ = get_system_accounts()
        entry = LedgerEntry.objects.create(reference='REF1', entry_type='DEPOSIT', created_by=self.user, status='POSTED')
        account.postings.create(entry=entry, direction='CREDIT', amount=Decimal('100.00'))
        funding.postings.create(entry=entry, direction='DEBIT', amount=Decimal('100.00'))
        self.assertEqual(account.balance(), Decimal('100.00'))


class ApiFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(username='user@example.com', email='user@example.com', password='pass1234', is_active=True)
        create_customer_account(self.user)
        get_system_accounts()
        self.admin = get_user_model().objects.create_user(username='admin@example.com', email='admin@example.com', password='pass1234', is_staff=True, is_active=True)

    def authenticate(self):
        response = self.client.post('/api/auth/login/', {'email': 'user@example.com', 'password': 'pass1234'}, format='json')
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def authenticate_admin(self):
        response = self.client.post('/api/auth/login/', {'email': 'admin@example.com', 'password': 'pass1234'}, format='json')
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_register_login_dashboard(self):
        response = self.client.post('/api/auth/register/', {
            'email': 'new@example.com',
            'username': 'newuser',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'pass1234',
            'confirm_password': 'pass1234',
            'terms_accepted': True,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        
        # Activate the user manually for testing
        User = get_user_model()
        user = User.objects.get(email='new@example.com')
        user.is_active = True
        user.save()
        
        # Login with the new user
        login_response = self.client.post('/api/auth/login/', {
            'email': 'new@example.com',
            'password': 'pass1234'
        }, format='json')
        self.assertEqual(login_response.status_code, 200)
        token = login_response.data['access']
        response = self.client.get('/api/me/', HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(response.status_code, 200)

    def test_deposit_flow(self):
        self.authenticate()
        response = self.client.post('/api/deposits/', {'amount': '50.00'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['entry_type'], 'DEPOSIT')

    def test_transfer_requires_admin_approval(self):
        recipient = get_user_model().objects.create_user(username='other@example.com', email='other@example.com', password='pass1234')
        create_customer_account(recipient)
        self.authenticate()
        response = self.client.post('/api/transfers/', {
            'amount': '10.00',
            'target_account_number': recipient.profile.accounts.first().account_number,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        entry_id = response.data['id']
        self.authenticate_admin()
        approve = self.client.post(f'/api/admin/transactions/{entry_id}/approve/')
        self.assertEqual(approve.status_code, 200)
        entry = LedgerEntry.objects.get(id=entry_id)
        self.assertEqual(entry.status, 'POSTED')

    def test_withdrawal_requires_admin_approval(self):
        self.authenticate()
        response = self.client.post('/api/withdrawals/', {'amount': '5.00'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('There is an issue with your withdrawal request', response.data['detail'])

    def test_statements_generate(self):
        self.authenticate()
        response = self.client.post('/api/statements/generate/', {
            'period_start': '2024-01-01',
            'period_end': '2024-01-31',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'PENDING')

class VirtualCardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(username='user@example.com', email='user@example.com', password='pass1234', is_active=True)
        create_customer_account(self.user)
        self.admin = get_user_model().objects.create_user(username='admin@example.com', email='admin@example.com', password='pass1234', is_staff=True, is_active=True)

    def authenticate(self):
        response = self.client.post('/api/auth/login/', {'email': 'user@example.com', 'password': 'pass1234'}, format='json')
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def authenticate_admin(self):
        response = self.client.post('/api/auth/login/', {'email': 'admin@example.com', 'password': 'pass1234'}, format='json')
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_virtual_card_application_flow(self):
        """Test complete virtual card application and approval flow"""
        self.authenticate()
        
        # Apply for virtual card
        response = self.client.post('/api/virtual-cards/', {
            'card_type': 'STANDARD',
            'daily_limit': '300.00',
            'monthly_limit': '10000.00',
            'is_international_enabled': False
        }, format='json')
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'PENDING')
        card_id = response.data['id']
        
        # Admin approves the card
        self.authenticate_admin()
        approve_response = self.client.post(f'/api/admin/virtual-cards/{card_id}/approve/', {
            'action': 'approve',
            'admin_notes': 'Application approved'
        }, format='json')
        self.assertEqual(approve_response.status_code, 200)
        self.assertEqual(approve_response.data['card']['status'], 'ACTIVE')

    def test_virtual_card_freeze_unfreeze(self):
        """Test freezing and unfreezing virtual card"""
        from .models import VirtualCard
        
        self.authenticate()
        
        # Create an active virtual card
        card = VirtualCard.objects.create(
            customer=self.user.profile,
            linked_account=self.user.profile.accounts.first(),
            card_type='STANDARD',
            status='ACTIVE'
        )
        
        # Freeze the card
        response = self.client.post(f'/api/virtual-cards/{card.id}/toggle-freeze/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['card']['status'], 'FROZEN')
        
        # Unfreeze the card
        response = self.client.post(f'/api/virtual-cards/{card.id}/toggle-freeze/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['card']['status'], 'ACTIVE')

    def test_virtual_card_limit_enforcement(self):
        """Test that users can't exceed card limits"""
        self.authenticate()
        
        # Create 3 active cards (maximum allowed)
        from .models import VirtualCard
        for i in range(3):
            VirtualCard.objects.create(
                customer=self.user.profile,
                linked_account=self.user.profile.accounts.first(),
                card_type='STANDARD',
                status='ACTIVE'
            )
        
        # Try to apply for a 4th card
        response = self.client.post('/api/virtual-cards/', {
            'card_type': 'STANDARD',
            'daily_limit': '300.00',
            'monthly_limit': '10000.00'
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Maximum of 3 virtual cards', response.data['detail'])