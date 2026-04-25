export interface BookingUser {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  vendorProfile?: {
    businessName?: string;
    rating?: number;
  };
}

export interface BookingServiceRef {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  basePrice?: number;
  category?: string | { _id: string; name: string };
  priceType?: string;
  duration?: number;
}

export interface StatusHistoryEntry {
  status: string;
  changedAt: string;
  changedBy: string | BookingUser;
  reason?: string;
}

export interface Booking {
  _id: string;
  bookingType: 'standard' | 'offer_based';
  client: BookingUser;
  vendor: BookingUser;
  service: BookingServiceRef;
  offer?: {
    _id: string;
    title?: string;
    price?: number;
    description?: string;
  };

  // Schedule
  scheduledDate: string;
  scheduledTime?: string;
  duration?: number;

  // Location (home services)
  location?: {
    type: string;
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
  };

  // Pricing
  servicePrice: number;
  distanceCharge: number;
  totalAmount: number;
  platformFee?: number;
  vendorEarnings?: number;

  // Status
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'rejected' | 'disputed';
  statusHistory?: StatusHistoryEntry[];
  acceptedAt?: string;
  rejectedAt?: string;

  // Notes
  clientNotes?: string;
  vendorNotes?: string;
  notes?: string;

  // Completion
  completedAt?: string;
  completedBy?: 'client' | 'vendor' | 'both';
  clientMarkedComplete?: boolean;
  vendorMarkedComplete?: boolean;

  // Payment
  paymentId?: string;
  paymentStatus: 'pending' | 'escrowed' | 'released' | 'refunded' | 'partially_refunded';
  paymentReference?: string;
  paymentMethod?: string;
  paymentExpiresAt?: string;
  cancellationPenalty?: number;

  // Cancellation
  cancelledAt?: string;
  cancelledBy?: string | BookingUser;
  cancellationReason?: string;

  // Dispute & Review
  hasDispute?: boolean;
  disputeId?: string;
  hasReview?: boolean;
  reviewId?: string;
  review?: {
    rating: number;
    comment: string;
  };

  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFilters {
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  accepted: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue?: number;
}
