import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Receipt } from '@/components/Receipt';
import { apiRequest } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { UserPlus, ChevronRight, ArrowLeft, Check, ExternalLink } from 'lucide-react';

interface Beneficiary {
  id: number;
  name: string;
  bank_label: string;
  account_number: string;
}

const Transfer = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'recipient' | 'amount' | 'success'>('recipient');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(null);
  const [newRecipient, setNewRecipient] = useState({ name: '', account: '' });
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    apiRequest<Beneficiary[]>('/beneficiaries/').then(setBeneficiaries).catch(() => setBeneficiaries([]));
  }, []);

  const handleBeneficiarySelect = (id: string) => {
    setSelectedBeneficiary(id);
    setStep('amount');
  };

  const handleNewRecipient = () => {
    setSelectedBeneficiary('new');
    setStep('amount');
  };

  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Add artificial delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const targetAccount = selectedBeneficiary === 'new'
        ? newRecipient.account
        : beneficiaries.find((b) => b.id.toString() === selectedBeneficiary)?.account_number;
      if (!targetAccount) {
        throw new Error('Recipient account is required');
      }
      const response = await apiRequest<{ reference: string }>(`/transfers/`, {
        method: 'POST',
        body: JSON.stringify({ amount, memo: note, target_account_number: targetAccount }),
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

  const getRecipientName = () => {
    if (selectedBeneficiary === 'new') {
      return newRecipient.name || 'New Recipient';
    }
    return beneficiaries.find(b => b.id.toString() === selectedBeneficiary)?.name || '';
  };

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Receipt
          type="transfer"
          reference={reference}
          amount={amount || '250.00'}
          date={new Date().toLocaleString('de-DE')}
          recipient={getRecipientName()}
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
          onClick={() => step === 'recipient' ? navigate('/app/dashboard') : setStep('recipient')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('action.back')}
        </Button>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('transfer.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {step === 'recipient' ? t('transfer.to') : t('transfer.amount')}
        </p>
      </div>

      {step === 'recipient' && (
        <div className="space-y-6 animate-slide-up">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {t('transfer.savedBeneficiaries')}
            </h3>
            <div className="space-y-2">
              {beneficiaries.map((beneficiary) => (
                <button
                  key={beneficiary.id}
                  onClick={() => handleBeneficiarySelect(beneficiary.id.toString())}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-card shadow-card hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                    {beneficiary.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-foreground">{beneficiary.name}</p>
                    <p className="text-sm text-muted-foreground">{beneficiary.bank_label}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground">or</span>
            </div>
          </div>

          <button
            onClick={handleNewRecipient}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-foreground">{t('transfer.newBeneficiary')}</p>
              <p className="text-sm text-muted-foreground">Enter recipient details manually</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate('/app/external-transfer')}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary/5 border-2 border-primary/20 hover:bg-primary/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <ExternalLink className="h-5 w-5" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-foreground">{t('externalTransfer.title')}</p>
              <p className="text-sm text-muted-foreground">{t('externalTransfer.subtitle')}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      )}

      {step === 'amount' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                {selectedBeneficiary === 'new'
                  ? newRecipient.name.slice(0, 2).toUpperCase() || 'NR'
                  : beneficiaries.find(b => b.id.toString() === selectedBeneficiary)?.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{getRecipientName()}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBeneficiary === 'new'
                    ? 'New recipient'
                    : beneficiaries.find(b => b.id.toString() === selectedBeneficiary)?.bank_label}
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                <Check className="h-4 w-4 text-success-foreground" />
              </div>
            </div>
          </div>

          {selectedBeneficiary === 'new' && (
            <div className="bg-card rounded-2xl p-6 shadow-card space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  placeholder="John Doe"
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientAccount">Account Number</Label>
                <Input
                  id="recipientAccount"
                  placeholder="ACCT-000001"
                  value={newRecipient.account}
                  onChange={(e) => setNewRecipient({ ...newRecipient, account: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl p-6 shadow-card">
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
                {[50, 100, 250, 500].map((preset) => (
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

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <Label htmlFor="note">{t('transfer.note')}</Label>
            <Textarea
              id="note"
              placeholder={t('transfer.notePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2"
            />
          </div>

          <Button size="lg" className="w-full" onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
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
      )}
    </div>
  );
};

export default Transfer;
