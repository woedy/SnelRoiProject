import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { TransactionIcon } from '@/components/TransactionIcon';
import { StatusBadge } from '@/components/StatusBadge';
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

interface DashboardData {
  accounts: Account[];
  recent_transactions: Transaction[];
  total_balance: number;
  insights: { debits_last_30_days: number; credits_last_30_days: number };
  virtual_card: { status: string; last_four: string };
}

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<DashboardData>('/dashboard')
      .then(setDashboard)
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = dashboard?.total_balance ?? 0;
  const totalAvailable = dashboard?.total_balance ?? 0;
  const pendingAmount = totalBalance - totalAvailable;

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
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6 lg:space-y-8 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('dashboard.welcome')}, {user?.username.split('@')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your accounts today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 banking-card text-primary-foreground">
          <div className="relative z-10">
            <p className="text-sm opacity-70 mb-1">{t('dashboard.totalBalance')}</p>
            <p className="text-4xl lg:text-5xl font-bold mb-6">
              ₵{Number(totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex gap-8">
              <div>
                <div className="flex items-center gap-2 text-sm opacity-70 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  {t('dashboard.available')}
                </div>
                <p className="text-lg font-semibold">
                  ₵{Number(totalAvailable).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm opacity-70 mb-1">
                  <TrendingDown className="h-4 w-4" />
                  {t('dashboard.pending')}
                </div>
                <p className="text-lg font-semibold">
                  ₵{Number(pendingAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">{t('dashboard.quickActions')}</h3>
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
                  ₵{Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
              <div className={`rounded-2xl p-5 text-primary-foreground banking-card ${isFrozen ? 'opacity-80' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm opacity-70">Primary</p>
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
                      GHS {isFrozen ? `• ${t('dashboard.virtualCardFrozen')}` : ''}
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
                  {isFrozen ? t('dashboard.virtualCardUnfreeze') : t('dashboard.virtualCardFreeze')}
                </Button>
                <Button variant="secondary" className="h-11">
                  {t('dashboard.virtualCardCopy')}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No virtual card data yet.</p>
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
              <p className="text-lg font-semibold">₵{Number(dashboard?.insights.credits_last_30_days ?? 0).toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="text-xs text-muted-foreground">Debits last 30 days</p>
              <p className="text-lg font-semibold">₵{Number(dashboard?.insights.debits_last_30_days ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
