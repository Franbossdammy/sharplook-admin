import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Withdrawal } from '../../types/withdrawal.types';

interface RejectWithdrawalModalProps {
  withdrawal: Withdrawal;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const RejectWithdrawalModal: React.FC<RejectWithdrawalModalProps> = ({
  withdrawal,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const handleConfirm = async () => {
    if (!reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(reason);
      setReason('');
    } finally {
      setLoading(false);
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
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Reject Withdrawal</h3>
                <p className="text-sm text-white/80">Provide a reason for rejection</p>
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
          <div className="px-6 py-4 space-y-4">
            {/* Withdrawal Info */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-700">Withdrawal Reference</p>
                <p className="text-sm font-mono text-gray-900">{withdrawal.reference}</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-700">Vendor</p>
                <p className="text-sm text-gray-900">
                  {withdrawal.user.firstName} {withdrawal.user.lastName}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-700">Amount</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(withdrawal.amount)}
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Important</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    The withdrawal amount will be refunded to the vendor's wallet, and they will be
                    notified of the rejection.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-600">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejecting this withdrawal..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be visible to the vendor
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !reason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Rejecting...
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Reject Withdrawal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};