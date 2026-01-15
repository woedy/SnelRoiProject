import { apiRequest } from "@/lib/api";

export interface User {
    id: string;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    full_name?: string;
}

export const userService = {
    getAll: async () => {
        return apiRequest<User[]>("/users/");
    },
    getOne: async (id: string) => {
        return apiRequest<User>(`/users/${id}`);
    },
    update: async (id: string, data: Partial<User>) => {
        return apiRequest<User>(`/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },
    delete: async (id: string) => {
        return apiRequest<void>(`/users/${id}`, {
            method: "DELETE",
        });
    },
};
