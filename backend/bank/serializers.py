from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from .models import Account, Beneficiary, CustomerProfile, LedgerEntry, LedgerPosting, Statement
from .services import create_customer_account

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'is_staff']


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
