import { apiRequest } from "@/lib/api";

export interface VerificationCode {
    id: number;
    user_email: string;
    code: string;
    purpose: string;
    purpose_display: string;
    created_at: string;
    used_at: string | null;
}

export const verificationService = {
    getAll: async (): Promise<VerificationCode[]> => {
        return apiRequest<VerificationCode[]>("/admin/verification-codes/");
    },
};
