import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Receipt } from '@/components/Receipt';
import { generateReferenceNumber } from '@/data/demoData';
import { Building2, CreditCard, Smartphone, ChevronRight, ArrowLeft } from 'lucide-react';

const Deposit = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'method' | 'amount' | 'success'>('method');
  const [method, setMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [reference] = useState(generateReferenceNumber());

  const methods = [
    { id: 'bank', icon: Building2, label: t('deposit.bankTransfer'), desc: '1-2 business days' },
    { id: 'card', icon: CreditCard, label: t('deposit.card'), desc: 'Instant' },
    { id: 'mobile', icon: Smartphone, label: t('deposit.mobile'), desc: 'Instant' },
  ];

  const handleMethodSelect = (methodId: string) => {
    setMethod(methodId);
    setStep('amount');
  };

  const handleConfirm = () => {
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Receipt
          type="deposit"
          reference={reference}
          amount={amount || '500.00'}
          date={new Date().toLocaleString('de-DE')}
          method={methods.find(m => m.id === method)?.label}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => step === 'method' ? navigate('/app/dashboard') : setStep('method')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('action.back')}
        </Button>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('deposit.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {step === 'method' ? t('deposit.method') : t('deposit.amount')}
        </p>
      </div>

      {step === 'method' && (
        <div className="space-y-3 animate-slide-up">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMethodSelect(m.id)}
              className="w-full flex items-center gap-4 p-5 rounded-2xl bg-card shadow-card hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <m.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground">{m.label}</p>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {step === 'amount' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              {(() => {
                const m = methods.find(m => m.id === method);
                return m ? (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <m.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{m.label}</p>
                      <p className="text-sm text-muted-foreground">{m.desc}</p>
                    </div>
                  </>
                ) : null;
              })()}
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
                {[100, 250, 500, 1000].map((preset) => (
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

          <Button size="lg" className="w-full" onClick={handleConfirm}>
            {t('action.confirm')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Deposit;
