import { apiRequest } from "@/lib/api";

export interface CryptoWallet {
    id: number;
    crypto_type: string;
    crypto_type_display: string;
    network: string;
    network_display: string;
    wallet_address: string;
    qr_code_url: string;
    is_active: boolean;
    min_deposit: string;
    instructions: string;
}

export interface CryptoDeposit {
    id: number;
    customer_name: string;
    crypto_wallet_details: {
        crypto_type_display: string;
        network_display: string;
        wallet_address: string;
    };
    amount_usd: string;
    crypto_amount: string;
    tx_hash: string;
    proof_of_payment_url: string;
    verification_status: string;
    verification_status_display: string;
    admin_notes: string;
    purpose: 'DEPOSIT' | 'VIRTUAL_CARD' | 'INVESTMENT';
    created_at: string;
}



export interface CryptoInvestmentPlan {
    id: number;
    name: string;
    description: string;
    minimum_amount_usd: string;
    expected_return_percent: string;
    duration_days: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    is_active: boolean;
}

export const cryptoService = {
    // Wallet management
    getWallets: () => apiRequest<CryptoWallet[]>("/admin/crypto-wallets/"),
    getWallet: (id: number) => apiRequest<CryptoWallet>(`/admin/crypto-wallets/${id}/`),
    createWallet: (data: any) => apiRequest<CryptoWallet>("/admin/crypto-wallets/", {
        method: "POST",
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    updateWallet: (id: number, data: any) => apiRequest<CryptoWallet>(`/admin/crypto-wallets/${id}/`, {
        method: "PATCH",
        body: data instanceof FormData ? data : JSON.stringify(data)
    }),
    deleteWallet: (id: number) => apiRequest(`/admin/crypto-wallets/${id}/`, {
        method: "DELETE"
    }),
    toggleWallet: (id: number) => apiRequest<CryptoWallet>(`/admin/crypto-wallets/${id}/toggle/`, {
        method: "POST"
    }),

    // Deposit verification
    getDeposits: (status?: string) => {
        const query = status ? `?status=${status}` : "";
        return apiRequest<CryptoDeposit[]>(`/admin/crypto-deposits/${query}`);
    },
    verifyDeposit: (id: number, action: "approve" | "reject", notes: string) =>
        apiRequest<CryptoDeposit>(`/admin/crypto-deposits/${id}/verify/`, {
            method: "POST",
            body: JSON.stringify({ action, admin_notes: notes })
        }),

    getInvestmentPlans: () => apiRequest<CryptoInvestmentPlan[]>('/admin/crypto-investment-plans/'),
    createInvestmentPlan: (data: Partial<CryptoInvestmentPlan>) =>
        apiRequest<CryptoInvestmentPlan>('/admin/crypto-investment-plans/', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateInvestmentPlan: (id: number, data: Partial<CryptoInvestmentPlan>) =>
        apiRequest<CryptoInvestmentPlan>(`/admin/crypto-investment-plans/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
};
