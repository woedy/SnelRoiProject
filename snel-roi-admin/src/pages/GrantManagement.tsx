import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Award, 
  Plus, 
  Eye, 
  Edit, 
  DollarSign, 
  Calendar, 
  Users,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface Grant {
  id: string;
  title: string;
  description: string;
  category: string;
  category_display: string;
  provider: string;
  amount: number;
  deadline: string;
  status: string;
  status_display: string;
  eligibility_requirements: string[];
  applications_count: number;
  created_by_name: string;
  created_at: string;
}

interface GrantApplication {
  id: string;
  grant_details: Grant;
  customer_name: string;
  first_name: string;
  last_name: string;
  email: string;
  organization: string;
  project_title: string;
  project_description: string;
  requested_amount: number;
  project_timeline: string;
  status: string;
  status_display: string;
  submitted_at: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
}

const GrantManagement = () => {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [applications, setApplications] = useState<GrantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<GrantApplication | null>(null);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'grants' | 'applications'>('grants');

  // Mock data for demonstration
  const mockGrants: Grant[] = [
    {
      id: '1',
      title: 'Small Business Innovation Grant',
      description: 'Supporting innovative small businesses with funding for research and development projects.',
      category: 'BUSINESS',
      category_display: 'Business',
      provider: 'Department of Commerce',
      amount: 50000,
      deadline: '2026-03-15',
      status: 'AVAILABLE',
      status_display: 'Available',
      eligibility_requirements: ['Small business owner', 'Less than 50 employees', 'Innovation focus'],
      applications_count: 5,
      created_by_name: 'Admin User',
      created_at: '2026-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Education Excellence Scholarship',
      description: 'Merit-based scholarship for outstanding students pursuing higher education.',
      category: 'EDUCATION',
      category_display: 'Education',
      provider: 'Education Foundation',
      amount: 15000,
      deadline: '2026-04-30',
      status: 'AVAILABLE',
      status_display: 'Available',
      eligibility_requirements: ['GPA 3.5 or higher', 'Full-time student', 'Financial need'],
      applications_count: 12,
      created_by_name: 'Admin User',
      created_at: '2026-01-10T14:30:00Z'
    }
  ];

  const mockApplications: GrantApplication[] = [
    {
      id: '1',
      grant_details: mockGrants[0],
      customer_name: 'John Doe',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      organization: 'Tech Innovations LLC',
      project_title: 'AI-Powered Customer Service Platform',
      project_description: 'Developing an AI-powered platform to revolutionize customer service interactions.',
      requested_amount: 45000,
      project_timeline: '12 months with quarterly milestones',
      status: 'SUBMITTED',
      status_display: 'Submitted',
      submitted_at: '2026-01-20T09:15:00Z'
    },
    {
      id: '2',
      grant_details: mockGrants[1],
      customer_name: 'Jane Smith',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      organization: '',
      project_title: 'Computer Science Degree Program',
      project_description: 'Pursuing a Master\'s degree in Computer Science with focus on machine learning.',
      requested_amount: 15000,
      project_timeline: '2 years full-time study',
      status: 'UNDER_REVIEW',
      status_display: 'Under Review',
      submitted_at: '2026-01-18T16:45:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setGrants(mockGrants);
      setApplications(mockApplications);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'AVAILABLE': { color: 'bg-green-100 text-green-800', icon: Clock },
      'CLOSED': { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      'SUBMITTED': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'UNDER_REVIEW': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'APPROVED': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'REJECTED': { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['SUBMITTED'];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      // Simulate API call
      console.log('Application approved successfully');
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'APPROVED', status_display: 'Approved' }
            : app
        )
      );
    } catch (error) {
      console.error('Failed to approve application');
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      // Simulate API call
      console.log('Application rejected');
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'REJECTED', status_display: 'Rejected' }
            : app
        )
      );
    } catch (error) {
      console.error('Failed to reject application');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Grant Management</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Grant Management</h1>
          <p className="text-muted-foreground">Manage grants and review applications</p>
        </div>
        <Button onClick={() => setShowGrantDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Grant
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'grants' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('grants')}
        >
          <Award className="h-4 w-4 mr-2" />
          Grants ({grants.length})
        </Button>
        <Button
          variant={activeTab === 'applications' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('applications')}
        >
          <Users className="h-4 w-4 mr-2" />
          Applications ({applications.length})
        </Button>
      </div>

      {/* Grants Tab */}
      {activeTab === 'grants' && (
        <Card>
          <CardHeader>
            <CardTitle>Available Grants</CardTitle>
            <CardDescription>Manage grant opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grant Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grants.map((grant) => (
                  <TableRow key={grant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{grant.title}</div>
                        <div className="text-sm text-muted-foreground">{grant.provider}</div>
                      </div>
                    </TableCell>
                    <TableCell>{grant.category_display}</TableCell>
                    <TableCell>{formatCurrency(grant.amount)}</TableCell>
                    <TableCell>{formatDate(grant.deadline)}</TableCell>
                    <TableCell>{grant.applications_count}</TableCell>
                    <TableCell>{getStatusBadge(grant.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedGrant(grant);
                            setShowGrantDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedGrant(grant);
                            setShowGrantDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <Card>
          <CardHeader>
            <CardTitle>Grant Applications</CardTitle>
            <CardDescription>Review and manage grant applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Grant</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{application.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{application.grant_details.title}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.project_title}</div>
                        {application.organization && (
                          <div className="text-sm text-muted-foreground">{application.organization}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(application.requested_amount)}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>{formatDate(application.submitted_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowApplicationDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {application.status === 'SUBMITTED' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApproveApplication(application.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRejectApplication(application.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Grant Dialog */}
      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedGrant ? 'Grant Details' : 'Create New Grant'}
            </DialogTitle>
            <DialogDescription>
              {selectedGrant ? 'View and edit grant information' : 'Create a new grant opportunity'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedGrant && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Grant Amount</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{formatCurrency(selectedGrant.amount)}</span>
                  </div>
                </div>
                <div>
                  <Label>Deadline</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(selectedGrant.deadline)}</span>
                  </div>
                </div>
                <div>
                  <Label>Applications</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedGrant.applications_count} applications</span>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedGrant.status)}
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label>Description</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedGrant?.description || 'No description available'}
              </p>
            </div>
            {selectedGrant?.eligibility_requirements && (
              <div>
                <Label>Eligibility Requirements</Label>
                <ul className="mt-1 text-sm text-muted-foreground list-disc list-inside">
                  {selectedGrant.eligibility_requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review grant application information
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Applicant</Label>
                  <div className="mt-1">
                    <div className="font-medium">{selectedApplication.customer_name}</div>
                    <div className="text-sm text-muted-foreground">{selectedApplication.email}</div>
                  </div>
                </div>
                <div>
                  <Label>Organization</Label>
                  <div className="mt-1">
                    {selectedApplication.organization || 'Individual applicant'}
                  </div>
                </div>
                <div>
                  <Label>Requested Amount</Label>
                  <div className="mt-1 font-semibold">
                    {formatCurrency(selectedApplication.requested_amount)}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Project Title</Label>
                <div className="mt-1 font-medium">{selectedApplication.project_title}</div>
              </div>
              
              <div>
                <Label>Project Description</Label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedApplication.project_description}
                </div>
              </div>
              
              <div>
                <Label>Project Timeline</Label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedApplication.project_timeline}
                </div>
              </div>

              {selectedApplication.status === 'SUBMITTED' && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      handleRejectApplication(selectedApplication.id);
                      setShowApplicationDialog(false);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="text-green-600 hover:text-green-700"
                    onClick={() => {
                      handleApproveApplication(selectedApplication.id);
                      setShowApplicationDialog(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GrantManagement;