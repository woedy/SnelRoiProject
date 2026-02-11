import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, Activity, MessageSquare, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { dashboardService, DashboardStats } from "@/services/dashboardService";
import { activityService, Activity as ActivityType } from "@/services/activityService";
import StatCard from "@/components/StatCard";
import ActivityTimeline from "@/components/ActivityTimeline";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          dashboardService.getStats(),
          activityService.getRecentActivity(10),
        ]);
        setStats(statsData);
        setRecentActivities(activitiesData.activities);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || !stats) {
    return <LoadingScreen message="Loading admin dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your banking platform.</p>
      </div>
      
      {/* Main Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={`$${stats.accounts.total_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`Across ${stats.accounts.total} accounts`}
          icon={DollarSign}
          iconColor="text-emerald-500"
        />
        <StatCard
          title="Active Users"
          value={stats.users.active}
          subtitle={`${stats.users.total} total users`}
          icon={Users}
          iconColor="text-blue-500"
          trend={{
            value: stats.users.growth_rate,
            isPositive: stats.users.growth_rate > 0,
          }}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pending_approvals.total}
          subtitle="Requires attention"
          icon={AlertCircle}
          iconColor="text-orange-500"
          onClick={() => navigate("/transactions")}
        />
        <StatCard
          title="Support Tickets"
          value={stats.support.open_tickets}
          subtitle="Open conversations"
          icon={MessageSquare}
          iconColor="text-purple-500"
          onClick={() => navigate("/support")}
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Transaction Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Today</span>
              <span className="text-sm font-semibold">{stats.transactions.today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">This Week</span>
              <span className="text-sm font-semibold">{stats.transactions.this_week}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">This Month</span>
              <span className="text-sm font-semibold">{stats.transactions.this_month}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Volume (Month)</span>
              <span className="text-sm font-semibold text-emerald-600">
                ${stats.transactions.volume_this_month.toLocaleString('en-US')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">New This Week</span>
              <span className="text-sm font-semibold text-blue-600">{stats.users.new_this_week}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">New This Month</span>
              <span className="text-sm font-semibold text-blue-600">{stats.users.new_this_month}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Active Accounts</span>
              <span className="text-sm font-semibold">{stats.accounts.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Frozen Accounts</span>
              <span className="text-sm font-semibold text-red-600">{stats.accounts.frozen}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Transactions</span>
              <span className="text-sm font-semibold">{stats.pending_approvals.transactions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">KYC Documents</span>
              <span className="text-sm font-semibold">{stats.pending_approvals.kyc_documents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Loans</span>
              <span className="text-sm font-semibold">{stats.pending_approvals.loans}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Virtual Cards</span>
              <span className="text-sm font-semibold">{stats.pending_approvals.virtual_cards}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Crypto Deposits</span>
              <span className="text-sm font-semibold">{stats.pending_approvals.crypto_deposits}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <button
            onClick={() => navigate("/activity-log")}
            className="text-sm text-primary hover:underline"
          >
            View All
          </button>
        </CardHeader>
        <CardContent>
          <ActivityTimeline activities={recentActivities} showUser={true} />
        </CardContent>
      </Card>
    </div>
  );
}
