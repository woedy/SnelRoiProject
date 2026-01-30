import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { adminKycService, CustomerProfile, getKYCStatusColor } from '@/services/kycService';
import { CheckCircle, XCircle, Eye, Filter } from 'lucide-react';

const KYCManagement = () => {
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<CustomerProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { kyc_status: statusFilter } : undefined;
      const data = await adminKycService.getKYCProfiles(params);
      console.log('Fetched profiles:', data);
      setProfiles(data);
    } catch (error) {
      console.error('Failed to fetch KYC profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [statusFilter]);

  const handleVerifyProfile = async (profileId: number) => {
    console.log('Verifying profile with ID:', profileId);
    try {
      setProcessing(profileId);
      await adminKycService.verifyKYCProfile(profileId, { action: 'verify' });
      await fetchProfiles();
      setSelectedProfile(null);
    } catch (error) {
      console.error('Failed to verify profile:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectProfile = async (profileId: number) => {
    console.log('Rejecting profile with ID:', profileId);
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(profileId);
      await adminKycService.verifyKYCProfile(profileId, {
        action: 'reject',
        rejection_reason: rejectionReason
      });
      await fetchProfiles();
      setSelectedProfile(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject profile:', error);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const colorClass = getKYCStatusColor(status);
    return (
      <Badge className={colorClass}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading KYC profiles...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">KYC Management</h1>
          <p className="text-muted-foreground">Manage customer identity verification</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Profiles ({profiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    {profile.full_name || `${profile.user.first_name} ${profile.user.last_name}`}
                  </TableCell>
                  <TableCell>{profile.user.email}</TableCell>
                  <TableCell>{getStatusBadge(profile.kyc_status)}</TableCell>
                  <TableCell>{formatDate(profile.kyc_submitted_at)}</TableCell>
                  <TableCell>{formatDate(profile.kyc_verified_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProfile(profile)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>KYC Profile Details</DialogTitle>
                          </DialogHeader>
                          {selectedProfile && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="font-semibold">Full Name</Label>
                                  <p>{selectedProfile.full_name}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">Email</Label>
                                  <p>{selectedProfile.user.email}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">Phone</Label>
                                  <p>{selectedProfile.phone || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">Country</Label>
                                  <p>{selectedProfile.country || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">Date of Birth</Label>
                                  <p>{selectedProfile.date_of_birth || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label className="font-semibold">KYC Status</Label>
                                  <div className="mt-1">{getStatusBadge(selectedProfile.kyc_status)}</div>
                                </div>
                              </div>

                              {selectedProfile.kyc_rejection_reason && (
                                <div>
                                  <Label className="font-semibold text-red-600">Rejection Reason</Label>
                                  <p className="text-red-600">{selectedProfile.kyc_rejection_reason}</p>
                                </div>
                              )}

                              {selectedProfile.kyc_status === 'PENDING' && (
                                <div className="flex gap-4 pt-4 border-t">
                                  <Button
                                    onClick={() => handleVerifyProfile(selectedProfile.id)}
                                    disabled={processing === selectedProfile.id}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {processing === selectedProfile.id ? 'Verifying...' : 'Verify'}
                                  </Button>
                                  
                                  <div className="flex-1 space-y-2">
                                    <Textarea
                                      placeholder="Rejection reason..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleRejectProfile(selectedProfile.id)}
                                      disabled={processing === selectedProfile.id}
                                      className="w-full"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      {processing === selectedProfile.id ? 'Rejecting...' : 'Reject'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {profile.kyc_status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleVerifyProfile(profile.id)}
                            disabled={processing === profile.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {profiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No customer profiles found
              {statusFilter && ` with status "${statusFilter}"`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCManagement;