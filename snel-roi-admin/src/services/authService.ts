import { apiRequest } from "@/lib/api";

export interface LoginResponse {
    access: string;
    refresh: string;
}

export const authService = {
    login: async (credentials: FormData) => {
        return apiRequest<LoginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(Object.fromEntries(credentials)),
        });
    },
    logout: () => {
        localStorage.removeItem("admin_token");
    },
};
