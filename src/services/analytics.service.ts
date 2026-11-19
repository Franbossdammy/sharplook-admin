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
  AcquisitionAnalytics,
  ActivityAnalytics,
  ActivityQuery,
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
   * Get "How did you hear about us" acquisition analytics
   */
  async getAcquisitionAnalytics(startDate?: string, endDate?: string): Promise<AcquisitionAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiService.get<any>(
      `${API_ENDPOINTS.ACQUISITION_ANALYTICS}${params.toString() ? '?' + params.toString() : ''}`
    );
    return response.data?.data || response.data || response;
  }

  /**
   * Who is active / gone quiet (vendors or clients), with filtered list
   */
  async getActivityAnalytics(q: ActivityQuery): Promise<ActivityAnalytics> {
    const params = this.activityParams(q);
    const response = await apiService.get<any>(`${API_ENDPOINTS.ACTIVITY_ANALYTICS}?${params.toString()}`);
    return response.data?.data || response.data || response;
  }

  /**
   * CSV of the filtered activity list (all rows)
   */
  async exportActivityCSV(q: ActivityQuery): Promise<Blob> {
    const params = this.activityParams(q);
    params.append('format', 'csv');
    return apiService.get<Blob>(`${API_ENDPOINTS.ACTIVITY_ANALYTICS}?${params.toString()}`, {
      responseType: 'blob',
    });
  }

  private activityParams(q: ActivityQuery): URLSearchParams {
    const params = new URLSearchParams();
    params.append('role', q.role);
    if (q.bucket) params.append('bucket', q.bucket);
    if (q.kyc) params.append('kyc', q.kyc);
    if (q.search) params.append('search', q.search);
    if (q.sort) params.append('sort', q.sort);
    if (q.page) params.append('page', String(q.page));
    if (q.limit) params.append('limit', String(q.limit));
    return params;
  }

  /**
   * Get detailed user list for analytics
   */
  async getUserDetails(params: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const response = await apiService.get<any>(
      `${API_ENDPOINTS.USER_DETAILS_ANALYTICS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    );
    return response.data?.data || response.data || response;
  }

  /**
   * Export user data as CSV
   */
  async exportUserDataCSV(params: {
    startDate?: string;
    endDate?: string;
    role?: string;
    status?: string;
  } = {}): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('format', 'csv');
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);

    return apiService.get<Blob>(
      `${API_ENDPOINTS.EXPORT_USER_DATA}?${queryParams.toString()}`,
      { responseType: 'blob' }
    );
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