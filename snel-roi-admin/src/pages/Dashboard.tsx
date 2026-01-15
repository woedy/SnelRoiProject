import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, Activity, Loader2 } from "lucide-react";
import { userService } from "@/services/userService";
import { transactionService } from "@/services/transactionService";
import { accountService } from "@/services/accountService";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAccounts: 0,
    totalBalance: 0,
    pendingTransactions: 0,
    totalTransactions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, accounts, transactions] = await Promise.all([
          userService.getAll(),
          accountService.getAll(),
          transactionService.getAll(),
        ]);

        const activeUsers = users.filter((user) => user.is_active).length;
        const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
        const pendingTransactions = transactions.filter((tx) => tx.status === "PENDING").length;

        setStats({
          totalUsers: users.length,
          activeUsers,
          totalAccounts: accounts.length,
          totalBalance,
          pendingTransactions,
          totalTransactions: transactions.length,
        });
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your banking platform.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Across all customer accounts</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">{stats.totalUsers} total users</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">{stats.totalTransactions} total transactions</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAccounts}</div>
            <p className="text-xs text-muted-foreground">Customer and system accounts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
