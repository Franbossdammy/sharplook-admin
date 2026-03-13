// Notification Types
export enum NotificationType {
  // Booking
  BOOKING_CREATED = 'booking_created',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_STARTED = 'booking_started',
  BOOKING_COMPLETED = 'booking_completed',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_RESCHEDULED = 'booking_rescheduled',
  BOOKING_REMINDER = 'booking_reminder',

  // Payment
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_SUCCESSFUL = 'payment_successful',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUNDED = 'payment_refunded',
  WITHDRAWAL_APPROVED = 'withdrawal_approved',
  WITHDRAWAL_REJECTED = 'withdrawal_rejected',

  // Messages
  NEW_MESSAGE = 'new_message',

  // Offers
  NEW_OFFER_NEARBY = 'new_offer_nearby',
  OFFER_RESPONSE = 'offer_response',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_COUNTER = 'offer_counter',

  // Promotional
  PROMOTIONAL = 'promotional',
  NEW_OFFER = 'new_offer',

  // System
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  ACCOUNT_UPDATE = 'account_update',
}

// Notification Channels
export interface NotificationChannels {
  push: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

// Notification Interface
export interface Notification {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  type: NotificationType;
  title: string;
  message: string;
  relatedBooking?: string;
  relatedPayment?: string;
  relatedDispute?: string;
  relatedReview?: string;
  relatedMessage?: string;
  actionUrl?: string;
  channels: NotificationChannels;
  data?: any;
  isRead: boolean;
  readAt?: string;
  isSent: boolean;
  sentAt?: string;
  failedAt?: string;
  failureReason?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Stats
export interface NotificationStats {
  total: number;
  sent: number;
  read: number;
  unread: number;
  byType: Record<string, number>;
}

// Send Notification Request
export interface SendNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  channels?: Partial<NotificationChannels>;
  filters?: {
    role?: 'vendor' | 'client' | 'all';
    isVerified?: boolean;
  };
}

// Send to Specific Users Request
export interface SendToUsersRequest {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  channels?: Partial<NotificationChannels>;
}

// Notification Settings
export interface NotificationSettings {
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  bookingUpdates: boolean;
  newMessages: boolean;
  paymentAlerts: boolean;
  reminderNotifications: boolean;
  promotions: boolean;
}