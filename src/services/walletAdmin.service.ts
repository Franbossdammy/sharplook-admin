import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/utils/constants';

export interface WalletTopUpPayload {
  userId: string;
  amount: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface WalletTopUpResult {
  user: {
    id: string;
    email: string;
    previousBalance: number;
    newBalance: number;
    creditedAmount?: number;
    debitedAmount?: number;
  };
  transaction: {
    id: string;
    reference: string;
    description: string;
  };
}

export interface CreditCheckResult {
  cardPayments: {
    reference: string;
    amount: number;
    paymentType: string | null;
    paidAt: string;
    booking: { _id: string; status: string; scheduledDate?: string } | null;
    hasOrder: boolean;
  }[];
  manualCredits: {
    _id: string;
    reference: string;
    amount: number;
    description?: string;
    createdAt: string;
  }[];
}

export class WalletAdminService {
  // Recent card payments + manual credits, so admins can see a user already paid before crediting
  async getCreditCheck(userId: string): Promise<CreditCheckResult> {
    const response: any = await apiService.get(`/payments/wallet/fund/credit-check/${userId}`);
    return response.data || response;
  }

  async creditWallet(payload: WalletTopUpPayload): Promise<WalletTopUpResult> {
    const response: any = await apiService.post(API_ENDPOINTS.WALLET_CREDIT, payload);
    return response.data || response;
  }

  async debitWallet(payload: WalletTopUpPayload): Promise<WalletTopUpResult> {
    const response: any = await apiService.post(API_ENDPOINTS.WALLET_DEBIT, payload);
    return response.data || response;
  }
}

export const walletAdminService = new WalletAdminService();
