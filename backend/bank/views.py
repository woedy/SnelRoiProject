from datetime import datetime, timedelta
from decimal import Decimal

from django.conf import settings
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Account, CustomerProfile, LedgerEntry, LedgerPosting, Statement
from .serializers import (
    AccountSerializer,
    AdminAccountSerializer,
    AdminAccountUpdateSerializer,
    AdminLedgerEntrySerializer,
    AdminUserCreateSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
    BeneficiarySerializer,
    LedgerEntrySerializer,
    ProfileSerializer,
    RegisterSerializer,
    StatementSerializer,
    UserSerializer,
)
from .services import (
    add_posting,
    approve_entry,
    create_customer_account,
    create_entry,
    decline_entry,
    get_system_accounts,
)
from .tasks import auto_post_entry, generate_statement


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = None
        if email and password:
            from django.contrib.auth import authenticate
            user = authenticate(username=email, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        refresh = RefreshToken.for_user(user)
        return Response({'access': str(refresh.access_token), 'refresh': str(refresh)})


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class DashboardView(APIView):
    def get(self, request):
        profile = request.user.profile
        accounts_qs = profile.accounts.all()
        accounts = AccountSerializer(accounts_qs, many=True).data
        entries = LedgerEntry.objects.filter(postings__account__customer=profile).distinct().order_by('-created_at')[:5]
        total_balance = sum([account.balance() for account in accounts_qs])
        last_30_days = timezone.now() - timedelta(days=30)
        summary = LedgerPosting.objects.filter(
            entry__created_at__gte=last_30_days,
            account__customer=profile,
        ).aggregate(
            debits=Sum('amount', filter=Q(direction='DEBIT')),
            credits=Sum('amount', filter=Q(direction='CREDIT')),
        )
        return Response({
            'accounts': accounts,
            'recent_transactions': LedgerEntrySerializer(entries, many=True).data,
            'total_balance': total_balance,
            'insights': {
                'debits_last_30_days': summary['debits'] or 0,
                'credits_last_30_days': summary['credits'] or 0,
            },
            'virtual_card': {
                'status': 'ACTIVE',
                'last_four': '1024',
            },
        })


class AccountsView(APIView):
    def get(self, request):
        profile = request.user.profile
        accounts = AccountSerializer(profile.accounts.all(), many=True)
        return Response(accounts.data)


class TransactionsView(APIView):
    def get(self, request):
        profile = request.user.profile
        entries = LedgerEntry.objects.filter(postings__account__customer=profile).distinct().order_by('-created_at')
        entry_type = request.query_params.get('type')
        if entry_type:
            entries = entries.filter(entry_type=entry_type)
        return Response(LedgerEntrySerializer(entries, many=True).data)


class DepositView(APIView):
    def post(self, request):
        amount = Decimal(request.data.get('amount', '0'))
        memo = request.data.get('memo', '')
        profile = request.user.profile
        account = profile.accounts.first()
        funding, _ = get_system_accounts()
        entry = create_entry('DEPOSIT', request.user, memo=memo)
        add_posting(entry, account, 'CREDIT', amount, 'Customer deposit')
        add_posting(entry, funding, 'DEBIT', amount, 'Funding source')
        if settings.AUTO_APPROVE_DEPOSITS:
            auto_post_entry.apply_async((entry.id,), countdown=settings.TRANSACTION_REVIEW_DELAY_SECONDS)
        return Response(LedgerEntrySerializer(entry).data, status=status.HTTP_201_CREATED)


class TransferView(APIView):
    def post(self, request):
        amount = Decimal(request.data.get('amount', '0'))
        memo = request.data.get('memo', '')
        target_account_number = request.data.get('target_account_number')
        profile = request.user.profile
        account = profile.accounts.first()
        recipient = Account.objects.filter(account_number=target_account_number).first()
        if not recipient:
            return Response({'detail': 'Recipient account not found'}, status=status.HTTP_400_BAD_REQUEST)
        entry = create_entry('TRANSFER', request.user, memo=memo)
        add_posting(entry, account, 'DEBIT', amount, 'Transfer out')
        add_posting(entry, recipient, 'CREDIT', amount, 'Transfer in')
        return Response(LedgerEntrySerializer(entry).data, status=status.HTTP_201_CREATED)


class WithdrawalView(APIView):
    def post(self, request):
        amount = Decimal(request.data.get('amount', '0'))
        memo = request.data.get('memo', '')
        profile = request.user.profile
        account = profile.accounts.first()
        _, payout = get_system_accounts()
        entry = create_entry('WITHDRAWAL', request.user, memo=memo)
        add_posting(entry, account, 'DEBIT', amount, 'Withdrawal')
        add_posting(entry, payout, 'CREDIT', amount, 'Payout')
        return Response(LedgerEntrySerializer(entry).data, status=status.HTTP_201_CREATED)


class StatementsView(APIView):
    def get(self, request):
        profile = request.user.profile
        statements = Statement.objects.filter(customer=profile).order_by('-period_start')
        return Response(StatementSerializer(statements, many=True).data)


class StatementsGenerateView(APIView):
    def post(self, request):
        profile = request.user.profile
        period_start = request.data.get('period_start')
        period_end = request.data.get('period_end')
        if not period_start or not period_end:
            return Response({'detail': 'period_start and period_end required'}, status=status.HTTP_400_BAD_REQUEST)
        period_start = datetime.strptime(period_start, '%Y-%m-%d').date()
        period_end = datetime.strptime(period_end, '%Y-%m-%d').date()
        statement = Statement.objects.create(
            customer=profile,
            period_start=period_start,
            period_end=period_end,
        )
        generate_statement.apply_async((statement.id,))
        return Response(StatementSerializer(statement).data, status=status.HTTP_201_CREATED)


class ProfileView(APIView):
    def get(self, request):
        return Response(ProfileSerializer(request.user.profile).data)

    def patch(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class BeneficiariesView(APIView):
    def get(self, request):
        beneficiaries = request.user.profile.beneficiaries.all()
        return Response(BeneficiarySerializer(beneficiaries, many=True).data)

    def post(self, request):
        serializer = BeneficiarySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(customer=request.user.profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminTransactionsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get('status')
        entries = LedgerEntry.objects.all().order_by('-created_at')
        if status_filter:
            entries = entries.filter(status=status_filter)
        return Response(AdminLedgerEntrySerializer(entries, many=True).data)


class AdminTransactionDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        return LedgerEntry.objects.get(pk=pk)

    def get(self, request, pk):
        entry = self.get_object(pk)
        return Response(AdminLedgerEntrySerializer(entry).data)


class AdminTransactionApproveView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        entry = LedgerEntry.objects.get(pk=pk)
        approve_entry(entry, request.user)
        return Response(AdminLedgerEntrySerializer(entry).data)


class AdminTransactionDeclineView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        entry = LedgerEntry.objects.get(pk=pk)
        decline_entry(entry, request.user)
        return Response(AdminLedgerEntrySerializer(entry).data)


class AdminUsersView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        users = AdminUserSerializer(User.objects.all(), many=True)
        return Response(users.data)

    def post(self, request):
        serializer = AdminUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)


class AdminUserDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        return User.objects.get(pk=pk)

    def get(self, request, pk):
        user = self.get_object(pk)
        return Response(AdminUserSerializer(user).data)

    def patch(self, request, pk):
        user = self.get_object(pk)
        serializer = AdminUserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        password = data.pop('password', None)
        if data:
            AdminUserSerializer().update(user, data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        return Response(AdminUserSerializer(user).data)

    def delete(self, request, pk):
        user = self.get_object(pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminAccountsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        accounts = AdminAccountSerializer(Account.objects.all(), many=True)
        return Response(accounts.data)


class AdminAccountDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        return Account.objects.get(pk=pk)

    def get(self, request, pk):
        account = self.get_object(pk)
        return Response(AdminAccountSerializer(account).data)

    def patch(self, request, pk):
        account = self.get_object(pk)
        serializer = AdminAccountUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        for field, value in serializer.validated_data.items():
            setattr(account, field, value)
        account.save()
        return Response(AdminAccountSerializer(account).data)


class AdminAuditView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        recent_entries = LedgerEntry.objects.order_by('-created_at')[:25]
        return Response({'entries': LedgerEntrySerializer(recent_entries, many=True).data})
