import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cryptoService, CryptoWallet } from '@/services/cryptoService';
import { cryptoInvestmentService, CryptoInvestment, CryptoInvestmentPlan } from '@/services/cryptoInvestmentService';

export default function CryptoInvestments() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<CryptoInvestmentPlan[]>([]);
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [investments, setInvestments] = useState<CryptoInvestment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [amountUsd, setAmountUsd] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const selectedPlanData = useMemo(
    () => plans.find((plan) => plan.id === Number(selectedPlan)),
    [plans, selectedPlan]
  );

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [planData, walletData, investmentData] = await Promise.all([
        cryptoInvestmentService.getPlans(),
        cryptoService.getWallets(),
        cryptoInvestmentService.getMyInvestments(),
      ]);

      setPlans(planData);
      setWallets(walletData);
      setInvestments(investmentData);

      if (planData.length > 0 && !selectedPlan) {
        setSelectedPlan(planData[0].id.toString());
      }
      if (walletData.length > 0 && !selectedWallet) {
        setSelectedWallet(walletData[0].id.toString());
      }
    } catch (error: any) {
      toast({
        title: 'Unable to load investments',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !selectedWallet || !amountUsd || !proofFile) {
      toast({
        title: 'Missing required fields',
        description: 'Please select plan, wallet, amount and upload proof.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await cryptoInvestmentService.create({
        plan_id: Number(selectedPlan),
        crypto_wallet_id: Number(selectedWallet),
        amount_usd: Number(amountUsd),
        proof_of_payment: proofFile,
        tx_hash: txHash,
      });

      toast({
        title: 'Investment submitted',
        description: 'Your crypto payment has been submitted for admin verification.',
      });

      setAmountUsd('');
      setTxHash('');
      setProofFile(null);
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Submission failed',
        description: error?.message || 'Please verify details and try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle: Record<string, string> = {
    PENDING_PAYMENT: 'bg-yellow-500/10 text-yellow-600',
    ACTIVE: 'bg-green-500/10 text-green-600',
    REJECTED: 'bg-red-500/10 text-red-600',
    COMPLETED: 'bg-blue-500/10 text-blue-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Crypto Investments</h1>
        <p className="text-muted-foreground">Choose an investment plan and fund it with crypto in one flow.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Investment</CardTitle>
          <CardDescription>
            Select a plan, send crypto to the selected wallet and upload proof for approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Investment Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlanData && (
                <p className="text-xs text-muted-foreground">
                  Min ${selectedPlanData.minimum_amount_usd} • {selectedPlanData.expected_return_percent}% expected return • {selectedPlanData.duration_days} days
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Crypto Wallet</Label>
              <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id.toString()}>
                      {wallet.crypto_type_display} ({wallet.network_display})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <Input type="number" min="1" value={amountUsd} onChange={(e) => setAmountUsd(e.target.value)} placeholder="100" />
            </div>

            <div className="space-y-2">
              <Label>Transaction Hash (optional)</Label>
              <Input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="0x..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Proof of Payment</Label>
              <Input type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting || isLoading}>
                {submitting ? 'Submitting...' : 'Submit Investment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Investments</CardTitle>
          <CardDescription>Track verification and active investments.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading investments...</p>
          ) : investments.length === 0 ? (
            <p className="text-muted-foreground">No investments yet.</p>
          ) : (
            <div className="space-y-3">
              {investments.map((investment) => (
                <div key={investment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{investment.plan_name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${investment.amount_usd} • Expected return ${investment.expected_return_amount}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[investment.status] || ''}`}>
                    {investment.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
