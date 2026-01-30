import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Banknote, CheckCircle, XCircle, Clock, DollarSign, Loader2 } from "lucide-react";
import { adminLoanService, AdminLoan } from "@/services/loanService";

const LoanManagement: React.FC = () => {
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingLoan, setProcessingLoan] = useState<number | null>(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const data = await adminLoanService.getAll();
      setLoans(data);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveLoan = async (loanId: number) => {
    setProcessingLoan(loanId);
    try {
      const loan = loans.find(l => l.id === loanId);
      await adminLoanService.approve(loanId, {
        approved_amount: loan?.requested_amount || "0",
        interest_rate: "5.0",
        approval_notes: "Approved by admin"
      });
      await fetchLoans();
    } catch (error) {
      console.error("Failed to approve loan:", error);
    } finally {
      setProcessingLoan(null);
    }
  };

  const handleRejectLoan = async (loanId: number) => {
    setProcessingLoan(loanId);
    try {
      await adminLoanService.reject(loanId, {
        rejection_reason: "Application does not meet requirements"
      });
      await fetchLoans();
    } catch (error) {
      console.error("Failed to reject loan:", error);
    } finally {
      setProcessingLoan(null);
    }
  };

  const handleDisburseLoan = async (loanId: number) => {
    setProcessingLoan(loanId);
    try {
      await adminLoanService.disburse(loanId);
      await fetchLoans();
    } catch (error) {
      console.error("Failed to disburse loan:", error);
    } finally {
      setProcessingLoan(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const getStatusClass = (status: string) => {
      switch (status) {
        case 'APPROVED':
          return 'bg-green-500/10 text-green-500 ring-green-500/20';
        case 'REJECTED':
        case 'DEFAULTED':
          return 'bg-red-500/10 text-red-500 ring-red-500/20';
        case 'ACTIVE':
          return 'bg-purple-500/10 text-purple-500 ring-purple-500/20';
        case 'PAID_OFF':
          return 'bg-gray-500/10 text-gray-500 ring-gray-500/20';
        default:
          return 'bg-yellow-500/10 text-yellow-500 ring-yellow-500/20';
      }
    };

    const getIcon = (status: string) => {
      switch (status) {
        case 'APPROVED':
          return CheckCircle;
        case 'REJECTED':
        case 'DEFAULTED':
          return XCircle;
        case 'ACTIVE':
          return Banknote;
        case 'PAID_OFF':
          return CheckCircle;
        default:
          return Clock;
      }
    };

    const Icon = getIcon(status);
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset gap-1 ${getStatusClass(status)}`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const pendingLoans = loans.filter(loan => loan.status === 'PENDING');
  const approvedLoans = loans.filter(loan => loan.status === 'APPROVED');
  const activeLoans = loans.filter(loan => loan.status === 'ACTIVE');
  const totalLoanAmount = loans
    .filter(loan => loan.status === 'ACTIVE')
    .reduce((sum: number, loan: AdminLoan) => sum + parseFloat(loan.outstanding_balance), 0);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-display bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Loan Management
        </h1>
        <p className="text-muted-foreground">Manage customer loan applications and disbursements.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLoans.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Loans</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedLoans.length}</div>
            <p className="text-xs text-muted-foreground">Ready for disbursement</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Banknote className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalLoanAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Outstanding loan amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Loans Table */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>All Loan Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{loan.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{loan.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${parseFloat(loan.requested_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>{loan.purpose}</TableCell>
                  <TableCell>{loan.term_months} months</TableCell>
                  <TableCell>
                    {loan.interest_rate ? parseFloat(loan.interest_rate).toFixed(2) + '%' : 'TBD'}
                  </TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  <TableCell>{new Date(loan.application_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {loan.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApproveLoan(loan.id)}
                            disabled={processingLoan === loan.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingLoan === loan.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectLoan(loan.id)}
                            disabled={processingLoan === loan.id}
                          >
                            {processingLoan === loan.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            Reject
                          </Button>
                        </>
                      )}
                      {loan.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleDisburseLoan(loan.id)}
                          disabled={processingLoan === loan.id}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {processingLoan === loan.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <DollarSign className="h-3 w-3" />
                          )}
                          Disburse
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loans.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No loan applications found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanManagement;