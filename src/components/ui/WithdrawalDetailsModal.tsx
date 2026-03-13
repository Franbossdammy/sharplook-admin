import React from 'react';
import {
  X,
  Wallet,
  User,
  Building,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
} from 'lucide-react';
import { Withdrawal, WithdrawalStatus } from '../../types/withdrawal.types';

interface WithdrawalDetailsModalProps {
  withdrawal: Withdrawal;
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawalDetailsModal: React.FC<WithdrawalDetailsModalProps> = ({
  withdrawal,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const getStatusColor = (status: WithdrawalStatus) => {
    switch (status) {
      case WithdrawalStatus.PENDING:
        return 'bg-yellow-100 text-yellow-700';
      case WithdrawalStatus.PROCESSING:
        return 'bg-blue-100 text-blue-700';
      case WithdrawalStatus.COMPLETED:
        return 'bg-green-100 text-green-700';
      case WithdrawalStatus.FAILED:
        return 'bg-red-100 text-red-700';
      case WithdrawalStatus.REJECTED:
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: WithdrawalStatus) => {
    switch (status) {
      case WithdrawalStatus.PENDING:
        return <Clock className="w-6 h-6" />;
      case WithdrawalStatus.PROCESSING:
        return <Loader className="w-6 h-6 animate-spin" />;
      case WithdrawalStatus.COMPLETED:
        return <CheckCircle className="w-6 h-6" />;
      case WithdrawalStatus.FAILED:
        return <XCircle className="w-6 h-6" />;
      case WithdrawalStatus.REJECTED:
        return <AlertCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Withdrawal Details</h3>
                <p className="text-sm text-white/80">{withdrawal.reference}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Status and Amount */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Withdrawal Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(withdrawal.amount)}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-xs text-gray-600">Fee</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(withdrawal.withdrawalFee)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Net Amount</p>
                    <p className="text-sm font-bold text-primary-600">
                      {formatCurrency(withdrawal.netAmount)}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`p-3 rounded-full ${getStatusColor(withdrawal.status)}`}>
                {getStatusIcon(withdrawal.status)}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-700">Status:</p>
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                  withdrawal.status
                )}`}
              >
                {withdrawal.status.toUpperCase()}
              </span>
            </div>

            {/* Vendor Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Vendor
              </p>
              <p className="font-medium text-gray-900">
                {withdrawal.user.firstName} {withdrawal.user.lastName}
              </p>
              <p className="text-sm text-gray-600 mt-1">{withdrawal.user.email}</p>
              {withdrawal.user.phone && (
                <p className="text-sm text-gray-600">{withdrawal.user.phone}</p>
              )}
              {withdrawal.user.vendorProfile?.businessName && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">Business Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {withdrawal.user.vendorProfile.businessName}
                  </p>
                </div>
              )}
            </div>

            {/* Bank Details */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-700 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Bank Details
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-blue-600">Bank Name</p>
                  <p className="text-sm font-medium text-gray-900">{withdrawal.bankName}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Account Number</p>
                  <p className="text-sm font-medium text-gray-900">{withdrawal.accountNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Account Name</p>
                  <p className="text-sm font-medium text-gray-900">{withdrawal.accountName}</p>
                </div>
              </div>
            </div>

            {/* Rejection/Failure Info */}
            {withdrawal.status === WithdrawalStatus.REJECTED && withdrawal.rejectionReason && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Rejection Reason
                </p>
                <p className="text-sm text-gray-900">{withdrawal.rejectionReason}</p>
                {withdrawal.rejectedAt && (
                  <p className="text-xs text-red-600 mt-2">
                    Rejected on: {formatDate(withdrawal.rejectedAt)}
                  </p>
                )}
              </div>
            )}

            {withdrawal.status === WithdrawalStatus.FAILED && withdrawal.failureReason && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Failure Reason
                </p>
                <p className="text-sm text-gray-900">{withdrawal.failureReason}</p>
                {withdrawal.failedAt && (
                  <p className="text-xs text-red-600 mt-2">
                    Failed on: {formatDate(withdrawal.failedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Paystack Info */}
            {(withdrawal.paystackRecipientCode || withdrawal.paystackTransferCode) && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-700 mb-3">Paystack Information</p>
                {withdrawal.paystackRecipientCode && (
                  <div className="mb-2">
                    <p className="text-xs text-purple-600">Recipient Code</p>
                    <p className="text-sm font-mono text-gray-900">
                      {withdrawal.paystackRecipientCode}
                    </p>
                  </div>
                )}
                {withdrawal.paystackTransferCode && (
                  <div>
                    <p className="text-xs text-purple-600">Transfer Code</p>
                    <p className="text-sm font-mono text-gray-900">
                      {withdrawal.paystackTransferCode}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Processed By */}
            {withdrawal.processedBy && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-700 mb-2">Processed By</p>
                <p className="text-sm text-gray-900">
                  {withdrawal.processedBy.firstName} {withdrawal.processedBy.lastName}
                </p>
                <p className="text-xs text-gray-600">{withdrawal.processedBy.email}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 flex items-center gap-2 mb-1">
                  <Calendar className="w-3 h-3" />
                  Requested
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(withdrawal.requestedAt)}
                </p>
              </div>

              {withdrawal.processedAt && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3" />
                    Processed
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(withdrawal.processedAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Created/Updated */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" />
                  Created
                </p>
                <p className="font-medium text-gray-900">{formatDate(withdrawal.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" />
                  Updated
                </p>
                <p className="font-medium text-gray-900">{formatDate(withdrawal.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};