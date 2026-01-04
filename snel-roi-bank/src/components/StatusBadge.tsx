import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface StatusBadgeProps {
  status: 'completed' | 'pending' | 'failed';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useLanguage();

  const styles = {
    completed: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    failed: 'bg-destructive/10 text-destructive',
  };

  const labels = {
    completed: t('transaction.completed'),
    pending: t('transaction.pending'),
    failed: t('transaction.failed'),
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};
