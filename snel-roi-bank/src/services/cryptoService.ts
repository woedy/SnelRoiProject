import { apiRequest } from '@/lib/api';

export interface CryptoWallet {
    id: number;
    crypto_type: string;
    crypto_type_display: string;
    network: string;
    network_display: string;
    wallet_address: string;
    qr_code_url: string;
    min_deposit: string;
    instructions: string;
}

export interface CryptoDepositInitiate {
    crypto_wallet_id: number;
    amount_usd: number;
    purpose?: 'DEPOSIT' | 'VIRTUAL_CARD';
    virtual_card_id?: number;
}

export interface CryptoDepositResponse {
    id: number;
    amount_usd: string;
    crypto_amount: string;
    exchange_rate: string;
    verification_status: string;
    expires_at: string;
}

export const cryptoService = {
    // Get active receiving wallets
    getWallets: async (): Promise<CryptoWallet[]> => {
        return apiRequest<CryptoWallet[]>('/crypto-wallets/');
    },

    // Submit a crypto deposit with proof of payment
    submitDeposit: async (data: CryptoDepositInitiate, file: File, txHash?: string): Promise<CryptoDepositResponse> => {
        const formData = new FormData();
        formData.append('crypto_wallet_id', data.crypto_wallet_id.toString());
        formData.append('amount_usd', data.amount_usd.toString());
        if (data.purpose) formData.append('purpose', data.purpose);
        if (data.virtual_card_id) formData.append('virtual_card_id', data.virtual_card_id.toString());

        formData.append('proof_of_payment', file);
        if (txHash) formData.append('tx_hash', txHash);

        return apiRequest<CryptoDepositResponse>('/deposits/crypto/initiate/', {
            method: 'POST',
            body: formData,
        });
    },
};
