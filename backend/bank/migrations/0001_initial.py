from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomerProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=255)),
                ('phone', models.CharField(blank=True, max_length=40)),
                ('preferred_language', models.CharField(default='en', max_length=10)),
                ('kyc_status', models.CharField(choices=[('PENDING', 'Pending'), ('VERIFIED', 'Verified')], default='PENDING', max_length=20)),
                ('tier', models.CharField(choices=[('STANDARD', 'Standard'), ('PREMIUM', 'Premium')], default='STANDARD', max_length=20)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('CHECKING', 'Checking'), ('SAVINGS', 'Savings'), ('SYSTEM', 'System')], default='CHECKING', max_length=20)),
                ('currency', models.CharField(default='GHS', max_length=3)),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('FROZEN', 'Frozen')], default='ACTIVE', max_length=20)),
                ('account_number', models.CharField(max_length=32, unique=True)),
                ('customer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='accounts', to='bank.customerprofile')),
            ],
        ),
        migrations.CreateModel(
            name='LedgerEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reference', models.CharField(max_length=64, unique=True)),
                ('entry_type', models.CharField(choices=[('DEPOSIT', 'Deposit'), ('TRANSFER', 'Transfer'), ('WITHDRAWAL', 'Withdrawal')], max_length=20)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('DECLINED', 'Declined'), ('POSTED', 'Posted'), ('REVERSED', 'Reversed')], default='PENDING', max_length=20)),
                ('approved_at', models.DateTimeField(blank=True, null=True)),
                ('memo', models.CharField(blank=True, max_length=255)),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='entries_approved', to=settings.AUTH_USER_MODEL)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='entries_created', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Statement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('period_start', models.DateField()),
                ('period_end', models.DateField()),
                ('generated_at', models.DateTimeField(blank=True, null=True)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('READY', 'Ready')], default='PENDING', max_length=20)),
                ('content', models.TextField(blank=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='statements', to='bank.customerprofile')),
            ],
        ),
        migrations.CreateModel(
            name='LedgerPosting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('direction', models.CharField(choices=[('DEBIT', 'Debit'), ('CREDIT', 'Credit')], max_length=10)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('description', models.CharField(blank=True, max_length=255)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='postings', to='bank.account')),
                ('entry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='postings', to='bank.ledgerentry')),
            ],
        ),
        migrations.CreateModel(
            name='Beneficiary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('bank_label', models.CharField(max_length=120)),
                ('account_number', models.CharField(max_length=64)),
                ('favorite', models.BooleanField(default=False)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='beneficiaries', to='bank.customerprofile')),
            ],
        ),
    ]
