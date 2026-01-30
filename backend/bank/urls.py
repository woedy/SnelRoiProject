from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', views.LoginView.as_view()),
    path('auth/verify-email/', views.VerifyEmailView.as_view()),
    path('auth/verify-email/resend/', views.ResendVerificationView.as_view()),
    path('auth/password-reset/request/', views.PasswordResetRequestView.as_view()),
    path('auth/password-reset/confirm/', views.PasswordResetConfirmView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('me/', views.MeView.as_view()),
    path('dashboard/', views.DashboardView.as_view()),
    path('accounts/', views.AccountsView.as_view()),
    path('transactions/', views.TransactionsView.as_view()),
    path('deposits/', views.DepositView.as_view()),
    path('transfers/', views.TransferView.as_view()),
    path('external-transfers/', views.ExternalTransferView.as_view()),
    path('withdrawals/', views.WithdrawalView.as_view()),
    path('statements/', views.StatementsView.as_view()),
    path('statements/generate/', views.StatementsGenerateView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('beneficiaries/', views.BeneficiariesView.as_view()),
    path('accounts/freeze/', views.FreezeAccountView.as_view()),
    path('accounts/unfreeze/', views.UnfreezeAccountView.as_view()),
    
    # Crypto Deposit Endpoints
    path('crypto-wallets/', views.CryptoWalletsPublicView.as_view()),
    path('deposits/crypto/', views.UserCryptoDepositsView.as_view()),
    path('deposits/crypto/initiate/', views.CryptoDepositInitiateView.as_view()),
    path('deposits/crypto/<int:pk>/upload-proof/', views.CryptoDepositUploadProofView.as_view()),
    path('deposits/crypto/<int:pk>/status/', views.CryptoDepositStatusView.as_view()),

    # Admin Crypto Endpoints
    path('admin/crypto-wallets/', views.AdminCryptoWalletsView.as_view()),
    path('admin/crypto-wallets/<int:pk>/', views.AdminCryptoWalletDetailView.as_view()),
    path('admin/crypto-wallets/<int:pk>/toggle/', views.AdminCryptoWalletToggleView.as_view()),
    path('admin/crypto-deposits/', views.AdminCryptoDepositsView.as_view()),
    path('admin/crypto-deposits/<int:pk>/verify/', views.AdminCryptoDepositVerifyView.as_view()),

    path('admin/transactions/', views.AdminTransactionsView.as_view()),
    path('admin/transactions/clear/', views.AdminClearTransactionsView.as_view()),
    path('admin/transactions/manual-transfer/', views.AdminManualTransferView.as_view()),
    path('admin/transactions/<int:pk>/', views.AdminTransactionDetailView.as_view()),
    path('admin/transactions/<int:pk>/approve/', views.AdminTransactionApproveView.as_view()),
    path('admin/transactions/<int:pk>/decline/', views.AdminTransactionDeclineView.as_view()),
    path('admin/users/', views.AdminUsersView.as_view()),
    path('admin/users/<int:pk>/', views.AdminUserDetailView.as_view()),
    
    # Loan Endpoints
    path('loans/', views.LoansView.as_view()),
    path('loans/<int:pk>/', views.LoanDetailView.as_view()),
    path('loans/<int:pk>/payments/', views.LoanPaymentsView.as_view()),
    
    # Admin Loan Endpoints
    path('admin/loans/', views.AdminLoansView.as_view()),
    path('admin/loans/<int:pk>/', views.AdminLoanDetailView.as_view()),
    path('admin/loans/<int:pk>/approve/', views.AdminLoanApproveView.as_view()),
    path('admin/loans/<int:pk>/reject/', views.AdminLoanRejectView.as_view()),
    path('admin/loans/<int:pk>/disburse/', views.AdminLoanDisburseView.as_view()),
    
    # Notification Endpoints
    path('notifications/', views.NotificationsView.as_view()),
    path('notifications/<int:pk>/', views.NotificationDetailView.as_view()),
    path('notifications/mark-all-read/', views.NotificationMarkAllReadView.as_view()),
    path('notifications/unread-count/', views.NotificationUnreadCountView.as_view()),
    path('notifications/<int:pk>/delete/', views.NotificationDeleteView.as_view()),

    # Virtual Card Endpoints
    path('virtual-cards/', views.VirtualCardsView.as_view()),
    path('virtual-cards/<int:pk>/', views.VirtualCardDetailView.as_view()),
    path('virtual-cards/<int:pk>/toggle-freeze/', views.VirtualCardToggleFreezeView.as_view()),

    # Admin Virtual Card Endpoints
    path('admin/virtual-cards/', views.AdminVirtualCardsView.as_view()),
    path('admin/virtual-cards/<int:pk>/', views.AdminVirtualCardDetailView.as_view()),
    path('admin/virtual-cards/<int:pk>/approve/', views.AdminVirtualCardApprovalView.as_view()),
    path('admin/accounts/', views.AdminAccountsView.as_view()),
    path('admin/accounts/<int:pk>/', views.AdminAccountDetailView.as_view()),
    path('admin/audit/', views.AdminAuditView.as_view()),
    
    # Customer Support Chat Endpoints
    path('support/conversations/', views.SupportConversationsView.as_view()),
    path('support/conversations/<int:pk>/', views.SupportConversationDetailView.as_view()),
    path('support/conversations/<int:conversation_id>/messages/', views.SendSupportMessageView.as_view()),
    path('support/unread-count/', views.SupportUnreadCountView.as_view()),
    
    # KYC Document Endpoints
    path('kyc/documents/', views.KYCDocumentsView.as_view()),
    path('kyc/documents/<int:pk>/', views.KYCDocumentDetailView.as_view()),
    path('kyc/submit/', views.KYCSubmitView.as_view()),
    
    # Admin KYC Endpoints
    path('admin/kyc/documents/', views.AdminKYCDocumentsView.as_view()),
    path('admin/kyc/documents/<int:pk>/', views.AdminKYCDocumentDetailView.as_view()),
    path('admin/kyc/profiles/', views.AdminKYCProfilesView.as_view()),
    path('admin/kyc/profiles/<int:pk>/', views.AdminKYCProfileDetailView.as_view()),
    
    # Tax Refund Endpoints
    path('tax-refunds/calculator/', views.TaxRefundCalculatorView.as_view()),
    path('tax-refunds/', views.TaxRefundApplicationListView.as_view()),
    path('tax-refunds/<int:pk>/', views.TaxRefundApplicationDetailView.as_view()),
    path('tax-refunds/<int:application_pk>/documents/', views.TaxRefundDocumentUploadView.as_view()),
    
    # Admin Tax Refund Endpoints
    path('admin/tax-refunds/', views.AdminTaxRefundApplicationListView.as_view()),
    path('admin/tax-refunds/<int:pk>/', views.AdminTaxRefundApplicationDetailView.as_view()),
    path('admin/tax-refunds/stats/', views.AdminTaxRefundStatsView.as_view()),
]
