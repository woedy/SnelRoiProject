import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Eye, DollarSign, FileText, Calendar, User } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface TaxRefundApplication {
  id: number;
  application_number: string;
  tax_year: number;
  status: string;
  status_display: string;
  customer_name: string;
  first_name: string;
  last_name: string;
  filing_status: string;
  filing_status_display: string;
  total_income: number;
  federal_tax_withheld: number;
  estimated_refund: number;
  approved_refund?: number;
  submitted_at?: string;
  reviewed_at?: string;
  processed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
  reviewed_by_name?: string;
  created_at: string;
  documents: TaxRefundDocument[];
}

interface TaxRefundDocument {
  id: number;
  document_type: string;
  document_type_display: string;
  document_name: string;
  file_size: number;
  status: string;
  status_display: string;
  file_url?: string;
  rejection_reason?: string;
  uploaded_at: string;
  updated_at: string;
}

interface TaxRefundStats {
  total_applications: number;
  by_status: Record<string, number>;
  total_refunds_approved: number;
  average_refund: number;
  processing_times: {
    pending_review: number;
    under_review: number;
    completed: number;
  };
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  PROCESSED: 'bg-purple-100 text-purple-800',
};

export default function TaxRefundManagement() {
  const [selectedApplication, setSelectedApplication] = useState<TaxRefundApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('2024');
  const [approvalData, setApprovalData] = useState({
    action: 'approve',
    approved_refund: '',
    admin_notes: '',
    rejection_reason: '',
  });

  const queryClient = useQueryClient();

  // Fetch tax refund applications
  const { data: applications = [], isLoading } = useQuery<TaxRefundApplication[]>({
    queryKey: ['admin-tax-refunds', statusFilter, yearFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (yearFilter !== 'all') params.append('tax_year', yearFilter);
      
      return apiRequest(`/admin/tax-refunds/?${params.toString()}`);
    },
  });

  // Fetch tax refund stats
  const { data: stats } = useQuery<TaxRefundStats>({
    queryKey: ['admin-tax-refund-stats', yearFilter],
    queryFn: async () => {
      const params = yearFilter !== 'all' ? `?year=${yearFilter}` : '';
      return apiRequest(`/admin/tax-refunds/stats/${params}`);
    },
  });

  // Process application mutation
  const processApplicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/admin/tax-refunds/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tax-refunds'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tax-refund-stats'] });
      setSelectedApplication(null);
      setApprovalData({
        action: 'approve',
        approved_refund: '',
        admin_notes: '',
        rejection_reason: '',
      });
    },
  });

  const handleProcessApplication = () => {
    if (!selectedApplication) return;

    const data: any = {
      action: approvalData.action,
      admin_notes: approvalData.admin_notes,
    };

    if (approvalData.action === 'approve') {
      data.approved_refund = parseFloat(approvalData.approved_refund);
    } else {
      data.rejection_reason = approvalData.rejection_reason;
    }

    processApplicationMutation.mutate({ id: selectedApplication.id, data });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading tax refund applications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tax Refund Management</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_applications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processing_times.pending_review}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds Approved</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_refunds_approved)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Refund</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.average_refund)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex flex-col space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="PROCESSED">Processed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <Label>Tax Year</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Refund Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tax Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Estimated Refund</TableHead>
                <TableHead>Approved Refund</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications && applications.map((application: TaxRefundApplication) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    {application.application_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{application.customer_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{application.tax_year}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                      {application.status_display}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(application.estimated_refund || 0)}</TableCell>
                  <TableCell>
                    {application.approved_refund ? formatCurrency(application.approved_refund) : '-'}
                  </TableCell>
                  <TableCell>
                    {application.submitted_at ? formatDate(application.submitted_at) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Tax Refund Application - {selectedApplication?.application_number}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedApplication && (
                            <div className="space-y-6">
                              {/* Application Details */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Personal Information</h3>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Name:</strong> {selectedApplication.first_name} {selectedApplication.last_name}</p>
                                    <p><strong>Filing Status:</strong> {selectedApplication.filing_status_display}</p>
                                    <p><strong>Tax Year:</strong> {selectedApplication.tax_year}</p>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">Financial Information</h3>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Total Income:</strong> {formatCurrency(selectedApplication.total_income)}</p>
                                    <p><strong>Federal Tax Withheld:</strong> {formatCurrency(selectedApplication.federal_tax_withheld)}</p>
                                    <p><strong>Estimated Refund:</strong> {formatCurrency(selectedApplication.estimated_refund || 0)}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Status and Processing */}
                              <div>
                                <h3 className="font-semibold mb-2">Status & Processing</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p><strong>Status:</strong> <Badge className={statusColors[selectedApplication.status as keyof typeof statusColors]}>{selectedApplication.status_display}</Badge></p>
                                    <p><strong>Submitted:</strong> {selectedApplication.submitted_at ? formatDate(selectedApplication.submitted_at) : 'Not submitted'}</p>
                                  </div>
                                  <div>
                                    <p><strong>Reviewed By:</strong> {selectedApplication.reviewed_by_name || 'Not reviewed'}</p>
                                    <p><strong>Reviewed At:</strong> {selectedApplication.reviewed_at ? formatDate(selectedApplication.reviewed_at) : 'Not reviewed'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Documents */}
                              <div>
                                <h3 className="font-semibold mb-2">Documents ({selectedApplication.documents?.length || 0})</h3>
                                {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                                  <div className="space-y-2">
                                    {selectedApplication.documents.map((doc: TaxRefundDocument) => (
                                      <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                                        <span className="text-sm">{doc.document_name}</span>
                                        <Badge variant="outline">{doc.document_type_display}</Badge>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No documents uploaded</p>
                                )}
                              </div>

                              {/* Admin Actions */}
                              {selectedApplication.status === 'SUBMITTED' && (
                                <div className="border-t pt-4">
                                  <h3 className="font-semibold mb-4">Process Application</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Action</Label>
                                      <Select
                                        value={approvalData.action}
                                        onValueChange={(value) => setApprovalData({ ...approvalData, action: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="approve">Approve</SelectItem>
                                          <SelectItem value="reject">Reject</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {approvalData.action === 'approve' && (
                                      <div>
                                        <Label>Approved Refund Amount</Label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="Enter approved amount"
                                          value={approvalData.approved_refund}
                                          onChange={(e) => setApprovalData({ ...approvalData, approved_refund: e.target.value })}
                                        />
                                      </div>
                                    )}

                                    {approvalData.action === 'reject' && (
                                      <div>
                                        <Label>Rejection Reason</Label>
                                        <Textarea
                                          placeholder="Enter reason for rejection"
                                          value={approvalData.rejection_reason}
                                          onChange={(e) => setApprovalData({ ...approvalData, rejection_reason: e.target.value })}
                                        />
                                      </div>
                                    )}

                                    <div>
                                      <Label>Admin Notes (Optional)</Label>
                                      <Textarea
                                        placeholder="Enter any additional notes"
                                        value={approvalData.admin_notes}
                                        onChange={(e) => setApprovalData({ ...approvalData, admin_notes: e.target.value })}
                                      />
                                    </div>

                                    <div className="flex space-x-2">
                                      <Button
                                        onClick={handleProcessApplication}
                                        disabled={processApplicationMutation.isPending}
                                        className={approvalData.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                                      >
                                        {approvalData.action === 'approve' ? (
                                          <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve Application
                                          </>
                                        ) : (
                                          <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject Application
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Admin Notes Display */}
                              {selectedApplication.admin_notes && (
                                <div>
                                  <h3 className="font-semibold mb-2">Admin Notes</h3>
                                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedApplication.admin_notes}</p>
                                </div>
                              )}

                              {/* Rejection Reason Display */}
                              {selectedApplication.rejection_reason && (
                                <div>
                                  <h3 className="font-semibold mb-2">Rejection Reason</h3>
                                  <p className="text-sm bg-red-50 p-3 rounded text-red-800">{selectedApplication.rejection_reason}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(!applications || applications.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No tax refund applications found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}