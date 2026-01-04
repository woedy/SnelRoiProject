import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { demoTransactions } from '@/data/demoData';
import { TransactionIcon } from '@/components/TransactionIcon';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Filter, X } from 'lucide-react';

const Transactions = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<typeof demoTransactions[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTransactions = demoTransactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('nav.transactions')}
        </h1>
        <p className="text-muted-foreground mt-1">
          View all your account activity
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'completed', 'pending', 'failed'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status === 'all' ? 'All' : t(`transaction.${status}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTransactions.map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => setSelectedTransaction(transaction)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <TransactionIcon type={transaction.type} />
                  <div>
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString('de-DE')}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {transaction.category}
                      </span>
                    </div>
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
                  <div className="mt-1">
                    <StatusBadge status={transaction.status} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Transaction Details</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <TransactionIcon type={selectedTransaction.type} size="lg" />
                <div>
                  <p className="font-semibold text-lg">{selectedTransaction.description}</p>
                  <StatusBadge status={selectedTransaction.status} />
                </div>
              </div>

              <div className="text-center py-4">
                <p
                  className={`text-4xl font-bold ${
                    selectedTransaction.amount > 0 ? 'text-success' : 'text-foreground'
                  }`}
                >
                  {selectedTransaction.amount > 0 ? '+' : ''}$
                  {Math.abs(selectedTransaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('common.date')}</span>
                  <span className="font-medium">
                    {new Date(selectedTransaction.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{selectedTransaction.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{selectedTransaction.type}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-xs">{selectedTransaction.id.toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
