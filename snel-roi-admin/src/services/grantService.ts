import { api } from '@/lib/api';

export interface Grant {
  id: string;
  title: string;
  description: string;
  category: string;
  category_display: string;
  provider: string;
  amount: number;
  deadline: string;
  status: string;
  status_display: string;
  eligibility_requirements: string[];
  applications_count: number;
  created_by_name: string;
  created_at: string;
}

export interface GrantApplication {
  id: string;
  grant_details: Grant;
  customer_name: string;
  first_name: string;
  last_name: string;
  email: string;
  organization: string;
  project_title: string;
  project_description: string;
  requested_amount: number;
  project_timeline: string;
  status: string;
  status_display: string;
  submitted_at: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
}

export interface CreateGrantData {
  title: string;
  description: string;
  category: string;
  provider: string;
  amount: number;
  deadline: string;
  eligibility_requirements: string[];
}

export interface UpdateGrantData extends Partial<CreateGrantData> {
  status?: string;
}

export interface ApproveApplicationData {
  action: 'approve';
  admin_notes?: string;
}

export interface RejectApplicationData {
  action: 'reject';
  rejection_reason: string;
  admin_notes?: string;
}

export const adminGrantService = {
  // Get all grants (admin view)
  async getGrants(params?: {
    status?: string;
  }): Promise<Grant[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) {
      searchParams.append('status', params.status);
    }

    const response = await api.get<Grant[]>(`/admin/grants/?${searchParams.toString()}`);
    return response;
  },

  // Get grant details
  async getGrant(id: string): Promise<Grant> {
    const response = await api.get<Grant>(`/admin/grants/${id}/`);
    return response;
  },

  // Create new grant
  async createGrant(data: CreateGrantData): Promise<Grant> {
    const response = await api.post<Grant>('/admin/grants/', data);
    return response;
  },

  // Update grant
  async updateGrant(id: string, data: UpdateGrantData): Promise<Grant> {
    const response = await api.put<Grant>(`/admin/grants/${id}/`, data);
    return response;
  },

  // Get all grant applications (admin view)
  async getGrantApplications(params?: {
    status?: string;
    grant_id?: string;
  }): Promise<GrantApplication[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) {
      searchParams.append('status', params.status);
    }
    if (params?.grant_id) {
      searchParams.append('grant_id', params.grant_id);
    }

    const response = await api.get<GrantApplication[]>(`/admin/grant-applications/?${searchParams.toString()}`);
    return response;
  },

  // Get grant application details
  async getGrantApplication(id: string): Promise<GrantApplication> {
    const response = await api.get<GrantApplication>(`/admin/grant-applications/${id}/`);
    return response;
  },

  // Approve grant application
  async approveGrantApplication(id: string, data: ApproveApplicationData): Promise<GrantApplication> {
    const response = await api.patch<GrantApplication>(`/admin/grant-applications/${id}/`, data);
    return response;
  },

  // Reject grant application
  async rejectGrantApplication(id: string, data: RejectApplicationData): Promise<GrantApplication> {
    const response = await api.patch<GrantApplication>(`/admin/grant-applications/${id}/`, data);
    return response;
  },

  // Get grant categories
  getGrantCategories() {
    return [
      { value: 'BUSINESS', label: 'Business' },
      { value: 'EDUCATION', label: 'Education' },
      { value: 'HEALTHCARE', label: 'Healthcare' },
      { value: 'TECHNOLOGY', label: 'Technology' },
      { value: 'ENVIRONMENT', label: 'Environment' },
      { value: 'ARTS', label: 'Arts & Culture' },
    ];
  },

  // Get grant statuses
  getGrantStatuses() {
    return [
      { value: 'AVAILABLE', label: 'Available' },
      { value: 'CLOSED', label: 'Closed' },
      { value: 'SUSPENDED', label: 'Suspended' },
    ];
  },

  // Get application statuses
  getApplicationStatuses() {
    return [
      { value: 'DRAFT', label: 'Draft' },
      { value: 'SUBMITTED', label: 'Submitted' },
      { value: 'UNDER_REVIEW', label: 'Under Review' },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'REJECTED', label: 'Rejected' },
    ];
  }
};