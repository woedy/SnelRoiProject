import { apiRequest } from '@/lib/api';

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
  is_deadline_soon: boolean;
  created_at: string;
}

export interface GrantApplication {
  id: string;
  grant: string;
  grant_details: Grant;
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
  submitted_at: string | null;
  created_at: string;
}

export interface CreateGrantApplicationData {
  grant: string;
  first_name: string;
  last_name: string;
  email: string;
  organization?: string;
  project_title: string;
  project_description: string;
  requested_amount: number;
  project_timeline: string;
}

export const grantService = {
  // Get available grants
  async getGrants(params?: {
    category?: string;
    search?: string;
  }): Promise<Grant[]> {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== 'all') {
      searchParams.append('category', params.category);
    }
    if (params?.search) {
      searchParams.append('search', params.search);
    }

    return apiRequest(`/grants/?${searchParams.toString()}`);
  },

  // Get user's grant applications
  async getGrantApplications(params?: {
    status?: string;
  }): Promise<GrantApplication[]> {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'all') {
      searchParams.append('status', params.status);
    }

    return apiRequest(`/grant-applications/?${searchParams.toString()}`);
  },

  // Create a new grant application
  async createGrantApplication(data: CreateGrantApplicationData): Promise<GrantApplication> {
    return apiRequest('/grant-applications/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get grant application details
  async getGrantApplication(id: string): Promise<GrantApplication> {
    return apiRequest(`/grant-applications/${id}/`);
  },

  // Submit grant application
  async submitGrantApplication(id: string): Promise<GrantApplication> {
    return apiRequest(`/grant-applications/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'submit' }),
    });
  },

  // Get grant categories for filtering
  getGrantCategories() {
    return [
      { value: 'all', label: 'All Categories' },
      { value: 'BUSINESS', label: 'Business' },
      { value: 'EDUCATION', label: 'Education' },
      { value: 'HEALTHCARE', label: 'Healthcare' },
      { value: 'TECHNOLOGY', label: 'Technology' },
      { value: 'ENVIRONMENT', label: 'Environment' },
      { value: 'ARTS', label: 'Arts & Culture' },
    ];
  },

  // Get application statuses for filtering
  getApplicationStatuses() {
    return [
      { value: 'all', label: 'All Status' },
      { value: 'DRAFT', label: 'Draft' },
      { value: 'SUBMITTED', label: 'Submitted' },
      { value: 'UNDER_REVIEW', label: 'Under Review' },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'REJECTED', label: 'Rejected' },
    ];
  }
};