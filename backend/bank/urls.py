from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path('auth/register', views.RegisterView.as_view()),
    path('auth/login', views.LoginView.as_view()),
    path('auth/refresh', TokenRefreshView.as_view()),
    path('me', views.MeView.as_view()),
    path('dashboard', views.DashboardView.as_view()),
    path('accounts', views.AccountsView.as_view()),
    path('transactions', views.TransactionsView.as_view()),
    path('deposits', views.DepositView.as_view()),
    path('transfers', views.TransferView.as_view()),
    path('withdrawals', views.WithdrawalView.as_view()),
    path('statements', views.StatementsView.as_view()),
    path('statements/generate', views.StatementsGenerateView.as_view()),
    path('profile', views.ProfileView.as_view()),
    path('beneficiaries', views.BeneficiariesView.as_view()),
    path('admin/transactions', views.AdminTransactionsView.as_view()),
    path('admin/transactions/<int:pk>', views.AdminTransactionDetailView.as_view()),
    path('admin/transactions/<int:pk>/approve', views.AdminTransactionApproveView.as_view()),
    path('admin/transactions/<int:pk>/decline', views.AdminTransactionDeclineView.as_view()),
    path('admin/users', views.AdminUsersView.as_view()),
    path('admin/users/<int:pk>', views.AdminUserDetailView.as_view()),
    path('admin/accounts', views.AdminAccountsView.as_view()),
    path('admin/accounts/<int:pk>', views.AdminAccountDetailView.as_view()),
    path('admin/audit', views.AdminAuditView.as_view()),
]
