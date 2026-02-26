import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  Bitcoin, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2,
  XCircle,
  ExternalLink
} from "lucide-react";
import { cryptoService, CryptoWallet, CryptoDeposit, CryptoInvestmentPlan } from "@/services/cryptoService";

export default function CryptoWallets() {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [deposits, setDeposits] = useState<CryptoDeposit[]>([]);
  const [plans, setPlans] = useState<CryptoInvestmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<CryptoWallet | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"deposits" | "wallets" | "plans">("deposits");
  
  const [walletForm, setWalletForm] = useState({
    crypto_type: "BTC",
    network: "BITCOIN",
    wallet_address: "",
    min_deposit: "10.00",
    instructions: "",
    is_active: true
  });
  const [walletQrFile, setWalletQrFile] = useState<File | null>(null);
  const [planForm, setPlanForm] = useState<{
    name: string;
    description: string;
    minimum_amount_usd: string;
    expected_return_percent: string;
    duration_days: string;
    risk_level: "LOW" | "MEDIUM" | "HIGH";
    is_active: boolean;
  }>({
    name: "",
    description: "",
    minimum_amount_usd: "100",
    expected_return_percent: "8",
    duration_days: "30",
    risk_level: "MEDIUM",
    is_active: true,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [walletData, depositData, planData] = await Promise.all([
        cryptoService.getWallets(),
        cryptoService.getDeposits(),
        cryptoService.getInvestmentPlans(),
      ]);
      setWallets(walletData);
      setDeposits(depositData);
      setPlans(planData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWalletFormChange = (key: string, value: any) => {
    setWalletForm(prev => ({ ...prev, [key]: value }));
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(walletForm).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      if (walletQrFile) {
        formData.append("qr_code_image", walletQrFile);
      }

      if (editingWallet) {
        await cryptoService.updateWallet(editingWallet.id, formData);
        alert("Wallet updated successfully");
      } else {
        await cryptoService.createWallet(formData);
        alert("Wallet created successfully");
      }
      setShowWalletForm(false);
      setEditingWallet(null);
      setWalletQrFile(null);
      fetchData();
    } catch (error: any) {
      alert(error.message || "Failed to save wallet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWallet = (wallet: CryptoWallet) => {
    setEditingWallet(wallet);
    setWalletForm({
      crypto_type: wallet.crypto_type,
      network: wallet.network,
      wallet_address: wallet.wallet_address,
      min_deposit: wallet.min_deposit,
      instructions: wallet.instructions,
      is_active: wallet.is_active
    });
    setWalletQrFile(null);
    setShowWalletForm(true);
  };

  const handleToggleWallet = async (id: number) => {
    try {
      await cryptoService.toggleWallet(id);
      fetchData();
    } catch (error) {
      alert("Failed to toggle wallet status");
    }
  };

  const handleVerifyDeposit = async (id: number, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this deposit?`)) return;
    setIsSubmitting(true);
    try {
      await cryptoService.verifyDeposit(id, action, verificationNotes);
      alert(`Deposit has been ${action === "approve" ? "approved" : "rejected"}.`);
      setVerificationNotes("");
      fetchData();
    } catch (error: any) {
      alert(error.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await cryptoService.createInvestmentPlan({
        ...planForm,
        minimum_amount_usd: planForm.minimum_amount_usd,
        expected_return_percent: planForm.expected_return_percent,
        duration_days: Number(planForm.duration_days),
      });
      setPlanForm({
        name: "",
        description: "",
        minimum_amount_usd: "100",
        expected_return_percent: "8",
        duration_days: "30",
        risk_level: "MEDIUM",
        is_active: true,
      });
      fetchData();
      alert('Investment plan created.');
    } catch (error: any) {
      alert(error.message || 'Failed to create investment plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
      case 'PENDING_VERIFICATION': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Crypto Management</h2>
          <p className="text-muted-foreground">Manage receiving wallets and verify incoming crypto deposits.</p>
        </div>
      </div>

      <div className="w-full flex gap-4 border-b border-border mb-6">
        <button 
          onClick={() => setActiveTab("deposits")}
          className={`pb-2 px-4 transition-all ${activeTab === "deposits" ? "border-b-2 border-primary font-bold text-primary" : "text-muted-foreground"}`}
        >
          Crypto Payment Verifications ({deposits.length})
        </button>
        <button 
          onClick={() => setActiveTab("wallets")}
          className={`pb-2 px-4 transition-all ${activeTab === "wallets" ? "border-b-2 border-primary font-bold text-primary" : "text-muted-foreground"}`}
        >
          Wallet Configuration ({wallets.length})
        </button>
        <button 
          onClick={() => setActiveTab("plans")}
          className={`pb-2 px-4 transition-all ${activeTab === "plans" ? "border-b-2 border-primary font-bold text-primary" : "text-muted-foreground"}`}
        >
          Investment Plans ({plans.length})
        </button>
      </div>

      {activeTab === "deposits" && (
        <div className="space-y-4">
          {deposits.length === 0 ? (
            <Card className="border-dashed border-2 py-12 text-center">
              <CardContent>
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No pending crypto payments</h3>
                <p className="text-muted-foreground">All crypto deposits have been processed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {deposits.map((deposit) => (
                <Card key={deposit.id} className="overflow-hidden border-border/50 shadow-sm">
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{deposit.customer_name}</CardTitle>
                        <CardDescription>Requested on {new Date(deposit.created_at).toLocaleString()}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">${deposit.amount_usd}</div>
                        <div className="flex gap-2 justify-end mt-1">
                          {deposit.purpose === 'VIRTUAL_CARD' && (
                            <div className="text-[10px] px-2 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 font-bold uppercase">
                              Virtual Card
                            </div>
                          )}
                          {deposit.purpose === 'INVESTMENT' && (
                            <div className="text-[10px] px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 font-bold uppercase">
                              Investment
                            </div>
                          )}
                          <div className={`text-[10px] px-2 py-0.5 rounded-full border inline-block font-bold uppercase ${getStatusColor(deposit.verification_status)}`}>
                            {deposit.verification_status_display}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <Label className="text-xs uppercase text-muted-foreground font-bold">Proof of Payment</Label>
                          {deposit.proof_of_payment_url ? (
                            <div className="relative group rounded-xl overflow-hidden border border-border">
                              <img src={deposit.proof_of_payment_url} alt="Proof" className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                              <a 
                                href={deposit.proof_of_payment_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 text-sm font-medium"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Full Image
                              </a>
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-muted rounded-xl flex items-center justify-center border border-border italic text-muted-foreground">
                              No image uploaded
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 flex flex-col">
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-xs uppercase text-muted-foreground font-bold">Tx Hash</Label>
                              <p className="text-sm font-mono break-all bg-muted/50 p-2 rounded border border-border/50">
                                {deposit.tx_hash || "Not provided"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs uppercase text-muted-foreground font-bold">Wallet Address</Label>
                              <p className="text-xs font-mono break-all bg-muted/50 p-2 rounded border border-border/50">
                                {deposit.crypto_wallet_details.wallet_address}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`notes-${deposit.id}`} className="text-xs uppercase text-muted-foreground font-bold">Admin Notes</Label>
                            <textarea 
                              id={`notes-${deposit.id}`}
                              placeholder="Reason for approval/rejection..."
                              value={verificationNotes}
                              onChange={(e) => setVerificationNotes(e.target.value)}
                              className="w-full h-24 p-2 rounded-md border border-input bg-background resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          <Button 
                            className="flex-1 gap-2 bg-green-600 hover:bg-green-700" 
                            disabled={isSubmitting}
                            onClick={() => handleVerifyDeposit(deposit.id, "approve")}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1 gap-2" 
                            disabled={isSubmitting}
                            onClick={() => handleVerifyDeposit(deposit.id, "reject")}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}


      {activeTab === "plans" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Investment Plan</CardTitle>
              <CardDescription>Simple plan setup for crypto investment subscriptions.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreatePlan}>
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input value={planForm.name} onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Amount (USD)</Label>
                  <Input type="number" value={planForm.minimum_amount_usd} onChange={(e) => setPlanForm(prev => ({ ...prev, minimum_amount_usd: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Expected Return %</Label>
                  <Input type="number" value={planForm.expected_return_percent} onChange={(e) => setPlanForm(prev => ({ ...prev, expected_return_percent: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Input type="number" value={planForm.duration_days} onChange={(e) => setPlanForm(prev => ({ ...prev, duration_days: e.target.value }))} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Input value={planForm.description} onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isSubmitting}>Create Plan</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Min USD</TableHead>
                    <TableHead>Return %</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.name}</TableCell>
                      <TableCell>${plan.minimum_amount_usd}</TableCell>
                      <TableCell>{plan.expected_return_percent}%</TableCell>
                      <TableCell>{plan.duration_days} days</TableCell>
                      <TableCell>{plan.is_active ? 'Active' : 'Inactive'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}


      {activeTab === "wallets" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Receiving Wallets</h3>
            <Button onClick={() => setShowWalletForm(!showWalletForm)} className="gap-2" variant={showWalletForm ? "outline" : "default"}>
              <Plus className="h-4 w-4" />
              {showWalletForm ? "Close Form" : "Add New Wallet"}
            </Button>
          </div>

          {showWalletForm && (
            <Card className="border-primary/20 bg-primary/5 shadow-sm">
              <CardHeader>
                <CardTitle>{editingWallet ? "Edit Wallet" : "Add Receiving Wallet"}</CardTitle>
                <CardDescription>Configure where users should send their crypto payments.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleWalletSubmit}>
                  <div className="space-y-2">
                    <Label>Crypto Type</Label>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
                      value={walletForm.crypto_type}
                      onChange={(e) => handleWalletFormChange("crypto_type", e.target.value)}
                    >
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="USDT">Tether (USDT)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <select 
                      className="w-full p-2 rounded-md border border-input bg-background"
                      value={walletForm.network}
                      onChange={(e) => handleWalletFormChange("network", e.target.value)}
                    >
                      <option value="BITCOIN">Bitcoin Network</option>
                      <option value="ERC20">Ethereum (ERC-20)</option>
                      <option value="TRC20">Tron (TRC-20)</option>
                      <option value="BEP20">Binance Smart Chain (BEP-20)</option>
                      <option value="ETHEREUM">Ethereum Network</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Wallet Address</Label>
                    <Input 
                      id="address"
                      value={walletForm.wallet_address}
                      onChange={(e) => handleWalletFormChange("wallet_address", e.target.value)}
                      placeholder="e.g. bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min">Min Deposit (USD)</Label>
                    <Input 
                      id="min"
                      type="number"
                      value={walletForm.min_deposit}
                      onChange={(e) => handleWalletFormChange("min_deposit", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qr">QR Code Image</Label>
                    <div className="flex items-center gap-4">
                      {editingWallet?.qr_code_url && !walletQrFile && (
                        <div className="w-16 h-16 rounded border overflow-hidden">
                          <img src={editingWallet.qr_code_url} alt="QR" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <input 
                        id="qr"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setWalletQrFile(e.target.files?.[0] || null)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-8">
                    <input 
                      type="checkbox" 
                      id="active"
                      checked={walletForm.is_active}
                      onChange={(e) => handleWalletFormChange("is_active", e.target.checked)}
                    />
                    <Label htmlFor="active">Active (Visible to users)</Label>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="instructions">Custom Instructions</Label>
                    <textarea 
                      id="instructions"
                      value={walletForm.instructions}
                      onChange={(e) => handleWalletFormChange("instructions", e.target.value)}
                      placeholder="Special instructions for this wallet/network..."
                      className="w-full h-24 p-2 rounded-md border border-input bg-background resize-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => {setShowWalletForm(false); setEditingWallet(null);}}>Cancel</Button>
                    <Button type="submit" className="px-8" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {editingWallet ? "Save Changes" : "Create Wallet"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
            <CardHeader>
              <CardTitle>Configured Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>QR</TableHead>
                    <TableHead>Min.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell className="font-bold">{wallet.crypto_type_display}</TableCell>
                      <TableCell>{wallet.network_display}</TableCell>
                      <TableCell className="font-mono text-xs">{wallet.wallet_address.substring(0, 10)}...{wallet.wallet_address.substring(wallet.wallet_address.length - 10)}</TableCell>
                      <TableCell>
                        {wallet.qr_code_url ? (
                          <div className="w-8 h-8 rounded overflow-hidden border border-border">
                            <img src={wallet.qr_code_url} alt="QR" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>${wallet.min_deposit}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleWallet(wallet.id)} className="h-8 p-0">
                          {wallet.is_active ? <ToggleRight className="h-6 w-6 text-green-500" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditWallet(wallet)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={async () => {
                          if (confirm("Are you sure you want to delete this wallet?")) {
                            await cryptoService.deleteWallet(wallet.id);
                            fetchData();
                          }
                        }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
