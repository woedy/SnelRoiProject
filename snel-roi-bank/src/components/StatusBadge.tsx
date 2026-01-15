import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useLanguage();

  const statusKey = status.toLowerCase();
  const styles: Record<string, string> = {
    completed: 'bg-success/10 text-success',
    posted: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    failed: 'bg-destructive/10 text-destructive',
    declined: 'bg-destructive/10 text-destructive',
  };

  const labels: Record<string, string> = {
    completed: t('transaction.completed'),
    posted: t('transaction.completed'),
    pending: t('transaction.pending'),
    failed: t('transaction.failed'),
    declined: t('transaction.failed'),
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[statusKey]}`}>
      {labels[statusKey]}
    </span>
  );
};
