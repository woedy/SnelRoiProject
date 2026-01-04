import React from 'react';
import { CheckCircle, Copy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface ReceiptProps {
  type: 'deposit' | 'transfer' | 'withdraw';
  reference: string;
  amount: string;
  date: string;
  recipient?: string;
  method?: string;
}

export const Receipt: React.FC<ReceiptProps> = ({
  type,
  reference,
  amount,
  date,
  recipient,
  method,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const typeLabels = {
    deposit: t('deposit.success'),
    transfer: t('transfer.success'),
    withdraw: t('withdraw.success'),
  };

  const copyReference = () => {
    navigator.clipboard.writeText(reference);
    toast({
      title: 'Copied!',
      description: 'Reference number copied to clipboard',
    });
  };

  return (
    <div className="animate-slide-up text-center max-w-md mx-auto">
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-success" />
      </div>

      <h2 className="text-2xl font-display font-bold text-foreground mb-2">
        {typeLabels[type]}
      </h2>

      <div className="bg-card rounded-2xl p-6 shadow-card mt-6 space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-border">
          <span className="text-muted-foreground">{t('common.amount')}</span>
          <span className="font-semibold text-lg">${amount}</span>
        </div>

        {recipient && (
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">{t('transfer.recipient')}</span>
            <span className="font-medium">{recipient}</span>
          </div>
        )}

        {method && (
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-muted-foreground">Method</span>
            <span className="font-medium">{method}</span>
          </div>
        )}

        <div className="flex justify-between items-center py-3 border-b border-border">
          <span className="text-muted-foreground">{t('common.date')}</span>
          <span className="font-medium">{date}</span>
        </div>

        <div className="flex justify-between items-center py-3">
          <span className="text-muted-foreground">{t('deposit.reference')}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{reference}</span>
            <Button variant="ghost" size="icon" onClick={copyReference} className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Button
          variant="default"
          size="lg"
          className="w-full"
          onClick={() => navigate('/app/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('action.backToDashboard')}
        </Button>
      </div>
    </div>
  );
};
