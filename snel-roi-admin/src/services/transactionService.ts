import { apiRequest } from "@/lib/api";

export interface Transaction {
    id: number;
    reference: string;
    amount: string;
    entry_type: string;
    status: string;
    memo: string;
    created_at: string;
    created_by_email?: string;
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
