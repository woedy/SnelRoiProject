import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { activityService, Activity, ActivityFilters } from "@/services/activityService";
import ActivityTimeline from "@/components/ActivityTimeline";
import { Search, Filter, Download } from "lucide-react";

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ActivityFilters>({
    limit: 100,
  });
  const [searchEmail, setSearchEmail] = useState("");

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const data = await activityService.getActivityLog(filters);
      setActivities(data.activities);
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleApplyFilters = () => {
    fetchActivities();
  };

  const handleReset = () => {
    setFilters({ limit: 100 });
    setSearchEmail("");
    fetchActivities();
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ["Timestamp", "Activity Type", "User", "Description", "Amount", "Status", "Reference"];
    const rows = activities.map(activity => [
      activity.timestamp,
      activity.activity_type,
      activity.user_email || "",
      activity.description,
      activity.amount?.toString() || "",
      activity.status,
      activity.reference,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading && activities.length === 0) {
    return <LoadingScreen message="Loading activity log..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Activity Log
          </h2>
          <p className="text-muted-foreground">Platform-wide activity monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide" : "Show"} Filters
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExport}
            disabled={activities.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search-email">Search by Email</Label>
                <Input
                  id="search-email"
                  placeholder="user@example.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-from">Date From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.date_from || ""}
                  onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">Date To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.date_to || ""}
                  onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit">Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  min="10"
                  max="500"
                  value={filters.limit || 100}
                  onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleApplyFilters} className="gap-2">
                <Search className="h-4 w-4" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
        <CardHeader>
          <CardTitle>
            Activities ({activities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ActivityTimeline activities={activities} showUser={true} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
