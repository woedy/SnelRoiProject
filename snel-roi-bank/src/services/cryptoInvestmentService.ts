import { apiRequest } from '@/lib/api';

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

export interface CryptoInvestment {
  id: number;
  plan: number;
  plan_name: string;
  amount_usd: string;
  expected_return_amount: string;
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'REJECTED' | 'COMPLETED';
  funded_deposit: number | null;
  funded_deposit_status?: string;
  starts_at: string | null;
  matures_at: string | null;
  admin_notes: string;
  created_at: string;
}

export interface CreateCryptoInvestmentPayload {
  plan_id: number;
  crypto_wallet_id: number;
  amount_usd: number;
  proof_of_payment: File;
  tx_hash?: string;
}

export const cryptoInvestmentService = {
  getPlans: () => apiRequest<CryptoInvestmentPlan[]>('/investments/crypto/plans/'),
  getMyInvestments: () => apiRequest<CryptoInvestment[]>('/investments/crypto/'),
  create: (payload: CreateCryptoInvestmentPayload) => {
    const formData = new FormData();
    formData.append('plan_id', payload.plan_id.toString());
    formData.append('crypto_wallet_id', payload.crypto_wallet_id.toString());
    formData.append('amount_usd', payload.amount_usd.toString());
    formData.append('proof_of_payment', payload.proof_of_payment);
    if (payload.tx_hash) {
      formData.append('tx_hash', payload.tx_hash);
    }

    return apiRequest<CryptoInvestment>('/investments/crypto/create/', {
      method: 'POST',
      body: formData,
    });
  },
};
