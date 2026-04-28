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
  ArrowRight,
  AlertCircle,
  Tag,
  Info,
  Briefcase,
} from 'lucide-react';
import { Transaction, TransactionType } from '../../types/transaction.types';

interface TransactionDetailsModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

type Classification = 'income' | 'expense' | 'debt';

function getClassification(type: TransactionType): Classification {
  if (type === TransactionType.WALLET_CREDIT) return 'debt';
  const incomeTypes: TransactionType[] = [
    TransactionType.BOOKING_EARNING,
    TransactionType.ORDER_EARNING,
    TransactionType.PAYMENT_RECEIVED,
    TransactionType.DEPOSIT,
    TransactionType.REFUND,
    TransactionType.BOOKING_REFUND,
    TransactionType.ORDER_REFUND,
    TransactionType.ESCROW_RELEASE,
    TransactionType.REFERRAL_BONUS,
  ];
  return incomeTypes.includes(type) ? 'income' : 'expense';
}

interface MoneyFlow {
  from: string;
  to: string;
  what: string;
  note?: string;
}

function getMoneyFlow(transaction: Transaction): MoneyFlow {
  const userName = `${transaction.user.firstName} ${transaction.user.lastName}`;
  switch (transaction.type) {
    case TransactionType.BOOKING_PAYMENT:
      return {
        from: userName + ' (Client)',
        to: 'Platform Escrow',
        what: 'Client pays for booking via card/bank',
        note: 'Held in escrow until booking is completed',
      };
    case TransactionType.BOOKING_EARNING:
      return {
        from: 'Platform Escrow',
        to: userName + ' (Vendor)',
        what: 'Vendor earning released after booking completion',
        note: 'Net amount after platform commission is deducted',
      };
    case TransactionType.ORDER_PAYMENT:
      return {
        from: userName + ' (Client)',
        to: 'Platform Escrow',
        what: 'Client pays for order via card/bank',
        note: 'Held in escrow until order is delivered',
      };
    case TransactionType.ORDER_EARNING:
      return {
        from: 'Platform Escrow',
        to: userName + ' (Seller)',
        what: 'Seller earning released after order completion',
        note: 'Net amount after platform commission is deducted',
      };
    case TransactionType.PAYMENT_RECEIVED:
      return {
        from: 'External / Card',
        to: userName + ' (Wallet)',
        what: 'Direct payment received into wallet',
      };
    case TransactionType.WALLET_CREDIT:
      return {
        from: 'Platform (Admin)',
        to: userName + ' (Wallet)',
        what: 'Admin manually credited user wallet',
        note: 'This is a platform liability — money given out, not earned',
      };
    case TransactionType.WALLET_DEBIT:
      return {
        from: userName + ' (Wallet)',
        to: 'Platform',
        what: 'Manual wallet deduction',
      };
    case TransactionType.WITHDRAWAL:
      return {
        from: userName + ' (Wallet)',
        to: userName + ' (Bank Account)',
        what: 'Vendor withdraws earnings to bank account',
        note: 'Withdrawal fee may apply separately',
      };
    case TransactionType.WITHDRAWAL_FEE:
      return {
        from: userName + ' (Wallet)',
        to: 'Platform',
        what: 'Fee charged for processing withdrawal',
      };
    case TransactionType.COMMISSION_DEDUCTION:
      return {
        from: userName + ' (Wallet)',
        to: 'Platform Revenue',
        what: 'Platform commission deducted from vendor earnings',
      };
    case TransactionType.PLATFORM_FEE:
      return {
        from: userName + ' (Wallet)',
        to: 'Platform Revenue',
        what: 'Platform service fee',
      };
    case TransactionType.REFUND:
    case TransactionType.BOOKING_REFUND:
    case TransactionType.ORDER_REFUND:
      return {
        from: 'Platform Escrow',
        to: userName + ' (Wallet)',
        what: 'Refund issued back to user',
        note: 'Original payment returned due to cancellation or dispute resolution',
      };
    case TransactionType.CANCELLATION_PENALTY:
      return {
        from: userName + ' (Wallet)',
        to: 'Platform',
        what: 'Penalty charged for late cancellation',
      };
    case TransactionType.ESCROW_LOCK:
      return {
        from: userName + ' (Wallet)',
        to: 'Platform Escrow',
        what: 'Payment locked in escrow for active booking/order',
        note: 'Released to vendor after completion or refunded on cancellation',
      };
    case TransactionType.ESCROW_RELEASE:
      return {
        from: 'Platform Escrow',
        to: userName + ' (Wallet)',
        what: 'Escrow payment released after service completion',
      };
    case TransactionType.REFERRAL_BONUS:
      return {
        from: 'Platform',
        to: userName + ' (Wallet)',
        what: 'Referral reward bonus credited to wallet',
      };
    case TransactionType.DEPOSIT: {
      const method = transaction.metadata?.paymentMethod || 'card';
      const ref = transaction.metadata?.paystackReference;
      return {
        from: `User (${method.charAt(0).toUpperCase() + method.slice(1)} / Paystack)`,
        to: userName + ' (Wallet)',
        what: `User funded their own wallet via ${method}`,
        note: ref ? `Paystack reference: ${ref}` : undefined,
      };
    }
    default:
      return {
        from: 'Source',
        to: 'Destination',
        what: transaction.description,
      };
  }
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const classification = getClassification(transaction.type);
  const moneyFlow = getMoneyFlow(transaction);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const getTransactionTypeLabel = (type: TransactionType) => {
    if (type === TransactionType.WALLET_CREDIT) return 'Manual Credit (Platform Debt)';
    if (type === TransactionType.DEPOSIT) return 'Wallet Top-Up (User Funded)';
    return type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const classificationConfig = {
    income: {
      label: 'Income',
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      amountColor: 'text-green-600',
      sign: '+',
      icon: <ArrowUpRight className="w-8 h-8 text-green-600" />,
      iconBg: 'bg-green-100',
      badgeBg: 'bg-green-100 text-green-700',
    },
    expense: {
      label: 'Expense / Outflow',
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      amountColor: 'text-red-600',
      sign: '-',
      icon: <ArrowDownLeft className="w-8 h-8 text-red-600" />,
      iconBg: 'bg-red-100',
      badgeBg: 'bg-red-100 text-red-700',
    },
    debt: {
      label: 'Platform Debt / Liability',
      bg: 'bg-orange-50 border-orange-200',
      text: 'text-orange-700',
      amountColor: 'text-orange-600',
      sign: '−',
      icon: <AlertCircle className="w-8 h-8 text-orange-600" />,
      iconBg: 'bg-orange-100',
      badgeBg: 'bg-orange-100 text-orange-700',
    },
  };

  const cfg = classificationConfig[classification];

  const isOfferBased = transaction.booking?.bookingType === 'offer_based';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                <p className="text-sm text-white/80 font-mono">{transaction.reference}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto">

            {/* Classification Banner */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${cfg.bg}`}>
              <div className={`p-2 rounded-full ${cfg.iconBg}`}>{cfg.icon}</div>
              <div className="flex-1">
                <p className={`text-xs font-medium ${cfg.text} uppercase tracking-wide`}>
                  Classification
                </p>
                <p className={`font-semibold ${cfg.text}`}>{cfg.label}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${cfg.badgeBg}`}>
                {getTransactionTypeLabel(transaction.type)}
              </span>
            </div>

            {/* Special note for WALLET_CREDIT */}
            {classification === 'debt' && (
              <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700">
                  This is a <strong>Manual Credit</strong> — the platform gave this money to the
                  user. It is NOT income; it is a platform liability/debt because the user received
                  these funds to use on the platform.
                </p>
              </div>
            )}

            {/* Amount + Balance Change */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`col-span-1 p-4 rounded-lg border ${cfg.bg} flex flex-col items-center justify-center`}>
                <p className={`text-xs font-medium ${cfg.text} mb-1`}>Amount</p>
                <p className={`text-2xl font-bold ${cfg.amountColor}`}>
                  {cfg.sign}{formatCurrency(transaction.amount)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-xs text-gray-500 mb-1">Balance Before</p>
                <p className="text-lg font-semibold text-gray-700">
                  {formatCurrency(transaction.balanceBefore)}
                </p>
              </div>
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200 text-center">
                <p className="text-xs text-primary-600 mb-1">Balance After</p>
                <p className="text-lg font-semibold text-primary-900">
                  {formatCurrency(transaction.balanceAfter)}
                </p>
              </div>
            </div>

            {/* Money Flow */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" /> Money Flow
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-white rounded-lg border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 mb-1">FROM</p>
                  <p className="text-sm font-medium text-gray-900">{moneyFlow.from}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 p-3 bg-white rounded-lg border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 mb-1">TO</p>
                  <p className="text-sm font-medium text-gray-900">{moneyFlow.to}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700">{moneyFlow.what}</p>
              {moneyFlow.note && (
                <p className="mt-1 text-xs text-gray-500 italic">{moneyFlow.note}</p>
              )}
            </div>

            {/* Status + Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Transaction Type
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {getTransactionTypeLabel(transaction.type)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
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
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> User
              </p>
              <p className="font-semibold text-gray-900">
                {transaction.user.firstName} {transaction.user.lastName}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">{transaction.user.email}</p>
              {transaction.user.phone && (
                <p className="text-sm text-gray-600">{transaction.user.phone}</p>
              )}
            </div>

            {/* Description */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Description</p>
              <p className="text-sm text-gray-900">{transaction.description}</p>
            </div>

            {/* Offer-Based Booking Chain */}
            {transaction.booking && isOfferBased && transaction.booking.offer && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Offer → Booking → Payment Chain
                </p>
                <div className="space-y-2">
                  {/* Offer */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-100">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">1</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-700">Offer Created</p>
                      <p className="text-sm text-gray-900 font-medium">{transaction.booking.offer.title}</p>
                      <p className="text-xs text-gray-500">
                        Proposed price: {formatCurrency(transaction.booking.offer.proposedPrice)}
                        {' · '}Status: {transaction.booking.offer.status}
                      </p>
                      {transaction.booking.offer.description && (
                        <p className="text-xs text-gray-500 mt-1">{transaction.booking.offer.description}</p>
                      )}
                    </div>
                  </div>
                  {/* Booking */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-100">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">2</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-700">Booking Created from Offer</p>
                      <p className="text-sm text-gray-900 font-medium">#{transaction.booking.bookingNumber}</p>
                      <p className="text-xs text-gray-500">Status: {transaction.booking.status}</p>
                      {transaction.booking.servicePrice !== undefined && (
                        <p className="text-xs text-gray-500">
                          Service: {formatCurrency(transaction.booking.servicePrice)}
                          {transaction.booking.distanceCharge
                            ? ` + Distance: ${formatCurrency(transaction.booking.distanceCharge)}`
                            : ''}
                          {' → '}Total: {formatCurrency(transaction.booking.totalAmount || 0)}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Payment */}
                  {transaction.payment && (
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-100">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-purple-600">3</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-purple-700">Payment Processed</p>
                        <p className="text-xs text-gray-500 font-mono">{transaction.payment.reference}</p>
                        <p className="text-xs text-gray-500">
                          Amount: {formatCurrency(transaction.payment.amount)}
                          {' · '}Status: {transaction.payment.status}
                          {transaction.payment.paymentMethod
                            ? ` · Method: ${transaction.payment.paymentMethod}`
                            : ''}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* This Transaction */}
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-100">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">4</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-700">This Transaction</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {getTransactionTypeLabel(transaction.type)} → {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        User wallet: {formatCurrency(transaction.balanceBefore)} → {formatCurrency(transaction.balanceAfter)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Booking (not offer-based) */}
            {transaction.booking && !isOfferBased && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Booking Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Booking Number</p>
                    <p className="text-sm font-semibold text-gray-900">#{transaction.booking.bookingNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Booking Status</p>
                    <p className="text-sm font-semibold text-gray-900">{transaction.booking.status}</p>
                  </div>
                  {transaction.booking.totalAmount && (
                    <div>
                      <p className="text-xs text-gray-500">Booking Total</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.booking.totalAmount)}</p>
                    </div>
                  )}
                  {transaction.booking.servicePrice !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500">Service Price</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.booking.servicePrice)}</p>
                    </div>
                  )}
                  {transaction.booking.client && (
                    <div>
                      <p className="text-xs text-gray-500">Client</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {transaction.booking.client.firstName} {transaction.booking.client.lastName}
                      </p>
                    </div>
                  )}
                  {transaction.booking.vendor && (
                    <div>
                      <p className="text-xs text-gray-500">Vendor</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {transaction.booking.vendor.firstName} {transaction.booking.vendor.lastName}
                      </p>
                    </div>
                  )}
                </div>
                {transaction.payment && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-gray-500 mb-1">Payment Reference</p>
                    <p className="text-xs font-mono text-gray-700">{transaction.payment.reference}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatCurrency(transaction.payment.amount)} · {transaction.payment.status}
                      {transaction.payment.paymentMethod ? ` · ${transaction.payment.paymentMethod}` : ''}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Order Details */}
            {transaction.order && (
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Order Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Order Number</p>
                    <p className="text-sm font-semibold text-gray-900">#{transaction.order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Order Status</p>
                    <p className="text-sm font-semibold text-gray-900">{transaction.order.status}</p>
                  </div>
                  {transaction.order.totalAmount && (
                    <div>
                      <p className="text-xs text-gray-500">Order Total</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.order.totalAmount)}</p>
                    </div>
                  )}
                </div>
                {transaction.payment && (
                  <div className="mt-3 pt-3 border-t border-indigo-200">
                    <p className="text-xs text-gray-500 mb-1">Payment Reference</p>
                    <p className="text-xs font-mono text-gray-700">{transaction.payment.reference}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatCurrency(transaction.payment.amount)} · {transaction.payment.status}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Payment only (no booking/order) */}
            {transaction.payment && !transaction.booking && !transaction.order && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Payment Record
                </p>
                <p className="text-xs text-gray-500">Reference</p>
                <p className="text-sm font-mono text-gray-900">{transaction.payment.reference}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatCurrency(transaction.payment.amount)} · {transaction.payment.status}
                  {transaction.payment.paymentMethod ? ` · ${transaction.payment.paymentMethod}` : ''}
                </p>
              </div>
            )}

            {/* Metadata */}
            {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Additional Metadata
                </p>
                <pre className="text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(transaction.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5" /> Created
                </p>
                <p className="text-sm font-medium text-gray-900">{formatDate(transaction.createdAt)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5" /> Updated
                </p>
                <p className="text-sm font-medium text-gray-900">{formatDate(transaction.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
