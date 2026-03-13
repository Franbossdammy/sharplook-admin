import { apiService } from './api.service';

class SubscriptionService {
  async getAllSubscriptions(filters?: any, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.plan) params.append('plan', filters.plan);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiService.get<any>(`/subscriptions?${params.toString()}`);

    // Backend returns: { success, data: [...], meta: { pagination: { currentPage, totalPages, pageSize, totalItems } } }
    const subscriptions = response.data || response || [];
    const pagination = response.meta?.pagination || {};

    return {
      subscriptions: Array.isArray(subscriptions) ? subscriptions : [],
      total: pagination.totalItems || (Array.isArray(subscriptions) ? subscriptions.length : 0),
      totalPages: pagination.totalPages || 1,
      page: pagination.currentPage || page,
    };
  }

  async getSubscriptionStats() {
    const response = await apiService.get<any>('/subscriptions/stats');

    // Backend returns: { success, data: { stats: { totalSubscriptions, activeSubscriptions, ... revenueByType: [...] } } }
    const stats = response.data?.stats || response.data || response || {};

    return {
      total: stats.totalSubscriptions || 0,
      active: stats.activeSubscriptions || 0,
      pending: stats.pendingSubscriptions || 0,
      cancelled: stats.cancelledSubscriptions || 0,
      expired: stats.expiredSubscriptions || 0,
      totalRevenue: stats.totalRevenue || 0,
      revenueByType: stats.revenueByType || [],
      recentSubscriptions: stats.recentSubscriptions || [],
    };
  }
}

export const subscriptionService = new SubscriptionService();
