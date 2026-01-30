import { apiRequest } from '@/lib/api';

export interface VirtualCard {
  id: number;
  customer_name: string;
  customer_email: string;
  account_number: string;
  account_balance: number;
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

export interface VirtualCardApplication {
  card_type: 'STANDARD' | 'PREMIUM' | 'BUSINESS';
  daily_limit: string;
  monthly_limit: string;
  is_international_enabled: boolean;
}

export interface VirtualCardUpdate {
  daily_limit?: string;
  monthly_limit?: string;
  is_online_enabled?: boolean;
  is_contactless_enabled?: boolean;
  is_international_enabled?: boolean;
}

export const virtualCardService = {
  // Get all user's virtual cards
  getAll: async (): Promise<VirtualCard[]> => {
    return apiRequest<VirtualCard[]>('/virtual-cards/');
  },

  // Get specific virtual card
  getById: async (id: number): Promise<VirtualCard> => {
    return apiRequest<VirtualCard>(`/virtual-cards/${id}/`);
  },

  // Apply for new virtual card
  apply: async (application: VirtualCardApplication): Promise<VirtualCard> => {
    return apiRequest<VirtualCard>('/virtual-cards/', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  },

  // Update virtual card settings
  update: async (id: number, updates: VirtualCardUpdate): Promise<VirtualCard> => {
    return apiRequest<VirtualCard>(`/virtual-cards/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Cancel virtual card
  cancel: async (id: number): Promise<{ detail: string }> => {
    return apiRequest<{ detail: string }>(`/virtual-cards/${id}/`, {
      method: 'DELETE',
    });
  },

  // Freeze/unfreeze virtual card
  toggleFreeze: async (id: number): Promise<{ detail: string; card: VirtualCard }> => {
    return apiRequest<{ detail: string; card: VirtualCard }>(`/virtual-cards/${id}/toggle-freeze/`, {
      method: 'POST',
    });
  },
};