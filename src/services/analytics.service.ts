import { apiService } from './api.service';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  DashboardOverview,
  UserAnalytics,
  BookingAnalytics,
  RevenueAnalytics,
  ServiceAnalytics,
  VendorPerformance,
  DisputeAnalytics,
  ReferralAnalytics,
} from '../types/analytics.types';

export class AnalyticsService {
  /**
   * Get dashboard overview with key metrics
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    const response = await apiService.get<any>(API_ENDPOINTS.DASHBOARD);
    // Handle nested data structure
    return response.data?.data || response.data || response;
  }

  /**
   * Get user analytics with optional date filters
   */
  async getUserAnalytics(startDate?: string, endDate?: string): Promise<UserAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiService.get<any>(
      `${API_ENDPOINTS.USER_ANALYTICS}${params.toString() ? '?' + params.toString() : ''}`
    );
    return response.data?.data || response.data || response;
  }

  /**
   * Get booking analytics with optional date filters
   */
  async getBookingAnalytics(startDate?: string, endDate?: string): Promise<BookingAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiService.get<any>(
      `${API_ENDPOINTS.BOOKING_ANALYTICS}${params.toString() ? '?' + params.toString() : ''}`
    );
    return response.data?.data || response.data || response;
  }

  /**
   * Get revenue analytics with optional date filters
   */
  async getRevenueAnalytics(startDate?: string, endDate?: string): Promise<RevenueAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiService.get<any>(
      `${API_ENDPOINTS.REVENUE_ANALYTICS}${params.toString() ? '?' + params.toString() : ''}`
    );
    return response.data?.data || response.data || response;
  }

  /**
   * Get service analytics
   */
  async getServiceAnalytics(): Promise<ServiceAnalytics> {
    const response = await apiService.get<any>(API_ENDPOINTS.SERVICE_ANALYTICS);
    return response.data?.data || response.data || response;
  }

  /**
   * Get vendor performance analytics
   */
  async getVendorPerformance(vendorId?: string): Promise<VendorPerformance> {
    const params = new URLSearchParams();
    if (vendorId) params.append('vendorId', vendorId);
    
    const response = await apiService.get<any>(
      `${API_ENDPOINTS.VENDOR_ANALYTICS}${params.toString() ? '?' + params.toString() : ''}`
    );
    return response.data?.data || response.data || response;
  }

  /**
   * Get dispute analytics
   */
  async getDisputeAnalytics(): Promise<DisputeAnalytics> {
    const response = await apiService.get<any>(API_ENDPOINTS.DISPUTE_ANALYTICS);
    return response.data?.data || response.data || response;
  }

  /**
   * Get referral analytics
   */
  async getReferralAnalytics(): Promise<ReferralAnalytics> {
    const response = await apiService.get<any>(API_ENDPOINTS.REFERRAL_ANALYTICS);
    return response.data?.data || response.data || response;
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(type: string, startDate?: string, endDate?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiService.get<Blob>(
      `${API_ENDPOINTS.EXPORT_ANALYTICS(type)}${params.toString() ? '?' + params.toString() : ''}`,
      { responseType: 'blob' }
    );
  }
}

export const analyticsService = new AnalyticsService();