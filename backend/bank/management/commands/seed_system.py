from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from bank.services import create_customer_account, get_system_accounts


class Command(BaseCommand):
    help = 'Seed system accounts and optional admin user.'

    def handle(self, *args, **options):
        funding, payout = get_system_accounts()
        self.stdout.write(self.style.SUCCESS(f'Funding account: {funding.account_number}'))
        self.stdout.write(self.style.SUCCESS(f'Payout account: {payout.account_number}'))
        admin_email = settings.SYSTEM_USER_EMAIL
        admin_password = settings.SYSTEM_USER_PASSWORD
        User = get_user_model()
        admin, created = User.objects.get_or_create(
            username=admin_email,
            defaults={'email': admin_email, 'is_staff': True, 'is_superuser': True},
        )
        if created:
            admin.set_password(admin_password)
            admin.save()
            create_customer_account(admin)
            self.stdout.write(self.style.SUCCESS('Admin user created.'))
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists.'))
