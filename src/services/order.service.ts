import { apiService } from './api.service';
import {
  Order,
  OrderStats,
  OrderFilters,
  UpdateOrderStatusRequest,
  AddTrackingRequest,
  CancelOrderRequest,
} from '../types/order.types';

export class OrderService {
  /**
   * Get all orders (admin)
   */
  async getAllOrders(
    filters?: OrderFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.seller) params.append('seller', filters.seller);
    if (filters?.customer) params.append('customer', filters.customer);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiService.get<any>(`/orders?${params.toString()}`);

    // Format: { success, data: [...], pagination: { currentPage, totalPages, pageSize, totalItems } }
    if (response.pagination) {
      return {
        orders: Array.isArray(response.data) ? response.data : [],
        total: response.pagination.totalItems || 0,
        totalPages: response.pagination.totalPages || 1,
        page: response.pagination.currentPage || page,
      };
    }

    // Direct array in data
    if (Array.isArray(response.data)) {
      return {
        orders: response.data,
        total: response.data.length,
        page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    // Nested: { data: { orders: [...] } }
    if (response.data?.orders) {
      return {
        orders: response.data.orders,
        total: response.data.total || response.data.orders.length,
        page: response.data.page || page,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || response.data.orders.length) / limit),
      };
    }

    return { orders: [], total: 0, page, totalPages: 1 };
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiService.get<any>(`/orders/${orderId}`);
    return response.data?.order || response.data?.data || response.data;
  }

  /**
   * Update order status (seller/admin)
   */
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusRequest): Promise<Order> {
    const response = await apiService.patch<any>(`/orders/${orderId}/status`, data);
    return response.data?.order || response.data?.data || response.data;
  }

  /**
   * Add tracking information
   */
  async addTrackingInfo(orderId: string, data: AddTrackingRequest): Promise<Order> {
    const response = await apiService.post<any>(`/orders/${orderId}/tracking`, data);
    return response.data?.order || response.data?.data || response.data;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, data: CancelOrderRequest): Promise<Order> {
    const response = await apiService.post<any>(`/orders/${orderId}/cancel`, data);
    return response.data?.order || response.data?.data || response.data;
  }

  /**
   * Confirm delivery
   */
  async confirmDelivery(orderId: string, role: 'customer' | 'seller'): Promise<Order> {
    const response = await apiService.post<any>(`/orders/${orderId}/confirm-delivery`, { role });
    return response.data?.order || response.data?.data || response.data;
  }

  /**
   * Delete/cancel order (admin)
   */
  async deleteOrder(orderId: string, reason: string = 'Cancelled by admin'): Promise<Order> {
    const response = await apiService.post<any>(`/orders/${orderId}/cancel`, { reason });
    return response.data?.order || response.data || response;
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);

    const response = await apiService.get<any>(`/orders/customer/my-orders?${params.toString()}`);

    if (Array.isArray(response.data)) {
      return {
        orders: response.data,
        total: response.data.length,
        page: page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    if (response.data?.orders) {
      return response.data;
    }

    return response.data?.data || response.data;
  }

  /**
   * Get seller orders
   */
  async getSellerOrders(
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);

    const response = await apiService.get<any>(`/orders/seller/my-orders?${params.toString()}`);

    if (Array.isArray(response.data)) {
      return {
        orders: response.data,
        total: response.data.length,
        page: page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    if (response.data?.orders) {
      return response.data;
    }

    return response.data?.data || response.data;
  }

  /**
   * Get customer order stats
   */
  async getCustomerOrderStats(): Promise<OrderStats> {
    const response = await apiService.get<any>('/orders/customer/stats');
    return response.data?.stats || response.data?.data || response.data;
  }

  /**
   * Get seller order stats
   */
  async getSellerOrderStats(): Promise<OrderStats> {
    const response = await apiService.get<any>('/orders/seller/stats');
    return response.data?.stats || response.data?.data || response.data;
  }
}

export const orderService = new OrderService();