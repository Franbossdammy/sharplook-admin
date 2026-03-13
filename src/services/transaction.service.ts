import { apiService } from './api.service';
import {
  Transaction,
  TransactionStats,
  TransactionFilters,
  UserTransactionStats,
} from '../types/transaction.types';

export class TransactionService {
  /**
   * Get all transactions (admin)
   */
  async getAllTransactions(
    filters?: TransactionFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: Transaction[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiService.get<any>(`/transactions/admin/all?${params.toString()}`);

    console.log('📡 TRANSACTIONS API RESPONSE:', response);
    console.log('📊 Response Data:', response.data);

    // Handle direct array response
    if (Array.isArray(response.data)) {
      return {
        transactions: response.data,
        total: response.data.length,
        page: page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    // Handle nested data structure
    if (response.data?.data) {
      return response.data.data;
    }

    // Handle transactions property
    if (response.data?.transactions) {
      return {
        transactions: response.data.transactions,
        total: response.data.total || response.data.transactions.length,
        page: response.data.page || page,
        totalPages:
          response.data.totalPages ||
          Math.ceil((response.data.total || response.data.transactions.length) / limit),
      };
    }

    return response.data;
  }

  /**
   * Get platform transaction statistics (admin)
   */
  async getPlatformStats(startDate?: string, endDate?: string): Promise<TransactionStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiService.get<any>(
      `/transactions/admin/stats?${params.toString()}`
    );

    console.log('📊 PLATFORM STATS RESPONSE:', response);
    console.log('Stats Data:', response.data?.stats || response.data?.data || response.data);

    return response.data?.stats || response.data?.data || response.data;
  }

  /**
   * Get transaction by ID (admin)
   */
  async getTransactionByIdAdmin(transactionId: string): Promise<Transaction> {
    const response = await apiService.get<any>(`/transactions/admin/${transactionId}`);
    return response.data?.transaction || response.data?.data || response.data;
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(
    filters?: Omit<TransactionFilters, 'userId'>,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: Transaction[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiService.get<any>(`/transactions?${params.toString()}`);

    if (Array.isArray(response.data)) {
      return {
        transactions: response.data,
        total: response.data.length,
        page: page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    return response.data?.data || response.data;
  }

  /**
   * Get user transaction stats
   */
  async getUserTransactionStats(
    startDate?: string,
    endDate?: string
  ): Promise<UserTransactionStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiService.get<any>(`/transactions/stats?${params.toString()}`);
    return response.data?.stats || response.data?.data || response.data;
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    const response = await apiService.get<any>(`/transactions/${transactionId}`);
    return response.data?.transaction || response.data?.data || response.data;
  }
}

export const transactionService = new TransactionService();