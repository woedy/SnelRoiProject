import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { accountService, Account } from "@/services/accountService";
import { Loader2, RefreshCcw } from "lucide-react";

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchAccounts = async () => {
    try {
      const data = await accountService.getAll();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleToggleStatus = async (account: Account) => {
    setActionLoading(account.id);
    try {
      const nextStatus = account.status === "ACTIVE" ? "FROZEN" : "ACTIVE";
      await accountService.update(account.id, { status: nextStatus });
      await fetchAccounts();
    } catch (error) {
      console.error("Failed to update account", error);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Accounts</h2>
          <p className="text-muted-foreground">Monitor and manage customer accounts.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchAccounts}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead>Account</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-muted/50 border-border/50 transition-colors">
                  <TableCell className="font-medium">
                    <div>{account.account_number}</div>
                    <div className="text-xs text-muted-foreground">{account.currency}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{account.customer_name || "System"}</div>
                    <div className="text-xs text-muted-foreground">{account.customer_email || "-"}</div>
                  </TableCell>
                  <TableCell className="capitalize">{account.type}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      account.status === 'ACTIVE'
                        ? 'bg-green-500/10 text-green-500 ring-green-500/20'
                        : 'bg-orange-500/10 text-orange-500 ring-orange-500/20'
                    }`}>
                      {account.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => handleToggleStatus(account)}
                      disabled={actionLoading === account.id}
                    >
                      {actionLoading === account.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        account.status === "ACTIVE" ? "Freeze" : "Activate"
                      )}
                    </Button>
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
