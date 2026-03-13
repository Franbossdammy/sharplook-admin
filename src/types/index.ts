// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'client' | 'vendor' | 'super_admin' | 'admin' | 'financial_admin' | 'analytics_admin' | 'support';
  isVendor: boolean;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export interface Booking {
  _id: string;
  service: string;
  client: User;
  vendor: User;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  totalAmount: number;
  commission: number;
  createdAt: string;
  updatedAt: string;
}

// Dispute Types
export interface Dispute {
  _id: string;
  booking: string;
  category: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  requestedResolution: string;
  resolution?: string;
  refundAmount?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Referral Types
export interface Referral {
  _id: string;
  referrer: User;
  referee: User;
  status: 'pending' | 'completed' | 'expired';
  rewardAmount: number;
  createdAt: string;
  completedAt?: string;
}

// Analytics Types
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    vendors: number;
    newThisMonth: number;
  };
  bookings: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    commission: number;
    thisMonth: number;
    avgBooking: number;
  };
  disputes: {
    active: number;
    resolved: number;
    total: number;
  };
  recentActivity?: Activity[];
}

export interface Activity {
  type: string;
  description: string;
  time: string;
}

export interface UserAnalytics {
  total: number;
  active: number;
  vendors: number;
  newThisMonth: number;
  growthRate?: number;
}

export interface BookingAnalytics {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
  completionRate?: number;
}

export interface RevenueAnalytics {
  total: number;
  commission: number;
  thisMonth: number;
  avgBooking: number;
  monthlyData?: Array<{ month: string; revenue: number }>;
}

export interface ServiceAnalytics {
  total: number;
  active: number;
  mostPopular: string;
  avgRating: number;
}

// Referral Stats
export interface ReferralStats {
  totalReferrals: number;
  completed: number;
  pending: number;
  totalRewards: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  data : any;
}

// Form Types
export interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
}

export interface DisputeResolution {
  resolution: 'full_refund' | 'partial_refund' | 'no_refund';
  refundAmount: number;
  adminNotes: string;
}
