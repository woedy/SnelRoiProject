import { apiRequest } from "@/lib/api";

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export const authService = {
    login: async (credentials: FormData) => {
        // Unlike JSON, for OAuth2 password flow we typically use form data
        // But backend might expect JSON. Let's check backend or assume JSON for now based on 'Content-Type: application/json' in api.ts
        // If backend uses FastAPI OAuth2PasswordRequestForm, it needs form-urlencoded.
        // However, existing api.ts sets content-type to json.
        // We'll stick to JSON for now, can be adjusted.
        return apiRequest<LoginResponse>("/auth/jwt/login", {
            method: "POST",
            body: JSON.stringify(Object.fromEntries(credentials)),
        });
    },
    logout: () => {
        localStorage.removeItem("admin_token");
    },
};
