import { apiRequest } from '@/lib/api';

export interface TaxRefundApplication {
  id: number;
  application_number: string;
  tax_year: number;
  status: string;
  status_display: string;
  customer_name: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  ssn: string;
  date_of_birth: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  phone_number?: string;
  email_address: string;
  filing_status: string;
  filing_status_display: string;
  total_income: number;
  federal_tax_withheld: number;
  state_tax_withheld: number;
  estimated_tax_paid: number;
  number_of_dependents: number;
  use_standard_deduction: boolean;
  mortgage_interest: number;
  charitable_donations: number;
  medical_expenses: number;
  business_expenses: number;
  education_expenses: number;
  other_deductions: number;
  total_deductions: number;
  estimated_refund?: number;
  approved_refund?: number;
  submitted_at?: string;
  reviewed_at?: string;
  processed_at?: string;
  processing_time_estimate: string;
  refund_method: string;
  admin_notes?: string;
  rejection_reason?: string;
  reviewed_by_name?: string;
  documents: TaxRefundDocument[];
  created_at: string;
  updated_at: string;
}

export interface TaxRefundDocument {
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

export interface TaxRefundStats {
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

export interface TaxRefundApprovalData {
  action: 'approve' | 'reject';
  approved_refund?: number;
  admin_notes?: string;
  rejection_reason?: string;
}

export const adminTaxRefundService = {
  // Get all tax refund applications (admin)
  getApplications: async (params?: { status?: string; tax_year?: string }): Promise<TaxRefundApplication[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.tax_year) searchParams.append('tax_year', params.tax_year);
    
    const queryString = searchParams.toString();
    return apiRequest(`/admin/tax-refunds/${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific tax refund application (admin)
  getApplication: async (id: number): Promise<TaxRefundApplication> => {
    return apiRequest(`/admin/tax-refunds/${id}/`);
  },

  // Process (approve/reject) a tax refund application
  processApplication: async (id: number, data: TaxRefundApprovalData): Promise<TaxRefundApplication> => {
    return apiRequest(`/admin/tax-refunds/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Get tax refund statistics
  getStats: async (year?: string): Promise<TaxRefundStats> => {
    const queryString = year ? `?year=${year}` : '';
    return apiRequest(`/admin/tax-refunds/stats/${queryString}`);
  },

  // Get status options for filtering
  getStatusOptions: () => [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'PROCESSED', label: 'Processed' },
  ],

  // Get filing status options
  getFilingStatusOptions: () => [
    { value: 'SINGLE', label: 'Single' },
    { value: 'MARRIED_JOINT', label: 'Married Filing Jointly' },
    { value: 'MARRIED_SEPARATE', label: 'Married Filing Separately' },
    { value: 'HEAD_HOUSEHOLD', label: 'Head of Household' },
    { value: 'QUALIFYING_WIDOW', label: 'Qualifying Widow(er)' },
  ],

  // Get document type options
  getDocumentTypeOptions: () => [
    { value: 'W2', label: 'W-2 Form' },
    { value: '1099', label: '1099 Form' },
    { value: '1098', label: '1098 Form (Mortgage Interest)' },
    { value: 'RECEIPTS', label: 'Receipts/Supporting Documents' },
    { value: 'PREVIOUS_RETURN', label: 'Previous Year Tax Return' },
    { value: 'ID_DOCUMENT', label: 'Identification Document' },
    { value: 'OTHER', label: 'Other' },
  ],

  // Helper functions
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  getStatusColor: (status: string): string => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      PROCESSED: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },
};