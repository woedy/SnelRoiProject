from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q, Sum
from rest_framework import serializers

from .models import Account, Beneficiary, CustomerProfile, LedgerEntry, LedgerPosting, Statement, CryptoWallet, CryptoDeposit
from .services import create_customer_account

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'is_staff', 'is_active']


class AccountSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['id', 'type', 'currency', 'status', 'account_number', 'balance']

    def get_balance(self, obj):
        return obj.balance()


class AdminAccountSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'type', 'currency', 'status', 'account_number', 'balance', 'customer_name', 'customer_email']

    def get_balance(self, obj):
        return obj.balance()


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=False, allow_blank=True)
    accounts = AdminAccountSerializer(source='profile.accounts', many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'full_name',
            'accounts',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['full_name'] = instance.profile.full_name if hasattr(instance, 'profile') else instance.get_full_name()
        return data

    def update(self, instance, validated_data):
        full_name = validated_data.pop('full_name', None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.username = instance.email
        instance.save()
        if full_name is not None:
            profile, _ = CustomerProfile.objects.get_or_create(
                user=instance,
                defaults={'full_name': full_name or instance.get_full_name() or instance.username},
            )
            profile.full_name = full_name or profile.full_name
            profile.save(update_fields=['full_name'])
        return instance


class AdminUserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()
    is_staff = serializers.BooleanField(default=False)
    is_active = serializers.BooleanField(default=True)

    def create(self, validated_data):
        full_name = validated_data['full_name']
        first_name, *rest = full_name.split(' ')
        last_name = ' '.join(rest)
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            is_staff=validated_data.get('is_staff', False),
            is_active=validated_data.get('is_active', True),
        )
        CustomerProfile.objects.update_or_create(
            user=user,
            defaults={'full_name': full_name},
        )
        create_customer_account(user)
        
        # Notify user of their credentials
        from .emails import send_welcome_email
        send_welcome_email.delay(user.id, validated_data['password'])
        
        return user


class AdminUserUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True, required=False)
    full_name = serializers.CharField(required=False, allow_blank=True)
    is_staff = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['full_name'].split(' ')[0],
            last_name=' '.join(validated_data['full_name'].split(' ')[1:]),
            is_active=False,
        )
        profile = CustomerProfile.objects.create(user=user, full_name=validated_data['full_name'])
        create_customer_account(user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        data['user'] = user
        return data


class AdminAccountUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Account.STATUS_CHOICES, required=False)
    type = serializers.ChoiceField(choices=Account.TYPE_CHOICES, required=False)


class LedgerPostingSerializer(serializers.ModelSerializer):
    account_number = serializers.CharField(source='account.account_number', read_only=True)

    class Meta:
        model = LedgerPosting
        fields = ['id', 'account_number', 'direction', 'amount', 'description']


class LedgerEntrySerializer(serializers.ModelSerializer):
    postings = LedgerPostingSerializer(many=True, read_only=True)

    class Meta:
        model = LedgerEntry
        fields = ['id', 'reference', 'entry_type', 'created_at', 'status', 'memo', 'postings']


class AdminLedgerEntrySerializer(serializers.ModelSerializer):
    postings = LedgerPostingSerializer(many=True, read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    amount = serializers.SerializerMethodField()

    class Meta:
        model = LedgerEntry
        fields = ['id', 'reference', 'entry_type', 'created_at', 'status', 'memo', 'created_by_email', 'amount', 'postings']

    def get_amount(self, obj):
        totals = obj.postings.aggregate(debit=Sum('amount', filter=Q(direction='DEBIT')))
        return totals['debit'] or 0


class BeneficiarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficiary
        fields = ['id', 'name', 'bank_label', 'account_number', 'favorite']


class StatementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statement
        fields = ['id', 'period_start', 'period_end', 'generated_at', 'status', 'content']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CustomerProfile
        fields = ['full_name', 'phone', 'preferred_language', 'kyc_status', 'tier', 'user']


from decimal import Decimal

class ExternalTransferSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    memo = serializers.CharField(max_length=500, required=False, allow_blank=True)
    recipient_details = serializers.DictField()
    fee = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'))

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def validate_recipient_details(self, value):
        required_fields = ['recipientName', 'bankName', 'accountNumber', 'routingNumber']
        for field in required_fields:
            if not value.get(field):
                raise serializers.ValidationError(f"{field} is required")
        return value


class CryptoWalletSerializer(serializers.ModelSerializer):
    """Serializer for crypto wallet configuration"""
    crypto_type_display = serializers.CharField(source='get_crypto_type_display', read_only=True)
    network_display = serializers.CharField(source='get_network_display', read_only=True)
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = CryptoWallet
        fields = [
            'id', 'crypto_type', 'crypto_type_display', 'network', 'network_display',
            'wallet_address', 'qr_code_image', 'qr_code_url', 'is_active',
            'min_deposit', 'instructions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_qr_code_url(self, obj):
        if obj.qr_code_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_code_image.url)
        return None


class CryptoWalletPublicSerializer(serializers.ModelSerializer):
    """Public serializer for active crypto wallets (for users)"""
    crypto_type_display = serializers.CharField(source='get_crypto_type_display', read_only=True)
    network_display = serializers.CharField(source='get_network_display', read_only=True)
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = CryptoWallet
        fields = [
            'id', 'crypto_type', 'crypto_type_display', 'network', 'network_display',
            'wallet_address', 'qr_code_url', 'min_deposit', 'instructions'
        ]

    def get_qr_code_url(self, obj):
        if obj.qr_code_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_code_image.url)
        return None


class CryptoDepositSerializer(serializers.ModelSerializer):
    """Serializer for crypto deposit requests"""
    crypto_wallet_details = CryptoWalletPublicSerializer(source='crypto_wallet', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    verification_status_display = serializers.CharField(source='get_verification_status_display', read_only=True)
    proof_of_payment_url = serializers.SerializerMethodField()

    class Meta:
        model = CryptoDeposit
        fields = [
            'id', 'customer', 'customer_name', 'crypto_wallet', 'crypto_wallet_details',
            'amount_usd', 'crypto_amount', 'exchange_rate', 'tx_hash',
            'proof_of_payment', 'proof_of_payment_url', 'verification_status',
            'verification_status_display', 'admin_notes', 'verified_by', 'verified_at',
            'created_at', 'updated_at', 'expires_at'
        ]
        read_only_fields = [
            'customer', 'verification_status', 'admin_notes', 'verified_by',
            'verified_at', 'created_at', 'updated_at'
        ]

    def get_proof_of_payment_url(self, obj):
        if obj.proof_of_payment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.proof_of_payment.url)
        return None


class CryptoDepositCreateSerializer(serializers.Serializer):
    """Serializer for initiating a crypto deposit"""
    crypto_wallet_id = serializers.IntegerField()
    amount_usd = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    crypto_amount = serializers.DecimalField(max_digits=18, decimal_places=8, required=False, allow_null=True)
    exchange_rate = serializers.DecimalField(max_digits=18, decimal_places=8, required=False, allow_null=True)

    def validate_crypto_wallet_id(self, value):
        try:
            wallet = CryptoWallet.objects.get(id=value, is_active=True)
        except CryptoWallet.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive crypto wallet")
        return value

    def validate(self, data):
        wallet = CryptoWallet.objects.get(id=data['crypto_wallet_id'])
        if data['amount_usd'] < wallet.min_deposit:
            raise serializers.ValidationError(
                f"Minimum deposit for {wallet.get_crypto_type_display()} is ${wallet.min_deposit}"
            )
        return data


class CryptoDepositProofUploadSerializer(serializers.Serializer):
    """Serializer for uploading proof of payment"""
    proof_of_payment = serializers.ImageField()
    tx_hash = serializers.CharField(max_length=255, required=False, allow_blank=True)


class CryptoDepositVerificationSerializer(serializers.Serializer):
    """Serializer for admin verification of crypto deposits"""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    admin_notes = serializers.CharField(required=False, allow_blank=True)


class AdminManualTransferSerializer(serializers.Serializer):
    """Serializer for manual fund transfers by admins"""
    to_account_number = serializers.CharField(max_length=50)
    from_account_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    memo = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate_to_account_number(self, value):
        clean_value = value.strip()
        if not clean_value:
            raise serializers.ValidationError("Recipient account number cannot be empty.")
            
        try:
            account = Account.objects.get(account_number=clean_value, status='ACTIVE')
        except Account.DoesNotExist:
            raise serializers.ValidationError(f"Recipient account '{clean_value}' not found or frozen.")
        return clean_value

    def validate_from_account_number(self, value):
        if not value:
            return value
        return value.strip()

