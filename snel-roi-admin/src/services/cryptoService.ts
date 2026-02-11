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
    purpose: 'DEPOSIT' | 'VIRTUAL_CARD';
    created_at: string;
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
        })
};
