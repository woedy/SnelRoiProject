import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt } from '@/components/Receipt';
import { apiRequest } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Building, ChevronRight, ArrowLeft, Info } from 'lucide-react';

const ExternalTransfer = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'amount' | 'confirm' | 'success'>('details');
  const [recipientDetails, setRecipientDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    recipientName: '',
    accountType: 'checking' as 'checking' | 'savings',
    swiftCode: '',
    country: 'US'
  });
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'EU', name: 'European Union' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
  ];

  const calculateFee = (transferAmount: string) => {
    const amount = parseFloat(transferAmount) || 0;
    const fee = amount * 0.025; // 2.5% fee for external transfers
    return Math.max(fee, 5); // Minimum $5 fee
  };

  const totalAmount = () => {
    const transferAmount = parseFloat(amount) || 0;
    return transferAmount + calculateFee(amount);
  };

  const handleDetailsSubmit = () => {
    if (!recipientDetails.accountNumber || !recipientDetails.routingNumber || 
        !recipientDetails.bankName || !recipientDetails.recipientName) {
      toast({
        title: t('common.error'),
        description: t('externalTransfer.requiredFields'),
        variant: 'destructive',
      });
      return;
    }
    setStep('amount');
  };

  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Add artificial delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await apiRequest<{ reference: string }>(`/external-transfers/`, {
        method: 'POST',
        body: JSON.stringify({
          amount,
          memo: note,
          recipient_details: recipientDetails,
          fee: calculateFee(amount),
        }),
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
          type="external-transfer"
          reference={reference}
          amount={amount || '100.00'}
          date={new Date().toLocaleString('de-DE')}
          recipient={recipientDetails.recipientName}
          method={`${recipientDetails.bankName} - ${t('externalTransfer.externalBank')}`}
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
          onClick={() => step === 'details' ? navigate('/app/transfer') : setStep('details')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('action.back')}
        </Button>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          {t('externalTransfer.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {step === 'details' 
            ? t('externalTransfer.recipientDetails') 
            : step === 'amount'
            ? t('externalTransfer.transferAmount')
            : t('externalTransfer.confirmTransfer')
          }
        </p>
      </div>

      {step === 'details' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
              <Building className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground">{t('externalTransfer.bankDetails')}</p>
                <p className="text-sm text-muted-foreground">{t('externalTransfer.secureTransfer')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">{t('externalTransfer.recipientName')}</Label>
                <Input
                  id="recipientName"
                  placeholder="John Doe"
                  value={recipientDetails.recipientName}
                  onChange={(e) => setRecipientDetails({...recipientDetails, recipientName: e.target.value})}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">{t('externalTransfer.bankName')}</Label>
                <Input
                  id="bankName"
                  placeholder="Bank of America"
                  value={recipientDetails.bankName}
                  onChange={(e) => setRecipientDetails({...recipientDetails, bankName: e.target.value})}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">{t('externalTransfer.accountNumber')}</Label>
                <Input
                  id="accountNumber"
                  placeholder="123456789"
                  value={recipientDetails.accountNumber}
                  onChange={(e) => setRecipientDetails({...recipientDetails, accountNumber: e.target.value})}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routingNumber">{t('externalTransfer.routingNumber')}</Label>
                <Input
                  id="routingNumber"
                  placeholder="021000021"
                  value={recipientDetails.routingNumber}
                  onChange={(e) => setRecipientDetails({...recipientDetails, routingNumber: e.target.value})}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">{t('externalTransfer.accountType')}</Label>
                <Select value={recipientDetails.accountType} onValueChange={(value: 'checking' | 'savings') => 
                  setRecipientDetails({...recipientDetails, accountType: value})
                }>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">{t('externalTransfer.checking')}</SelectItem>
                    <SelectItem value="savings">{t('externalTransfer.savings')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">{t('externalTransfer.country')}</Label>
                <Select value={recipientDetails.country} onValueChange={(value) => 
                  setRecipientDetails({...recipientDetails, country: value})
                }>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {recipientDetails.country !== 'US' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="swiftCode">{t('externalTransfer.swiftCode')}</Label>
                  <Input
                    id="swiftCode"
                    placeholder="BOFAUS3N"
                    value={recipientDetails.swiftCode}
                    onChange={(e) => setRecipientDetails({...recipientDetails, swiftCode: e.target.value})}
                    className="h-12"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  {t('externalTransfer.importantInfo')}
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  {t('externalTransfer.processingTime')}: 1-3 {t('common.businessDays')}
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  {t('externalTransfer.transferFee')}: 2.5% ({t('externalTransfer.minimum')} $5)
                </p>
              </div>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={handleDetailsSubmit}>
            {t('action.continue')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 'amount' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                {recipientDetails.recipientName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{recipientDetails.recipientName}</p>
                <p className="text-sm text-muted-foreground">
                  {recipientDetails.bankName} • {t('externalTransfer.external')}
                </p>
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
                {[50, 100, 250, 500, 1000].map((preset) => (
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
            <textarea
              id="note"
              placeholder={t('externalTransfer.notePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full mt-2 p-3 border rounded-lg resize-none h-20"
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                  {t('externalTransfer.transferSummary')}
                </p>
                <div className="space-y-1 text-amber-700 dark:text-amber-300">
                  <p>{t('externalTransfer.transferAmount')}: ${amount || '0.00'}</p>
                  <p>{t('externalTransfer.transferFee')}: ${calculateFee(amount).toFixed(2)}</p>
                  <p className="font-semibold text-amber-900 dark:text-amber-100">
                    {t('externalTransfer.totalAmount')}: ${totalAmount().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={() => setStep('confirm')}>
            {t('action.continue')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4">{t('externalTransfer.confirmDetails')}</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{t('externalTransfer.recipient')}</span>
                <span className="font-medium">{recipientDetails.recipientName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{t('externalTransfer.bank')}</span>
                <span className="font-medium">{recipientDetails.bankName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{t('externalTransfer.account')}</span>
                <span className="font-medium">****{recipientDetails.accountNumber.slice(-4)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{t('externalTransfer.transferAmount')}</span>
                <span className="font-medium">${amount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{t('externalTransfer.transferFee')}</span>
                <span className="font-medium">${calculateFee(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">{t('externalTransfer.totalAmount')}</span>
                <span className="font-semibold text-lg">${totalAmount().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                {t('common.processing')}
              </>
            ) : (
              <>
                {t('externalTransfer.confirmTransfer')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExternalTransfer;
