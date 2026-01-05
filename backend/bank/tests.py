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
        entry = LedgerEntry.objects.create(reference='REF1', entry_type='DEPOSIT', created_by=self.user)
        account.postings.create(entry=entry, direction='CREDIT', amount=Decimal('100.00'))
        funding.postings.create(entry=entry, direction='DEBIT', amount=Decimal('100.00'))
        self.assertEqual(account.balance(), Decimal('100.00'))


class ApiFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(username='user@example.com', email='user@example.com', password='pass1234')
        create_customer_account(self.user)
        get_system_accounts()
        self.admin = get_user_model().objects.create_user(username='admin@example.com', email='admin@example.com', password='pass1234', is_staff=True)

    def authenticate(self):
        response = self.client.post('/api/auth/login', {'email': 'user@example.com', 'password': 'pass1234'}, format='json')
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def authenticate_admin(self):
        response = self.client.post('/api/auth/login', {'email': 'admin@example.com', 'password': 'pass1234'}, format='json')
        token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_register_login_dashboard(self):
        response = self.client.post('/api/auth/register', {
            'email': 'new@example.com',
            'password': 'pass1234',
            'full_name': 'New User',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        response = self.client.get('/api/me', HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        self.assertEqual(response.status_code, 200)

    def test_deposit_flow(self):
        self.authenticate()
        response = self.client.post('/api/deposits', {'amount': '50.00'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['entry_type'], 'DEPOSIT')

    def test_transfer_requires_admin_approval(self):
        recipient = get_user_model().objects.create_user(username='other@example.com', email='other@example.com', password='pass1234')
        create_customer_account(recipient)
        self.authenticate()
        response = self.client.post('/api/transfers', {
            'amount': '10.00',
            'target_account_number': recipient.profile.accounts.first().account_number,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        entry_id = response.data['id']
        self.authenticate_admin()
        approve = self.client.post(f'/api/admin/transactions/{entry_id}/approve')
        self.assertEqual(approve.status_code, 200)
        entry = LedgerEntry.objects.get(id=entry_id)
        self.assertEqual(entry.status, 'POSTED')

    def test_withdrawal_requires_admin_approval(self):
        self.authenticate()
        response = self.client.post('/api/withdrawals', {'amount': '5.00'}, format='json')
        self.assertEqual(response.status_code, 201)
        entry_id = response.data['id']
        self.authenticate_admin()
        approve = self.client.post(f'/api/admin/transactions/{entry_id}/approve')
        self.assertEqual(approve.status_code, 200)

    def test_statements_generate(self):
        self.authenticate()
        response = self.client.post('/api/statements/generate', {
            'period_start': '2024-01-01',
            'period_end': '2024-01-31',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'PENDING')
