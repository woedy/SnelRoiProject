import { apiRequest } from '@/lib/api';

export interface KYCDocument {
  id: number;
  document_type: string;
  document_type_display: string;
  document_file: string;
  document_url: string;
  document_number: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  status_display: string;
  rejection_reason: string;
  verified_by: number | null;
  verified_at: string | null;
  admin_notes: string;
  uploaded_at: string;
  updated_at: string;
  expires_at: string | null;
  file_size: number | null;
  customer: {
    id: number;
    full_name: string;
    user: {
      email: string;
    };
  };
}

export interface CustomerProfile {
  id: number;
  full_name: string;
  middle_name: string;
  phone: string;
  country: string;
  preferred_language: string;
  date_of_birth: string | null;
  gender: string;
  gender_display: string;
  nationality: string;
  occupation: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state_province: string;
  postal_code: string;
  kyc_status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  kyc_status_display: string;
  kyc_submitted_at: string | null;
  kyc_verified_at: string | null;
  kyc_rejection_reason: string;
  tier: 'STANDARD' | 'PREMIUM' | 'VIP';
  tier_display: string;
  profile_completion_percentage: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_active: boolean;
  };
}

export const adminKycService = {
  // KYC document operations
  getKYCDocuments: (params?: {
    status?: string;
    customer?: string;
  }): Promise<KYCDocument[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.customer) searchParams.append('customer', params.customer);
    
    const queryString = searchParams.toString();
    return apiRequest<KYCDocument[]>(`/admin/kyc/documents/${queryString ? `?${queryString}` : ''}`);
  },

  getKYCDocument: (documentId: number): Promise<KYCDocument> => {
    return apiRequest<KYCDocument>(`/admin/kyc/documents/${documentId}/`);
  },

  verifyKYCDocument: (
    documentId: number,
    data: {
      action: 'approve' | 'reject';
      admin_notes?: string;
      rejection_reason?: string;
    }
  ): Promise<KYCDocument> => {
    return apiRequest<KYCDocument>(`/admin/kyc/documents/${documentId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Customer profile operations
  getKYCProfiles: (params?: {
    kyc_status?: string;
    customer?: string;
  }): Promise<CustomerProfile[]> => {
    const searchParams = new URLSearchParams();
    if (params?.kyc_status) searchParams.append('kyc_status', params.kyc_status);
    if (params?.customer) searchParams.append('customer', params.customer);
    
    const queryString = searchParams.toString();
    return apiRequest<CustomerProfile[]>(`/admin/kyc/profiles/${queryString ? `?${queryString}` : ''}`);
  },
};

export const getKYCStatusColor = (status: string) => {
  switch (status) {
    case 'VERIFIED':
      return 'bg-green-100 text-green-800';
    case 'UNDER_REVIEW':
      return 'bg-blue-100 text-blue-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getDocumentStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'EXPIRED':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};