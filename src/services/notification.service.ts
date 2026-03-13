import { apiService } from './api.service';
import {
  Notification,
  NotificationStats,
  SendNotificationRequest,
  SendToUsersRequest,
  NotificationSettings,
} from '../types/notification.types';

export class NotificationService {
  /**
   * Send notification to all users (admin)
   */
  async sendToAllUsers(data: SendNotificationRequest): Promise<{ userCount: number }> {
    const response = await apiService.post<any>('/notifications/admin/send-to-all', data);
    
    console.log('📤 SEND TO ALL USERS RESPONSE:', response);
    
    return response.data?.data || response.data || { userCount: 0 };
  }

  /**
   * Send notification to specific users (admin)
   */
  async sendToSpecificUsers(data: SendToUsersRequest): Promise<{ userCount: number }> {
    const response = await apiService.post<any>('/notifications/admin/send-to-users', data);
    
    console.log('📤 SEND TO SPECIFIC USERS RESPONSE:', response);
    
    return response.data?.data || response.data || { userCount: 0 };
  }

  /**
   * Get notification statistics (admin)
   */
  async getNotificationStats(): Promise<NotificationStats> {
    const response = await apiService.get<any>('/notifications/admin/stats');
    
    console.log('📊 NOTIFICATION STATS RESPONSE:', response);
    console.log('Stats Data:', response.data?.stats || response.data?.data || response.data);
    
    return response.data?.stats || response.data?.data || response.data;
  }

  /**
   * Get all notifications (admin)
   */
  async getAllNotifications(
    filters?: {
      type?: string;
      isRead?: boolean;
      isSent?: boolean;
    },
    page: number = 1,
    limit: number = 20
  ): Promise<{ notifications: Notification[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isRead !== undefined) params.append('isRead', String(filters.isRead));
    if (filters?.isSent !== undefined) params.append('isSent', String(filters.isSent));

    const response = await apiService.get<any>(`/notifications/admin/all?${params.toString()}`);

    console.log('📡 ALL NOTIFICATIONS RESPONSE:', response);

    // Handle direct array response
    if (Array.isArray(response.data)) {
      return {
        notifications: response.data,
        total: response.data.length,
        page: page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    // Handle nested data structure
    if (response.data?.data) {
      return response.data.data;
    }

    // Handle notifications property
    if (response.data?.notifications) {
      return {
        notifications: response.data.notifications,
        total: response.data.total || response.data.notifications.length,
        page: response.data.page || page,
        totalPages:
          response.data.totalPages ||
          Math.ceil((response.data.total || response.data.notifications.length) / limit),
      };
    }

    return response.data;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    filters?: {
      type?: string;
      isRead?: boolean;
    },
    page: number = 1,
    limit: number = 20
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isRead !== undefined) params.append('isRead', String(filters.isRead));

    const response = await apiService.get<any>(`/notifications?${params.toString()}`);
    return response.data?.data || response.data;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<any>('/notifications/unread-count');
    return response.data?.count || response.data?.data?.count || 0;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiService.put(`/notifications/${notificationId}/read`);
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<void> {
    await apiService.put('/notifications/read-all');
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiService.delete(`/notifications/${notificationId}`);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await apiService.delete('/notifications');
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiService.get<any>('/notifications/settings');
    return response.data?.settings || response.data?.data || response.data;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    await apiService.put('/notifications/settings', settings);
  }

  /**
   * Register device token
   */
  async registerDeviceToken(
    token: string,
    deviceType: 'ios' | 'android' | 'web',
    deviceName?: string
  ): Promise<void> {
    await apiService.post('/notifications/register-device', {
      token,
      deviceType,
      deviceName,
    });
  }

  /**
   * Unregister device token
   */
  async unregisterDeviceToken(token: string): Promise<void> {
    await apiService.post('/notifications/unregister-device', { token });
  }
}

export const notificationService = new NotificationService();