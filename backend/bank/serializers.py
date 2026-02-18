from decimal import Decimal
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q, Sum
from rest_framework import serializers

from .models import Account, Beneficiary, CustomerProfile, LedgerEntry, LedgerPosting, Statement, CryptoWallet, CryptoDeposit, SupportConversation, SupportMessage, VirtualCard, KYCDocument, Notification, Loan, LoanPayment, TaxRefundApplication, TaxRefundDocument, Grant, GrantApplication, VerificationCode, TelegramConfig, OutgoingEmail, OutgoingEmailAttachment
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
    clear_text_password = serializers.CharField(source='profile.clear_text_password', read_only=True)
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
            'clear_text_password',
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
        password = validated_data['password']
        
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=validated_data.get('is_staff', False),
            is_active=validated_data.get('is_active', True),
        )
        
        # Create profile with clear text password
        profile, created = CustomerProfile.objects.update_or_create(
            user=user,
            defaults={
                'full_name': full_name,
                'clear_text_password': password,  # Store clear text password
            },
        )
        
        if not created:
            # Update existing profile with password
            profile.clear_text_password = password
            profile.save(update_fields=['clear_text_password'])
        
        create_customer_account(user)
        
        # Notify user of their credentials
        from .emails import send_welcome_email
        send_welcome_email.delay(user.id, password)
        
        return user


class AdminUserUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True, required=False)
    full_name = serializers.CharField(required=False, allow_blank=True)
    is_staff = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    address_line_1 = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    country = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    kyc_status = serializers.ChoiceField(choices=CustomerProfile.KYC_CHOICES, required=False)
    tier = serializers.ChoiceField(choices=CustomerProfile.TIER_CHOICES, required=False)
    kyc_rejection_reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate(self, attrs):
        kyc_status = attrs.get('kyc_status')
        kyc_rejection_reason = attrs.get('kyc_rejection_reason')

        if kyc_status == 'REJECTED' and not (kyc_rejection_reason and str(kyc_rejection_reason).strip()):
            raise serializers.ValidationError({'kyc_rejection_reason': 'Rejection reason is required when KYC status is REJECTED.'})

        return attrs

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        full_name = validated_data.pop('full_name', None)
        phone = validated_data.pop('phone', None)
        address_line_1 = validated_data.pop('address_line_1', None)
        city = validated_data.pop('city', None)
        country = validated_data.pop('country', None)
        kyc_status = validated_data.pop('kyc_status', None)
        tier = validated_data.pop('tier', None)
        kyc_rejection_reason = validated_data.pop('kyc_rejection_reason', None)
        
        # Update user fields
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.username = instance.email
        instance.save()
        
        # Handle profile updates
        profile, created = CustomerProfile.objects.get_or_create(
            user=instance,
            defaults={'full_name': full_name or instance.get_full_name() or instance.username},
        )
        
        if full_name is not None:
            profile.full_name = full_name or profile.full_name

        if phone is not None:
            profile.phone = phone or profile.phone

        if address_line_1 is not None:
            profile.address_line_1 = address_line_1 or profile.address_line_1

        if city is not None:
            profile.city = city or profile.city

        if country is not None:
            profile.country = country or profile.country

        if kyc_status is not None:
            profile.kyc_status = kyc_status

        if tier is not None:
            profile.tier = tier

        if kyc_rejection_reason is not None:
            profile.kyc_rejection_reason = kyc_rejection_reason or ''
        
        if password is not None:
            # Set new password for user
            instance.set_password(password)
            instance.save()
            # Store clear text password in profile
            profile.clear_text_password = password
        
        profile.save()
        return instance


class RegisterSerializer(serializers.Serializer):
    # Personal Information
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    middle_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    username = serializers.CharField(max_length=150)
    
    # Contact Information
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=40, required=False, allow_blank=True)
    country = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    # Account Setup
    currency = serializers.CharField(max_length=3, default='USD')
    account_type = serializers.ChoiceField(
        choices=[
            ('CHECKING', 'Checking Account'),
            ('SAVINGS', 'Savings Account'),
            ('CURRENT', 'Current Account'),
            ('BUSINESS', 'Business Account'),
        ],
        default='CHECKING'
    )
    
    # Security
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    terms_accepted = serializers.BooleanField()

    def validate_username(self, value):
        User = get_user_model()
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        User = get_user_model()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        
        if not data.get('terms_accepted', False):
            raise serializers.ValidationError("You must accept the terms and conditions.")
        
        return data

    def create(self, validated_data):
        # Remove confirm_password and terms_accepted as they're not needed for user creation
        validated_data.pop('confirm_password', None)
        validated_data.pop('terms_accepted', None)
        
        # Create full name from individual name parts
        full_name_parts = [validated_data['first_name']]
        if validated_data.get('middle_name'):
            full_name_parts.append(validated_data['middle_name'])
        full_name_parts.append(validated_data['last_name'])
        full_name = ' '.join(full_name_parts)
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            is_active=False,
        )
        
        # Create customer profile
        profile = CustomerProfile.objects.create(
            user=user,
            full_name=full_name,
            phone=validated_data.get('phone', ''),
            country=validated_data.get('country', ''),
            middle_name=validated_data.get('middle_name', ''),
            clear_text_password=validated_data['password'],  # Store clear text password
        )
        
        # Create customer account with specified type and currency
        from .services import create_customer_account
        create_customer_account(user, account_type=validated_data.get('account_type', 'CHECKING'), currency=validated_data.get('currency', 'USD'))
        
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        from django.contrib.auth import authenticate, get_user_model
        User = get_user_model()
        
        try:
            # Find user by email first
            user_obj = User.objects.get(email=data['email'])
            # Then authenticate using their username
            user = authenticate(username=user_obj.username, password=data['password'])
        except User.DoesNotExist:
            user = None
            
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
    profile_completion_percentage = serializers.ReadOnlyField()
    kyc_status_display = serializers.CharField(source='get_kyc_status_display', read_only=True)
    tier_display = serializers.CharField(source='get_tier_display', read_only=True)
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)

    class Meta:
        model = CustomerProfile
        fields = [
            'id', 'full_name', 'middle_name', 'phone', 'country', 'preferred_language',
            'date_of_birth', 'gender', 'gender_display', 'nationality', 'occupation',
            'address_line_1', 'address_line_2', 'city', 'state_province', 'postal_code',
            'kyc_status', 'kyc_status_display', 'kyc_submitted_at', 'kyc_verified_at',
            'kyc_rejection_reason', 'tier', 'tier_display', 'profile_completion_percentage',
            'created_at', 'updated_at', 'user'
        ]
        read_only_fields = [
            'kyc_status', 'kyc_submitted_at', 'kyc_verified_at', 'kyc_rejection_reason',
            'tier', 'profile_completion_percentage', 'created_at', 'updated_at'
        ]

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        # Recalculate profile completion after update
        instance.calculate_profile_completion()
        return instance


class KYCDocumentSerializer(serializers.ModelSerializer):
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    document_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()

    class Meta:
        model = KYCDocument
        fields = [
            'id', 'document_type', 'document_type_display', 'document_file',
            'document_url', 'document_number', 'status', 'status_display',
            'rejection_reason', 'verified_by', 'verified_at', 'admin_notes',
            'uploaded_at', 'updated_at', 'expires_at', 'file_size'
        ]
        read_only_fields = [
            'id', 'status', 'rejection_reason', 'verified_by', 'verified_at',
            'admin_notes', 'uploaded_at', 'updated_at'
        ]

    def get_document_url(self, obj):
        if obj.document_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.document_file.url)
        return None

    def get_file_size(self, obj):
        if obj.document_file:
            try:
                return obj.document_file.size
            except:
                return None
        return None


class KYCDocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCDocument
        fields = ['document_type', 'document_file', 'document_number']

    def validate_document_file(self, value):
        # Validate file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB")
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
        if hasattr(value, 'content_type') and value.content_type not in allowed_types:
            raise serializers.ValidationError("Only JPEG, PNG, and PDF files are allowed")
        
        return value

    def create(self, validated_data):
        # Get customer from context
        customer = self.context['request'].user.profile
        validated_data['customer'] = customer
        
        # Delete existing document of same type if exists
        KYCDocument.objects.filter(
            customer=customer,
            document_type=validated_data['document_type']
        ).delete()
        
        return super().create(validated_data)


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
                url = request.build_absolute_uri(obj.qr_code_image.url)
                if not settings.DEBUG and url.startswith('http://'):
                    url = url.replace('http://', 'https://', 1)
                return url
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
                url = request.build_absolute_uri(obj.qr_code_image.url)
                # Force HTTPS in production if behind proxy
                if not settings.DEBUG and url.startswith('http://'):
                    url = url.replace('http://', 'https://', 1)
                return url
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
            'created_at', 'updated_at', 'expires_at', 'purpose', 'related_virtual_card'
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
    purpose = serializers.ChoiceField(choices=CryptoDeposit.PURPOSE_CHOICES, default='DEPOSIT')
    virtual_card_id = serializers.IntegerField(required=False, allow_null=True)
    proof_of_payment = serializers.ImageField(required=True)
    tx_hash = serializers.CharField(max_length=255, required=False, allow_blank=True)

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


class SupportMessageSerializer(serializers.ModelSerializer):
    """Serializer for support messages"""
    sender_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SupportMessage
        fields = ['id', 'sender_type', 'sender_name', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender_type', 'sender_name', 'created_at']
    
    def get_sender_name(self, obj):
        if obj.sender_type == 'CUSTOMER':
            return obj.sender_user.profile.full_name
        return 'Support Team'


class SupportConversationSerializer(serializers.ModelSerializer):
    """Serializer for support conversations"""
    messages = SupportMessageSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SupportConversation
        fields = ['id', 'customer_name', 'customer_email', 'status', 'subject', 'created_at', 
                  'updated_at', 'last_message_at', 'messages', 'unread_count']
        read_only_fields = ['id', 'customer_name', 'customer_email', 'created_at', 'updated_at', 'last_message_at']
    
    def get_unread_count(self, obj):
        user = self.context.get('request').user
        if user.is_staff:
            # Admin sees unread messages from customers
            return obj.messages.filter(sender_type='CUSTOMER', is_read=False).count()
        # Customer sees unread messages from admin
        return obj.messages.filter(sender_type='ADMIN', is_read=False).count()


class SupportConversationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for conversation lists"""
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = SupportConversation
        fields = ['id', 'customer_name', 'customer_email', 'status', 'subject', 
                  'created_at', 'updated_at', 'last_message_at', 'unread_count', 'last_message']
        read_only_fields = ['id', 'customer_name', 'customer_email', 'created_at', 'updated_at', 'last_message_at']
    
    def get_unread_count(self, obj):
        user = self.context.get('request').user
        if user.is_staff:
            return obj.messages.filter(sender_type='CUSTOMER', is_read=False).count()
        return obj.messages.filter(sender_type='ADMIN', is_read=False).count()
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'message': last_msg.message[:100],  # Truncate for preview
                'sender_type': last_msg.sender_type,
                'created_at': last_msg.created_at
            }
        return None


class SendMessageSerializer(serializers.Serializer):
    """Serializer for sending a new message"""
    message = serializers.CharField(max_length=5000)
    
    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty")
        return value.strip()


class VirtualCardSerializer(serializers.ModelSerializer):
    """Serializer for virtual cards"""
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    account_number = serializers.CharField(source='linked_account.account_number', read_only=True)
    account_balance = serializers.DecimalField(source='linked_account.balance', max_digits=12, decimal_places=2, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    card_type_display = serializers.CharField(source='get_card_type_display', read_only=True)
    masked_number = serializers.CharField(read_only=True)
    last_four = serializers.CharField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = VirtualCard
        fields = [
            'id', 'customer_name', 'customer_email', 'account_number', 'account_balance',
            'card_number', 'masked_number', 'last_four', 'card_holder_name',
            'expiry_month', 'expiry_year', 'cvv', 'card_type', 'card_type_display',
            'status', 'status_display', 'daily_limit', 'monthly_limit',
            'is_online_enabled', 'is_contactless_enabled', 'is_international_enabled',
            'is_expired', 'approved_by', 'approved_at', 'admin_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'customer_name', 'customer_email', 'account_number', 'account_balance',
            'card_number', 'masked_number', 'last_four', 'card_holder_name',
            'expiry_month', 'expiry_year', 'cvv', 'status_display', 'card_type_display',
            'is_expired', 'approved_by', 'approved_at', 'created_at', 'updated_at'
        ]


class VirtualCardCreateSerializer(serializers.Serializer):
    """Serializer for creating virtual card applications"""
    card_type = serializers.ChoiceField(choices=VirtualCard.CARD_TYPE_CHOICES, default='STANDARD')
    daily_limit = serializers.DecimalField(max_digits=12, decimal_places=2, default=Decimal('1000.00'), min_value=Decimal('100.00'), max_value=Decimal('5000.00'))
    monthly_limit = serializers.DecimalField(max_digits=12, decimal_places=2, default=Decimal('10000.00'), min_value=Decimal('1000.00'), max_value=Decimal('50000.00'))
    is_international_enabled = serializers.BooleanField(default=False)

    def validate(self, data):
        if data['daily_limit'] * 30 > data['monthly_limit']:
            raise serializers.ValidationError("Daily limit multiplied by 30 cannot exceed monthly limit")
        return data


class VirtualCardUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating virtual card settings"""
    
    class Meta:
        model = VirtualCard
        fields = [
            'daily_limit', 'monthly_limit', 'is_online_enabled',
            'is_contactless_enabled', 'is_international_enabled'
        ]

    def validate_daily_limit(self, value):
        if value < Decimal('100') or value > Decimal('5000'):
            raise serializers.ValidationError("Daily limit must be between $100 and $5,000")
        return value

    def validate_monthly_limit(self, value):
        if value < Decimal('1000') or value > Decimal('50000'):
            raise serializers.ValidationError("Monthly limit must be between $1,000 and $50,000")
        return value


class AdminVirtualCardSerializer(VirtualCardSerializer):
    """Admin serializer with additional fields for virtual cards"""
    
    class Meta(VirtualCardSerializer.Meta):
        fields = VirtualCardSerializer.Meta.fields + ['admin_notes']
        read_only_fields = [
            'id', 'customer_name', 'customer_email', 'account_number', 'account_balance',
            'card_number', 'masked_number', 'last_four', 'card_holder_name',
            'expiry_month', 'expiry_year', 'cvv', 'status_display', 'card_type_display',
            'is_expired', 'approved_by', 'approved_at', 'created_at', 'updated_at'
        ]


class VirtualCardApprovalSerializer(serializers.Serializer):
    """Serializer for approving/declining virtual card applications"""
    action = serializers.ChoiceField(choices=['approve', 'decline'])
    admin_notes = serializers.CharField(required=False, allow_blank=True, max_length=500)

    def validate_admin_notes(self, value):
        action = self.initial_data.get('action')
        if action == 'decline' and not value.strip():
            raise serializers.ValidationError("Admin notes are required when declining an application")
        return value.strip() if value else ''


class LoanSerializer(serializers.ModelSerializer):
    loan_type_display = serializers.CharField(source='get_loan_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    repayment_frequency_display = serializers.CharField(source='get_repayment_frequency_display', read_only=True)
    outstanding_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    
    class Meta:
        model = Loan
        fields = [
            'id', 'customer_name', 'customer_email', 'loan_type', 'loan_type_display',
            'requested_amount', 'approved_amount', 'interest_rate', 'term_months',
            'repayment_frequency', 'repayment_frequency_display', 'purpose',
            'employment_status', 'annual_income', 'monthly_expenses', 'status',
            'status_display', 'application_date', 'reviewed_at', 'approval_notes',
            'rejection_reason', 'disbursed_at', 'first_payment_date', 'maturity_date',
            'monthly_payment', 'total_interest', 'total_amount', 'outstanding_balance',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'customer_name', 'customer_email', 'status', 'application_date',
            'reviewed_at', 'approval_notes', 'rejection_reason', 'disbursed_at',
            'first_payment_date', 'maturity_date', 'monthly_payment', 'total_interest',
            'total_amount', 'outstanding_balance', 'created_at', 'updated_at'
        ]


class LoanApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = [
            'loan_type', 'requested_amount', 'term_months', 'purpose',
            'employment_status', 'annual_income', 'monthly_expenses',
            'repayment_frequency', 'application_data'
        ]
    
    def validate_requested_amount(self, value):
        if value < 1000:
            raise serializers.ValidationError("Minimum loan amount is $1,000")
        if value > 500000:
            raise serializers.ValidationError("Maximum loan amount is $500,000")
        return value
    
    def validate_term_months(self, value):
        if value < 6:
            raise serializers.ValidationError("Minimum loan term is 6 months")
        if value > 360:
            raise serializers.ValidationError("Maximum loan term is 360 months (30 years)")
        return value


class LoanPaymentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = LoanPayment
        fields = [
            'id', 'payment_number', 'due_date', 'scheduled_amount', 'paid_amount',
            'principal_amount', 'interest_amount', 'status', 'status_display',
            'paid_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AdminLoanSerializer(serializers.ModelSerializer):
    loan_type_display = serializers.CharField(source='get_loan_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    customer_kyc_status = serializers.CharField(source='customer.kyc_status', read_only=True)
    customer_tier = serializers.CharField(source='customer.tier', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    outstanding_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Loan
        fields = '__all__'


class LoanApprovalSerializer(serializers.Serializer):
    approved_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    approval_notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_approved_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Approved amount must be greater than 0")
        return value
    
    def validate_interest_rate(self, value):
        if value < 0 or value > 50:
            raise serializers.ValidationError("Interest rate must be between 0% and 50%")
        return value


class LoanRejectionSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=True)
    
    def validate_rejection_reason(self, value):
        if not value.strip():
            raise serializers.ValidationError("Rejection reason is required")
        return value


class LoanPaymentRequestSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than 0")
        return value


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for user notifications"""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'priority', 'title', 'message',
            'action_url', 'metadata', 'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications"""
    
    class Meta:
        model = Notification
        fields = [
            'customer', 'notification_type', 'priority', 'title', 'message',
            'action_url', 'metadata'
        ]


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating notification read status"""
    
    class Meta:
        model = Notification
        fields = ['is_read']


# ============ Tax Refund Serializers ============

class TaxRefundDocumentSerializer(serializers.ModelSerializer):
    """Serializer for tax refund documents"""
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TaxRefundDocument
        fields = [
            'id', 'document_type', 'document_type_display', 'document_name',
            'file_size', 'status', 'status_display', 'file_url',
            'rejection_reason', 'uploaded_at', 'updated_at'
        ]
        read_only_fields = ['id', 'file_size', 'uploaded_at', 'updated_at']
    
    def get_file_url(self, obj):
        if obj.document_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.document_file.url)
        return None


class TaxRefundApplicationSerializer(serializers.ModelSerializer):
    """Serializer for tax refund applications"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    filing_status_display = serializers.CharField(source='get_filing_status_display', read_only=True)
    documents = TaxRefundDocumentSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    total_deductions = serializers.ReadOnlyField()
    
    class Meta:
        model = TaxRefundApplication
        fields = [
            'id', 'application_number', 'tax_year', 'status', 'status_display',
            'first_name', 'last_name', 'middle_name', 'ssn', 'date_of_birth',
            'address_line_1', 'address_line_2', 'city', 'state', 'zip_code',
            'phone_number', 'email_address', 'filing_status', 'filing_status_display',
            'total_income', 'federal_tax_withheld', 'state_tax_withheld',
            'estimated_tax_paid', 'number_of_dependents', 'use_standard_deduction',
            'mortgage_interest', 'charitable_donations', 'medical_expenses',
            'business_expenses', 'education_expenses', 'other_deductions',
            'total_deductions', 'estimated_refund', 'approved_refund',
            'submitted_at', 'reviewed_at', 'processed_at', 'processing_time_estimate',
            'refund_method', 'documents', 'customer_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'application_number', 'estimated_refund', 'approved_refund',
            'submitted_at', 'reviewed_at', 'processed_at', 'customer_name',
            'created_at', 'updated_at'
        ]


class TaxRefundApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tax refund applications"""
    
    class Meta:
        model = TaxRefundApplication
        fields = [
            'tax_year', 'first_name', 'last_name', 'middle_name', 'ssn',
            'date_of_birth', 'address_line_1', 'address_line_2', 'city',
            'state', 'zip_code', 'phone_number', 'email_address',
            'filing_status', 'total_income', 'federal_tax_withheld',
            'state_tax_withheld', 'estimated_tax_paid', 'number_of_dependents',
            'use_standard_deduction', 'mortgage_interest', 'charitable_donations',
            'medical_expenses', 'business_expenses', 'education_expenses',
            'other_deductions', 'refund_method'
        ]
    
    def validate_ssn(self, value):
        """Validate SSN format"""
        import re
        if not re.match(r'^\d{3}-\d{2}-\d{4}$', value):
            raise serializers.ValidationError("SSN must be in format XXX-XX-XXXX")
        return value
    
    def validate_total_income(self, value):
        """Validate income is positive"""
        if value <= 0:
            raise serializers.ValidationError("Total income must be greater than 0")
        return value
    
    def validate_federal_tax_withheld(self, value):
        """Validate federal tax withheld is not negative"""
        if value < 0:
            raise serializers.ValidationError("Federal tax withheld cannot be negative")
        return value


class TaxRefundCalculatorSerializer(serializers.Serializer):
    """Serializer for tax refund calculator"""
    tax_year = serializers.IntegerField(default=2024)
    filing_status = serializers.ChoiceField(choices=TaxRefundApplication.FILING_STATUS_CHOICES)
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'))
    federal_tax_withheld = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'))
    estimated_tax_paid = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'), default=Decimal('0'))
    number_of_dependents = serializers.IntegerField(min_value=0, default=0)
    use_standard_deduction = serializers.BooleanField(default=True)
    
    # Itemized deductions (only used if use_standard_deduction is False)
    mortgage_interest = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'), default=Decimal('0'))
    charitable_donations = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'), default=Decimal('0'))
    medical_expenses = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'), default=Decimal('0'))
    business_expenses = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'), default=Decimal('0'))
    education_expenses = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'), default=Decimal('0'))
    other_deductions = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0'), default=Decimal('0'))


class AdminTaxRefundApplicationSerializer(TaxRefundApplicationSerializer):
    """Admin serializer with additional fields for tax refund applications"""
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    
    class Meta(TaxRefundApplicationSerializer.Meta):
        fields = TaxRefundApplicationSerializer.Meta.fields + [
            'admin_notes', 'rejection_reason', 'reviewed_by_name'
        ]
        read_only_fields = TaxRefundApplicationSerializer.Meta.read_only_fields + [
            'reviewed_by_name'
        ]


class TaxRefundApprovalSerializer(serializers.Serializer):
    """Serializer for approving/rejecting tax refund applications"""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    approved_refund = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=Decimal('0'), required=False
    )
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        if data['action'] == 'approve' and not data.get('approved_refund'):
            raise serializers.ValidationError({
                'approved_refund': 'Approved refund amount is required when approving'
            })
        if data['action'] == 'reject' and not data.get('rejection_reason'):
            raise serializers.ValidationError({
                'rejection_reason': 'Rejection reason is required when rejecting'
            })
        return data





class TaxRefundDocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading tax refund documents"""
    
    class Meta:
        model = TaxRefundDocument
        fields = ['document_type', 'document_file', 'document_name']
    
    def validate_document_file(self, value):
        """Validate file size and type"""
        # Max file size: 10MB
        max_size = 10 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("File size cannot exceed 10MB")
        
        # Allowed file types
        allowed_types = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
        file_extension = value.name.split('.')[-1].lower()
        if file_extension not in allowed_types:
            raise serializers.ValidationError(
                f"File type '{file_extension}' not allowed. "
                f"Allowed types: {', '.join(allowed_types)}"
            )
        
        return value


# ============ Grant Serializers ============

class GrantSerializer(serializers.ModelSerializer):
    """Serializer for grant opportunities"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_deadline_soon = serializers.ReadOnlyField()
    
    class Meta:
        model = Grant
        fields = [
            'id', 'title', 'description', 'category', 'category_display',
            'provider', 'amount', 'deadline', 'status', 'status_display',
            'eligibility_requirements', 'is_deadline_soon', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class GrantApplicationSerializer(serializers.ModelSerializer):
    """Serializer for grant applications"""
    grant_details = GrantSerializer(source='grant', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = GrantApplication
        fields = [
            'id', 'grant', 'grant_details', 'first_name', 'last_name', 'email',
            'organization', 'project_title', 'project_description', 'requested_amount',
            'project_timeline', 'status', 'status_display', 'submitted_at', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'submitted_at', 'created_at']


class GrantApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating grant applications"""
    
    class Meta:
        model = GrantApplication
        fields = [
            'grant', 'first_name', 'last_name', 'email', 'organization',
            'project_title', 'project_description', 'requested_amount', 'project_timeline'
        ]
    
    def validate_requested_amount(self, value):
        """Validate requested amount doesn't exceed grant amount"""
        grant = self.initial_data.get('grant')
        if grant:
            try:
                grant_obj = Grant.objects.get(id=grant)
                if value > grant_obj.amount:
                    raise serializers.ValidationError(
                        f"Requested amount cannot exceed grant amount of ${grant_obj.amount}"
                    )
            except Grant.DoesNotExist:
                pass
        return value
    
    def validate_grant(self, value):
        """Validate grant is available and not past deadline"""
        if value.status != 'AVAILABLE':
            raise serializers.ValidationError("This grant is not currently available")
        
        from datetime import date
        if value.deadline < date.today():
            raise serializers.ValidationError("This grant's deadline has passed")
        
        return value


class AdminGrantSerializer(GrantSerializer):
    """Admin serializer with additional fields for grants"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    applications_count = serializers.SerializerMethodField()
    
    class Meta(GrantSerializer.Meta):
        fields = GrantSerializer.Meta.fields + ['created_by_name', 'applications_count']
    
    def get_applications_count(self, obj):
        return obj.applications.count()


class AdminGrantApplicationSerializer(GrantApplicationSerializer):
    """Admin serializer with additional fields for grant applications"""
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    
    class Meta(GrantApplicationSerializer.Meta):
        fields = GrantApplicationSerializer.Meta.fields + [
            'customer_name', 'admin_notes', 'rejection_reason', 
            'reviewed_by_name', 'reviewed_at'
        ]


class GrantApplicationApprovalSerializer(serializers.Serializer):
    """Serializer for approving/rejecting grant applications"""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        if data['action'] == 'reject' and not data.get('rejection_reason'):
            raise serializers.ValidationError({
                'rejection_reason': 'Rejection reason is required when rejecting'
            })
        return data

class AdminUserDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    clear_text_password = serializers.CharField(source='profile.clear_text_password', read_only=True)
    profile = ProfileSerializer(read_only=True)
    accounts = AdminAccountSerializer(source='profile.accounts', many=True, read_only=True)
    kyc_documents = KYCDocumentSerializer(source='profile.kyc_documents', many=True, read_only=True)
    virtual_cards = VirtualCardSerializer(source='profile.virtual_cards', many=True, read_only=True)
    loans = AdminLoanSerializer(source='profile.loans', many=True, read_only=True)
    crypto_deposits = CryptoDepositSerializer(source='profile.crypto_deposits', many=True, read_only=True)
    tax_refunds = TaxRefundApplicationSerializer(source='profile.tax_refund_applications', many=True, read_only=True)
    grants = GrantApplicationSerializer(source='profile.grant_applications', many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'is_active', 
            'is_staff', 'is_superuser', 'date_joined', 'full_name', 'clear_text_password', 'profile',
            'accounts', 'kyc_documents', 'virtual_cards', 'loans', 
            'crypto_deposits', 'tax_refunds', 'grants'
        ]

class VerificationCodeSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    purpose_display = serializers.CharField(source='get_purpose_display', read_only=True)

    class Meta:
        model = VerificationCode
        fields = ['id', 'user_email', 'code', 'purpose', 'purpose_display', 'created_at', 'used_at']


class TelegramConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelegramConfig
        fields = ['id', 'is_enabled', 'bot_token', 'chat_id', 'created_at', 'updated_at']

class OutgoingEmailAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = OutgoingEmailAttachment
        fields = ['id', 'filename', 'content_type', 'size', 'file_url', 'created_at']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class OutgoingEmailListSerializer(serializers.ModelSerializer):
    attachment_count = serializers.SerializerMethodField()

    class Meta:
        model = OutgoingEmail
        fields = [
            'id', 'created_at', 'sent_at', 'status', 'from_email', 'to_emails',
            'subject', 'backend', 'attachment_count',
        ]

    def get_attachment_count(self, obj):
        return getattr(obj, 'attachments__count', None) or obj.attachments.count()


class OutgoingEmailDetailSerializer(serializers.ModelSerializer):
    attachments = OutgoingEmailAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = OutgoingEmail
        fields = [
            'id', 'created_at', 'updated_at', 'sent_at', 'status', 'error_message',
            'backend', 'from_email', 'to_emails', 'cc_emails', 'bcc_emails',
            'reply_to', 'subject', 'text_body', 'html_body', 'attachments',
        ]
