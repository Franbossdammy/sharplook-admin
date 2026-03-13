import { apiService } from './api.service';
import { Booking, BookingFilters, BookingStats } from '../types/booking.types';

export class BookingService {
  async getAllBookings(
    filters?: BookingFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ bookings: Booking[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiService.get<any>(`/bookings/admin/all?${params.toString()}`);

    // Format from ResponseHandler.paginated: { success, data: [...], meta: { pagination: {...} } }
    const pagination = response.meta?.pagination || response.pagination;
    if (pagination) {
      return {
        bookings: Array.isArray(response.data) ? response.data : [],
        total: pagination.totalItems || 0,
        totalPages: pagination.totalPages || 1,
        page: pagination.currentPage || page,
      };
    }

    // Format: { success, data: { bookings: [...], total, totalPages } }
    if (response.data?.bookings) {
      return {
        bookings: response.data.bookings,
        total: response.data.total || response.data.bookings.length,
        totalPages: response.data.totalPages || 1,
        page: response.data.page || page,
      };
    }

    // Direct array
    const bookings = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
    return {
      bookings,
      total: bookings.length,
      totalPages: 1,
      page,
    };
  }

  async getBookingById(id: string): Promise<Booking> {
    const response = await apiService.get<any>(`/bookings/${id}`);
    return response.data?.booking || response.data || response;
  }

  async getBookingStats(): Promise<BookingStats> {
    const response = await apiService.get<any>('/bookings/admin/stats');
    // Backend returns: { success, data: { total, pending, ... } } or { success, data: { stats: { ... } } }
    const stats = response.data?.stats || response.data || response;
    return {
      total: stats.total || 0,
      pending: stats.pending || 0,
      accepted: stats.accepted || 0,
      inProgress: stats.inProgress || stats.in_progress || 0,
      completed: stats.completed || 0,
      cancelled: stats.cancelled || 0,
      totalRevenue: stats.totalRevenue || 0,
    };
  }
}

export const bookingService = new BookingService();
