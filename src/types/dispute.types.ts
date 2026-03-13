// Booking Dispute Types
export enum BookingDisputeStatus {
  OPEN = 'open',
  IN_REVIEW = 'in_review',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum BookingDisputeResolution {
  REFUND_CLIENT = 'refund_client',
  PAY_VENDOR = 'pay_vendor',
  PARTIAL_REFUND = 'partial_refund',
  NO_ACTION = 'no_action',
}

export interface BookingDispute {
  _id: string;
  booking: {
    _id: string;
    service?: string;
    scheduledDate?: string;
    totalAmount?: number;
  };
  raisedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  against: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  reason: string;
  description: string;
  category: string;
  status: BookingDisputeStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  resolution?: BookingDisputeResolution;
  resolutionDetails?: string;
  refundAmount?: number;
  vendorPaymentAmount?: number;
  evidence: Array<{
    type: string;
    content: string;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  messages: Array<{
    sender: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    message: string;
    attachments?: string[];
    sentAt: string;
  }>;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  closedAt?: string;
  closedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Product Dispute Types
export enum ProductDisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ProductDisputeReason {
  PRODUCT_NOT_RECEIVED = 'product_not_received',
  PRODUCT_NOT_AS_DESCRIBED = 'product_not_as_described',
  DEFECTIVE_PRODUCT = 'defective_product',
  WRONG_ITEM = 'wrong_item',
  PAYMENT_ISSUE = 'payment_issue',
  SELLER_UNRESPONSIVE = 'seller_unresponsive',
  OTHER = 'other',
}

export enum ProductDisputeResolution {
  FULL_REFUND = 'full_refund',
  PARTIAL_REFUND = 'partial_refund',
  SELLER_WINS = 'seller_wins',
  CUSTOMER_WINS = 'customer_wins',
}

export interface ProductDispute {
  _id: string;
  order: {
    _id: string;
    orderNumber?: string;
    totalAmount: number;
  };
  product?: {
    _id: string;
    name: string;
    images?: string[];
  };
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  reason: ProductDisputeReason;
  description: string;
  evidence?: string[];
  status: ProductDisputeStatus;
  priority: 'low' | 'medium' | 'high';
  resolution?: ProductDisputeResolution;
  resolutionNote?: string;
  refundAmount?: number;
  messages: Array<{
    sender: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    senderRole: 'customer' | 'seller' | 'admin';
    message: string;
    attachments?: string[];
    sentAt: string;
  }>;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  assignedAt?: string;
  resolvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  resolvedAt?: string;
  closedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  closedAt?: string;
  closureNote?: string;
  isEscalated?: boolean;
  escalatedAt?: string;
  escalatedReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Common types
export interface DisputeStats {
  total: number;
  open: number;
  inReview?: number;
  underReview?: number;
  resolved: number;
  closed: number;
  activeDisputes?: number;
  highPriorityDisputes?: number;
  byCategory?: Array<{
    _id: string;
    count: number;
  }>;
  byPriority?: Array<{
    _id: string;
    count: number;
  }>;
}

export interface DisputeFilters {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  reason?: string;
}

export type Dispute = BookingDispute | ProductDispute;
export type DisputeStatus = BookingDisputeStatus | ProductDisputeStatus;
export type DisputeResolution = BookingDisputeResolution | ProductDisputeResolution;