import React from 'react';
import {
  X,
  DollarSign,
  User,
  Calendar,
  FileText,
  Package,
  ShoppingCart,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Transaction, TransactionType } from '../../types/transaction.types';

interface TransactionDetailsModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
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

  const getTransactionTypeLabel = (type: TransactionType) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isIncome = [
    TransactionType.BOOKING_EARNING,
    TransactionType.ORDER_EARNING,
    TransactionType.PAYMENT_RECEIVED,
    TransactionType.WALLET_CREDIT,
    TransactionType.REFUND,
  ].includes(transaction.type);

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
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                <p className="text-sm text-white/80">{transaction.reference}</p>
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
          <div className="px-6 py-4 space-y-6">
            {/* Amount and Type */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction Amount</p>
                <p className={`text-3xl font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncome ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${
                  isIncome ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {isIncome ? (
                  <ArrowUpRight className={`w-8 h-8 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
                ) : (
                  <ArrowDownLeft className="w-8 h-8 text-red-600" />
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Type
                </p>
                <p className="font-medium text-gray-900">
                  {getTransactionTypeLabel(transaction.type)}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    transaction.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : transaction.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : transaction.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {transaction.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                User
              </p>
              <p className="font-medium text-gray-900">
                {transaction.user.firstName} {transaction.user.lastName}
              </p>
              <p className="text-sm text-gray-600 mt-1">{transaction.user.email}</p>
              {transaction.user.phone && (
                <p className="text-sm text-gray-600">{transaction.user.phone}</p>
              )}
            </div>

            {/* Balance Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Balance Before</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(transaction.balanceBefore)}
                </p>
              </div>

              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <p className="text-sm text-primary-700 mb-1">Balance After</p>
                <p className="text-lg font-semibold text-primary-900">
                  {formatCurrency(transaction.balanceAfter)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
              <p className="text-sm text-gray-900">{transaction.description}</p>
            </div>

            {/* Related Info */}
            {(transaction.booking || transaction.order || transaction.payment) && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Related Information</p>

                {transaction.booking && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-700">Booking</p>
                    </div>
                    <p className="text-sm text-gray-900">
                      #{transaction.booking.bookingNumber}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Status: {transaction.booking.status}
                    </p>
                    {transaction.booking.totalAmount && (
                      <p className="text-xs text-gray-600">
                        Amount: {formatCurrency(transaction.booking.totalAmount)}
                      </p>
                    )}
                  </div>
                )}

                {transaction.order && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-4 h-4 text-purple-600" />
                      <p className="text-sm font-medium text-purple-700">Order</p>
                    </div>
                    <p className="text-sm text-gray-900">#{transaction.order.orderNumber}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Status: {transaction.order.status}
                    </p>
                    {transaction.order.totalAmount && (
                      <p className="text-xs text-gray-600">
                        Amount: {formatCurrency(transaction.order.totalAmount)}
                      </p>
                    )}
                  </div>
                )}

                {transaction.payment && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-green-700">Payment</p>
                    </div>
                    <p className="text-sm text-gray-900">{transaction.payment.reference}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Amount: {formatCurrency(transaction.payment.amount)}
                    </p>
                    <p className="text-xs text-gray-600">Status: {transaction.payment.status}</p>
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Additional Information</p>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(transaction.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" />
                  Created
                </p>
                <p className="font-medium text-gray-900">{formatDate(transaction.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" />
                  Updated
                </p>
                <p className="font-medium text-gray-900">{formatDate(transaction.updatedAt)}</p>
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