import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Receipt } from '@/components/Receipt';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { apiRequest } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Building2, ChevronRight, ArrowLeft } from 'lucide-react';

const Withdraw = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'amount' | 'success'>('amount');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Add artificial delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await apiRequest<{ reference: string }>(`/withdrawals/`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
      setReference(response.reference);
      setStep('success');
    } catch (error) {
      toast({
        title: t('common.error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Receipt
          type="withdraw"
          reference={reference}
          amount={amount || '200.00'}
          date={new Date().toLocaleString('de-DE')}
          method={t('withdraw.bankTransfer')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('action.back')}
        </Button>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('withdraw.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('withdraw.amount')}
        </p>
      </div>

      <div className="space-y-6 animate-slide-up">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t('withdraw.bankTransfer')}</p>
              <p className="text-sm text-muted-foreground">1-2 business days</p>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="amount">{t('common.amount')}</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-16 text-3xl font-semibold pl-10 text-center"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {[50, 100, 200, 500].map((preset) => (
                <Button
                  key={preset}
                  variant="secondary"
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button size="lg" className="w-full" onClick={handleConfirm} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {t('common.processing')}
            </>
          ) : (
            <>
              {t('action.confirm')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Withdraw;
