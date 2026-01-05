import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { TransactionIcon } from '@/components/TransactionIcon';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search } from 'lucide-react';

interface Transaction {
  id: number;
  reference: string;
  entry_type: string;
  created_at: string;
  status: string;
  memo: string;
}

const Transactions = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    apiRequest<Transaction[]>('/transactions').then(setTransactions);
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.entry_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('nav.transactions')}
        </h1>
        <p className="text-muted-foreground mt-1">View all your account activity</p>
      </div>

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
          {['all', 'pending', 'posted', 'declined'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status === 'all' ? 'All' : status}
            </Button>
          ))}
        </div>
      </div>

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
                  <TransactionIcon type={transaction.entry_type} />
                  <div>
                    <p className="font-medium text-foreground">{transaction.entry_type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString('de-DE')}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {transaction.reference}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{transaction.memo || '—'}</p>
                  <div className="mt-1">
                    <StatusBadge status={transaction.status} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Transaction Details</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <TransactionIcon type={selectedTransaction.entry_type} size="lg" />
                <div>
                  <p className="font-semibold text-lg">{selectedTransaction.entry_type}</p>
                  <StatusBadge status={selectedTransaction.status} />
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('common.date')}</span>
                  <span className="font-medium">
                    {new Date(selectedTransaction.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{selectedTransaction.entry_type}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-xs">{selectedTransaction.reference}</span>
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
