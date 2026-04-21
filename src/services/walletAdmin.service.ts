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

export class WalletAdminService {
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
