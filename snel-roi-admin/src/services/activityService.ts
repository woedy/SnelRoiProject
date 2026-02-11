import { apiRequest } from "@/lib/api";

export interface Activity {
    activity_type: string;
    timestamp: string;
    user_id: number | null;
    user_email: string | null;
    user_name: string | null;
    description: string;
    metadata: Record<string, any>;
    actor_id: number | null;
    actor_email: string | null;
    reference: string;
    amount: number | null;
    status: string;
}

export interface ActivityLogResponse {
    activities: Activity[];
    count: number;
}

export interface ActivityFilters {
    limit?: number;
    user_id?: number;
    activity_type?: string[];
    date_from?: string;
    date_to?: string;
}

export const activityService = {
    getActivityLog: async (filters?: ActivityFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.user_id) params.append('user_id', filters.user_id.toString());
            if (filters.activity_type) {
                filters.activity_type.forEach(type => params.append('activity_type', type));
            }
            if (filters.date_from) params.append('date_from', filters.date_from);
            if (filters.date_to) params.append('date_to', filters.date_to);
        }
        return apiRequest<ActivityLogResponse>(`/admin/activity-log/?${params.toString()}`);
    },

    getRecentActivity: async (limit?: number) => {
        const params = limit ? `?limit=${limit}` : '';
        return apiRequest<ActivityLogResponse>(`/admin/recent-activity/${params}`);
    },

    getUserActivity: async (userId: number, filters?: { limit?: number; activity_type?: string[] }) => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.activity_type) {
                filters.activity_type.forEach(type => params.append('activity_type', type));
            }
        }
        return apiRequest<ActivityLogResponse>(`/admin/users/${userId}/activity/?${params.toString()}`);
    },
};
