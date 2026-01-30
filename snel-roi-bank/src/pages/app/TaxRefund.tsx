import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Calculator,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Download,
  RefreshCw,
  TrendingUp,
  Building2,
  User,
  Home,
  GraduationCap,
  Heart,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { 
  taxRefundService, 
  TaxRefundApplication, 
  TaxRefundCalculatorData, 
  TaxRefundEstimate,
  TaxRefundApplicationCreate 
} from '@/services/taxRefundService';

const TaxRefund = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'calculator' | 'application' | 'status'>('calculator');
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<TaxRefundApplication[]>([]);
  const [currentApplication, setCurrentApplication] = useState<TaxRefundApplication | null>(null);
  
  // Calculator state
  const [calculatorData, setCalculatorData] = useState<TaxRefundCalculatorData>({
    filing_status: '',
    total_income: 0,
    federal_tax_withheld: 0,
    estimated_tax_paid: 0,
    number_of_dependents: 0,
    use_standard_deduction: true,
    mortgage_interest: 0,
    charitable_donations: 0,
    medical_expenses: 0,
    business_expenses: 0,
    education_expenses: 0,
    other_deductions: 0,
  });
  const [estimatedRefund, setEstimatedRefund] = useState<TaxRefundEstimate | null>(null);
  
  // Application form state
  const [applicationData, setApplicationData] = useState<TaxRefundApplicationCreate>({
    first_name: '',
    last_name: '',
    middle_name: '',
    ssn: '',
    date_of_birth: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    phone_number: '',
    email_address: '',
    filing_status: '',
    total_income: 0,
    federal_tax_withheld: 0,
    state_tax_withheld: 0,
    estimated_tax_paid: 0,
    number_of_dependents: 0,
    use_standard_deduction: true,
    mortgage_interest: 0,
    charitable_donations: 0,
    medical_expenses: 0,
    business_expenses: 0,
    education_expenses: 0,
    other_deductions: 0,
    refund_method: 'DIRECT_DEPOSIT',
  });

  // Load applications on component mount
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const apps = await taxRefundService.getApplications();
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tax refund applications',
        variant: 'destructive',
      });
    }
  };

  const calculateRefund = async () => {
    if (!calculatorData.filing_status || calculatorData.total_income <= 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in filing status and income',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const estimate = await taxRefundService.calculateRefund(calculatorData);
      setEstimatedRefund(estimate);
      toast({
        title: 'Calculation Complete',
        description: `Estimated refund: $${estimate.estimated_refund.toLocaleString()}`,
      });
    } catch (error) {
      console.error('Error calculating refund:', error);
      toast({
        title: 'Calculation Error',
        description: 'Failed to calculate tax refund estimate',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async () => {
    if (!applicationData.first_name || !applicationData.last_name || !applicationData.ssn) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in required personal information',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const newApp = await taxRefundService.createApplication(applicationData);
      setCurrentApplication(newApp);
      await loadApplications();
      toast({
        title: 'Application Created',
        description: `Application ${newApp.application_number} created successfully`,
      });
      setActiveTab('status');
    } catch (error) {
      console.error('Error creating application:', error);
      toast({
        title: 'Application Error',
        description: 'Failed to create tax refund application',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (applicationId: number) => {
    setLoading(true);
    try {
      await taxRefundService.submitApplication(applicationId);
      await loadApplications();
      toast({
        title: 'Application Submitted',
        description: 'Your tax refund application has been submitted for review',
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Submission Error',
        description: 'Failed to submit tax refund application',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (applicationId: number, file: File, documentType: string) => {
    setLoading(true);
    try {
      await taxRefundService.uploadDocument(applicationId, file, documentType);
      await loadApplications();
      toast({
        title: 'Document Uploaded',
        description: 'Document uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <FileText className="h-4 w-4" />;
      case 'SUBMITTED':
        return <Clock className="h-4 w-4" />;
      case 'UNDER_REVIEW':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'APPROVED':
      case 'PROCESSED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
      case 'PROCESSED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filingStatusOptions = taxRefundService.getFilingStatusOptions();
  const stateOptions = taxRefundService.getStateOptions();
  const documentTypeOptions = taxRefundService.getDocumentTypeOptions();

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Tax Refund Service
          </h1>
          <p className="text-muted-foreground mt-1">
            Calculate, apply for, and track your tax refunds all in one place
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'calculator' ? 'default' : 'outline'}
            onClick={() => setActiveTab('calculator')}
            size="sm"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculator
          </Button>
          <Button
            variant={activeTab === 'application' ? 'default' : 'outline'}
            onClick={() => setActiveTab('application')}
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Apply
          </Button>
          <Button
            variant={activeTab === 'status' ? 'default' : 'outline'}
            onClick={() => setActiveTab('status')}
            size="sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Status
          </Button>
        </div>
      </div>

      {/* Tax Refund Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Tax Refund Calculator
              </CardTitle>
              <CardDescription>
                Get an estimate of your potential tax refund for 2024
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="income">Annual Income</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="75,000"
                    value={calculatorData.total_income || ''}
                    onChange={(e) => setCalculatorData({ 
                      ...calculatorData, 
                      total_income: parseFloat(e.target.value) || 0 
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="taxPaid">Federal Tax Withheld</Label>
                  <Input
                    id="taxPaid"
                    type="number"
                    placeholder="12,000"
                    value={calculatorData.federal_tax_withheld || ''}
                    onChange={(e) => setCalculatorData({ 
                      ...calculatorData, 
                      federal_tax_withheld: parseFloat(e.target.value) || 0 
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="filingStatus">Filing Status</Label>
                  <Select
                    value={calculatorData.filing_status}
                    onValueChange={(value) => setCalculatorData({ 
                      ...calculatorData, 
                      filing_status: value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select filing status" />
                    </SelectTrigger>
                    <SelectContent>
                      {filingStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estimatedTax">Estimated Tax Paid (Optional)</Label>
                  <Input
                    id="estimatedTax"
                    type="number"
                    placeholder="0"
                    value={calculatorData.estimated_tax_paid || ''}
                    onChange={(e) => setCalculatorData({ 
                      ...calculatorData, 
                      estimated_tax_paid: parseFloat(e.target.value) || 0 
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="dependents">Number of Dependents</Label>
                  <Input
                    id="dependents"
                    type="number"
                    placeholder="0"
                    value={calculatorData.number_of_dependents || ''}
                    onChange={(e) => setCalculatorData({ 
                      ...calculatorData, 
                      number_of_dependents: parseInt(e.target.value) || 0 
                    })}
                  />
                </div>

                {/* Deductions Section */}
                <div className="space-y-3">
                  <Label>Deductions</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="standardDeduction"
                      checked={calculatorData.use_standard_deduction}
                      onChange={(e) => setCalculatorData({ 
                        ...calculatorData, 
                        use_standard_deduction: e.target.checked 
                      })}
                    />
                    <Label htmlFor="standardDeduction">Use Standard Deduction</Label>
                  </div>
                  
                  {!calculatorData.use_standard_deduction && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <Label htmlFor="mortgageInterest">Mortgage Interest</Label>
                        <Input
                          id="mortgageInterest"
                          type="number"
                          placeholder="0"
                          value={calculatorData.mortgage_interest || ''}
                          onChange={(e) => setCalculatorData({ 
                            ...calculatorData, 
                            mortgage_interest: parseFloat(e.target.value) || 0 
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="charitableDonations">Charitable Donations</Label>
                        <Input
                          id="charitableDonations"
                          type="number"
                          placeholder="0"
                          value={calculatorData.charitable_donations || ''}
                          onChange={(e) => setCalculatorData({ 
                            ...calculatorData, 
                            charitable_donations: parseFloat(e.target.value) || 0 
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="medicalExpenses">Medical Expenses</Label>
                        <Input
                          id="medicalExpenses"
                          type="number"
                          placeholder="0"
                          value={calculatorData.medical_expenses || ''}
                          onChange={(e) => setCalculatorData({ 
                            ...calculatorData, 
                            medical_expenses: parseFloat(e.target.value) || 0 
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessExpenses">Business Expenses</Label>
                        <Input
                          id="businessExpenses"
                          type="number"
                          placeholder="0"
                          value={calculatorData.business_expenses || ''}
                          onChange={(e) => setCalculatorData({ 
                            ...calculatorData, 
                            business_expenses: parseFloat(e.target.value) || 0 
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={calculateRefund} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Refund
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Estimated Refund
              </CardTitle>
            </CardHeader>
            <CardContent>
              {estimatedRefund ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      ${estimatedRefund.estimated_refund.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">Estimated Federal Refund</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Annual Income:</span>
                      <span>${estimatedRefund.breakdown.income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Deductions:</span>
                      <span>${estimatedRefund.total_deductions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxable Income:</span>
                      <span>${estimatedRefund.taxable_income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Owed:</span>
                      <span>${estimatedRefund.calculated_tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Paid:</span>
                      <span>${estimatedRefund.total_tax_paid.toLocaleString()}</span>
                    </div>
                    {estimatedRefund.child_tax_credit > 0 && (
                      <div className="flex justify-between">
                        <span>Child Tax Credit:</span>
                        <span>${estimatedRefund.child_tax_credit.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This is an estimate only. Actual refund may vary based on additional factors.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={() => {
                      // Pre-fill application form with calculator data
                      setApplicationData({
                        ...applicationData,
                        filing_status: calculatorData.filing_status,
                        total_income: calculatorData.total_income,
                        federal_tax_withheld: calculatorData.federal_tax_withheld,
                        estimated_tax_paid: calculatorData.estimated_tax_paid || 0,
                        number_of_dependents: calculatorData.number_of_dependents || 0,
                        use_standard_deduction: calculatorData.use_standard_deduction,
                        mortgage_interest: calculatorData.mortgage_interest || 0,
                        charitable_donations: calculatorData.charitable_donations || 0,
                        medical_expenses: calculatorData.medical_expenses || 0,
                        business_expenses: calculatorData.business_expenses || 0,
                        education_expenses: calculatorData.education_expenses || 0,
                        other_deductions: calculatorData.other_deductions || 0,
                      });
                      setActiveTab('application');
                    }} 
                    className="w-full"
                    disabled={estimatedRefund.estimated_refund <= 0}
                  >
                    Apply for Refund
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Use the calculator to estimate your tax refund
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tax Refund Application */}
      {activeTab === 'application' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Refund Application</CardTitle>
              <CardDescription>
                Complete your tax refund application for the 2024 tax year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        placeholder="John"
                        value={applicationData.first_name}
                        onChange={(e) => setApplicationData({ 
                          ...applicationData, 
                          first_name: e.target.value 
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Doe"
                        value={applicationData.last_name}
                        onChange={(e) => setApplicationData({ 
                          ...applicationData, 
                          last_name: e.target.value 
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input 
                        id="middleName" 
                        placeholder="Optional"
                        value={applicationData.middle_name}
                        onChange={(e) => setApplicationData({ 
                          ...applicationData, 
                          middle_name: e.target.value 
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ssn">Social Security Number *</Label>
                      <Input 
                        id="ssn" 
                        placeholder="XXX-XX-XXXX"
                        value={applicationData.ssn}
                        onChange={(e) => setApplicationData({ 
                          ...applicationData, 
                          ssn: e.target.value 
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <Input 
                        id="dob" 
                        type="date"
                        value={applicationData.date_of_birth}
                        onChange={(e) => setApplicationData({ 
                          ...applicationData, 
                          date_of_birth: e.target.value 
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="john@example.com"
                        value={applicationData.email_address}
                        onChange={(e) => setApplicationData({ 
                          ...applicationData, 
                          email_address: e.target.value 
                        })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address Line 1 *</Label>
                      <Input 
                        id="address" 
                        placeholder="123 Main Street"
                        value={applicationData.address_line_1}
                        onChange={(e) => setApplicationData({ 
                          ...applicationData, 
                          address_line_1: e.target.value 
                        })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address2">Address Line 2</Label>
                      <Input 
                        id="address2" 
                        placeholder="Apt, Suite, etc. (Optional)"
                        value={applicationData.address_line_2}
                        onChange={(e) => setApplicationData({ 
                          ...applicationData, 
                          address_line_2: e.target.value 
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input 
                        id="city" 
                        placeholder="New York"
                        value={applicationData.city}
                        onChange={(e) => setApplicationData({ 
                          ...applicationData, 
                          city: e.target.value 
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select
                        value={applicationData.state}
                        onValueChange={(value) => setApplicationData({ 
                          ...applicationData, 
                          state: value 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {stateOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                         ssName="text-lg font-semibold flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Required Documents
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-dashed">
                      <CardContent className="p-6 text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium">W-2 Forms</p>
                        <p className="text-xs text-muted-foreground">Upload your W-2 forms</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Choose Files
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="border-dashed">
                      <CardContent className="p-6 text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium">1099 Forms</p>
                        <p className="text-xs text-muted-foreground">Upload any 1099 forms</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Choose Files
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1">
                    Save as Draft
                  </Button>
                  <Button className="flex-1">
                    Submit Application
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Application Status */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Track the progress of your tax refund applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((app) => (
                  <Card key={app.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(app.status)}
                            <span className="font-medium">{app.id}</span>
                          </div>
                          <Badge className={getStatusColor(app.status)}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            ${(app.actualRefund || app.estimatedRefund).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {app.actualRefund ? 'Refund Amount' : 'Estimated'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid gap-2 md:grid-cols-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Submitted:</span>
                          <div>{app.submittedDate ? new Date(app.submittedDate).toLocaleDateString() : 'Not submitted'}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Processing Time:</span>
                          <div>{app.processingTime}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="capitalize">{app.status.replace('-', ' ')}</div>
                        </div>
                      </div>

                      {app.status === 'processing' && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Processing Progress</span>
                            <span>65%</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        {app.status === 'draft' && (
                          <Button size="sm">
                            Continue Application
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">$3,770</div>
                    <div className="text-sm text-muted-foreground">Total Refunds</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">2</div>
                    <div className="text-sm text-muted-foreground">Applications</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">7-14</div>
                    <div className="text-sm text-muted-foreground">Days Processing</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxRefund;