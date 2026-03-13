import { apiService } from './api.service';
import {
  RedFlag,
  RedFlagStats,
  RedFlagFilters,
  RedFlagListResponse,
  TopFlaggedUser,
  RedFlagTypeSummary,
  UpdateRedFlagStatusRequest,
  ResolveRedFlagRequest,
  AssignRedFlagRequest,
  AddRedFlagNoteRequest,
  CreateManualRedFlagRequest,
  BulkUpdateStatusRequest,
  BulkUpdateResponse,
} from '../types/redFlag.types';

class RedFlagService {
  private baseUrl = '/redFlag';

  // ==================== GET METHODS ====================

  /**
   * Get all red flags with filters and pagination
   */
  async getRedFlags(
    filters?: RedFlagFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<RedFlagListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (filters?.type) params.append('type', filters.type);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiService.get<any>(`${this.baseUrl}?${params.toString()}`);

    // Handle different response structures
    if (response.data?.data) {
      return response.data.data;
    }

    if (response.data?.flags) {
      return {
        flags: response.data.flags,
        total: response.data.total || response.data.flags.length,
        page: response.data.page || page,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || response.data.flags.length) / limit),
      };
    }

    return response.data;
  }

  /**
   * Get red flag statistics
   */
  async getStats(): Promise<RedFlagStats> {
    const response = await apiService.get<any>(`${this.baseUrl}/stats`);
    return response.data?.data || response.data?.stats || response.data;
  }

  /**
   * Get users with most red flags
   */
  async getTopFlaggedUsers(limit: number = 10): Promise<TopFlaggedUser[]> {
    const response = await apiService.get<any>(`${this.baseUrl}/top-users?limit=${limit}`);
    return response.data?.data || response.data;
  }

  /**
   * Get red flag types with descriptions
   */
  async getTypesSummary(): Promise<RedFlagTypeSummary[]> {
    const response = await apiService.get<any>(`${this.baseUrl}/types/summary`);
    return response.data?.data || response.data;
  }

  /**
   * Get single red flag by ID
   */
  async getRedFlagById(id: string): Promise<RedFlag> {
    const response = await apiService.get<any>(`${this.baseUrl}/${id}`);
    return response.data?.data || response.data?.flag || response.data;
  }

  /**
   * Get red flags for a specific user
   */
  async getRedFlagsByUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<RedFlagListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    const response = await apiService.get<any>(`${this.baseUrl}/user/${userId}?${params.toString()}`);

    if (response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  // ==================== UPDATE METHODS ====================

  /**
   * Update red flag status
   */
  async updateStatus(id: string, data: UpdateRedFlagStatusRequest): Promise<RedFlag> {
    const response = await apiService.patch<any>(`${this.baseUrl}/${id}/status`, data);
    return response.data?.data || response.data?.flag || response.data;
  }

  /**
   * Resolve red flag with action
   */
  async resolve(id: string, data: ResolveRedFlagRequest): Promise<RedFlag> {
    const response = await apiService.post<any>(`${this.baseUrl}/${id}/resolve`, data);
    return response.data?.data || response.data?.flag || response.data;
  }

  /**
   * Assign red flag to admin
   */
  async assign(id: string, data: AssignRedFlagRequest): Promise<RedFlag> {
    const response = await apiService.patch<any>(`${this.baseUrl}/${id}/assign`, data);
    return response.data?.data || response.data?.flag || response.data;
  }

  /**
   * Add note to red flag
   */
  async addNote(id: string, data: AddRedFlagNoteRequest): Promise<RedFlag> {
    const response = await apiService.post<any>(`${this.baseUrl}/${id}/notes`, data);
    return response.data?.data || response.data?.flag || response.data;
  }

  /**
   * Bulk update red flag statuses
   */
  async bulkUpdateStatus(data: BulkUpdateStatusRequest): Promise<BulkUpdateResponse> {
    const response = await apiService.patch<any>(`${this.baseUrl}/bulk/status`, data);
    return response.data?.data || response.data;
  }

  // ==================== CREATE METHODS ====================

  /**
   * Manually create a red flag
   */
  async createManual(data: CreateManualRedFlagRequest): Promise<RedFlag> {
    const response = await apiService.post<any>(`${this.baseUrl}/manual`, data);
    return response.data?.data || response.data?.flag || response.data;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get severity color class
   */
  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Get status color class
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      case 'escalated':
        return 'bg-purple-100 text-purple-800';
      case 'action_taken':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Format red flag type for display
   */
  formatType(type: string): string {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Get type description
   */
  getTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      vendor_late_cancellation: 'Vendor cancelled booking close to appointment time',
      client_frequent_cancellation: 'Client has cancelled multiple bookings',
      suspected_off_platform_meeting: 'Suspected off-platform transaction',
      location_proximity_no_booking: 'Vendor and client detected near each other without booking',
      chat_contains_contact_info: 'Contact information shared in chat',
      chat_suggests_outside_payment: 'Outside payment suggested in chat',
      frequent_refund_requests: 'Excessive refund requests',
      suspicious_payment_pattern: 'Unusual payment activity',
      chargeback_attempt: 'Chargeback or dispute filed',
      multiple_accounts_same_device: 'Multiple accounts from same device',
      fake_reviews_detected: 'Suspected fake reviews',
      identity_mismatch: 'Identity verification mismatch',
      service_quality_complaints: 'Multiple service quality complaints',
      no_show_vendor: 'Vendor did not show up',
      no_show_client: 'Client did not show up',
      harassment_reported: 'Harassment reported',
      inappropriate_behavior: 'Inappropriate behavior reported',
      safety_concern: 'Safety concern raised',
      custom: 'Custom flag',
    };

    return descriptions[type] || 'Unknown type';
  }

  /**
   * Get action description
   */
  getActionDescription(action: string): string {
    const descriptions: Record<string, string> = {
      warning_issued: 'A warning notification was sent to the user',
      temporary_suspension: 'User temporarily suspended for 7 days',
      permanent_ban: 'User permanently banned from the platform',
      fine_applied: 'A fine was applied to the user account',
      no_action: 'No action taken after review',
      escalated: 'Escalated to higher authority',
    };

    return descriptions[action] || 'Unknown action';
  }

  /**
   * Check if flag requires urgent attention
   */
  isUrgent(flag: RedFlag): boolean {
    return (
      flag.status === 'open' &&
      (flag.severity === 'critical' || flag.severity === 'high')
    );
  }

  /**
   * Get urgency level (for sorting)
   */
  getUrgencyLevel(flag: RedFlag): number {
    const severityScore: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const statusScore: Record<string, number> = {
      open: 10,
      under_review: 5,
      escalated: 8,
      resolved: 0,
      dismissed: 0,
      action_taken: 0,
    };

    return (severityScore[flag.severity] || 0) + (statusScore[flag.status] || 0);
  }
}

export const redFlagService = new RedFlagService();
export default redFlagService;