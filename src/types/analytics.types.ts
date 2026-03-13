// Dashboard Overview Types
export interface DashboardOverview {
  users: {
    total: number;
    vendors: number;
    clients: number;
    activeVendors: number;
  };
  bookings: {
    total: number;
    completed: number;
    active: number;
    completionRate: string;
  };
  revenue: {
    total: number;
    thisMonth: number;
  };
  services: {
    total: number;
    avgRating: string;
  };
}

// User Analytics Types
export interface UserAnalytics {
  total: number;
  byRole: Array<{
    _id: string;
    count: number;
  }>;
  byMonth: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
  }>;
  newToday: number;
}

// Booking Analytics Types
export interface BookingAnalytics {
  total: number;
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
  byType: Array<{
    _id: string;
    count: number;
  }>;
  byMonth: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
    revenue: number;
  }>;
  avgValue: number;
  topServices: Array<{
    serviceName: string;
    bookings: number;
  }>;
}

// Revenue Analytics Types
export interface RevenueAnalytics {
  totalRevenue: number;
  platformFees: number;
  vendorPayouts: number;
  avgTransactionValue: number;
  byMonth: Array<{
    _id: {
      year: number;
      month: number;
    };
    revenue: number;
    platformFee: number;
    vendorAmount: number;
  }>;
  paymentMethods: Array<{
    _id: string;
    count: number;
  }>;
}

// Service Analytics Types
export interface ServiceAnalytics {
  totalServices: number;
  byCategory: Array<{
    _id: string;
    categoryName: string;
    count: number;
  }>;
  topRated: Array<{
    _id: string;
    name: string;
    rating: number;
    reviews: number;
  }>;
  mostBooked: Array<{
    _id: string;
    name: string;
    bookings: number;
    completedBookings: number;
  }>;
}

// Vendor Performance Types
export interface VendorPerformance {
  topVendors: Array<{
    _id: string;
    vendorName: string;
    totalBookings: number;
    totalRevenue: number;
    rating: number;
  }>;
  avgResponseTime: number;
  topRated: Array<{
    _id: string;
    avgRating: number;
    totalReviews: number;
  }>;
}

// Dispute Analytics Types
export interface DisputeAnalytics {
  total: number;
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
  byCategory: Array<{
    _id: string;
    count: number;
  }>;
  avgResolutionTime: string;
}

// Referral Analytics Types
export interface ReferralAnalytics {
  totalReferrals: number;
  completedReferrals: number;
  totalRewardsPaid: number;
  conversionRate: string;
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// Date Range Filter
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}