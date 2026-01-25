from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path('auth/register', views.RegisterView.as_view()),
    path('auth/login', views.LoginView.as_view()),
    path('auth/verify-email', views.VerifyEmailView.as_view()),
    path('auth/verify-email/resend', views.ResendVerificationView.as_view()),
    path('auth/password-reset/request', views.PasswordResetRequestView.as_view()),
    path('auth/password-reset/confirm', views.PasswordResetConfirmView.as_view()),
    path('auth/refresh', TokenRefreshView.as_view()),
    path('me', views.MeView.as_view()),
    path('dashboard', views.DashboardView.as_view()),
    path('accounts', views.AccountsView.as_view()),
    path('transactions', views.TransactionsView.as_view()),
    path('deposits', views.DepositView.as_view()),
    path('transfers', views.TransferView.as_view()),
    path('external-transfers', views.ExternalTransferView.as_view()),
    path('withdrawals', views.WithdrawalView.as_view()),
    path('statements', views.StatementsView.as_view()),
    path('statements/generate', views.StatementsGenerateView.as_view()),
    path('profile', views.ProfileView.as_view()),
    path('beneficiaries', views.BeneficiariesView.as_view()),
    path('accounts/freeze', views.FreezeAccountView.as_view()),
    path('accounts/unfreeze', views.UnfreezeAccountView.as_view()),
    
    # Crypto Deposit Endpoints
    path('crypto-wallets', views.CryptoWalletsPublicView.as_view()),
    path('deposits/crypto', views.UserCryptoDepositsView.as_view()),
    path('deposits/crypto/initiate', views.CryptoDepositInitiateView.as_view()),
    path('deposits/crypto/<int:pk>/upload-proof', views.CryptoDepositUploadProofView.as_view()),
    path('deposits/crypto/<int:pk>/status', views.CryptoDepositStatusView.as_view()),

    # Admin Crypto Endpoints
    path('admin/crypto-wallets', views.AdminCryptoWalletsView.as_view()),
    path('admin/crypto-wallets/<int:pk>', views.AdminCryptoWalletDetailView.as_view()),
    path('admin/crypto-wallets/<int:pk>/toggle', views.AdminCryptoWalletToggleView.as_view()),
    path('admin/crypto-deposits', views.AdminCryptoDepositsView.as_view()),
    path('admin/crypto-deposits/<int:pk>/verify', views.AdminCryptoDepositVerifyView.as_view()),

    path('admin/transactions', views.AdminTransactionsView.as_view()),
    path('admin/transactions/clear', views.AdminClearTransactionsView.as_view()),
    path('admin/transactions/manual-transfer', views.AdminManualTransferView.as_view()),
    path('admin/transactions/<int:pk>', views.AdminTransactionDetailView.as_view()),
    path('admin/transactions/<int:pk>/approve', views.AdminTransactionApproveView.as_view()),
    path('admin/transactions/<int:pk>/decline', views.AdminTransactionDeclineView.as_view()),
    path('admin/users', views.AdminUsersView.as_view()),
    path('admin/users/<int:pk>', views.AdminUserDetailView.as_view()),
    path('admin/accounts', views.AdminAccountsView.as_view()),
    path('admin/accounts/<int:pk>', views.AdminAccountDetailView.as_view()),
    path('admin/audit', views.AdminAuditView.as_view()),
]
