export interface SubscriptionVendor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  businessName?: string;
}

export interface Subscription {
  _id: string;
  vendor: SubscriptionVendor;
  type: 'in_shop' | 'home_service' | 'both';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  monthlyFee: number;
  commissionRate: number;
  autoRenew: boolean;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  lastPaymentReference?: string;
  nextPaymentDue?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  features?: string[];
  paymentHistory?: Array<{
    amount: number;
    date: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionFilters {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  pending?: number;
  cancelled: number;
  expired: number;
  totalRevenue: number;
  revenueByType?: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
}
