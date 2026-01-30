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
}

export interface ProfileData {
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

export const kycService = {
  // Profile operations
  getProfile: (): Promise<ProfileData> => {
    return apiRequest<ProfileData>('/profile/');
  },

  updateProfile: (data: Partial<ProfileData>): Promise<ProfileData> => {
    return apiRequest<ProfileData>('/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // KYC document operations
  getKYCDocuments: (): Promise<KYCDocument[]> => {
    return apiRequest<KYCDocument[]>('/kyc/documents/');
  },

  uploadKYCDocument: (formData: FormData): Promise<KYCDocument> => {
    return apiRequest<KYCDocument>('/kyc/documents/', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  },

  deleteKYCDocument: (documentId: number): Promise<void> => {
    return apiRequest<void>(`/kyc/documents/${documentId}/`, {
      method: 'DELETE',
    });
  },

  submitKYC: (): Promise<{ detail: string; kyc_status: string }> => {
    return apiRequest<{ detail: string; kyc_status: string }>('/kyc/submit/', {
      method: 'POST',
    });
  },
};

export const DOCUMENT_TYPES = [
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'NATIONAL_ID', label: 'National ID Card' },
  { value: 'DRIVERS_LICENSE', label: 'Driver\'s License' },
  { value: 'UTILITY_BILL', label: 'Utility Bill' },
  { value: 'BANK_STATEMENT', label: 'Bank Statement' },
  { value: 'PROOF_OF_ADDRESS', label: 'Proof of Address' },
  { value: 'SELFIE', label: 'Selfie with ID' },
];

export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
  { value: '', label: 'Prefer not to say' },
];

export const getKYCStatusColor = (status: string) => {
  switch (status) {
    case 'VERIFIED':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'UNDER_REVIEW':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'REJECTED':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getDocumentStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'text-green-600 bg-green-50';
    case 'REJECTED':
      return 'text-red-600 bg-red-50';
    case 'EXPIRED':
      return 'text-orange-600 bg-orange-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};