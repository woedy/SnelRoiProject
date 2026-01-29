import { apiRequest } from '@/lib/api';

export interface VirtualCard {
  id: number;
  customer_name: string;
  customer_email: string;
  account_number: string;
  account_balance: string | number;
  card_number: string;
  masked_number: string;
  last_four: string;
  card_holder_name: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  card_type: 'STANDARD' | 'PREMIUM' | 'BUSINESS';
  card_type_display: string;
  status: 'PENDING' | 'ACTIVE' | 'FROZEN' | 'CANCELLED' | 'EXPIRED';
  status_display: string;
  daily_limit: string;
  monthly_limit: string;
  is_online_enabled: boolean;
  is_contactless_enabled: boolean;
  is_international_enabled: boolean;
  is_expired: boolean;
  approved_by: number | null;
  approved_at: string | null;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface VirtualCardApproval {
  action: 'approve' | 'decline';
  admin_notes?: string;
}

export const virtualCardService = {
  // Get all virtual cards (admin)
  getAll: async (filters?: { status?: string; customer?: string }): Promise<VirtualCard[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customer) params.append('customer', filters.customer);
    
    const url = `/admin/virtual-cards/${params.toString() ? `?${params.toString()}` : ''}`;
    return apiRequest<VirtualCard[]>(url);
  },

  // Get specific virtual card (admin)
  getById: async (id: number): Promise<VirtualCard> => {
    return apiRequest<VirtualCard>(`/admin/virtual-cards/${id}/`);
  },

  // Update admin notes
  updateNotes: async (id: number, admin_notes: string): Promise<VirtualCard> => {
    return apiRequest<VirtualCard>(`/admin/virtual-cards/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ admin_notes }),
    });
  },

  // Approve or decline virtual card application
  processApplication: async (id: number, approval: VirtualCardApproval): Promise<{ detail: string; card: VirtualCard }> => {
    return apiRequest<{ detail: string; card: VirtualCard }>(`/admin/virtual-cards/${id}/approve/`, {
      method: 'POST',
      body: JSON.stringify(approval),
    });
  },
};