import { apiRequest } from '@/lib/api';

export interface Notification {
  id: number;
  notification_type: 'TRANSACTION' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'KYC' | 'SECURITY' | 'SYSTEM' | 'VIRTUAL_CARD' | 'CRYPTO' | 'SUPPORT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  title: string;
  message: string;
  action_url?: string;
  metadata: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total_count: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface NotificationFilters {
  is_read?: boolean;
  type?: string;
  page?: number;
  page_size?: number;
}

export const notificationService = {
  // Get notifications with pagination and filters
  getNotifications: async (filters: NotificationFilters = {}): Promise<NotificationResponse> => {
    const params = new URLSearchParams();
    
    if (filters.is_read !== undefined) {
      params.append('is_read', filters.is_read.toString());
    }
    if (filters.type) {
      params.append('type', filters.type);
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.page_size) {
      params.append('page_size', filters.page_size.toString());
    }

    const queryString = params.toString();
    const url = `/notifications/${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<NotificationResponse>(url);
  },

  // Get single notification
  getNotification: async (id: number): Promise<Notification> => {
    return apiRequest<Notification>(`/notifications/${id}/`);
  },

  // Mark notification as read/unread
  updateNotification: async (id: number, data: { is_read: boolean }): Promise<Notification> => {
    return apiRequest<Notification>(`/notifications/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ detail: string; count: number }> => {
    return apiRequest<{ detail: string; count: number }>('/notifications/mark-all-read/', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    return apiRequest<{ unread_count: number }>('/notifications/unread-count/');
  },

  // Delete notification
  deleteNotification: async (id: number): Promise<void> => {
    return apiRequest<void>(`/notifications/${id}/delete/`, {
      method: 'DELETE',
    });
  },
};