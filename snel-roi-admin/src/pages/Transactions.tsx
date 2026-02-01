import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen, InlineLoader } from "@/components/ui/loading-screen";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { transactionService, Transaction } from "@/services/transactionService";
import { Check, X, Trash2 } from "lucide-react";

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleClearAll = async () => {
    const confirmed = window.confirm(
      "☢️ SYSTEM RESET: Are you absolutely sure you want to CLEAR ALL TRANSACTION HISTORY?\n\nThis will permanently delete all records, crypto deposits, and reset all user balances to $0.00.\n\nTHIS ACTION CANNOT BE UNDONE."
    );
    
    if (!confirmed) return;

    setIsClearing(true);
    try {
      await transactionService.clearAll();
      alert("System purged successfully. Current balances are now $0.00.");
      await fetchTransactions();
    } catch (error: any) {
      alert(error.message || "Failed to purge history");
    } finally {
      setIsClearing(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await transactionService.approve(id);
      await fetchTransactions(); // Refresh list
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id: number) => {
    setActionLoading(id);
    try {
      await transactionService.decline(id);
      await fetchTransactions(); // Refresh list
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading transactions..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Transactions</h2>
          <p className="text-muted-foreground">Review and manage user transactions.</p>
        </div>
        <Button 
          variant="destructive" 
          className="gap-2 shadow-lg shadow-destructive/20" 
          onClick={handleClearAll}
          disabled={isClearing}
        >
          {isClearing ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
          Clear Transaction History
        </Button>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead>Reference</TableHead>
                <TableHead>Initiated By</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Memo</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-muted/50 border-border/50 transition-colors">
                  <TableCell className="font-medium">{tx.reference}</TableCell>
                  <TableCell>{tx.created_by_email || <span className="text-muted-foreground italic">System</span>}</TableCell>
                  <TableCell className="capitalize">{tx.entry_type}</TableCell>
                    <TableCell className="font-mono">${Number(tx.amount).toLocaleString('en-US')}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      tx.status === 'POSTED' ? 'bg-green-500/10 text-green-500 ring-green-500/20' :
                      tx.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 ring-yellow-500/20' :
                      'bg-red-500/10 text-red-500 ring-red-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tx.memo || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {tx.status === 'PENDING' && (
                      <div className="flex gap-2">
                         <Button size="sm" variant="outline" className="h-8 border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-600" onClick={() => handleApprove(tx.id)} disabled={actionLoading === tx.id}>
                           {actionLoading === tx.id ? <LoadingSpinner size="sm" /> : <Check className="h-4 w-4" />}
                         </Button>
                         <Button size="sm" variant="outline" className="h-8 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600" onClick={() => handleDecline(tx.id)} disabled={actionLoading === tx.id}>
                           {actionLoading === tx.id ? <LoadingSpinner size="sm" /> : <X className="h-4 w-4" />}
                         </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
