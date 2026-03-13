// Withdrawal Status
export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REJECTED = 'rejected',
}

// Withdrawal Interface
export interface Withdrawal {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    vendorProfile?: {
      businessName: string;
      businessPhone?: string;
    };
  };
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  reference: string;
  withdrawalFee: number;
  netAmount: number;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  processedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  rejectedAt?: string;
  rejectionReason?: string;
  failedAt?: string;
  failureReason?: string;
  paystackRecipientCode?: string;
  paystackTransferCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Withdrawal Stats
export interface WithdrawalStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  rejected: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
}

// Withdrawal Filters
export interface WithdrawalFilters {
  status?: WithdrawalStatus;
  startDate?: string;
  endDate?: string;
}

// Process Withdrawal Request
export interface ProcessWithdrawalRequest {
  withdrawalId: string;
}

// Reject Withdrawal Request
export interface RejectWithdrawalRequest {
  withdrawalId: string;
  reason: string;
}

// Request Withdrawal (User)
export interface RequestWithdrawalData {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  pin: string;
}