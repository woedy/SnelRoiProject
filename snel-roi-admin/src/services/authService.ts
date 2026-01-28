import { apiRequest } from "@/lib/api";

export interface LoginResponse {
    access: string;
    refresh: string;
}

export const authService = {
    login: async (credentials: FormData) => {
        const response = await apiRequest<LoginResponse>("/auth/login/", {
            method: "POST",
            body: JSON.stringify(Object.fromEntries(credentials)),
        });
        
        // Store both tokens
        localStorage.setItem("admin_token", response.access);
        localStorage.setItem("admin_refresh_token", response.refresh);
        
        return response;
    },
    logout: () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refresh_token");
    },
};
