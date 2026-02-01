import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { TransactionIcon } from '@/components/TransactionIcon';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingScreen, InlineLoader } from '@/components/ui/loading-screen';
import { apiRequest } from '@/lib/api';
import {
  ArrowDownToLine,
  Send,
  ArrowUpFromLine,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Eye,
  EyeOff,
  Snowflake,
  Plus,
  Shield,
  AlertTriangle,
} from 'lucide-react';

interface Account {
  id: number;
  type: string;
  currency: string;
  status: string;
  account_number: string;
  balance: number;
}

interface Transaction {
  id: number;
  reference: string;
  entry_type: string;
  created_at: string;
  status: string;
  memo: string;
}

interface PendingCryptoDeposit {
  id: number;
  amount_usd: string;
  crypto_wallet_details: {
    crypto_type_display: string;
    network_display: string;
  };
  verification_status_display: string;
  created_at: string;
}

interface DashboardData {
  accounts: Account[];
  recent_transactions: Transaction[];
  unsettled_crypto_deposits?: PendingCryptoDeposit[];
  total_balance: number;
  available_balance: number;
  pending_balance: number;
  insights: { debits_last_30_days: number; credits_last_30_days: number };
  virtual_card: { 
    status: string; 
    last_four: string;
    card_type?: string;
    is_frozen?: boolean;
  } | null;
  account_status?: {
    has_frozen_account: boolean;
    frozen_account_numbers: string[];
    message: string | null;
  };
  kyc_status?: {
    status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
    profile_completion_percentage: number;
    rejection_reason?: string;
  };
}

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<DashboardData>('/dashboard/')
      .then(setDashboard)
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = dashboard?.total_balance ?? 0;
  const availableBalance = dashboard?.available_balance ?? 0;
  const pendingBalance = dashboard?.pending_balance ?? 0;

  const recentTransactions = dashboard?.recent_transactions ?? [];

  const quickActions = [
    { icon: ArrowDownToLine, label: t('nav.deposit'), path: '/app/deposit', color: 'bg-success/10 text-success' },
    { icon: Send, label: t('nav.transfer'), path: '/app/transfer', color: 'bg-info/10 text-info' },
    { icon: ArrowUpFromLine, label: t('nav.withdraw'), path: '/app/withdraw', color: 'bg-warning/10 text-warning' },
  ];

  const accountTypeLabels: Record<string, string> = {
    CHECKING: t('dashboard.checking'),
    SAVINGS: t('dashboard.savings'),
    SYSTEM: t('dashboard.business'),
  };

  const [showCardDetails, setShowCardDetails] = React.useState(false);
  const [isFrozen, setIsFrozen] = React.useState(false);

  useEffect(() => {
    if (dashboard?.virtual_card) {
      setIsFrozen(dashboard.virtual_card.status === 'FROZEN');
    }
  }, [dashboard]);

  const maskedPan = (pan: string) => {
    const digits = pan.replace(/\s/g, '');
    const last4 = digits.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  if (loading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  return (
    <div className="space-y-6 lg:space-y-8 pb-20 lg:pb-0">
      {/* KYC Verification Alert */}
      {dashboard?.kyc_status && dashboard.kyc_status.status !== 'VERIFIED' && (
        <div className={`border rounded-xl p-4 mb-6 ${
          dashboard.kyc_status.status === 'REJECTED' 
            ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
            : 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              dashboard.kyc_status.status === 'REJECTED' 
                ? 'bg-red-500' 
                : 'bg-amber-500'
            }`}>
              {dashboard.kyc_status.status === 'REJECTED' ? (
                <span className="text-white text-xs font-bold">!</span>
              ) : (
                <Shield className="h-3 w-3 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${
                dashboard.kyc_status.status === 'REJECTED'
                  ? 'text-red-900 dark:text-red-100'
                  : 'text-amber-900 dark:text-amber-100'
              }`}>
                {dashboard.kyc_status.status === 'REJECTED' 
                  ? 'KYC Verification Rejected'
                  : dashboard.kyc_status.status === 'UNDER_REVIEW'
                  ? 'KYC Under Review'
                  : 'Complete Your KYC Verification'
                }
              </h3>
              <p className={`text-sm mb-3 ${
                dashboard.kyc_status.status === 'REJECTED'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-amber-700 dark:text-amber-300'
              }`}>
                {dashboard.kyc_status.status === 'REJECTED' 
                  ? `Your KYC verification was rejected. ${dashboard.kyc_status.rejection_reason || 'Please update your information and resubmit.'}`
                  : dashboard.kyc_status.status === 'UNDER_REVIEW'
                  ? 'Your KYC documents are being reviewed. This typically takes 1-3 business days.'
                  : 'To access all banking features and increase your transaction limits, please complete your KYC verification by providing the required documents.'
                }
              </p>
              {dashboard.kyc_status.status !== 'UNDER_REVIEW' && (
                <Link to="/app/profile">
                  <Button 
                    size="sm" 
                    className={
                      dashboard.kyc_status.status === 'REJECTED'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {dashboard.kyc_status.status === 'REJECTED' ? 'Update KYC' : 'Complete KYC'}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Frozen Account Alert */}
      {dashboard?.account_status?.has_frozen_account && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-red-900 dark:text-red-100 font-semibold mb-1">
                {t('dashboard.accountFrozen')}
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                Your account {dashboard.account_status.frozen_account_numbers[0]} has been frozen. Please contact <strong>customer care at banking@snelroi.com</strong> to resolve this issue.
              </p>
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                {t('dashboard.frozenAccount')}: {dashboard.account_status.frozen_account_numbers[0]}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('dashboard.welcome')}, {user?.username.split('@')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your accounts today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 banking-card relative">
          <div className="relative z-10">
            <p className="text-sm opacity-70 mb-1">{t('dashboard.totalBalance')}</p>
            <p className="text-4xl lg:text-5xl font-bold mb-6">
              ${Number(totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex flex-col sm:flex-row sm:gap-8 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm opacity-70 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  {t('dashboard.available')}
                </div>
                <p className="text-lg font-semibold">
                  ${Number(availableBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm opacity-70 mb-1">
                  <TrendingDown className="h-4 w-4" />
                  {t('dashboard.pending')}
                </div>
                <p className="text-lg font-semibold">
                  ${Number(pendingBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            
            {/* Add Money and Send Money Buttons - Desktop Only */}
            {!isMobile && (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link to="/app/deposit" className="flex-1 sm:flex-none">
                  <Button className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm">
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    {t('nav.deposit')}
                  </Button>
                </Link>
                <Link to="/app/transfer" className="flex-1 sm:flex-none">
                  <Button className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm">
                    <Send className="h-4 w-4 mr-2" />
                    {t('nav.transfer')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">{t('dashboard.quickActions')}</h3>
          
          {/* Mobile: Icon Grid Layout */}
          {isMobile ? (
            <div className="grid grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.path} className="flex flex-col items-center">
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="w-16 h-16 rounded-2xl p-0 hover:bg-secondary flex-col gap-1"
                  >
                    <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                  </Button>
                  <span className="text-xs font-medium text-center mt-2 text-muted-foreground leading-tight">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            /* Desktop: Full Width Buttons */
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.path}>
                  <Button variant="ghost" className="w-full justify-start h-auto py-3 hover:bg-secondary">
                    <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mr-3`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{action.label}</span>
                    <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">{t('dashboard.accounts')}</h3>
          <div className="space-y-3">
            {dashboard?.accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {accountTypeLabels[account.type] || account.type}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {account.account_number.slice(-8)}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-foreground">
                  ${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{t('dashboard.virtualCard')}</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowCardDetails((v) => !v)}>
              {showCardDetails ? t('dashboard.virtualCardHide') : t('dashboard.virtualCardReveal')}
              {showCardDetails ? <EyeOff className="h-4 w-4 ml-2" /> : <Eye className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          {dashboard?.virtual_card ? (
            <div className="space-y-4">
              <div className={`rounded-2xl p-5 banking-card ${dashboard.virtual_card.is_frozen ? 'opacity-80' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm opacity-70">{dashboard.virtual_card.card_type || 'Standard'}</p>
                    <p className="mt-1 text-xl font-semibold tracking-wide">
                      {showCardDetails ? `**** **** **** ${dashboard.virtual_card.last_four}` : maskedPan(`0000 0000 0000 ${dashboard.virtual_card.last_four}`)}
                    </p>
                  </div>
                  <div className="text-sm font-semibold opacity-80">VISA</div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs opacity-70">{t('dashboard.virtualCardDetails')}</p>
                    <p className="text-sm font-medium mt-1">{showCardDetails ? '***' : '•••'} • 12/28</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-70">{user?.username}</p>
                    <p className="text-sm font-medium mt-1">
                      USD {dashboard.virtual_card.is_frozen ? `• ${t('dashboard.virtualCardFrozen')}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button variant="secondary" className="h-11" onClick={() => setShowCardDetails((v) => !v)}>
                  {showCardDetails ? t('dashboard.virtualCardHide') : t('dashboard.virtualCardReveal')}
                </Button>
                <Button variant="secondary" className="h-11" onClick={() => setIsFrozen((v) => !v)}>
                  <Snowflake className="h-4 w-4 mr-2" />
                  {dashboard.virtual_card.is_frozen ? t('dashboard.virtualCardUnfreeze') : t('dashboard.virtualCardFreeze')}
                </Button>
                <Link to="/app/virtual-cards">
                  <Button variant="secondary" className="h-11 w-full">
                    {t('dashboard.virtualCardCopy')}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">No virtual cards yet</p>
              <Link to="/app/virtual-cards">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Apply for Card
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{t('dashboard.recentTransactions')}</h3>
            <Link to="/app/transactions" className="text-sm text-accent hover:underline">
              {t('dashboard.viewAll')}
            </Link>
          </div>
          <div className="space-y-2">
            {/* Render Unsettled Crypto Deposits First */}
            {dashboard?.unsettled_crypto_deposits?.map((pending) => (
              <div key={`pending-${pending.id}`} className={`flex items-center justify-between p-3 rounded-xl border ${pending.verification_status_display.toLowerCase().includes('reject') ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pending.verification_status_display.toLowerCase().includes('reject') ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                    <ArrowDownToLine className={`h-5 w-5 ${pending.verification_status_display.toLowerCase().includes('reject') ? 'text-red-600' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {pending.crypto_wallet_details.crypto_type_display} Deposit
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pending.crypto_wallet_details.network_display} • {new Date(pending.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${pending.verification_status_display.toLowerCase().includes('reject') ? 'text-red-600' : 'text-amber-600'}`}>+${pending.amount_usd}</p>
                  <StatusBadge status={pending.verification_status_display.toUpperCase()} />
                </div>
              </div>
            ))}

            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40">
                <div className="flex items-center gap-3">
                  <TransactionIcon type={transaction.entry_type} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{transaction.entry_type}</p>
                    <p className="text-xs text-muted-foreground">{transaction.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{transaction.memo || '—'}</p>
                  <StatusBadge status={transaction.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">{t('dashboard.insights')}</h3>
          <div className="grid gap-3">
            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="text-xs text-muted-foreground">Credits last 30 days</p>
              <p className="text-lg font-semibold">${Number(dashboard?.insights.credits_last_30_days ?? 0).toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="text-xs text-muted-foreground">Debits last 30 days</p>
              <p className="text-lg font-semibold">${Number(dashboard?.insights.debits_last_30_days ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
