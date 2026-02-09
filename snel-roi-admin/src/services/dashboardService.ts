import { apiRequest } from "@/lib/api";

export interface DashboardStats {
    users: {
        total: number;
        active: number;
        new_this_week: number;
        new_this_month: number;
        growth_rate: number;
    };
    accounts: {
        total: number;
        active: number;
        frozen: number;
        total_balance: number;
    };
    transactions: {
        total: number;
        pending: number;
        approved: number;
        today: number;
        this_week: number;
        this_month: number;
        volume_this_month: number;
    };
    kyc: {
        pending: number;
        under_review: number;
        verified: number;
    };
    loans: {
        pending: number;
        active: number;
        total_amount: number;
    };
    virtual_cards: {
        pending: number;
        active: number;
    };
    pending_approvals: {
        transactions: number;
        kyc_documents: number;
        loans: number;
        virtual_cards: number;
        tax_refunds: number;
        grants: number;
        crypto_deposits: number;
        total: number;
    };
    support: {
        open_tickets: number;
    };
}

export const dashboardService = {
    getStats: async () => {
        return apiRequest<DashboardStats>("/admin/dashboard/stats/");
    },
};
