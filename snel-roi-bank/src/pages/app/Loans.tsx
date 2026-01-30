import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { loanService, type Loan } from '@/services/loanService';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Eye
} from 'lucide-react';

const Loans = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const data = await loanService.getAll();
      setLoans(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch loans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Loans</h1>
            <p className="text-muted-foreground">Manage your loan applications and active loans</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-muted-foreground">Manage your loan applications and active loans</p>
        </div>
        <Button onClick={() => navigate('/app/loans/apply')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Apply for Loan
        </Button>
      </div>

      {loans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No loans yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Apply for your first loan to get started with our lending services.
            </p>
            <Button onClick={() => navigate('/app/loans/apply')}>
              Apply for Loan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {loans.map((loan) => (
            <Card key={loan.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {loan.loan_type_display}
                      <Badge className={getStatusColor(loan.status)}>
                        {getStatusIcon(loan.status)}
                        <span className="ml-1">{loan.status_display}</span>
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Applied on {formatDate(loan.application_date)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/app/loans/${loan.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
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

                {loan.status === 'ACTIVE' && (
                  <>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="font-semibold">{formatCurrency(loan.monthly_payment)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                        <p className="font-semibold">{formatCurrency(loan.outstanding_balance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Payment</p>
                        <p className="font-semibold">{formatDate(loan.first_payment_date)}</p>
                      </div>
                    </div>
                  </>
                )}

                {loan.rejection_reason && (
                  <>
                    <Separator className="my-4" />
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-400">
                        <strong>Rejection Reason:</strong> {loan.rejection_reason}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Loans;