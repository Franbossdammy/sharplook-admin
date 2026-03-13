import { apiService } from './api.service';
import {
  BookingDispute,
  ProductDispute,
  DisputeStats,
  DisputeFilters,
  BookingDisputeResolution,
  ProductDisputeResolution,
} from '../types/dispute.types';

export class DisputeService {
  // ==================== BOOKING DISPUTES ====================

  /**
   * Get all booking disputes (admin)
   */
  async getBookingDisputes(
    filters?: DisputeFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ disputes: BookingDispute[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);

    const response = await apiService.get<any>(`/disputes?${params.toString()}`);

    // Format: { success, data: [...], pagination: {...} }
    if (response.pagination) {
      return {
        disputes: Array.isArray(response.data) ? response.data : [],
        total: response.pagination.totalItems || 0,
        totalPages: response.pagination.totalPages || 1,
        page: response.pagination.currentPage || page,
      };
    }

    if (Array.isArray(response.data)) {
      return {
        disputes: response.data,
        total: response.data.length,
        page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    if (response.data?.disputes) {
      return {
        disputes: response.data.disputes,
        total: response.data.total || response.data.disputes.length,
        page: response.data.page || page,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || response.data.disputes.length) / limit),
      };
    }

    return { disputes: [], total: 0, page, totalPages: 1 };
  }

  /**
   * Get booking dispute by ID
   */
  async getBookingDisputeById(disputeId: string): Promise<BookingDispute> {
    const response = await apiService.get<any>(`/disputes/${disputeId}`);
    return response.data?.dispute || response.data?.data || response;
  }

  /**
   * Assign booking dispute
   */
  async assignBookingDispute(disputeId: string, assignToId: string): Promise<BookingDispute> {
    const response = await apiService.post<any>(`/disputes/${disputeId}/assign`, { assignToId });
    return response.data?.dispute || response.data?.data || response;
  }

  /**
   * Update booking dispute priority
   */
  async updateBookingDisputePriority(
    disputeId: string,
    priority: 'low' | 'medium' | 'high' | 'urgent'
  ): Promise<BookingDispute> {
    const response = await apiService.put<any>(`/disputes/${disputeId}/priority`, { priority });
    return response.data?.dispute || response.data?.data || response;
  }

  /**
   * Resolve booking dispute
   */
  async resolveBookingDispute(
    disputeId: string,
    data: {
      resolution: BookingDisputeResolution;
      resolutionDetails: string;
      refundAmount?: number;
      vendorPaymentAmount?: number;
    }
  ): Promise<BookingDispute> {
    const response = await apiService.post<any>(`/disputes/${disputeId}/resolve`, data);
    return response.data?.dispute || response.data?.data || response;
  }

  /**
   * Close booking dispute
   */
  async closeBookingDispute(disputeId: string): Promise<BookingDispute> {
    const response = await apiService.post<any>(`/disputes/${disputeId}/close`, {});
    return response.data?.dispute || response.data?.data || response;
  }

  /**
   * Add message to booking dispute
   */
  async addBookingDisputeMessage(
    disputeId: string,
    message: string,
    attachments?: string[]
  ): Promise<BookingDispute> {
    const response = await apiService.post<any>(`/disputes/${disputeId}/messages`, {
      message,
      attachments,
    });
    return response.data?.dispute || response.data?.data || response;
  }

  /**
   * Get booking dispute stats
   */
  async getBookingDisputeStats(): Promise<DisputeStats> {
    const response = await apiService.get<any>('/disputes/stats');
    return response.data?.stats || response.data || response;
  }

  // ==================== PRODUCT DISPUTES ====================

  /**
   * Get all product disputes (admin)
   */
  async getProductDisputes(
    filters?: DisputeFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ disputes: ProductDispute[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.reason) params.append('reason', filters.reason);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);

    const response = await apiService.get<any>(`/disputesProduct/admin/all?${params.toString()}`);

    if (response.pagination) {
      return {
        disputes: Array.isArray(response.data) ? response.data : [],
        total: response.pagination.totalItems || 0,
        totalPages: response.pagination.totalPages || 1,
        page: response.pagination.currentPage || page,
      };
    }

    if (Array.isArray(response.data)) {
      return {
        disputes: response.data,
        total: response.data.length,
        page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    if (response.data?.disputes) {
      return {
        disputes: response.data.disputes,
        total: response.data.total || response.data.disputes.length,
        page: response.data.page || page,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || response.data.disputes.length) / limit),
      };
    }

    return { disputes: [], total: 0, page, totalPages: 1 };
  }

  /**
   * Get product dispute by ID
   */
  async getProductDisputeById(disputeId: string): Promise<ProductDispute> {
    const response = await apiService.get<any>(`/disputesProduct/${disputeId}`);
    return response.data?.dispute || response.data?.data || response;
  }

  /**
   * Assign product dispute
   */
  async assignProductDispute(disputeId: string, adminId?: string): Promise<ProductDispute> {
    const response = await apiService.post<any>(`/disputesProduct/${disputeId}/assign`, {
      adminId: adminId || undefined,
    });
    return response.data?.dispute || response.data?.data || response;
  }

  /**
   * Resolve product dispute
   */
  async resolveProductDispute(
    disputeId: string,
    data: {
      resolution: ProductDisputeResolution;
      resolutionNote: string;
      refundAmount?: number;
    }
  ): Promise<ProductDispute> {
    const response = await apiService.post<any>(`/disputesProduct/${disputeId}/resolve`, data);
    return response.data?.dispute || response.data?.data || response;
  }

  /**
   * Close product dispute
   */
  async closeProductDispute(disputeId: string, closureNote: string): Promise<ProductDispute> {
    const response = await apiService.post<any>(`/disputesProduct/${disputeId}/close`, { closureNote });
    return response.data?.dispute || response.data?.data || response;
  }

  /**
   * Add message to product dispute
   */
  async addProductDisputeMessage(
    disputeId: string,
    message: string,
    attachments?: string[]
  ): Promise<ProductDispute> {
    const response = await apiService.post<any>(`/disputesProduct/${disputeId}/messages`, {
      message,
      attachments,
    });
    return response.data?.dispute || response.data?.data || response;
  }

  /**
   * Escalate product dispute
   */
  async escalateProductDispute(disputeId: string, reason: string): Promise<ProductDispute> {
    const response = await apiService.post<any>(`/disputesProduct/${disputeId}/escalate`, { reason });
    return response.data?.dispute || response.data?.data || response;
  }

  /**
   * Get product dispute stats
   */
  async getProductDisputeStats(): Promise<DisputeStats> {
    const response = await apiService.get<any>('/disputesProduct/admin/stats');
    return response.data?.stats || response.data || response;
  }

  /**
   * Get admin users for dispute assignment
   */
  async getAdminUsers(): Promise<Array<{ _id: string; firstName: string; lastName: string; email: string; role: string }>> {
    const response = await apiService.get<any>('/users?role=admin&limit=50');
    if (response.pagination && Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.users) {
      return response.data.users;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }

  /**
   * Get open product disputes
   */
  async getOpenProductDisputes(
    page: number = 1,
    limit: number = 20
  ): Promise<{ disputes: ProductDispute[]; total: number; page: number; totalPages: number }> {
    const response = await apiService.get<any>(
      `/disputesProduct/admin/open?page=${page}&limit=${limit}`
    );
    return response.data?.data || response.data || response;
  }

  /**
   * Get high priority product disputes
   */
  async getHighPriorityProductDisputes(
    page: number = 1,
    limit: number = 20
  ): Promise<{ disputes: ProductDispute[]; total: number; page: number; totalPages: number }> {
    const response = await apiService.get<any>(
      `/disputesProduct/admin/high-priority?page=${page}&limit=${limit}`
    );
    return response.data?.data || response.data || response;
  }
}

export const disputeService = new DisputeService();