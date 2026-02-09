import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { virtualCardService, VirtualCard, VirtualCardApplication } from '@/services/virtualCardService';
import { cryptoService, CryptoWallet } from '@/services/cryptoService';
import { 
  CreditCard, 
  Plus, 
  Eye, 
  EyeOff, 
  Snowflake, 
  Settings, 
  Copy, 
  Check,
  AlertCircle,
  Clock,
  Ban
} from 'lucide-react';

const VirtualCards = () => {
  const { t } = useLanguage();
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCardDetails, setShowCardDetails] = useState<{ [key: number]: boolean }>({});
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [copiedCard, setCopiedCard] = useState<number | null>(null);

  // Payment state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [txHash, setTxHash] = useState('');
  const [pendingCardId, setPendingCardId] = useState<number | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Application form state
  const [application, setApplication] = useState<VirtualCardApplication>({
    card_type: 'STANDARD',
    daily_limit: '1000.00',
    monthly_limit: '10000.00',
    is_international_enabled: false,
  });

  useEffect(() => {
    fetchCards();
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const data = await cryptoService.getWallets();
      setWallets(data);
    } catch (error) {
      console.error('Failed to fetch wallets');
    }
  };

  const fetchCards = async () => {
    try {
      const data = await virtualCardService.getAll();
      setCards(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load virtual cards',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      const card = await virtualCardService.apply(application);
      toast({
        title: 'Application Started',
        description: 'Please complete the payment to activate your card.',
      });
      setIsApplyDialogOpen(false);
      setPendingCardId(card.id);
      setIsPaymentDialogOpen(true);
      fetchCards();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFreeze = async (card: VirtualCard) => {
    try {
      const response = await virtualCardService.toggleFreeze(card.id);
      toast({
        title: 'Success',
        description: response.detail,
      });
      fetchCards();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update card status',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentSubmit = async () => {
    if (!pendingCardId || !selectedWalletId || !proofFile) {
      toast({
        title: 'Error',
        description: 'Please select a wallet and upload proof of payment',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingPayment(true);
    try {
      // 1. Submit Deposit with Proof (Atomic Operation)
      const wallet = wallets.find(w => w.id.toString() === selectedWalletId);
      if (!wallet) throw new Error('Invalid wallet selected');

      // Fixed fee for now, e.g., $10
      const fee = 10.00;

      await cryptoService.submitDeposit(
        {
          crypto_wallet_id: parseInt(selectedWalletId),
          amount_usd: fee,
          purpose: 'VIRTUAL_CARD',
          virtual_card_id: pendingCardId
        },
        proofFile,
        txHash
      );

      toast({
        title: 'Payment Submitted',
        description: 'Your payment is being verified. You will be notified once Approved.',
      });
      setIsPaymentDialogOpen(false);
      setPendingCardId(null);
      setProofFile(null);
      setTxHash('');
      fetchCards();
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to submit payment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const selectedWallet = wallets.find(w => w.id.toString() === selectedWalletId);

  const handleCopyCardDetails = async (card: VirtualCard) => {
    const details = `Card: ${card.card_number}\nExpiry: ${card.expiry_month.toString().padStart(2, '0')}/${card.expiry_year}\nCVV: ${card.cvv}`;
    try {
      await navigator.clipboard.writeText(details);
      setCopiedCard(card.id);
      setTimeout(() => setCopiedCard(null), 2000);
      toast({
        title: 'Copied',
        description: 'Card details copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy card details',
        variant: 'destructive',
      });
    }
  };

  const toggleCardDetails = (cardId: number) => {
    setShowCardDetails(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'ACTIVE':
        return <CreditCard className="h-4 w-4" />;
      case 'FROZEN':
        return <Snowflake className="h-4 w-4" />;
      case 'CANCELLED':
      case 'EXPIRED':
        return <Ban className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'FROZEN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Virtual Cards</h1>
          <p className="text-muted-foreground">Manage your virtual debit cards</p>
        </div>
        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Apply for Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Virtual Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="card_type">Card Type</Label>
                <Select
                  value={application.card_type}
                  onValueChange={(value: 'STANDARD' | 'PREMIUM' | 'BUSINESS') =>
                    setApplication(prev => ({ ...prev, card_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="daily_limit">Daily Limit ($)</Label>
                <Input
                  id="daily_limit"
                  type="number"
                  min="100"
                  max="5000"
                  step="0.01"
                  value={application.daily_limit}
                  onChange={(e) =>
                    setApplication(prev => ({ ...prev, daily_limit: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="monthly_limit">Monthly Limit ($)</Label>
                <Input
                  id="monthly_limit"
                  type="number"
                  min="1000"
                  max="50000"
                  step="0.01"
                  value={application.monthly_limit}
                  onChange={(e) =>
                    setApplication(prev => ({ ...prev, monthly_limit: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="international"
                  checked={application.is_international_enabled}
                  onCheckedChange={(checked) =>
                    setApplication(prev => ({ ...prev, is_international_enabled: checked }))
                  }
                />
                <Label htmlFor="international">Enable International Transactions</Label>
              </div>
              <Button onClick={handleApply} className="w-full">
                Submit Application
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Card Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold">Activation Fee: $10.00</p>
                <p>Please send the equivalent amount in crypto to activate your card.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Payment Method</Label>
                <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a crypto wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map(wallet => (
                      <SelectItem key={wallet.id} value={wallet.id.toString()}>
                        {wallet.crypto_type_display} ({wallet.network_display})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedWallet && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase font-bold">Send Payment To</Label>
                    <div className="flex items-center space-x-2 bg-muted p-2 rounded">
                      <code className="text-xs flex-1 break-all">{selectedWallet.wallet_address}</code>
                      <Button size="sm" variant="ghost" onClick={() => {
                        navigator.clipboard.writeText(selectedWallet.wallet_address);
                        toast({ title: "Address copied" });
                      }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {selectedWallet.qr_code_url && (
                    <div className="flex justify-center py-2">
                      <img src={selectedWallet.qr_code_url} alt="QR Code" className="w-32 h-32 rounded-lg border" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Transaction Hash (Optional)</Label>
                    <Input 
                      placeholder="e.g. 0x..." 
                      value={txHash} 
                      onChange={(e) => setTxHash(e.target.value)} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Proof of Payment (Screenshot)</Label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={handlePaymentSubmit} 
                className="w-full" 
                disabled={isSubmittingPayment || !selectedWalletId || !proofFile}
              >
                {isSubmittingPayment ? 'Verifying...' : 'I Have Paid'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Virtual Cards</h3>
            <p className="text-muted-foreground text-center mb-4">
              You don't have any virtual cards yet. Apply for your first card to get started.
            </p>
            <Button onClick={() => setIsApplyDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Apply for Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{card.card_type_display}</CardTitle>
                  <Badge className={getStatusColor(card.status)}>
                    {getStatusIcon(card.status)}
                    <span className="ml-1">{card.status_display}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Card Visual */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm opacity-80">Virtual Card</div>
                    <div className="text-sm font-semibold">VISA</div>
                  </div>
                  <div className="text-lg font-mono tracking-wider mb-4">
                    {showCardDetails[card.id] ? card.card_number : card.masked_number}
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs opacity-80">EXPIRES</div>
                      <div className="text-sm">
                        {showCardDetails[card.id] 
                          ? `${card.expiry_month.toString().padStart(2, '0')}/${card.expiry_year}`
                          : '••/••'
                        }
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-80">CVV</div>
                      <div className="text-sm">
                        {showCardDetails[card.id] ? card.cvv : '•••'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Limit:</span>
                    <span>${card.daily_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Limit:</span>
                    <span>${card.monthly_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">International:</span>
                    <span>{card.is_international_enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleCardDetails(card.id)}
                    className="flex-1"
                  >
                    {showCardDetails[card.id] ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                  
                  {card.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCardDetails(card)}
                      className="flex-1"
                    >
                      {copiedCard === card.id ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                  
                  {(card.status === 'ACTIVE' || card.status === 'FROZEN') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFreeze(card)}
                      className="flex-1"
                    >
                      <Snowflake className="h-4 w-4 mr-1" />
                      {card.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}
                    </Button>
                  )}
                </div>

                {card.status === 'PENDING' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">
                        Your application is being reviewed. You'll be notified once approved.
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VirtualCards;