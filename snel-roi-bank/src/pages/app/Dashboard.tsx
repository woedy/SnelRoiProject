import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { demoAccounts, demoTransactions, demoVirtualCards } from '@/data/demoData';
import { TransactionIcon } from '@/components/TransactionIcon';
import { StatusBadge } from '@/components/StatusBadge';
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
  Copy,
  Snowflake,
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const totalBalance = demoAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAvailable = demoAccounts.reduce((sum, acc) => sum + acc.availableBalance, 0);
  const pendingAmount = totalBalance - totalAvailable;

  const recentTransactions = demoTransactions.slice(0, 5);

  const quickActions = [
    { icon: ArrowDownToLine, label: t('nav.deposit'), path: '/app/deposit', color: 'bg-success/10 text-success' },
    { icon: Send, label: t('nav.transfer'), path: '/app/transfer', color: 'bg-info/10 text-info' },
    { icon: ArrowUpFromLine, label: t('nav.withdraw'), path: '/app/withdraw', color: 'bg-warning/10 text-warning' },
  ];

  const accountTypeLabels: Record<string, string> = {
    checking: t('dashboard.checking'),
    savings: t('dashboard.savings'),
    business: t('dashboard.business'),
  };

  const primaryVirtualCard = demoVirtualCards[0];
  const [showCardDetails, setShowCardDetails] = React.useState(false);
  const [isFrozen, setIsFrozen] = React.useState(primaryVirtualCard?.status === 'frozen');

  const maskedPan = (pan: string) => {
    const digits = pan.replace(/\s/g, '');
    const last4 = digits.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-20 lg:pb-0">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('dashboard.welcome')}, {user?.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your accounts today.
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 banking-card text-primary-foreground">
          <div className="relative z-10">
            <p className="text-sm opacity-70 mb-1">{t('dashboard.totalBalance')}</p>
            <p className="text-4xl lg:text-5xl font-bold mb-6">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex gap-8">
              <div>
                <div className="flex items-center gap-2 text-sm opacity-70 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  {t('dashboard.available')}
                </div>
                <p className="text-lg font-semibold">
                  ${totalAvailable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm opacity-70 mb-1">
                  <TrendingDown className="h-4 w-4" />
                  {t('dashboard.pending')}
                </div>
                <p className="text-lg font-semibold">
                  ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">{t('dashboard.quickActions')}</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.path}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto py-3 hover:bg-secondary"
                >
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

      {/* Accounts & Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Accounts */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">{t('dashboard.accounts')}</h3>
          <div className="space-y-3">
            {demoAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{accountTypeLabels[account.type]}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {account.accountNumber.slice(-8)}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-foreground">
                  ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Virtual Card */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{t('dashboard.virtualCard')}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCardDetails((v) => !v)}
            >
              {showCardDetails ? t('dashboard.virtualCardHide') : t('dashboard.virtualCardReveal')}
              {showCardDetails ? (
                <EyeOff className="h-4 w-4 ml-2" />
              ) : (
                <Eye className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>

          {primaryVirtualCard ? (
            <div className="space-y-4">
              <div className={`rounded-2xl p-5 text-primary-foreground banking-card ${isFrozen ? 'opacity-80' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm opacity-70">{primaryVirtualCard.nickname}</p>
                    <p className="mt-1 text-xl font-semibold tracking-wide">
                      {showCardDetails ? primaryVirtualCard.pan : maskedPan(primaryVirtualCard.pan)}
                    </p>
                  </div>
                  <div className="text-sm font-semibold opacity-80">{primaryVirtualCard.brand}</div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs opacity-70">{t('dashboard.virtualCardDetails')}</p>
                    <p className="text-sm font-medium mt-1">
                      {showCardDetails ? primaryVirtualCard.cvv : '•••'} • {primaryVirtualCard.expiryMonth}/{primaryVirtualCard.expiryYear}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-70">{primaryVirtualCard.cardholderName}</p>
                    <p className="text-sm font-medium mt-1">
                      {primaryVirtualCard.currency} {isFrozen ? `• ${t('dashboard.virtualCardFrozen')}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="secondary"
                  className="h-11"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(primaryVirtualCard.pan);
                    } catch {
                      // ignore
                    }
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('dashboard.virtualCardCopyNumber')}
                </Button>

                <Button
                  variant="secondary"
                  className="h-11"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(primaryVirtualCard.cvv);
                    } catch {
                      // ignore
                    }
                  }}
                  disabled={!showCardDetails}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('dashboard.virtualCardCopyCvv')}
                </Button>

                <Button
                  variant={isFrozen ? 'default' : 'destructive'}
                  className="h-11"
                  onClick={() => setIsFrozen((v) => !v)}
                >
                  <Snowflake className="h-4 w-4 mr-2" />
                  {isFrozen ? t('dashboard.virtualCardUnfreeze') : t('dashboard.virtualCardFreeze')}
                </Button>
              </div>

              <div className="space-y-3">
                {(() => {
                  const spent = primaryVirtualCard.spentThisMonth;
                  const limit = primaryVirtualCard.monthlyLimit;
                  const remaining = Math.max(0, limit - spent);
                  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;

                  return (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('dashboard.virtualCardMonthlyLimit')}</span>
                        <span className="text-foreground font-medium">
                          ${limit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('dashboard.virtualCardSpentThisMonth')}</span>
                        <span className="text-foreground font-medium">
                          ${spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('dashboard.virtualCardRemaining')}</span>
                        <span className="text-foreground font-medium">
                          ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-secondary/50 text-muted-foreground">
              {t('dashboard.virtualCardEmpty')}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{t('dashboard.recentTransactions')}</h3>
          <Link to="/app/transactions">
            <Button variant="ghost" size="sm">
              {t('dashboard.viewAll')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TransactionIcon type={transaction.type} />
                <div>
                  <p className="font-medium text-foreground">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    transaction.amount > 0 ? 'text-success' : 'text-foreground'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}$
                  {Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <StatusBadge status={transaction.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
