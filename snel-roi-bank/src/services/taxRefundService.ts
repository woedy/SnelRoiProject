import { apiRequest } from '@/lib/api';

export interface TaxRefundCalculatorData {
  tax_year?: number;
  filing_status: string;
  total_income: number;
  federal_tax_withheld: number;
  estimated_tax_paid?: number;
  number_of_dependents?: number;
  use_standard_deduction?: boolean;
  mortgage_interest?: number;
  charitable_donations?: number;
  medical_expenses?: number;
  business_expenses?: number;
  education_expenses?: number;
  other_deductions?: number;
}

export interface TaxRefundEstimate {
  estimated_refund: number;
  total_deductions: number;
  taxable_income: number;
  calculated_tax: number;
  child_tax_credit: number;
  total_tax_paid: number;
  breakdown: {
    income: number;
    deductions: number;
    taxable_income: number;
    tax_owed: number;
    tax_paid: number;
    refund: number;
  };
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

export interface TaxRefundApplication {
  id: number;
  application_number: string;
  tax_year: number;
  status: string;
  status_display: string;
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
  documents: TaxRefundDocument[];
  customer_name: string;
  created_at: string;
  updated_at: string;
}

export interface TaxRefundApplicationCreate {
  tax_year?: number;
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
  total_income: number;
  federal_tax_withheld: number;
  state_tax_withheld?: number;
  estimated_tax_paid?: number;
  number_of_dependents?: number;
  use_standard_deduction?: boolean;
  mortgage_interest?: number;
  charitable_donations?: number;
  medical_expenses?: number;
  business_expenses?: number;
  education_expenses?: number;
  other_deductions?: number;
  refund_method?: string;
}

export const taxRefundService = {
  // Calculate estimated tax refund
  calculateRefund: async (data: TaxRefundCalculatorData): Promise<TaxRefundEstimate> => {
    return apiRequest('/tax-refunds/calculator/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all tax refund applications for the user
  getApplications: async (): Promise<TaxRefundApplication[]> => {
    return apiRequest('/tax-refunds/');
  },

  // Get a specific tax refund application
  getApplication: async (id: number): Promise<TaxRefundApplication> => {
    return apiRequest(`/tax-refunds/${id}/`);
  },

  // Create a new tax refund application
  createApplication: async (data: TaxRefundApplicationCreate): Promise<TaxRefundApplication> => {
    return apiRequest('/tax-refunds/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update a tax refund application (draft only)
  updateApplication: async (id: number, data: Partial<TaxRefundApplicationCreate>): Promise<TaxRefundApplication> => {
    return apiRequest(`/tax-refunds/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Submit a tax refund application for review
  submitApplication: async (id: number): Promise<TaxRefundApplication> => {
    return apiRequest(`/tax-refunds/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'submit' }),
    });
  },

  // Upload a document for a tax refund application
  uploadDocument: async (applicationId: number, file: File, documentType: string): Promise<TaxRefundDocument> => {
    const formData = new FormData();
    formData.append('document_file', file);
    formData.append('document_type', documentType);
    formData.append('document_name', file.name);

    return apiRequest(`/tax-refunds/${applicationId}/documents/`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it for FormData
      headers: {},
    });
  },

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

  // Get US states options
  getStateOptions: () => [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
  ],
};