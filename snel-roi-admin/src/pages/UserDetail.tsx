import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string>("");
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState<string>("");
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address_line_1: "",
    city: "",
    country: "",
    is_active: true,
    is_staff: false,
    kyc_status: "PENDING",
    tier: "STANDARD",
    kyc_rejection_reason: "",
  });

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

  const handleToggleActive = async () => {
    if (!id || !user) return;
    try {
      const updated = await userService.update(id, { is_active: !user.is_active });
      setUser(updated);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user) return;
    setEditForm({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.profile?.phone || "",
      address_line_1: user.profile?.address_line_1 || "",
      city: user.profile?.city || "",
      country: user.profile?.country || "",
      is_active: !!user.is_active,
      is_staff: !!user.is_staff,
      kyc_status: user.profile?.kyc_status || "PENDING",
      tier: user.profile?.tier || "STANDARD",
      kyc_rejection_reason: user.profile?.kyc_rejection_reason || "",
    });
  }, [user]);

  const handleEditChange = (key: keyof typeof editForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditBooleanChange = (key: "is_active" | "is_staff", value: boolean) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = (key: keyof typeof passwordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    setPasswordError("");
    if (!passwordForm.new_password) {
      setPasswordError("New password is required.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsPasswordSaving(true);
    try {
      const updated = await userService.update(id, { password: passwordForm.new_password });
      setUser(updated);
      setIsPasswordOpen(false);
      setPasswordForm({ new_password: "", confirm_password: "" });
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Unable to update password. Please try again.");
      console.error(error);
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;
    setIsSaving(true);
    setEditError("");
    try {
      const updated = await userService.update(id, {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        address_line_1: editForm.address_line_1,
        city: editForm.city,
        country: editForm.country,
        is_active: editForm.is_active,
        is_staff: editForm.is_staff,
        kyc_status: editForm.kyc_status,
        tier: editForm.tier,
        kyc_rejection_reason: editForm.kyc_rejection_reason,
      });
      setUser(updated);
      setIsEditOpen(false);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Unable to update profile. Please try again.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

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
          <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Key className="h-4 w-4" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => handlePasswordChange("new_password", e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => handlePasswordChange("confirm_password", e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </div>

                {passwordError ? (
                  <div className="text-sm text-destructive">{passwordError}</div>
                ) : null}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsPasswordOpen(false)} disabled={isPasswordSaving}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPasswordSaving}>
                    {isPasswordSaving ? "Saving..." : "Update Password"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="is_active">Account Status</Label>
                    <Select
                      value={editForm.is_active ? "active" : "frozen"}
                      onValueChange={(value) => handleEditBooleanChange("is_active", value === "active")}
                    >
                      <SelectTrigger id="is_active">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="frozen">Frozen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="is_staff">Staff Access</Label>
                    <Select
                      value={editForm.is_staff ? "staff" : "user"}
                      onValueChange={(value) => handleEditBooleanChange("is_staff", value === "staff")}
                    >
                      <SelectTrigger id="is_staff">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Regular User</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) => handleEditChange("full_name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleEditChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => handleEditChange("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_line_1">Address Line 1</Label>
                  <Input
                    id="address_line_1"
                    value={editForm.address_line_1}
                    onChange={(e) => handleEditChange("address_line_1", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editForm.city}
                      onChange={(e) => handleEditChange("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={editForm.country}
                      onChange={(e) => handleEditChange("country", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="kyc_status">KYC Status</Label>
                    <Select value={editForm.kyc_status} onValueChange={(value) => handleEditChange("kyc_status", value)}>
                      <SelectTrigger id="kyc_status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">PENDING</SelectItem>
                        <SelectItem value="UNDER_REVIEW">UNDER_REVIEW</SelectItem>
                        <SelectItem value="VERIFIED">VERIFIED</SelectItem>
                        <SelectItem value="REJECTED">REJECTED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier">Tier</Label>
                    <Select value={editForm.tier} onValueChange={(value) => handleEditChange("tier", value)}>
                      <SelectTrigger id="tier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD">STANDARD</SelectItem>
                        <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {editForm.kyc_status === "REJECTED" ? (
                  <div className="space-y-2">
                    <Label htmlFor="kyc_rejection_reason">KYC Rejection Reason</Label>
                    <Input
                      id="kyc_rejection_reason"
                      value={editForm.kyc_rejection_reason}
                      onChange={(e) => handleEditChange("kyc_rejection_reason", e.target.value)}
                    />
                  </div>
                ) : null}

                {editError ? (
                  <div className="text-sm text-destructive">{editError}</div>
                ) : null}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant={user.is_active ? "destructive" : "default"} className="gap-2" onClick={handleToggleActive}>
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
