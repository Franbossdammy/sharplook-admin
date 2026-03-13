export interface BookingUser {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  vendorProfile?: {
    businessName?: string;
  };
}

export interface BookingServiceRef {
  _id: string;
  name: string;
  images?: string[];
  basePrice?: number;
  category?: string;
}

export interface Booking {
  _id: string;
  bookingType: 'standard' | 'offer_based';
  client: BookingUser;
  vendor: BookingUser;
  service: BookingServiceRef;
  offer?: string;
  scheduledDate: string;
  scheduledTime?: string;
  duration?: number;
  location?: {
    type: string;
    coordinates: [number, number];
    address: string;
    city: string;
    state: string;
  };
  servicePrice: number;
  distanceCharge: number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  statusHistory?: {
    status: string;
    changedAt: string;
    changedBy: string;
    reason?: string;
  }[];
  clientNotes?: string;
  vendorNotes?: string;
  completedAt?: string;
  completedBy?: 'client' | 'vendor' | 'both';
  clientMarkedComplete?: boolean;
  vendorMarkedComplete?: boolean;
  paymentId?: string;
  paymentStatus: 'pending' | 'escrowed' | 'released' | 'refunded' | 'partially_refunded';
  paymentReference?: string;
  cancellationPenalty?: number;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  hasDispute?: boolean;
  hasReview?: boolean;
  review?: {
    rating: number;
    comment: string;
  };
  notes?: string;
  platformFee?: number;
  vendorEarnings?: number;
  paymentMethod?: string;
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
