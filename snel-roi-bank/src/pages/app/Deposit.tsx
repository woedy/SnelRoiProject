import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Receipt } from '@/components/Receipt';
import { apiRequest } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Building2, CreditCard, Smartphone, ChevronRight, ArrowLeft, Bitcoin, DollarSign, Wallet, Copy, Check, Upload, Info, ExternalLink, Lock } from 'lucide-react';

interface CryptoWallet {
  id: number;
  crypto_type: string;
  crypto_type_display: string;
  network: string;
  network_display: string;
  wallet_address: string;
  qr_code_url: string;
  min_deposit: string;
  instructions: string;
}

interface CryptoDeposit {
  id: number;
  amount_usd: string;
  crypto_amount: string | null;
  exchange_rate: string | null;
  verification_status: string;
  verification_status_display: string;
}

const Deposit = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'method' | 'amount' | 'address' | 'proof' | 'success'>('method');
  const [method, setMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Account Status
  const [isFrozen, setIsFrozen] = useState(false);
  const isInactive = user?.is_active === false;
  const isRestricted = isFrozen || isInactive;

  // Crypto specific states
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [activeDeposit, setActiveDeposit] = useState<CryptoDeposit | null>(null);
  const [txHash, setTxHash] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStatusAndWallets = async () => {
      try {
        // Fetch dashboard to get account status
        const dashboard = await apiRequest<any>('/dashboard');
        setIsFrozen(dashboard.account_status?.has_frozen_account || false);

        const wallets = await apiRequest<CryptoWallet[]>('/crypto-wallets');
        setCryptoWallets(wallets);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchStatusAndWallets();
  }, []);

  const methods = [
    { 
      id: 'card', 
      icon: CreditCard, 
      label: 'Credit Card', 
      desc: 'Instant deposit',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      type: 'fiat'
    },
    { 
      id: 'usdt', 
      icon: DollarSign, 
      label: 'USDT', 
      desc: 'Crypto payment',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      type: 'crypto'
    },
    { 
      id: 'bank', 
      icon: Building2, 
      label: 'Bank Transfer', 
      desc: '1-2 business days',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      type: 'fiat'
    },
    { 
      id: 'paypal', 
      icon: Wallet, 
      label: 'Paypal', 
      desc: 'Instant transfer',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      type: 'fiat'
    },
    { 
      id: 'bitcoin', 
      icon: Bitcoin, 
      label: 'Bitcoin', 
      desc: 'Cryptocurrency',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      type: 'crypto'
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setMethod(methodId);
    setStep('amount');
  };

  const currentMethod = methods.find(m => m.id === method);

  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (currentMethod?.type === 'crypto') {
        const typeMap: Record<string, string> = {
          'bitcoin': 'BTC',
          'usdt': 'USDT',
          'eth': 'ETH'
        };
        const targetType = typeMap[currentMethod.id.toLowerCase()] || currentMethod.id.toUpperCase();
        
        // Find the first active wallet for this crypto type
        const wallet = cryptoWallets.find(w => w.crypto_type.toUpperCase() === targetType);
        
        if (!wallet) {
          throw new Error(`The admin hasn't configured a ${currentMethod.label} wallet address yet. Please contact support or try another method.`);
        }
        setSelectedWallet(wallet);

        const response = await apiRequest<CryptoDeposit>('/deposits/crypto/initiate', {
          method: 'POST',
          body: JSON.stringify({ 
            crypto_wallet_id: wallet.id,
            amount_usd: amount
          }),
        });
        setActiveDeposit(response);
        setStep('address');
      } else {
        // Regular deposit
        const response = await apiRequest<{ reference: string }>('/deposits', {
          method: 'POST',
          body: JSON.stringify({ amount, memo: method }),
        });
        setReference(response.reference);
        setStep('success');
      }
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

  const handleSubmitProof = async () => {
    if (isProcessing || !activeDeposit || !proofFile) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('proof_of_payment', proofFile);
      if (txHash) formData.append('tx_hash', txHash);

      // Using Fetch directly because apiRequest might not handle FormData seamlessly unless updated
      const response = await fetch(`${import.meta.env.VITE_API_URL}/deposits/crypto/${activeDeposit.id}/upload-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('snel-roi-token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied!',
      description: 'Wallet address copied to clipboard',
    });
  };

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-8">
        {currentMethod?.type === 'crypto' ? (
          <div className="bg-card rounded-3xl p-8 shadow-card border border-border text-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-3">Deposit Submitted</h1>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Your crypto deposit has been submitted for verification. Funds will be credited to your account once approved by our team.
            </p>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mb-8 text-left space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-foreground">${amount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">
                   Pending Verification
                </span>
              </div>
              {txHash && (
                <div className="flex justify-between items-start text-sm gap-4">
                  <span className="text-muted-foreground">Tx Hash:</span>
                  <span className="font-mono text-xs text-foreground break-all text-right">{txHash}</span>
                </div>
              )}
            </div>

            <Button size="lg" className="w-full" onClick={() => navigate('/app/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <Receipt
            type="deposit"
            reference={reference}
            amount={amount || '500.00'}
            date={new Date().toLocaleString('de-DE')}
            method={currentMethod?.label}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      {step === 'method' && (
        <div className="animate-slide-up">
          {/* Gradient Header Section */}
          <div className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-8 lg:p-12">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/dashboard')}
                className="mb-6 text-white/90 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('action.back')}
              </Button>
              
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-white text-center mb-3">
                Fund Your Account
              </h1>
              <p className="text-blue-100 text-center text-lg max-w-md mx-auto">
                Choose your preferred deposit method and amount
              </p>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 px-1">
              Select Deposit Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {methods.map((m) => {
                const isDisabled = isRestricted && m.type === 'fiat';
                return (
                  <button
                    key={m.id}
                    onClick={() => !isDisabled && handleMethodSelect(m.id)}
                    disabled={isDisabled}
                    title={isDisabled ? "Method unavailable for restricted accounts" : ""}
                    className={`group relative overflow-hidden flex items-center gap-4 p-6 rounded-2xl bg-card border-2 transition-all duration-300 ${
                      isDisabled 
                        ? 'opacity-40 grayscale-[0.5] cursor-not-allowed border-muted-foreground/10' 
                        : 'border-border hover:border-primary/50 shadow-sm hover:shadow-lg hover:-translate-y-1'
                    }`}
                  >
                    {/* Icon container with gradient background */}
                    <div className={`w-14 h-14 rounded-xl ${isDisabled ? 'bg-muted' : m.bgColor} flex items-center justify-center transition-transform duration-300 ${!isDisabled && 'group-hover:scale-110'}`}>
                      {isDisabled ? (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <m.icon className={`h-7 w-7 ${m.iconColor}`} />
                      )}
                    </div>
                    
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-lg mb-0.5 ${isDisabled ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {m.label}
                        </p>
                        {isDisabled && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{m.desc}</p>
                    </div>
                    
                    {!isDisabled && <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />}
                    
                    {/* Hover gradient effect */}
                    {!isDisabled && <div className={`absolute inset-0 bg-gradient-to-r ${m.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {step === 'amount' && (
        <div className="space-y-6 animate-slide-up">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('method')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('action.back')}
          </Button>

          {/* Selected Method Display */}
          {(() => {
            const selectedMethod = methods.find(m => m.id === method);
            return selectedMethod ? (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-muted-foreground mb-3">Selected Payment Method</p>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl ${selectedMethod.bgColor} flex items-center justify-center`}>
                    <selectedMethod.icon className={`h-7 w-7 ${selectedMethod.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">{selectedMethod.label}</p>
                    <p className="text-sm text-muted-foreground">{selectedMethod.desc}</p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Amount Input Card */}
          <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">Enter Deposit Amount</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-sm font-medium">{t('common.amount')}</Label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-20 text-4xl font-bold pl-14 pr-6 text-center border-2 focus:border-primary rounded-xl"
                  />
                </div>
              </div>

              {/* Quick Amount Presets */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Quick amounts</p>
                <div className="grid grid-cols-4 gap-3">
                  {[100, 250, 500, 1000].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="lg"
                      onClick={() => setAmount(preset.toString())}
                      className="font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">Processing Time</p>
                    <p className="text-blue-700 dark:text-blue-300">
                      {methods.find(m => m.id === method)?.desc || 'Varies by method'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <Button 
            size="lg" 
            className="w-full h-14 text-lg font-semibold shadow-button" 
            onClick={handleConfirm} 
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent mr-2" />
                {t('common.processing')}
              </>
            ) : (
              <>
                {t('action.confirm')} Deposit
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      )}

      {step === 'address' && selectedWallet && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-card rounded-3xl p-8 shadow-card border border-border text-center">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">Send {selectedWallet.crypto_type_display}</h2>
            
            <div className="flex flex-col items-center mb-8">
              {selectedWallet.qr_code_url ? (
                <div className="bg-white p-4 rounded-3xl shadow-lg mb-6 border border-slate-100">
                  <img src={selectedWallet.qr_code_url} alt="QR Code" className="w-56 h-56 object-contain" />
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl mb-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <Bitcoin className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                  <p className="text-sm text-muted-foreground italic">Scan QR on your device or copy address below</p>
                </div>
              )}
              
              <div className="w-full space-y-4">
                <div>
                  <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-2 block text-left">Network</Label>
                  <p className="font-mono bg-secondary/50 p-4 rounded-xl text-foreground font-bold border border-border/50 text-left">
                    {selectedWallet.network_display}
                  </p>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-2 block text-left">Wallet Address</Label>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 font-mono text-sm break-all bg-secondary/50 p-4 rounded-xl text-foreground border border-border/50 text-left">
                      {selectedWallet.wallet_address}
                    </p>
                    <Button variant="secondary" size="icon" className="h-[52px] w-[52px] rounded-xl" onClick={() => copyToClipboard(selectedWallet.wallet_address)}>
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Amount to Send</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">${amount}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50">
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Network</p>
                <p className="text-lg font-bold text-amber-900 dark:text-amber-100">{selectedWallet.network_display}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl text-left border border-border mb-8">
              <div className="flex gap-3 mb-4">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <h3 className="font-semibold text-foreground">Instructions</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                <li>Send only {selectedWallet.crypto_type_display} to this address</li>
                <li>Ensure you are using the {selectedWallet.network_display} network</li>
                <li>Wait for at least 3 network confirmations</li>
                {selectedWallet.instructions && <li>{selectedWallet.instructions}</li>}
              </ul>
            </div>

            <Button size="lg" className="w-full h-14" onClick={() => setStep('proof')}>
              I've Made the Payment
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {step === 'proof' && (
        <div className="space-y-6 animate-slide-up">
           <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('address')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Address
          </Button>

          <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6 text-center">Confirm Payment</h2>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-sm font-medium">Upload Proof Of Payment</Label>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${proofFile ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/10' : 'border-border hover:border-primary cursor-pointer'}`}
                  onClick={() => document.getElementById('proof-upload')?.click()}
                >
                  <input 
                    type="file" 
                    id="proof-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                  {proofFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-3">
                        <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{proofFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to change file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Select a screenshot or photo</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG or PDF (Max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="txHash" className="text-sm font-medium">Transaction Hash (Optional)</Label>
                <Input
                  id="txHash"
                  placeholder="Paste transaction ID or hash here"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  className="h-14 rounded-xl border-border focus:border-primary"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 flex gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Manual verification usually takes 10-30 minutes during business hours.
                </p>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 font-semibold shadow-button"
                onClick={handleSubmitProof}
                disabled={isProcessing || !proofFile}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit For Verification
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposit;
