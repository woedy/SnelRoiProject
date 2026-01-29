import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Search,
  Filter,
  User,
  Calendar
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface KYCDocument {
  id: number;
  document_type: string;
  document_type_display: string;
  document_url: string;
  document_number: string;
  status: string;
  status_display: string;
  rejection_reason: string;
  admin_notes: string;
  uploaded_at: string;
  customer: {
    full_name: string;
    user: {
      email: string;
    };
  };
}

interface CustomerProfile {
  id: number;
  full_name: string;
  kyc_status: string;
  kyc_status_display: string;
  kyc_submitted_at: string | null;
  profile_completion_percentage: number;
  user: {
    email: string;
  };
}

const KYCManagement = () => {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'documents' | 'profiles'>('documents');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  const [verificationAction, setVerificationAction] = useState<'approve' | 'reject' | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'documents') {
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (searchTerm) params.append('customer', searchTerm);
        
        const data = await apiRequest<KYCDocument[]>(`/admin/kyc/documents/?${params.toString()}`);
        setDocuments(data);
      } else {
        const params = new URLSearchParams();
        if (statusFilter) params.append('kyc_status', statusFilter);
        if (searchTerm) params.append('customer', searchTerm);
        
        const data = await apiRequest<CustomerProfile[]>(`/admin/kyc/profiles/?${params.toString()}`);
        setProfiles(data);
      }
    } catch (error) {
      console.error('Failed to load KYC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async () => {
    if (!selectedDocument || !verificationAction) return;

    try {
      const data = {
        action: verificationAction,
        admin_notes: adminNotes,
        ...(verificationAction === 'reject' && { rejection_reason: rejectionReason })
      };

      await apiRequest(`/admin/kyc/documents/${selectedDocument.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      // Reload data and close dialog
      await loadData();
      setSelectedDocument(null);
      setVerificationAction('');
      setAdminNotes('');
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to verify document:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'UNDER_REVIEW':
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KYC Management</h1>
        <p className="text-muted-foreground">Manage customer identity verification</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'documents'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Documents
        </button>
        <button
          onClick={() => setActiveTab('profiles')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'profiles'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="h-4 w-4 inline mr-2" />
          Profiles
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Customer</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  {activeTab === 'documents' ? (
                    <>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'documents' ? (
        <Card>
          <CardHeader>
            <CardTitle>KYC Documents</CardTitle>
            <CardDescription>Review and verify customer documents</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No documents found
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{doc.customer.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{doc.customer.user.email}</p>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>
                        {getStatusIcon(doc.status)}
                        <span className="ml-1">{doc.status_display}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium">Document Type</p>
                        <p className="text-sm text-muted-foreground">{doc.document_type_display}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Document Number</p>
                        <p className="text-sm text-muted-foreground">{doc.document_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Uploaded</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.document_url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {doc.status === 'PENDING' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setAdminNotes(doc.admin_notes || '');
                                }}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Document</DialogTitle>
                                <DialogDescription>
                                  Review and verify {doc.document_type_display} for {doc.customer.full_name}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <Button
                                    variant={verificationAction === 'approve' ? 'default' : 'outline'}
                                    onClick={() => setVerificationAction('approve')}
                                    className="h-20 flex-col"
                                  >
                                    <CheckCircle className="h-6 w-6 mb-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant={verificationAction === 'reject' ? 'destructive' : 'outline'}
                                    onClick={() => setVerificationAction('reject')}
                                    className="h-20 flex-col"
                                  >
                                    <XCircle className="h-6 w-6 mb-2" />
                                    Reject
                                  </Button>
                                </div>

                                {verificationAction === 'reject' && (
                                  <div className="space-y-2">
                                    <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                                    <Textarea
                                      id="rejection-reason"
                                      placeholder="Please provide a reason for rejection..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label htmlFor="admin-notes">Admin Notes</Label>
                                  <Textarea
                                    id="admin-notes"
                                    placeholder="Optional notes for internal use..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                  />
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedDocument(null);
                                      setVerificationAction('');
                                      setAdminNotes('');
                                      setRejectionReason('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleVerifyDocument}
                                    disabled={!verificationAction || (verificationAction === 'reject' && !rejectionReason)}
                                  >
                                    Submit Review
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>

                    {doc.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                        <p className="text-sm text-red-600">
                          <strong>Rejection Reason:</strong> {doc.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Customer Profiles</CardTitle>
            <CardDescription>Overview of customer KYC status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No profiles found
              </div>
            ) : (
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{profile.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{profile.user.email}</p>
                      </div>
                      <Badge className={getStatusColor(profile.kyc_status)}>
                        {getStatusIcon(profile.kyc_status)}
                        <span className="ml-1">{profile.kyc_status_display}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Profile Completion</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${profile.profile_completion_percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {profile.profile_completion_percentage}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">KYC Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.kyc_submitted_at 
                            ? new Date(profile.kyc_submitted_at).toLocaleDateString()
                            : 'Not submitted'
                          }
                        </p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KYCManagement;