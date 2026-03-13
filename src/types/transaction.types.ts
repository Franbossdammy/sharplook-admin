// Transaction Types
export enum TransactionType {
  // Booking
  BOOKING_PAYMENT = 'booking_payment',
  BOOKING_EARNING = 'booking_earning',

  // Order
  ORDER_PAYMENT = 'order_payment',
  ORDER_EARNING = 'order_earning',

  // Payment
  PAYMENT_RECEIVED = 'payment_received',

  // Wallet
  WALLET_CREDIT = 'wallet_credit',
  WALLET_DEBIT = 'wallet_debit',

  // Withdrawal
  WITHDRAWAL = 'withdrawal',

  // Commission
  COMMISSION_DEDUCTION = 'commission_deduction',

  // Refund
  REFUND = 'refund',
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