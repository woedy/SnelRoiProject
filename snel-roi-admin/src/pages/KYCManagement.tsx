import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminKycService, CustomerProfile, KYCDocument, getKYCStatusColor, getDocumentStatusColor } from '@/services/kycService';
import { CheckCircle, XCircle, Eye, Filter, FileText } from 'lucide-react';

const KYCManagement = () => {
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<CustomerProfile | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [documentRejectionReason, setDocumentRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [documentStatusFilter, setDocumentStatusFilter] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('profiles');

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { kyc_status: statusFilter } : undefined;
      const data = await adminKycService.getKYCProfiles(params);
      console.log('Fetched profiles:', data);
      // Ensure data is an array and has proper structure
      setProfiles(Array.isArray(data) ? data.filter(profile => profile && profile.user) : []);
    } catch (error) {
      console.error('Failed to fetch KYC profiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const params = documentStatusFilter ? { status: documentStatusFilter } : undefined;
      const data = await adminKycService.getKYCDocuments(params);
      console.log('Fetched documents:', data);
      console.log('First document structure:', data[0]);
      
      // More lenient filtering - just ensure basic document structure exists
      if (Array.isArray(data)) {
        const validDocuments = data.filter(doc => {
          const isValid = doc && doc.id && doc.document_type;
          if (!isValid) {
            console.log('Invalid document filtered out:', doc);
          }
          return isValid;
        });
        console.log('Valid documents after filtering:', validDocuments);
        setDocuments(validDocuments);
      } else {
        console.log('Data is not an array:', data);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Failed to fetch KYC documents:', error);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [statusFilter]);

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments();
    }
  }, [activeTab, documentStatusFilter]);

  const handleVerifyDocument = async (documentId: number) => {
    try {
      setProcessing(documentId);
      await adminKycService.verifyKYCDocument(documentId, {
        action: 'approve',
        admin_notes: adminNotes
      });
      await fetchDocuments();
      setSelectedDocument(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to verify document:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectDocument = async (documentId: number) => {
    if (!documentRejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(documentId);
      await adminKycService.verifyKYCDocument(documentId, {
        action: 'reject',
        rejection_reason: documentRejectionReason,
        admin_notes: adminNotes
      });
      await fetchDocuments();
      setSelectedDocument(null);
      setDocumentRejectionReason('');
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to reject document:', error);
    } finally {
      setProcessing(null);
    }
  };

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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profiles">Customer Profiles</TabsTrigger>
          <TabsTrigger value="documents">Document Review</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
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
                  {profiles.map((profile) => {
                    // Add safety checks for profile and user data
                    if (!profile || !profile.user) {
                      return null;
                    }
                    
                    return (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          {profile.full_name || `${profile.user.first_name || ''} ${profile.user.last_name || ''}`.trim() || 'N/A'}
                        </TableCell>
                        <TableCell>{profile.user.email || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(profile.kyc_status || 'PENDING')}</TableCell>
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
                                {selectedProfile && selectedProfile.user && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Full Name</Label>
                                        <p>{selectedProfile.full_name || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Email</Label>
                                        <p>{selectedProfile.user.email || 'N/A'}</p>
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
                                        <div className="mt-1">{getStatusBadge(selectedProfile.kyc_status || 'PENDING')}</div>
                                      </div>
                                    </div>

                                    {selectedProfile.kyc_rejection_reason && (
                                      <div>
                                        <Label className="font-semibold text-red-600">Rejection Reason</Label>
                                        <p className="text-red-600">{selectedProfile.kyc_rejection_reason}</p>
                                      </div>
                                    )}

                                    {(selectedProfile.kyc_status === 'PENDING' || selectedProfile.kyc_status === 'UNDER_REVIEW') && (
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

                            {(profile.kyc_status === 'PENDING' || profile.kyc_status === 'UNDER_REVIEW') && (
                              <Button
                                size="sm"
                                onClick={() => handleVerifyProfile(profile.id)}
                                disabled={processing === profile.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <select
              value={documentStatusFilter}
              onChange={(e) => setDocumentStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>KYC Documents ({documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="text-center py-8">Loading documents...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((document) => {
                      return (
                        <TableRow key={document.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p>{document.customer?.full_name || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{document.customer?.user?.email || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {document.document_type_display || document.document_type || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getDocumentStatusColor(document.status || 'PENDING')}>
                              {document.status_display || document.status || 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(document.uploaded_at)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(document.document_url, '_blank')}
                                disabled={!document.document_url}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDocument(document);
                                      setAdminNotes(document.admin_notes || '');
                                      setDocumentRejectionReason(document.rejection_reason || '');
                                    }}
                                  >
                                    Review
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Review Document</DialogTitle>
                                  </DialogHeader>
                                  {selectedDocument && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="font-semibold">Customer</Label>
                                          <p>{selectedDocument.customer?.full_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <Label className="font-semibold">Document Type</Label>
                                          <p>{selectedDocument.document_type_display || selectedDocument.document_type || 'N/A'}</p>
                                        </div>
                                        <div>
                                          <Label className="font-semibold">Status</Label>
                                          <Badge className={getDocumentStatusColor(selectedDocument.status || 'PENDING')}>
                                            {selectedDocument.status_display || selectedDocument.status || 'Pending'}
                                          </Badge>
                                        </div>
                                        <div>
                                          <Label className="font-semibold">Uploaded</Label>
                                          <p>{formatDate(selectedDocument.uploaded_at)}</p>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <Label className="font-semibold">Admin Notes</Label>
                                        <Textarea
                                          placeholder="Add admin notes..."
                                          value={adminNotes}
                                          onChange={(e) => setAdminNotes(e.target.value)}
                                        />
                                      </div>

                                      {selectedDocument.status === 'PENDING' && (
                                        <div className="flex gap-4 pt-4 border-t">
                                          <Button
                                            onClick={() => handleVerifyDocument(selectedDocument.id)}
                                            disabled={processing === selectedDocument.id}
                                            className="flex-1"
                                          >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            {processing === selectedDocument.id ? 'Approving...' : 'Approve'}
                                          </Button>
                                          
                                          <div className="flex-1 space-y-2">
                                            <Textarea
                                              placeholder="Rejection reason..."
                                              value={documentRejectionReason}
                                              onChange={(e) => setDocumentRejectionReason(e.target.value)}
                                            />
                                            <Button
                                              variant="destructive"
                                              onClick={() => handleRejectDocument(selectedDocument.id)}
                                              disabled={processing === selectedDocument.id}
                                              className="w-full"
                                            >
                                              <XCircle className="h-4 w-4 mr-2" />
                                              {processing === selectedDocument.id ? 'Rejecting...' : 'Reject'}
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {documents.length === 0 && !documentsLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No documents found
                  {documentStatusFilter && ` with status "${documentStatusFilter}"`}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KYCManagement;