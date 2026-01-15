import { apiRequest } from "@/lib/api";

export interface User {
    id: number;
    email: string;
    username: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    full_name?: string;
}

export const userService = {
    getAll: async () => {
        return apiRequest<User[]>("/admin/users");
    },
    getOne: async (id: string) => {
        return apiRequest<User>(`/admin/users/${id}`);
    },
    create: async (data: { email: string; password: string; full_name: string; is_staff?: boolean; is_active?: boolean }) => {
        return apiRequest<User>("/admin/users", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
    update: async (id: string, data: Record<string, unknown>) => {
        return apiRequest<User>(`/admin/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },
    delete: async (id: string) => {
        return apiRequest<void>(`/admin/users/${id}`, {
            method: "DELETE",
        });
    },
};
