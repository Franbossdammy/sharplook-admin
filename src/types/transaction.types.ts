// Transaction Types
export enum TransactionType {
  // Client Payments (money out via card/external)
  BOOKING_PAYMENT = 'booking_payment',
  ORDER_PAYMENT = 'order_payment',
  SUBSCRIPTION_PAYMENT = 'subscription_payment',

  // Vendor/Seller Earnings (money into wallet)
  BOOKING_EARNING = 'booking_earning',
  ORDER_EARNING = 'order_earning',
  PAYMENT_RECEIVED = 'payment_received',

  // Refunds (money returned to client wallet)
  REFUND = 'refund',
  BOOKING_REFUND = 'booking_refund',
  ORDER_REFUND = 'order_refund',
  CANCELLATION_PENALTY = 'cancellation_penalty',

  // Withdrawals (money out from vendor wallet)
  WITHDRAWAL = 'withdrawal',
  WITHDRAWAL_FEE = 'withdrawal_fee',

  // Platform Fees & Commissions
  COMMISSION = 'commission',
  COMMISSION_DEDUCTION = 'commission_deduction',
  PLATFORM_FEE = 'platform_fee',

  // Wallet Operations
  DEPOSIT = 'deposit',
  WALLET_CREDIT = 'wallet_credit',  // Admin manual credit = platform debt
  WALLET_DEBIT = 'wallet_debit',

  // Special
  REFERRAL_BONUS = 'referral_bonus',

  // Escrow
  ESCROW_LOCK = 'escrow_lock',
  ESCROW_RELEASE = 'escrow_release',
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

// Transaction Interface
export interface Transaction {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: PaymentStatus;
  reference: string;
  description: string;
  booking?: {
    _id: string;
    bookingNumber: string;
    status: string;
    totalAmount?: number;
    bookingType?: 'standard' | 'offer_based';
    servicePrice?: number;
    distanceCharge?: number;
    clientNotes?: string;
    offer?: {
      _id: string;
      title: string;
      proposedPrice: number;
      status: string;
      description?: string;
    };
    client?: { _id: string; firstName: string; lastName: string; email: string };
    vendor?: { _id: string; firstName: string; lastName: string; email: string };
  };
  order?: {
    _id: string;
    orderNumber: string;
    status: string;
    totalAmount?: number;
  };
  payment?: {
    _id: string;
    reference: string;
    amount: number;
    status: string;
    paymentMethod?: string;
  };
  withdrawal?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// Transaction Stats
export interface TransactionStats {
  totalTransactions: number;
  totalVolume: number;
  totalIncome: number;
  totalExpense: number;
  totalCommissions: number;
  totalWithdrawals: number;
  totalRefunds: number;
  bookingEarnings: number;
  orderEarnings: number;
  totalCreditsIssued: number; // Platform liability: admin credits given to users
  netRevenue: number;
  byType: Record<
    string,
    {
      count: number;
      total: number;
    }
  >;
}

// User Transaction Stats
export interface UserTransactionStats {
  totalIncome: number;
  totalExpense: number;
  totalBookingEarnings: number;
  totalOrderEarnings: number;
  totalWithdrawals: number;
  totalRefunds: number;
  transactionCount: number;
  netIncome: number;
}

// Transaction Filters
export interface TransactionFilters {
  userId?: string;
  type?: TransactionType;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
}