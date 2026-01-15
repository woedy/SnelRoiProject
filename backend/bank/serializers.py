from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q, Sum
from rest_framework import serializers

from .models import Account, Beneficiary, CustomerProfile, LedgerEntry, LedgerPosting, Statement
from .services import create_customer_account

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'is_staff']


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=False, allow_blank=True)

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
