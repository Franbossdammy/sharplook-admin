import { apiService } from './api.service';
import {
  Withdrawal,
  WithdrawalFilters,
  WithdrawalStats,
  ProcessWithdrawalRequest,
  RejectWithdrawalRequest,
  RequestWithdrawalData,
} from '../types/withdrawal.types';

export class WithdrawalService {
  /**
   * Get all withdrawals (admin)
   */
  async getAllWithdrawals(
    filters?: WithdrawalFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ withdrawals: Withdrawal[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiService.get<any>(
      `/payments/wallet/withdrawals?${params.toString()}`
    );

    // Format: { success, data: [...], pagination: {...} }
    if (response.pagination) {
      return {
        withdrawals: Array.isArray(response.data) ? response.data : [],
        total: response.pagination.totalItems || 0,
        totalPages: response.pagination.totalPages || 1,
        page: response.pagination.currentPage || page,
      };
    }

    if (Array.isArray(response.data)) {
      return {
        withdrawals: response.data,
        total: response.data.length,
        page: page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    // Handle nested data structure
    if (response.data?.data) {
      return response.data.data;
    }

    // Handle withdrawals property
    if (response.data?.withdrawals) {
      return {
        withdrawals: response.data.withdrawals,
        total: response.data.total || response.data.withdrawals.length,
        page: response.data.page || page,
        totalPages:
          response.data.totalPages ||
          Math.ceil((response.data.total || response.data.withdrawals.length) / limit),
      };
    }

    return response.data;
  }

  /**
   * Get withdrawal statistics (admin)
   * Note: This needs to be calculated from the withdrawal list
   */
  async getWithdrawalStats(startDate?: string, endDate?: string): Promise<WithdrawalStats> {
    // Fetch all withdrawals with filters to calculate stats
    const filters: WithdrawalFilters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    // Fetch multiple pages to get comprehensive stats
    const limit = 100;
    let allWithdrawals: Withdrawal[] = [];
    let page = 1;
    let hasMore = true;

    try {
      while (hasMore && page <= 5) {
        // Limit to 5 pages (500 withdrawals max)
        const result = await this.getAllWithdrawals(filters, page, limit);
        allWithdrawals = [...allWithdrawals, ...result.withdrawals];

        if (result.page >= result.totalPages) {
          hasMore = false;
        } else {
          page++;
        }
      }

      // Calculate stats from fetched withdrawals
      const stats: WithdrawalStats = {
        total: allWithdrawals.length,
        pending: allWithdrawals.filter((w) => w.status === 'pending').length,
        processing: allWithdrawals.filter((w) => w.status === 'processing').length,
        completed: allWithdrawals.filter((w) => w.status === 'completed').length,
        failed: allWithdrawals.filter((w) => w.status === 'failed').length,
        rejected: allWithdrawals.filter((w) => w.status === 'rejected').length,
        totalAmount: allWithdrawals.reduce((sum, w) => sum + w.amount, 0),
        completedAmount: allWithdrawals
          .filter((w) => w.status === 'completed')
          .reduce((sum, w) => sum + w.amount, 0),
        pendingAmount: allWithdrawals
          .filter((w) => w.status === 'pending')
          .reduce((sum, w) => sum + w.amount, 0),
      };

      console.log('=== WITHDRAWAL STATS ===');
      console.log('Total withdrawals fetched:', allWithdrawals.length);
      console.log('Stats:', stats);

      return stats;
    } catch (error) {
      console.error('Error calculating withdrawal stats:', error);
      // Return default stats on error
      return {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        rejected: 0,
        totalAmount: 0,
        completedAmount: 0,
        pendingAmount: 0,
      };
    }
  }

  /**
   * Process withdrawal (admin)
   */
  async processWithdrawal(withdrawalId: string): Promise<Withdrawal> {
    const response = await apiService.post<any>(
      `/payments/wallet/withdrawals/${withdrawalId}/process`
    );
    return response.data?.withdrawal || response.data?.data || response.data;
  }

  /**
   * Reject withdrawal (admin)
   */
  async rejectWithdrawal(withdrawalId: string, reason: string): Promise<Withdrawal> {
    const response = await apiService.post<any>(
      `/payments/wallet/withdrawals/${withdrawalId}/reject`,
      { reason }
    );
    return response.data?.withdrawal || response.data?.data || response.data;
  }

  /**
   * Get withdrawal by ID (admin)
   */
  async getWithdrawalById(withdrawalId: string): Promise<Withdrawal> {
    const response = await apiService.get<any>(
      `/payments/wallet/withdrawals/${withdrawalId}`
    );
    return response.data?.withdrawal || response.data?.data || response.data;
  }

  /**
   * Request withdrawal (user/vendor)
   */
  async requestWithdrawal(data: RequestWithdrawalData): Promise<Withdrawal> {
    const response = await apiService.post<any>('/payments/wallet/withdraw', data);
    return response.data?.withdrawal || response.data?.data || response.data;
  }

  /**
   * Get user withdrawals
   */
  async getUserWithdrawals(
    page: number = 1,
    limit: number = 10
  ): Promise<{ withdrawals: Withdrawal[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });

    const response = await apiService.get<any>(
      `/payments/wallet/withdrawals/my-withdrawals?${params.toString()}`
    );

    if (Array.isArray(response.data)) {
      return {
        withdrawals: response.data,
        total: response.data.length,
        page: page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    return response.data?.data || response.data;
  }
}

export const withdrawalService = new WithdrawalService();