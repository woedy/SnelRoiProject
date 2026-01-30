from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from bank.models import CustomerProfile
from bank.services import (
    create_transaction_notification,
    create_kyc_notification,
    create_virtual_card_notification,
    create_crypto_deposit_notification,
    create_security_notification,
    create_system_notification
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test notifications for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email of the user to create notifications for',
            default=None
        )

    def handle(self, *args, **options):
        email = options.get('email')
        
        if email:
            try:
                user = User.objects.get(email=email)
                customer = user.profile
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'User with email {email} not found')
                )
                return
        else:
            # Get the first customer profile
            customer = CustomerProfile.objects.first()
            if not customer:
                self.stdout.write(
                    self.style.ERROR('No customer profiles found. Please create a user first.')
                )
                return

        self.stdout.write(f'Creating test notifications for {customer.full_name}...')

        # Create various types of notifications
        notifications_created = []

        # Transaction notifications
        create_transaction_notification(
            customer=customer,
            transaction_type='DEPOSIT',
            amount=500.00,
            status='POSTED',
            reference='DEP123456'
        )
        notifications_created.append('Deposit confirmation')

        create_transaction_notification(
            customer=customer,
            transaction_type='TRANSFER',
            amount=250.00,
            status='PENDING',
            reference='TRF789012'
        )
        notifications_created.append('Transfer pending approval')

        create_transaction_notification(
            customer=customer,
            transaction_type='WITHDRAWAL',
            amount=100.00,
            status='APPROVED',
            reference='WTH345678'
        )
        notifications_created.append('Withdrawal approved')

        # KYC notification
        create_kyc_notification(
            customer=customer,
            status='VERIFIED'
        )
        notifications_created.append('KYC verification complete')

        # Virtual card notification
        create_virtual_card_notification(
            customer=customer,
            card_status='ACTIVE',
            card_last_four='1234'
        )
        notifications_created.append('Virtual card approved')

        # Crypto deposit notification
        create_crypto_deposit_notification(
            customer=customer,
            status='APPROVED',
            amount=1000.00,
            crypto_type='BTC'
        )
        notifications_created.append('Crypto deposit approved')

        # Security notification
        create_security_notification(
            customer=customer,
            event_type='LOGIN',
            details='New login from Chrome on Windows'
        )
        notifications_created.append('Security alert - new login')

        # System notification
        create_system_notification(
            customer=customer,
            title='System Maintenance',
            message='Scheduled maintenance will occur on Sunday from 2:00 AM to 4:00 AM EST. Banking services may be temporarily unavailable.',
            priority='MEDIUM',
            action_url='/app/help'
        )
        notifications_created.append('System maintenance notice')

        # High priority security alert
        create_security_notification(
            customer=customer,
            event_type='ACCOUNT_FROZEN',
            details='Suspicious activity detected. Please contact support immediately.'
        )
        notifications_created.append('Account security alert')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(notifications_created)} test notifications:'
            )
        )
        
        for notification in notifications_created:
            self.stdout.write(f'  ✓ {notification}')

        self.stdout.write(
            self.style.SUCCESS(
                f'\nNotifications created for: {customer.full_name} ({customer.user.email})'
            )
        )