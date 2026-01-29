from datetime import datetime, timedelta
from decimal import Decimal
import random

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Account, CustomerProfile, LedgerEntry, LedgerPosting, Statement, VerificationCode, CryptoWallet, CryptoDeposit, SupportConversation, SupportMessage, VirtualCard, KYCDocument
from .serializers import (
    AccountSerializer,
    AdminAccountSerializer,
    AdminAccountUpdateSerializer,
    AdminLedgerEntrySerializer,
    AdminUserCreateSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
    BeneficiarySerializer,
    ExternalTransferSerializer,
    KYCDocumentSerializer,
    KYCDocumentUploadSerializer,
    LedgerEntrySerializer,
    ProfileSerializer,
    RegisterSerializer,
    StatementSerializer,
    UserSerializer,
    CryptoWalletSerializer,
    CryptoWalletPublicSerializer,
    CryptoDepositSerializer,
    CryptoDepositCreateSerializer,
    CryptoDepositProofUploadSerializer,
    CryptoDepositVerificationSerializer,
    SupportConversationSerializer,
    SupportConversationListSerializer,
    SupportMessageSerializer,
    SendMessageSerializer,
    VirtualCardSerializer,
    VirtualCardCreateSerializer,
    VirtualCardUpdateSerializer,
    AdminVirtualCardSerializer,
    VirtualCardApprovalSerializer,
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
        verification_code = create_verification_code(user, 'EMAIL_VERIFICATION')
        
        from .emails import send_verification_email
        send_verification_email.delay(user.id, verification_code.code)
        
        return Response({
            'detail': 'Verification code sent to your email.',
            'email': user.email,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = None
        if email and password:
            from django.contrib.auth import authenticate
            User = get_user_model()
            
            # First, find the user by email
            try:
                user_obj = User.objects.get(email=email)
                # Then authenticate using their username
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
                
        if not user:
            if email:
                User = get_user_model()
                if User.objects.filter(email=email, is_active=False).exists():
                    return Response({'detail': 'Email not verified'}, status=status.HTTP_403_FORBIDDEN)
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        refresh = RefreshToken.for_user(user)
        return Response({'access': str(refresh.access_token), 'refresh': str(refresh)})


def generate_code():
    return f"{random.randint(0, 9999):04d}"


def create_verification_code(user, purpose):
    return VerificationCode.objects.create(
        user=user,
        code=generate_code(),
        purpose=purpose,
    )


def send_verification_email(user, code):
    send_mail(
        subject='Verify your SnelROI account',
        message=f'Your verification code is {code}. It expires in 10 minutes.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
    )


def send_password_reset_email(user, code):
    send_mail(
        subject='Reset your SnelROI password',
        message=f'Your password reset code is {code}. It expires in 10 minutes.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
    )


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        if not email or not code:
            return Response({'detail': 'Email and code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'detail': 'Invalid verification request.'}, status=status.HTTP_400_BAD_REQUEST)

        expiry_time = timezone.now() - timedelta(minutes=10)
        verification = VerificationCode.objects.filter(
            user=user,
            purpose='EMAIL_VERIFICATION',
            used_at__isnull=True,
            created_at__gte=expiry_time,
        ).order_by('-created_at').first()

        if not verification or verification.code != str(code):
            return Response({'detail': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.save(update_fields=['is_active'])
        verification.used_at = timezone.now()
        verification.save(update_fields=['used_at'])

        refresh = RefreshToken.for_user(user)
        return Response({'access': str(refresh.access_token), 'refresh': str(refresh)})


class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        user = User.objects.filter(email=email).first()
        if user and not user.is_active:
            verification_code = create_verification_code(user, 'EMAIL_VERIFICATION')
            from .emails import send_verification_email
            send_verification_email.delay(user.id, verification_code.code)

        return Response({'detail': 'If the email exists, a verification code has been sent.'})


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        user = User.objects.filter(email=email).first()
        if user:
            reset_code = create_verification_code(user, 'PASSWORD_RESET')
            from .emails import send_password_reset_email
            send_password_reset_email.delay(user.id, reset_code.code)

        return Response({'detail': 'If the email exists, a reset code has been sent.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')
        if not email or not code or not new_password:
            return Response({'detail': 'Email, code, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'detail': 'Invalid reset request.'}, status=status.HTTP_400_BAD_REQUEST)

        expiry_time = timezone.now() - timedelta(minutes=10)
        reset = VerificationCode.objects.filter(
            user=user,
            purpose='PASSWORD_RESET',
            used_at__isnull=True,
            created_at__gte=expiry_time,
        ).order_by('-created_at').first()

        if not reset or reset.code != str(code):
            return Response({'detail': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save(update_fields=['password'])
        reset.used_at = timezone.now()
        reset.save(update_fields=['used_at'])

        return Response({'detail': 'Password reset successfully.'})


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class DashboardView(APIView):
    def get(self, request):
        profile = request.user.profile
        accounts_qs = profile.accounts.all()
        accounts = AccountSerializer(accounts_qs, many=True).data
        # Check if any account is frozen
        frozen_accounts = accounts_qs.filter(status='FROZEN')
        has_frozen_account = frozen_accounts.exists()
        frozen_account_numbers = list(frozen_accounts.values_list('account_number', flat=True))
        entries = LedgerEntry.objects.filter(postings__account__customer=profile).distinct().order_by('-created_at')[:5]
        
        # Include unsettled crypto deposits (pending & rejected)
        from .models import CryptoDeposit
        from .serializers import CryptoDepositSerializer
        unsettled_crypto = CryptoDeposit.objects.filter(
            customer=profile, 
            verification_status__in=['PENDING_PAYMENT', 'PENDING_VERIFICATION', 'REJECTED']
        ).order_by('-created_at')[:5]
        
        # Get primary virtual card
        primary_card = VirtualCard.objects.filter(
            customer=profile,
            status__in=['ACTIVE', 'FROZEN']
        ).first()
        
        virtual_card_data = None
        if primary_card:
            virtual_card_data = {
                'id': primary_card.id,
                'status': primary_card.status,
                'last_four': primary_card.last_four,
                'card_type': primary_card.card_type,
                'is_frozen': primary_card.status == 'FROZEN',
            }
        
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
            'unsettled_crypto_deposits': CryptoDepositSerializer(unsettled_crypto, many=True).data,
            'total_balance': total_balance,
            'account_status': {
                'has_frozen_account': has_frozen_account,
                'frozen_account_numbers': frozen_account_numbers,
                'message': f"Account Frozen: Your account {frozen_account_numbers[0]} has been frozen. Please contact customer care at banking@snelroi.com to resolve this issue." if has_frozen_account else None
            },
            'insights': {
                'debits_last_30_days': summary['debits'] or 0,
                'credits_last_30_days': summary['credits'] or 0,
            },
            'virtual_card': virtual_card_data,
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
        
        # Include unsettled crypto deposits (pending & rejected)
        from .models import CryptoDeposit
        from .serializers import CryptoDepositSerializer
        unsettled_crypto = CryptoDeposit.objects.filter(
            customer=profile, 
            verification_status__in=['PENDING_PAYMENT', 'PENDING_VERIFICATION', 'REJECTED']
        ).order_by('-created_at')

        return Response({
            'transactions': LedgerEntrySerializer(entries, many=True).data,
            'unsettled_crypto_deposits': CryptoDepositSerializer(unsettled_crypto, many=True).data
        })


class DepositView(APIView):
    def post(self, request):
        amount = Decimal(request.data.get('amount', '0'))
        memo = request.data.get('memo', '')
        profile = request.user.profile
        account = profile.accounts.filter(status='ACTIVE').first()
        if not account:
            return Response({'detail': 'No active account found or account is frozen. Please contact customer care.'}, status=status.HTTP_400_BAD_REQUEST)
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
        account = profile.accounts.filter(status='ACTIVE').first()
        if not account:
            return Response({'detail': 'No active account found or account is frozen. Please contact customer care.'}, status=status.HTTP_400_BAD_REQUEST)
        recipient = Account.objects.filter(account_number=target_account_number).first()
        if not recipient:
            return Response({'detail': 'Recipient account not found'}, status=status.HTTP_400_BAD_REQUEST)
        entry = create_entry('TRANSFER', request.user, memo=memo)
        add_posting(entry, account, 'DEBIT', amount, 'Transfer out')
        add_posting(entry, recipient, 'CREDIT', amount, 'Transfer in')
        
        # Notify recipient
        from .emails import send_transfer_received_email
        send_transfer_received_email.delay(recipient.customer.user.id, amount, f"User {request.user.email}", memo)
        
        return Response(LedgerEntrySerializer(entry).data, status=status.HTTP_201_CREATED)


class WithdrawalView(APIView):
    def post(self, request):
        amount = Decimal(request.data.get('amount', '0'))
        memo = request.data.get('memo', '')
        profile = request.user.profile
        account = profile.accounts.filter(status='ACTIVE').first()
        if not account:
            return Response({'detail': 'No active account found or account is frozen. Please contact customer care.'}, status=status.HTTP_400_BAD_REQUEST)
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
        
        # Notify user
        from .emails import send_transaction_status_email
        send_transaction_status_email.delay(entry.id, 'APPROVED')
        
        return Response(AdminLedgerEntrySerializer(entry).data)


class AdminTransactionDeclineView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        entry = LedgerEntry.objects.get(pk=pk)
        decline_entry(entry, request.user)
        
        # Notify user
        from .emails import send_transaction_status_email
        send_transaction_status_email.delay(entry.id, 'DECLINED')
        
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
        old_status = account.status
        for field, value in serializer.validated_data.items():
            setattr(account, field, value)
        account.save()
        print(f"DEBUG: AdminAccountDetailView.patch triggered for {account.account_number}")

        # Notify user if status changed
        if 'status' in serializer.validated_data and serializer.validated_data['status'] != old_status:
            from .emails import send_account_status_email
            send_account_status_email.delay(account.id, serializer.validated_data['status'])
            
        return Response(AdminAccountSerializer(account).data)


class AdminAuditView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        recent_entries = LedgerEntry.objects.order_by('-created_at')[:25]
        return Response({'entries': LedgerEntrySerializer(recent_entries, many=True).data})


class ExternalTransferView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from .services import create_external_transfer
        
        serializer = ExternalTransferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            transaction = create_external_transfer(
                user=request.user,
                amount=serializer.validated_data['amount'],
                memo=serializer.validated_data.get('memo', ''),
                recipient_details=serializer.validated_data['recipient_details'],
                fee=serializer.validated_data['fee']
            )
            
            return Response({
                'reference': transaction.reference,
                'status': transaction.status,
                'fee': transaction.external_data.get('fee', 0)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class FreezeAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        account_number = request.data.get('account_number')
        if not account_number:
            return Response({'detail': 'Account number is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        profile = request.user.profile
        account = Account.objects.filter(
            customer=profile,
            account_number=account_number
        ).first()
        
        if not account:
            return Response({'detail': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)
        
        account.status = 'FROZEN'
        account.save(update_fields=['status'])
        
        print(f"DEBUG: FreezeAccountView triggered for {account_number}")
        # Notify user
        from .emails import send_account_status_email
        send_account_status_email.delay(account.id, 'FROZEN')
        
        return Response({'detail': f'Account {account_number} has been frozen'}, status=status.HTTP_200_OK)


class UnfreezeAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        account_number = request.data.get('account_number')
        if not account_number:
            return Response({'detail': 'Account number is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        profile = request.user.profile
        account = Account.objects.filter(
            customer=profile,
            account_number=account_number
        ).first()
        
        if not account:
            return Response({'detail': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)
        
        account.status = 'ACTIVE'
        account.save(update_fields=['status'])
        
        print(f"DEBUG: UnfreezeAccountView triggered for {account_number}")
        # Notify user
        from .emails import send_account_status_email
        send_account_status_email.delay(account.id, 'ACTIVE')
        
        return Response({'detail': f'Account {account_number} has been unfrozen'}, status=status.HTTP_200_OK)


# ============ Crypto Deposit Views ============

class CryptoWalletsPublicView(APIView):
    """Public endpoint to list active crypto wallets"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        wallets = CryptoWallet.objects.filter(is_active=True)
        serializer = CryptoWalletPublicSerializer(wallets, many=True, context={'request': request})
        return Response(serializer.data)


class CryptoDepositInitiateView(APIView):
    """Initiate a crypto deposit"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CryptoDepositCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile = request.user.profile
        wallet = CryptoWallet.objects.get(id=serializer.validated_data['crypto_wallet_id'])

        # Create crypto deposit
        crypto_deposit = CryptoDeposit.objects.create(
            customer=profile,
            crypto_wallet=wallet,
            amount_usd=serializer.validated_data['amount_usd'],
            crypto_amount=serializer.validated_data.get('crypto_amount'),
            exchange_rate=serializer.validated_data.get('exchange_rate'),
            expires_at=timezone.now() + timedelta(minutes=30),
        )

        response_serializer = CryptoDepositSerializer(crypto_deposit, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class CryptoDepositUploadProofView(APIView):
    """Upload proof of payment for a crypto deposit"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            crypto_deposit = CryptoDeposit.objects.get(pk=pk, customer=request.user.profile)
        except CryptoDeposit.DoesNotExist:
            return Response({'detail': 'Crypto deposit not found'}, status=status.HTTP_404_NOT_FOUND)

        if crypto_deposit.verification_status != 'PENDING_PAYMENT':
            return Response(
                {'detail': 'Cannot upload proof for this deposit'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CryptoDepositProofUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        crypto_deposit.proof_of_payment = serializer.validated_data['proof_of_payment']
        crypto_deposit.tx_hash = serializer.validated_data.get('tx_hash', '')
        crypto_deposit.verification_status = 'PENDING_VERIFICATION'
        crypto_deposit.save()

        response_serializer = CryptoDepositSerializer(crypto_deposit, context={'request': request})
        return Response(response_serializer.data)


class CryptoDepositStatusView(APIView):
    """Check status of a crypto deposit"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            crypto_deposit = CryptoDeposit.objects.get(pk=pk, customer=request.user.profile)
        except CryptoDeposit.DoesNotExist:
            return Response({'detail': 'Crypto deposit not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CryptoDepositSerializer(crypto_deposit, context={'request': request})
        return Response(serializer.data)


class UserCryptoDepositsView(APIView):
    """List user's crypto deposits"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        deposits = CryptoDeposit.objects.filter(customer=request.user.profile)
        serializer = CryptoDepositSerializer(deposits, many=True, context={'request': request})
        return Response(serializer.data)


# ============ Admin Crypto Views ============

class AdminCryptoWalletsView(APIView):
    """Admin endpoint to manage crypto wallets"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        wallets = CryptoWallet.objects.all()
        serializer = CryptoWalletSerializer(wallets, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = CryptoWalletSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        wallet = serializer.save()
        return Response(CryptoWalletSerializer(wallet, context={'request': request}).data, status=status.HTTP_201_CREATED)


class AdminCryptoWalletDetailView(APIView):
    """Admin endpoint for wallet detail operations"""
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        try:
            return CryptoWallet.objects.get(pk=pk)
        except CryptoWallet.DoesNotExist:
            return None

    def get(self, request, pk):
        wallet = self.get_object(pk)
        if not wallet:
            return Response({'detail': 'Wallet not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CryptoWalletSerializer(wallet, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, pk):
        wallet = self.get_object(pk)
        if not wallet:
            return Response({'detail': 'Wallet not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CryptoWalletSerializer(wallet, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        wallet = serializer.save()
        return Response(CryptoWalletSerializer(wallet, context={'request': request}).data)

    def delete(self, request, pk):
        wallet = self.get_object(pk)
        if not wallet:
            return Response({'detail': 'Wallet not found'}, status=status.HTTP_404_NOT_FOUND)
        wallet.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminCryptoWalletToggleView(APIView):
    """Toggle wallet active status"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            wallet = CryptoWallet.objects.get(pk=pk)
        except CryptoWallet.DoesNotExist:
            return Response({'detail': 'Wallet not found'}, status=status.HTTP_404_NOT_FOUND)

        wallet.is_active = not wallet.is_active
        wallet.save()
        serializer = CryptoWalletSerializer(wallet, context={'request': request})
        return Response(serializer.data)


class AdminCryptoDepositsView(APIView):
    """Admin endpoint to view all crypto deposits"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get('status')
        deposits = CryptoDeposit.objects.all()
        if status_filter:
            deposits = deposits.filter(verification_status=status_filter)
        serializer = CryptoDepositSerializer(deposits, many=True, context={'request': request})
        return Response(serializer.data)


class AdminCryptoDepositVerifyView(APIView):
    """Admin endpoint to verify/reject crypto deposits"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            crypto_deposit = CryptoDeposit.objects.get(pk=pk)
        except CryptoDeposit.DoesNotExist:
            return Response({'detail': 'Crypto deposit not found'}, status=status.HTTP_404_NOT_FOUND)

        if crypto_deposit.verification_status != 'PENDING_VERIFICATION':
            return Response(
                {'detail': 'Deposit is not pending verification'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CryptoDepositVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        admin_notes = serializer.validated_data.get('admin_notes', '')

        if action == 'approve':
            # Create ledger entry for the deposit
            account = crypto_deposit.customer.accounts.filter(status='ACTIVE').first()
            if not account:
                return Response(
                    {'detail': 'Customer has no active account'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            funding, _ = get_system_accounts()
            entry = create_entry('DEPOSIT', request.user, memo=f'Crypto deposit - {crypto_deposit.crypto_wallet.crypto_type}')
            add_posting(entry, account, 'CREDIT', crypto_deposit.amount_usd, f'Crypto deposit ({crypto_deposit.crypto_wallet.crypto_type})')
            add_posting(entry, funding, 'DEBIT', crypto_deposit.amount_usd, 'Crypto funding')

            # Approve the entry immediately
            approve_entry(entry, request.user)

            # Update crypto deposit
            crypto_deposit.ledger_entry = entry
            crypto_deposit.verification_status = 'APPROVED'
            crypto_deposit.verified_by = request.user
            crypto_deposit.verified_at = timezone.now()
            crypto_deposit.admin_notes = admin_notes
            crypto_deposit.save()

            # Notify user
            from .emails import send_crypto_approval_email
            send_crypto_approval_email.delay(crypto_deposit.id)

        elif action == 'reject':
            crypto_deposit.verification_status = 'REJECTED'
            crypto_deposit.verified_by = request.user
            crypto_deposit.verified_at = timezone.now()
            crypto_deposit.admin_notes = admin_notes
            crypto_deposit.save()

            # Notify user
            from .emails import send_crypto_rejection_email
            send_crypto_rejection_email.delay(crypto_deposit.id, admin_notes)

        response_serializer = CryptoDepositSerializer(crypto_deposit, context={'request': request})
        return Response(response_serializer.data)


class AdminClearTransactionsView(APIView):
    """Admin endpoint to purge all transaction history for a fresh start"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        # Transactional deletion for safety
        from django.db import transaction
        from .models import LedgerEntry, LedgerPosting, CryptoDeposit
        
        with transaction.atomic():
            LedgerPosting.objects.all().delete()
            LedgerEntry.objects.all().delete()
            CryptoDeposit.objects.all().delete()
            
        return Response({'detail': 'All transactions and crypto records have been cleared successfully.'})


class AdminManualTransferView(APIView):
    """Admin endpoint to manually transfer funds to a user account"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        from .serializers import AdminManualTransferSerializer
        from .services import create_entry, add_posting, approve_entry, get_system_accounts
        from .models import Account
        from django.db import transaction
        
        serializer = AdminManualTransferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        to_account = Account.objects.get(account_number=data['to_account_number'])
        amount = data['amount']
        
        # User requested source field to be free-text/label
        source_label = data.get('from_account_number', '').strip()
        memo = data.get('memo', '').strip() or f"Manual Credit"
        
        # Financial source is always the System Funding account
        funding, _ = get_system_accounts()
        from_account = funding
        
        # Combine memo and source label for a clear history
        # e.g. "Deposit correction (Source: Bank of America)"
        full_memo = memo
        if source_label:
            full_memo = f"{memo} (Source: {source_label})"

        with transaction.atomic():
            entry = create_entry('TRANSFER', request.user, memo=full_memo)
            
            # Credit recipient
            add_posting(entry, to_account, 'CREDIT', amount, f"Manual credit: {memo}")
            
            # Debit system funding (the source of the new balance)
            add_posting(entry, from_account, 'DEBIT', amount, f"System disbursement: {source_label or 'Admin Adjustment'}")
            
            # Auto-approve the manual entry
            approve_entry(entry, request.user)
            
            # Notify recipient
            from .emails import send_transfer_received_email
            send_transfer_received_email.delay(to_account.customer.user.id, amount, source_label or "System Funding", memo)
            
        return Response({
            'detail': f'Successfully transferred ${amount} to {to_account.account_number}',
            'reference': entry.reference
        })


# ============ Customer Support Chat Views ============

class SupportConversationsView(APIView):
    """List conversations (filtered by user type)"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if user.is_staff:
            # Admin sees all conversations
            conversations = SupportConversation.objects.all()
            status_filter = request.query_params.get('status')
            if status_filter:
                conversations = conversations.filter(status=status_filter)
        else:
            # Customer sees only their conversations
            conversations = SupportConversation.objects.filter(customer=user.profile)
        
        serializer = SupportConversationListSerializer(
            conversations, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)
    
    def post(self, request):
        """Create a new conversation (customers only)"""
        if request.user.is_staff:
            return Response(
                {'detail': 'Admins cannot create conversations'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get or create active conversation for this customer
        conversation, created = SupportConversation.objects.get_or_create(
            customer=request.user.profile,
            status__in=['OPEN', 'IN_PROGRESS'],
            defaults={'subject': 'Support Request'}
        )
        
        serializer = SupportConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class SupportConversationDetailView(APIView):
    """Get conversation details with messages"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self, pk, user):
        try:
            conversation = SupportConversation.objects.get(pk=pk)
            # Check permissions
            if not user.is_staff and conversation.customer.user != user:
                return None
            return conversation
        except SupportConversation.DoesNotExist:
            return None
    
    def get(self, request, pk):
        conversation = self.get_object(pk, request.user)
        if not conversation:
            return Response(
                {'detail': 'Conversation not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Mark messages as read
        if request.user.is_staff:
            # Admin marks customer messages as read
            conversation.messages.filter(sender_type='CUSTOMER', is_read=False).update(is_read=True)
        else:
            # Customer marks admin messages as read
            conversation.messages.filter(sender_type='ADMIN', is_read=False).update(is_read=True)
        
        serializer = SupportConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data)
    
    def patch(self, request, pk):
        """Update conversation status (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only admins can update conversation status'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        conversation = self.get_object(pk, request.user)
        if not conversation:
            return Response(
                {'detail': 'Conversation not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        new_status = request.data.get('status')
        if new_status and new_status in dict(SupportConversation.STATUS_CHOICES):
            conversation.status = new_status
            conversation.save(update_fields=['status'])
        
        serializer = SupportConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data)


class SendSupportMessageView(APIView):
    """Send a message in a conversation"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, conversation_id):
        try:
            conversation = SupportConversation.objects.get(pk=conversation_id)
        except SupportConversation.DoesNotExist:
            return Response(
                {'detail': 'Conversation not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not request.user.is_staff and conversation.customer.user != request.user:
            return Response(
                {'detail': 'You do not have permission to send messages in this conversation'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Determine sender type
        sender_type = 'ADMIN' if request.user.is_staff else 'CUSTOMER'
        
        # Create message
        message = SupportMessage.objects.create(
            conversation=conversation,
            sender_type=sender_type,
            sender_user=request.user,
            message=serializer.validated_data['message']
        )
        
        # Update conversation
        conversation.last_message_at = timezone.now()
        if conversation.status == 'OPEN' and sender_type == 'ADMIN':
            conversation.status = 'IN_PROGRESS'
        conversation.save(update_fields=['last_message_at', 'status'])
        
        response_serializer = SupportMessageSerializer(message)
    
        # Broadcast to WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'chat_{conversation_id}',
            {
                'type': 'chat_message',
                'message': response_serializer.data
            }
        )
    
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class SupportUnreadCountView(APIView):
    """Get unread message count"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.is_staff:
            # Count unread customer messages across all conversations
            unread_count = SupportMessage.objects.filter(
                sender_type='CUSTOMER',
                is_read=False
            ).count()
        else:
            # Count unread admin messages in user's conversations
            unread_count = SupportMessage.objects.filter(
                conversation__customer=user.profile,
                sender_type='ADMIN',
                is_read=False
            ).count()
        
        return Response({'unread_count': unread_count})


# ============ Virtual Card Views ============

class VirtualCardsView(APIView):
    """List and create virtual cards"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """List user's virtual cards"""
        cards = VirtualCard.objects.filter(customer=request.user.profile)
        serializer = VirtualCardSerializer(cards, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Apply for a new virtual card"""
        # Check if user has an active account
        try:
            account = Account.objects.get(customer=request.user.profile, status='ACTIVE')
        except Account.DoesNotExist:
            return Response(
                {'detail': 'You must have an active account to apply for a virtual card'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already has a pending application
        pending_cards = VirtualCard.objects.filter(
            customer=request.user.profile,
            status='PENDING'
        ).count()
        
        if pending_cards > 0:
            return Response(
                {'detail': 'You already have a pending virtual card application'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check card limit (max 3 cards per customer)
        total_cards = VirtualCard.objects.filter(
            customer=request.user.profile,
            status__in=['ACTIVE', 'FROZEN']
        ).count()
        
        if total_cards >= 3:
            return Response(
                {'detail': 'Maximum of 3 virtual cards allowed per customer'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = VirtualCardCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create virtual card application
        card = VirtualCard.objects.create(
            customer=request.user.profile,
            linked_account=account,
            **serializer.validated_data
        )

        response_serializer = VirtualCardSerializer(card)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class VirtualCardDetailView(APIView):
    """Get, update, or delete a specific virtual card"""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return VirtualCard.objects.get(pk=pk, customer=user.profile)
        except VirtualCard.DoesNotExist:
            return None

    def get(self, request, pk):
        """Get virtual card details"""
        card = self.get_object(pk, request.user)
        if not card:
            return Response(
                {'detail': 'Virtual card not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = VirtualCardSerializer(card)
        return Response(serializer.data)

    def patch(self, request, pk):
        """Update virtual card settings"""
        card = self.get_object(pk, request.user)
        if not card:
            return Response(
                {'detail': 'Virtual card not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if card.status not in ['ACTIVE', 'FROZEN']:
            return Response(
                {'detail': 'Can only update active or frozen cards'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = VirtualCardUpdateSerializer(card, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        response_serializer = VirtualCardSerializer(card)
        return Response(response_serializer.data)

    def delete(self, request, pk):
        """Cancel virtual card"""
        card = self.get_object(pk, request.user)
        if not card:
            return Response(
                {'detail': 'Virtual card not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if card.status == 'CANCELLED':
            return Response(
                {'detail': 'Card is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        card.status = 'CANCELLED'
        card.save(update_fields=['status', 'updated_at'])

        return Response({'detail': 'Virtual card cancelled successfully'})


class VirtualCardToggleFreezeView(APIView):
    """Freeze or unfreeze a virtual card"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            card = VirtualCard.objects.get(pk=pk, customer=request.user.profile)
        except VirtualCard.DoesNotExist:
            return Response(
                {'detail': 'Virtual card not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if card.status not in ['ACTIVE', 'FROZEN']:
            return Response(
                {'detail': 'Can only freeze/unfreeze active or frozen cards'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Toggle freeze status
        if card.status == 'ACTIVE':
            card.status = 'FROZEN'
            message = 'Virtual card frozen successfully'
        else:
            card.status = 'ACTIVE'
            message = 'Virtual card unfrozen successfully'

        card.save(update_fields=['status', 'updated_at'])

        serializer = VirtualCardSerializer(card)
        return Response({
            'detail': message,
            'card': serializer.data
        })


# ============ Admin Virtual Card Views ============

class AdminVirtualCardsView(APIView):
    """Admin view for managing all virtual cards"""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        """List all virtual cards with filters"""
        cards = VirtualCard.objects.select_related('customer', 'linked_account').all()
        
        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            cards = cards.filter(status=status_filter)
        
        customer_filter = request.query_params.get('customer')
        if customer_filter:
            cards = cards.filter(
                Q(customer__full_name__icontains=customer_filter) |
                Q(customer__user__email__icontains=customer_filter)
            )

        serializer = AdminVirtualCardSerializer(cards, many=True)
        return Response(serializer.data)


class AdminVirtualCardDetailView(APIView):
    """Admin view for managing specific virtual card"""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_object(self, pk):
        try:
            return VirtualCard.objects.select_related('customer', 'linked_account').get(pk=pk)
        except VirtualCard.DoesNotExist:
            return None

    def get(self, request, pk):
        """Get virtual card details"""
        card = self.get_object(pk)
        if not card:
            return Response(
                {'detail': 'Virtual card not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AdminVirtualCardSerializer(card)
        return Response(serializer.data)

    def patch(self, request, pk):
        """Update virtual card (admin notes only)"""
        card = self.get_object(pk)
        if not card:
            return Response(
                {'detail': 'Virtual card not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        admin_notes = request.data.get('admin_notes', '')
        card.admin_notes = admin_notes
        card.save(update_fields=['admin_notes', 'updated_at'])

        serializer = AdminVirtualCardSerializer(card)
        return Response(serializer.data)


class AdminVirtualCardApprovalView(APIView):
    """Admin approve/decline virtual card applications"""
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            card = VirtualCard.objects.get(pk=pk)
        except VirtualCard.DoesNotExist:
            return Response(
                {'detail': 'Virtual card not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if card.status != 'PENDING':
            return Response(
                {'detail': 'Can only approve/decline pending applications'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = VirtualCardApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        admin_notes = serializer.validated_data.get('admin_notes', '')

        if action == 'approve':
            card.status = 'ACTIVE'
            card.approved_by = request.user
            card.approved_at = timezone.now()
            message = 'Virtual card application approved'
        else:
            card.status = 'CANCELLED'
            message = 'Virtual card application declined'

        card.admin_notes = admin_notes
        card.save(update_fields=['status', 'approved_by', 'approved_at', 'admin_notes', 'updated_at'])

        # Send notification email (implement as needed)
        # from .emails import send_virtual_card_status_email
        # send_virtual_card_status_email.delay(card.customer.user.id, card.id, action)

        response_serializer = AdminVirtualCardSerializer(card)
        return Response({
            'detail': message,
            'card': response_serializer.data
        })


# ============ KYC Document Views ============

class KYCDocumentsView(APIView):
    """List and upload KYC documents"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get user's KYC documents"""
        documents = KYCDocument.objects.filter(customer=request.user.profile).order_by('-uploaded_at')
        serializer = KYCDocumentSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        """Upload a new KYC document"""
        serializer = KYCDocumentUploadSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        document = serializer.save()
        
        # Recalculate profile completion
        request.user.profile.calculate_profile_completion()
        
        return Response(
            KYCDocumentSerializer(document, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class KYCDocumentDetailView(APIView):
    """Get, update, or delete a specific KYC document"""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return KYCDocument.objects.get(pk=pk, customer=user.profile)
        except KYCDocument.DoesNotExist:
            return None

    def get(self, request, pk):
        """Get KYC document details"""
        document = self.get_object(pk, request.user)
        if not document:
            return Response(
                {'detail': 'Document not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = KYCDocumentSerializer(document, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk):
        """Delete a KYC document (only if pending)"""
        document = self.get_object(pk, request.user)
        if not document:
            return Response(
                {'detail': 'Document not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if document.status != 'PENDING':
            return Response(
                {'detail': 'Cannot delete document that has been reviewed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        document.delete()
        
        # Recalculate profile completion
        request.user.profile.calculate_profile_completion()
        
        return Response(status=status.HTTP_204_NO_CONTENT)


class KYCSubmitView(APIView):
    """Submit KYC for review"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Submit KYC documents for review"""
        profile = request.user.profile
        
        # Check if profile has required information
        required_fields = ['full_name', 'phone', 'date_of_birth', 'address_line_1', 'city', 'country']
        missing_fields = []
        
        for field in required_fields:
            if not getattr(profile, field):
                missing_fields.append(field.replace('_', ' ').title())
        
        if missing_fields:
            return Response(
                {
                    'detail': 'Please complete your profile before submitting KYC',
                    'missing_fields': missing_fields
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if required documents are uploaded
        required_doc_types = ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE']  # At least one ID
        address_doc_types = ['UTILITY_BILL', 'BANK_STATEMENT', 'PROOF_OF_ADDRESS']  # At least one address proof
        
        user_docs = KYCDocument.objects.filter(customer=profile)
        uploaded_types = list(user_docs.values_list('document_type', flat=True))
        
        has_id_doc = any(doc_type in uploaded_types for doc_type in required_doc_types)
        has_address_doc = any(doc_type in uploaded_types for doc_type in address_doc_types)
        
        if not has_id_doc:
            return Response(
                {'detail': 'Please upload at least one ID document (Passport, National ID, or Driver\'s License)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not has_address_doc:
            return Response(
                {'detail': 'Please upload at least one proof of address document'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update KYC status
        profile.kyc_status = 'UNDER_REVIEW'
        profile.kyc_submitted_at = timezone.now()
        profile.save(update_fields=['kyc_status', 'kyc_submitted_at'])
        
        return Response({
            'detail': 'KYC submitted successfully for review',
            'kyc_status': profile.kyc_status
        })


# ============ Admin KYC Views ============

class AdminKYCDocumentsView(APIView):
    """Admin view for managing KYC documents"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        """List all KYC documents with filters"""
        documents = KYCDocument.objects.select_related('customer', 'customer__user').order_by('-uploaded_at')
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            documents = documents.filter(status=status_filter)
        
        # Filter by customer
        customer_filter = request.query_params.get('customer')
        if customer_filter:
            documents = documents.filter(
                Q(customer__full_name__icontains=customer_filter) |
                Q(customer__user__email__icontains=customer_filter)
            )
        
        serializer = KYCDocumentSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data)


class AdminKYCDocumentDetailView(APIView):
    """Admin view for managing specific KYC document"""
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        try:
            return KYCDocument.objects.select_related('customer', 'customer__user').get(pk=pk)
        except KYCDocument.DoesNotExist:
            return None

    def get(self, request, pk):
        """Get KYC document details"""
        document = self.get_object(pk)
        if not document:
            return Response(
                {'detail': 'Document not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = KYCDocumentSerializer(document, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, pk):
        """Approve or reject KYC document"""
        document = self.get_object(pk)
        if not document:
            return Response(
                {'detail': 'Document not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        action = request.data.get('action')  # 'approve' or 'reject'
        admin_notes = request.data.get('admin_notes', '')
        rejection_reason = request.data.get('rejection_reason', '')

        if action not in ['approve', 'reject']:
            return Response(
                {'detail': 'Action must be either "approve" or "reject"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if action == 'reject' and not rejection_reason:
            return Response(
                {'detail': 'Rejection reason is required when rejecting a document'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update document status
        document.status = 'APPROVED' if action == 'approve' else 'REJECTED'
        document.rejection_reason = rejection_reason if action == 'reject' else ''
        document.admin_notes = admin_notes
        document.verified_by = request.user
        document.verified_at = timezone.now()
        document.save()

        # Check if all required documents are approved for KYC completion
        if action == 'approve':
            customer = document.customer
            required_doc_types = ['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE']
            address_doc_types = ['UTILITY_BILL', 'BANK_STATEMENT', 'PROOF_OF_ADDRESS']
            
            approved_docs = KYCDocument.objects.filter(customer=customer, status='APPROVED')
            approved_types = list(approved_docs.values_list('document_type', flat=True))
            
            has_approved_id = any(doc_type in approved_types for doc_type in required_doc_types)
            has_approved_address = any(doc_type in approved_types for doc_type in address_doc_types)
            
            if has_approved_id and has_approved_address:
                # All required documents approved - verify KYC
                customer.kyc_status = 'VERIFIED'
                customer.kyc_verified_at = timezone.now()
                customer.kyc_verified_by = request.user
                customer.save(update_fields=['kyc_status', 'kyc_verified_at', 'kyc_verified_by'])
                
                # Send verification email
                from .emails import send_account_active_email
                send_account_active_email.delay(customer.user.id)

        serializer = KYCDocumentSerializer(document, context={'request': request})
        return Response(serializer.data)


class AdminKYCProfilesView(APIView):
    """Admin view for managing customer KYC profiles"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        """List customer profiles with KYC status"""
        profiles = CustomerProfile.objects.select_related('user').order_by('-kyc_submitted_at')
        
        # Filter by KYC status
        status_filter = request.query_params.get('kyc_status')
        if status_filter:
            profiles = profiles.filter(kyc_status=status_filter)
        
        # Filter by customer
        customer_filter = request.query_params.get('customer')
        if customer_filter:
            profiles = profiles.filter(
                Q(full_name__icontains=customer_filter) |
                Q(user__email__icontains=customer_filter)
            )
        
        serializer = ProfileSerializer(profiles, many=True, context={'request': request})
        return Response(serializer.data)