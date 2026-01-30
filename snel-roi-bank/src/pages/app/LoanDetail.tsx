import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loanService, type Loan, type LoanPayment } from '@/services/loanService';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CreditCard,
  FileText,
  Download
} from 'lucide-react';

const paymentSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => parseFloat(val) > 0,
    'Amount must be greater than 0'
  ),
});

type PaymentForm = z.infer<typeof paymentSchema>;

const LoanDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
  });

  useEffect(() => {
    if (id) {
      fetchLoanDetails();
      fetchPayments();
    }
  }, [id]);

  const fetchLoanDetails = async () => {
    try {
      const data = await loanService.getById(parseInt(id!));
      setLoan(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch loan details',
        variant: 'destructive',
      });
      navigate('/app/loans');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await loanService.getPayments(parseInt(id!));
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const handlePayment = async (data: PaymentForm) => {
    if (paymentLoading || !loan) return;

    setPaymentLoading(true);
    try {
      const result = await loanService.makePayment(loan.id, { amount: data.amount });
      
      toast({
        title: 'Payment Successful',
        description: `Payment of $${data.amount} has been processed. Reference: ${result.reference}`,
      });
      
      setPaymentDialogOpen(false);
      form.reset();
      
      // Refresh loan details and payments
      await fetchLoanDetails();
      await fetchPayments();
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'UNDER_REVIEW':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
      case 'ACTIVE':
      case 'PAID_OFF':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
      case 'DEFAULTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'PAID_OFF':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'DEFAULTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/loans')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Loan not found</h3>
          <Button onClick={() => navigate('/app/loans')} className="mt-4">
            Back to Loans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/loans')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{loan.loan_type_display}</h1>
          <p className="text-muted-foreground">Loan ID: {loan.id}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Loan Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Loan Overview</CardTitle>
                  <CardDescription>
                    Applied on {formatDate(loan.application_date)}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(loan.status)}>
                  {getStatusIcon(loan.status)}
                  <span className="ml-1">{loan.status_display}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Requested</p>
                    <p className="font-semibold">{formatCurrency(loan.requested_amount)}</p>
                  </div>
                </div>
                
                {loan.approved_amount && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="font-semibold">{formatCurrency(loan.approved_amount)}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Term</p>
                    <p className="font-semibold">{loan.term_months} months</p>
                  </div>
                </div>
                
                {loan.interest_rate && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold">{loan.interest_rate}%</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div>
                <h4 className="font-semibold mb-2">Purpose</h4>
                <p className="text-sm text-muted-foreground">{loan.purpose}</p>
              </div>

              {loan.approval_notes && (
                <>
                  <Separator className="my-4" />
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-400 mb-1">
                      Approval Notes
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {loan.approval_notes}
                    </p>
                  </div>
                </>
              )}

              {loan.rejection_reason && (
                <>
                  <Separator className="my-4" />
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <h4 className="font-semibold text-red-800 dark:text-red-400 mb-1">
                      Rejection Reason
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {loan.rejection_reason}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          {loan.status === 'ACTIVE' && payments.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Payment Schedule</CardTitle>
                    <CardDescription>
                      Your loan payment schedule and history
                    </CardDescription>
                  </div>
                  <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Make Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Make Loan Payment</DialogTitle>
                        <DialogDescription>
                          Enter the amount you want to pay towards your loan
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Amount</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="0.00"
                                      className="pl-9"
                                      min="0.01"
                                      step="0.01"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setPaymentDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={paymentLoading}>
                              {paymentLoading ? 'Processing...' : 'Make Payment'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment #</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.slice(0, 10).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.payment_number}</TableCell>
                        <TableCell>{formatDate(payment.due_date)}</TableCell>
                        <TableCell>{formatCurrency(payment.scheduled_amount)}</TableCell>
                        <TableCell>{formatCurrency(payment.principal_amount)}</TableCell>
                        <TableCell>{formatCurrency(payment.interest_amount)}</TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            {payment.status_display}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {payments.length > 10 && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing first 10 payments. Total: {payments.length} payments
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {loan.status === 'ACTIVE' && (
            <Card>
              <CardHeader>
                <CardTitle>Loan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Payment:</span>
                  <span className="font-semibold">{formatCurrency(loan.monthly_payment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Outstanding Balance:</span>
                  <span className="font-semibold">{formatCurrency(loan.outstanding_balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Next Payment:</span>
                  <span className="font-semibold">{formatDate(loan.first_payment_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Maturity Date:</span>
                  <span className="font-semibold">{formatDate(loan.maturity_date)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employment:</span>
                <span>{loan.employment_status}</span>
              </div>
              {loan.annual_income && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Income:</span>
                  <span>{formatCurrency(loan.annual_income)}</span>
                </div>
              )}
              {loan.monthly_expenses && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Expenses:</span>
                  <span>{formatCurrency(loan.monthly_expenses)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Repayment:</span>
                <span>{loan.repayment_frequency_display}</span>
              </div>
              {loan.total_interest && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Interest:</span>
                  <span>{formatCurrency(loan.total_interest)}</span>
                </div>
              )}
              {loan.total_amount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span>{formatCurrency(loan.total_amount)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoanDetail;