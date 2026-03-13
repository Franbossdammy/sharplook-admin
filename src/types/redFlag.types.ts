// ==================== RED FLAG TYPES ====================

export type RedFlagType =
  | 'vendor_late_cancellation'
  | 'client_frequent_cancellation'
  | 'suspected_off_platform_meeting'
  | 'location_proximity_no_booking'
  | 'chat_contains_contact_info'
  | 'chat_suggests_outside_payment'
  | 'frequent_refund_requests'
  | 'suspicious_payment_pattern'
  | 'chargeback_attempt'
  | 'multiple_accounts_same_device'
  | 'fake_reviews_detected'
  | 'identity_mismatch'
  | 'service_quality_complaints'
  | 'no_show_vendor'
  | 'no_show_client'
  | 'harassment_reported'
  | 'inappropriate_behavior'
  | 'safety_concern'
  | 'custom';

export type RedFlagSeverity = 'low' | 'medium' | 'high' | 'critical';

export type RedFlagStatus =
  | 'open'
  | 'under_review'
  | 'resolved'
  | 'dismissed'
  | 'escalated'
  | 'action_taken';

export type RedFlagTriggerSource = 'system_auto' | 'user_report' | 'admin_manual' | 'ai_detection';

export type RedFlagResolutionAction =
  | 'warning_issued'
  | 'temporary_suspension'
  | 'permanent_ban'
  | 'fine_applied'
  | 'no_action'
  | 'escalated';

// ==================== INTERFACES ====================

export interface RedFlagUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  vendorProfile?: {
    businessName?: string;
    isVerified?: boolean;
  };
}

export interface RedFlagBooking {
  _id: string;
  scheduledDate: string;
  scheduledTime?: string;
  totalAmount: number;
  status?: string;
}

export interface RedFlagPayment {
  _id: string;
  amount: number;
  status: string;
  paymentMethod: string;
}

export interface RedFlagService {
  _id: string;
  name: string;
  basePrice: number;
}

export interface RedFlagEvidence {
  type: 'location' | 'chat_message' | 'transaction' | 'screenshot' | 'log' | 'other';
  data: any;
  timestamp: string;
}

export interface RedFlagLocationData {
  flaggedUserLocation?: {
    type: string;
    coordinates: [number, number];
    address?: string;
    capturedAt: string;
  };
  relatedUserLocation?: {
    type: string;
    coordinates: [number, number];
    address?: string;
    capturedAt: string;
  };
  distanceMeters?: number;
  proximityDuration?: number;
}

export interface RedFlagSuspiciousMessage {
  messageId: string;
  content: string;
  detectedPatterns: string[];
  confidence: number;
  timestamp: string;
}

export interface RedFlagChatAnalysis {
  suspiciousMessages: RedFlagSuspiciousMessage[];
  overallRiskScore: number;
}

export interface RedFlagMetrics {
  occurrenceCount?: number;
  timeframeDays?: number;
  previousFlagsCount?: number;
  financialImpact?: number;
}

export interface RedFlagResolution {
  action: RedFlagResolutionAction;
  actionDetails?: string;
  resolvedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  resolvedAt: string;
  notes?: string;
}

export interface RedFlagAdminNote {
  note: string;
  addedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  addedAt: string;
}

export interface RedFlag {
  _id: string;
  type: RedFlagType;
  severity: RedFlagSeverity;
  status: RedFlagStatus;
  
  // Users involved
  flaggedUser: RedFlagUser;
  flaggedUserRole: 'client' | 'vendor';
  relatedUser?: RedFlagUser;
  relatedUserRole?: 'client' | 'vendor';
  
  // Trigger info
  triggerSource: RedFlagTriggerSource;
  reportedBy?: RedFlagUser;
  
  // Related entities
  booking?: RedFlagBooking;
  payment?: RedFlagPayment;
  service?: RedFlagService;
  chat?: string;
  review?: string;
  
  // Details
  title: string;
  description: string;
  evidence: RedFlagEvidence[];
  
  // Analysis data
  locationData?: RedFlagLocationData;
  chatAnalysis?: RedFlagChatAnalysis;
  metrics?: RedFlagMetrics;
  
  // Resolution
  resolution?: RedFlagResolution;
  
  // Admin tracking
  adminNotes: RedFlagAdminNote[];
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

// ==================== STATS INTERFACES ====================

export interface RedFlagStats {
  total: number;
  byStatus: {
    open: number;
    underReview: number;
    resolved: number;
    escalated: number;
  };
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  trends: {
    last7Days: number;
    last30Days: number;
  };
}

export interface TopFlaggedUser {
  _id: string;
  flagCount: number;
  types: string[];
  latestFlag: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    vendorProfile?: {
      businessName?: string;
    };
  };
}

export interface RedFlagTypeSummary {
  type: string;
  count: number;
  description: string;
}

// ==================== REQUEST INTERFACES ====================

export interface RedFlagFilters {
  type?: RedFlagType;
  severity?: RedFlagSeverity;
  status?: RedFlagStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateRedFlagStatusRequest {
  status: RedFlagStatus;
  note?: string;
}

export interface ResolveRedFlagRequest {
  action: RedFlagResolutionAction;
  actionDetails?: string;
  notes?: string;
}

export interface AssignRedFlagRequest {
  adminId: string;
}

export interface AddRedFlagNoteRequest {
  note: string;
}

export interface CreateManualRedFlagRequest {
  type: RedFlagType;
  severity: RedFlagSeverity;
  flaggedUserId: string;
  flaggedUserRole: 'client' | 'vendor';
  relatedUserId?: string;
  relatedUserRole?: 'client' | 'vendor';
  title: string;
  description: string;
  bookingId?: string;
  paymentId?: string;
  serviceId?: string;
}

export interface BulkUpdateStatusRequest {
  flagIds: string[];
  status: RedFlagStatus;
  note?: string;
}

// ==================== RESPONSE INTERFACES ====================

export interface RedFlagListResponse {
  flags: RedFlag[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BulkUpdateResponse {
  total: number;
  successful: number;
  failed: number;
}