import { apiRequest } from '@/lib/api';

export interface Loan {
  id: number;
  customer_name: string;
  customer_email: string;
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
  created_at: string;
  updated_at: string;
}

export interface LoanApplication {
  loan_type: 'PERSONAL' | 'BUSINESS' | 'MORTGAGE' | 'AUTO' | 'EDUCATION';
  requested_amount: string;
  term_months: number;
  purpose: string;
  employment_status: string;
  annual_income?: string;
  monthly_expenses?: string;
  repayment_frequency?: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  application_data?: Record<string, any>;
}

export interface LoanPayment {
  id: number;
  payment_number: number;
  due_date: string;
  scheduled_amount: string;
  paid_amount: string;
  principal_amount: string | null;
  interest_amount: string | null;
  status: 'SCHEDULED' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  status_display: string;
  paid_at: string | null;
  created_at: string;
}

export interface LoanPaymentRequest {
  amount: string;
}

export const loanService = {
  // Get all user's loans
  getAll: async (): Promise<Loan[]> => {
    return apiRequest<Loan[]>('/loans/');
  },

  // Get specific loan details
  getById: async (id: number): Promise<Loan> => {
    return apiRequest<Loan>(`/loans/${id}/`);
  },

  // Apply for a new loan
  apply: async (application: LoanApplication): Promise<Loan> => {
    return apiRequest<Loan>('/loans/', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  },

  // Get loan payment schedule
  getPayments: async (loanId: number): Promise<LoanPayment[]> => {
    return apiRequest<LoanPayment[]>(`/loans/${loanId}/payments/`);
  },

  // Make a loan payment
  makePayment: async (loanId: number, payment: LoanPaymentRequest): Promise<{
    detail: string;
    reference: string;
    outstanding_balance: string;
  }> => {
    return apiRequest(`/loans/${loanId}/payments/`, {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  },

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

  // Get loan type options
  getLoanTypes: () => [
    { value: 'PERSONAL', label: 'Personal Loan', description: 'For personal expenses, debt consolidation, or major purchases' },
    { value: 'BUSINESS', label: 'Business Loan', description: 'For business expansion, equipment, or working capital' },
    { value: 'MORTGAGE', label: 'Mortgage', description: 'For home purchase or refinancing' },
    { value: 'AUTO', label: 'Auto Loan', description: 'For vehicle purchase or refinancing' },
    { value: 'EDUCATION', label: 'Education Loan', description: 'For tuition, books, and educational expenses' },
  ],

  // Get repayment frequency options
  getRepaymentFrequencies: () => [
    { value: 'MONTHLY', label: 'Monthly', description: 'Pay every month' },
    { value: 'QUARTERLY', label: 'Quarterly', description: 'Pay every 3 months' },
    { value: 'SEMI_ANNUAL', label: 'Semi-Annual', description: 'Pay every 6 months' },
    { value: 'ANNUAL', label: 'Annual', description: 'Pay once a year' },
  ],
};