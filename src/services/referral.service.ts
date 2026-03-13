import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/utils/constants';

export class ReferralService {
  async getReferrals(page = 1, limit = 50, status?: string) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await apiService.get<any>(
      `${API_ENDPOINTS.REFERRALS}?${params.toString()}`
    );

    // Backend returns: { success, data: [...], meta: { pagination: { currentPage, totalPages, pageSize, totalItems } } }
    const referrals = response.data || response || [];
    const pagination = response.meta?.pagination || {};

    return {
      referrals: Array.isArray(referrals) ? referrals : [],
      total: pagination.totalItems || (Array.isArray(referrals) ? referrals.length : 0),
      totalPages: pagination.totalPages || 1,
      page: pagination.currentPage || page,
    };
  }

  async getReferralStats() {
    const response = await apiService.get<any>(API_ENDPOINTS.REFERRAL_STATS);

    // Backend returns: { success, data: { stats: { totalReferrals, completedReferrals, pendingReferrals, conversionRate, totalRewardsPaid, avgRewardPerReferral } } }
    const stats = response.data?.stats || response.data || response || {};

    return {
      totalReferrals: stats.totalReferrals || 0,
      completed: stats.completedReferrals || 0,
      pending: stats.pendingReferrals || 0,
      totalRewards: stats.totalRewardsPaid || 0,
      conversionRate: stats.conversionRate || '0',
      avgRewardPerReferral: stats.avgRewardPerReferral || 0,
    };
  }
}

export const referralService = new ReferralService();
