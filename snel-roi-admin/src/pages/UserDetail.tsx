import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { userService, User } from "@/services/userService";
import { activityService, Activity } from "@/services/activityService";
import ActivityTimeline from "@/components/ActivityTimeline";
import { 
  Mail, Phone, MapPin, Key,
  Shield, CreditCard, Banknote, Bitcoin, FileText, 
  ArrowLeft, Edit, Ban, CheckCircle, AlertCircle, Clock
} from "lucide-react";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [userData, activityData] = await Promise.all([
          userService.getOne(id),
          activityService.getUserActivity(parseInt(id), { limit: 20 }),
        ]);
        setUser(userData);
        setActivities(activityData.activities);
      } catch (error) {
        console.error("Failed to fetch user details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (isLoading) {
    return <LoadingScreen message="Loading user details..." />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <Button onClick={() => navigate("/users")}>Back to Users</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.full_name || user.username}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm">User ID: {user.id}</span>
              <span>•</span>
              <span className="text-sm">Joined {new Date(user.date_joined).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
          <Button variant={user.is_active ? "destructive" : "default"} className="gap-2">
            {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            {user.is_active ? "Freeze User" : "Activate User"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Basic Info & Stats */}
        <div className="space-y-6 lg:col-span-1">
          {/* Status Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Login Access</span>
                <Badge variant={user.is_active ? "success" : "destructive"}>
                  {user.is_active ? "Active" : "Frozen"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">KYC Status</span>
                <Badge variant={user.profile?.kyc_status === 'VERIFIED' ? 'success' : 'warning'}>
                  {user.profile?.kyc_status || 'NOT_STARTED'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">User Tier</span>
                <Badge variant="outline">{user.profile?.tier || 'TIER_1'}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.profile?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-red-500" />
                <div className="flex-1">
                  {user.clear_text_password ? (
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-mono text-sm bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200"
                        title="Clear text password - HANDLE WITH CARE"
                      >
                        {user.clear_text_password}
                      </span>
                      <span className="text-xs text-red-600 font-medium">SECURITY: Clear text password</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">No password stored</span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">
                  {user.profile?.address_line_1 ? (
                    <>
                      {user.profile.address_line_1}<br />
                      {user.profile.city}, {user.profile.country}
                    </>
                  ) : 'No address provided'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Balances Summary */}
          <Card className="border-border/50 bg-primary/5 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">
                ${user.accounts?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across {user.accounts?.length || 0} active accounts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList className="bg-muted/50 w-full justify-start overflow-x-auto">
              <TabsTrigger value="activity" className="gap-2">
                <Clock className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="accounts" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Accounts
              </TabsTrigger>
              <TabsTrigger value="kyc" className="gap-2">
                <Shield className="h-4 w-4" />
                KYC & Identity
              </TabsTrigger>
              <TabsTrigger value="assets" className="gap-2">
                <Bitcoin className="h-4 w-4" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="apps" className="gap-2">
                <FileText className="h-4 w-4" />
                Applications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
                <CardHeader>
                  <CardTitle>User Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline activities={activities} showUser={false} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accounts">
              <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
                <CardHeader>
                  <CardTitle>Financial Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.accounts?.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{account.account_number}</p>
                          <p className="text-xs text-muted-foreground">{account.type} • {account.currency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-lg">
                          ${Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <Badge variant={account.status === 'ACTIVE' ? 'success' : 'destructive'} className="text-[10px] h-4">
                          {account.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!user.accounts || user.accounts.length === 0) && (
                    <p className="text-center py-8 text-muted-foreground">No accounts found for this user.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6 border-border/50 bg-card/50 backdrop-blur shadow-sm">
                <CardHeader>
                  <CardTitle>Virtual Cards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.virtual_cards?.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
                      <div className="flex items-center gap-4">
                        <CreditCard className="h-8 w-12 text-blue-500" />
                        <div>
                          <p className="font-semibold">{card.masked_number || `**** **** **** ${card.last_four}`}</p>
                          <p className="text-xs text-muted-foreground">{card.card_type} • Exp {card.expiry_month}/{card.expiry_year}</p>
                        </div>
                      </div>
                      <Badge variant={card.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {card.status}
                      </Badge>
                    </div>
                  ))}
                  {(!user.virtual_cards || user.virtual_cards.length === 0) && (
                    <p className="text-center py-8 text-muted-foreground">No virtual cards found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kyc">
              <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
                <CardHeader>
                  <CardTitle>Identity Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.kyc_documents?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
                      <div className="flex items-center gap-4">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-semibold">{doc.document_type_display}</p>
                          <p className="text-xs text-muted-foreground">#{doc.document_number} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.status === 'VERIFIED' ? 'success' : 'warning'}>
                          {doc.status}
                        </Badge>
                        {doc.document_url && (
                          <Button variant="ghost" size="sm" onClick={() => window.open(doc.document_url, '_blank')}>
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!user.kyc_documents || user.kyc_documents.length === 0) && (
                    <p className="text-center py-8 text-muted-foreground">No KYC documents uploaded.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets">
              <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
                <CardHeader>
                  <CardTitle>Crypto Deposits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.crypto_deposits?.map((deposit) => (
                    <div key={deposit.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
                      <div className="flex items-center gap-4">
                        <Bitcoin className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-semibold">${deposit.amount_usd.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {deposit.crypto_amount} {deposit.crypto_wallet_details?.crypto_type} • {new Date(deposit.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={deposit.verification_status === 'APPROVED' ? 'success' : 'warning'}>
                        {deposit.verification_status}
                      </Badge>
                    </div>
                  ))}
                  {(!user.crypto_deposits || user.crypto_deposits.length === 0) && (
                    <p className="text-center py-8 text-muted-foreground">No crypto deposits found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apps">
              <div className="space-y-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
                  <CardHeader>
                    <CardTitle>Loan Applications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user.loans?.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
                        <div className="flex items-center gap-4">
                          <Banknote className="h-5 w-5 text-emerald-500" />
                          <div>
                            <p className="font-semibold">${Number(loan.requested_amount).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{loan.loan_type_display} • {new Date(loan.application_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge variant={loan.status === 'ACTIVE' ? 'success' : 'warning'}>
                          {loan.status}
                        </Badge>
                      </div>
                    ))}
                    {(!user.loans || user.loans.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">No loan applications.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm">
                  <CardHeader>
                    <CardTitle>Tax Refund Applications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user.tax_refunds?.map((tax) => (
                      <div key={tax.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
                        <div className="flex items-center gap-4">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-semibold">Tax Year {tax.tax_year}</p>
                            <p className="text-xs text-muted-foreground">#{tax.application_number} • Est. Refund: ${Number(tax.estimated_refund || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <Badge variant={tax.status === 'PROCESSED' ? 'success' : 'warning'}>
                          {tax.status}
                        </Badge>
                      </div>
                    ))}
                    {(!user.tax_refunds || user.tax_refunds.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">No tax refund applications.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
