import { apiRequest } from "@/lib/api";

export interface Transaction {
    id: number;
    amount: string;
    transaction_type: string;
    status: string;
    description: string;
    created_at: string;
    user_email?: string;
}

export const transactionService = {
    getAll: async (params?: URLSearchParams) => {
        const queryString = params ? `?${params.toString()}` : "";
        return apiRequest<Transaction[]>(`/admin/transactions${queryString}`);
    },
    approve: async (id: number) => {
        return apiRequest<void>(`/admin/transactions/${id}/approve`, {
            method: "POST",
        });
    },
    decline: async (id: number) => {
        return apiRequest<void>(`/admin/transactions/${id}/decline`, {
            method: "POST",
        });
    },
};
