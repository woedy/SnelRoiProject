import { apiRequest } from '@/lib/api';

export interface AdminLoan {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_kyc_status: string;
  customer_tier: string;
  loan_type: 'PERSONAL' | 'BUSINESS' | 'MORTGAGE' | 'AUTO' | 'EDUCATION';
  loan_type_display: string;
  requested_amount: string;
  approved_amount: string | null;
  interest_rate: string | null;
  term_months: number;
  repayment_frequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  repayment_frequency_display: string;
  purpose: string;
  employment_status: string;
  annual_income: string | null;
  monthly_expenses: string | null;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'PAID_OFF' | 'DEFAULTED';
  status_display: string;
  application_date: string;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  approval_notes: string;
  rejection_reason: string;
  disbursed_at: string | null;
  first_payment_date: string | null;
  maturity_date: string | null;
  monthly_payment: string | null;
  total_interest: string | null;
  total_amount: string | null;
  outstanding_balance: string;
  application_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LoanApproval {
  approved_amount: string;
  interest_rate: string;
  approval_notes?: string;
}

export interface LoanRejection {
  rejection_reason: string;
}

export const adminLoanService = {
  // Get all loans for admin review
  getAll: async (status?: string): Promise<AdminLoan[]> => {
    const params = status ? `?status=${status}` : '';
    return apiRequest<AdminLoan[]>(`/admin/loans/${params}`);
  },

  // Get specific loan details for admin
  getById: async (id: number): Promise<AdminLoan> => {
    return apiRequest<AdminLoan>(`/admin/loans/${id}/`);
  },

  // Approve loan application
  approve: async (id: number, approval: LoanApproval): Promise<AdminLoan> => {
    return apiRequest<AdminLoan>(`/admin/loans/${id}/approve/`, {
      method: 'POST',
      body: JSON.stringify(approval),
    });
  },

  // Reject loan application
  reject: async (id: number, rejection: LoanRejection): Promise<AdminLoan> => {
    return apiRequest<AdminLoan>(`/admin/loans/${id}/reject/`, {
      method: 'POST',
      body: JSON.stringify(rejection),
    });
  },

  // Disburse approved loan funds
  disburse: async (id: number): Promise<{
    detail: string;
    reference: string;
    loan: AdminLoan;
  }> => {
    return apiRequest(`/admin/loans/${id}/disburse/`, {
      method: 'POST',
    });
  },

  // Get loan status options for filtering
  getStatusOptions: () => [
    { value: '', label: 'All Loans' },
    { value: 'PENDING', label: 'Pending Review' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PAID_OFF', label: 'Paid Off' },
    { value: 'DEFAULTED', label: 'Defaulted' },
  ],

  // Calculate estimated monthly payment (client-side calculation)
  calculateMonthlyPayment: (principal: number, annualRate: number, termMonths: number): number => {
    if (annualRate === 0) {
      return principal / termMonths;
    }
    
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    return Math.round(monthlyPayment * 100) / 100;
  },
};