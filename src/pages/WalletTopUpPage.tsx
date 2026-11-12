import React, { useState } from 'react';
import {
  Wallet,
  Search,
  PlusCircle,
  MinusCircle,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowUpCircle,
  ArrowDownCircle,
  User,
  RefreshCw,
} from 'lucide-react';
import { userService } from '../services/user.service';
import { walletAdminService, WalletTopUpResult, CreditCheckResult } from '../services/walletAdmin.service';
import { auditLogService } from '../services/auditLog.service';
import type { AuditLog } from '../services/auditLog.service';
import { User as UserType } from '../types';

type OperationType = 'credit' | 'debit';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export const WalletTopUpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const [operationType, setOperationType] = useState<OperationType>('credit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<WalletTopUpResult | null>(null);

  // Recent card payments for the selected user, shown before crediting
  const [creditCheck, setCreditCheck] = useState<CreditCheckResult | null>(null);
  const [creditCheckLoading, setCreditCheckLoading] = useState(false);
  const [creditCheckFailed, setCreditCheckFailed] = useState(false);
  const [paymentsReviewed, setPaymentsReviewed] = useState(false);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(1);

  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };

  const fetchAuditLogs = async (page = 1) => {
    setAuditLoading(true);
    try {
      const result = await auditLogService.getAll(page, 10, { resource: 'wallet' });
      setAuditLogs(result.logs);
      setAuditTotal(result.total);
      setAuditTotalPages(result.totalPages);
      setAuditPage(page);
    } catch {
      // silently ignore
    } finally {
      setAuditLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAuditLogs(1);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);
    try {
      const res = await userService.getUsers({ search: searchQuery.trim(), limit: 8 });
      setSearchResults(res.data || []);
    } catch {
      showToast('Failed to search users', 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  const loadCreditCheck = async (userId: string) => {
    setCreditCheck(null);
    setCreditCheckFailed(false);
    setPaymentsReviewed(false);
    setCreditCheckLoading(true);
    try {
      setCreditCheck(await walletAdminService.getCreditCheck(userId));
    } catch {
      setCreditCheckFailed(true);
    } finally {
      setCreditCheckLoading(false);
    }
  };

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchQuery('');
    setLastResult(null);
    loadCreditCheck(user._id);
  };

  const recentCardPayments = creditCheck?.cardPayments || [];
  const enteredAmount = parseFloat(amount);
  const matchingPayment = !isNaN(enteredAmount)
    ? recentCardPayments.find((p) => p.amount === enteredAmount)
    : undefined;
  // A credit can't go through until the admin confirms they've checked the user's recent payments
  const needsPaymentReview =
    operationType === 'credit' &&
    (creditCheckLoading || creditCheckFailed || recentCardPayments.length > 0) &&
    !paymentsReviewed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount || !description.trim()) return;
    if (needsPaymentReview) {
      showToast("Please review the user's recent card payments first", 'error');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid positive amount', 'error');
      return;
    }

    setSubmitting(true);
    setLastResult(null);
    try {
      const payload = {
        userId: selectedUser._id,
        amount: numAmount,
        description: description.trim(),
      };

      const result =
        operationType === 'credit'
          ? await walletAdminService.creditWallet(payload)
          : await walletAdminService.debitWallet(payload);

      setLastResult(result);
      setAmount('');
      setDescription('');
      loadCreditCheck(selectedUser._id);
      showToast(
        operationType === 'credit'
          ? `₦${numAmount.toLocaleString()} credited successfully`
          : `₦${numAmount.toLocaleString()} debited successfully`,
        'success'
      );
      fetchAuditLogs(1);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Operation failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (n: number) =>
    `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const ACTION_BADGE: Record<string, string> = {
    WALLET_CREDIT: 'bg-green-100 text-green-800',
    WALLET_DEBIT: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Wallet className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SharpPay Wallet Top-Up</h1>
          <p className="text-sm text-gray-500">Credit or debit a user's SharpPay wallet. All actions are audited.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Top-Up Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">Wallet Operation</h2>

          {/* Operation Type Toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setOperationType('credit')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                operationType === 'credit'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Credit (Top Up)
            </button>
            <button
              type="button"
              onClick={() => setOperationType('debit')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                operationType === 'debit'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Debit (Reverse)
            </button>
          </div>

          {/* User Search */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Search User</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name, email or phone..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searchLoading}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {searchLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {searchResults.map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected User Card */}
          {selectedUser && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                  {selectedUser.walletBalance !== undefined && (
                    <p className="text-xs text-green-600 font-medium mt-0.5">
                      Balance: {formatCurrency(selectedUser.walletBalance)}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedUser(null); setLastResult(null); setCreditCheck(null); setPaymentsReviewed(false); }}
                className="text-gray-400 hover:text-gray-600 text-xs underline"
              >
                Change
              </button>
            </div>
          )}

          {/* Recent card payments — shown so admins don't credit someone who already paid */}
          {selectedUser && operationType === 'credit' && (
            <div className="space-y-2">
              {creditCheckLoading && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  Checking this user's recent card payments...
                </div>
              )}

              {creditCheckFailed && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                  Couldn't load this user's recent payments. Check their bookings and payments
                  manually before crediting.{' '}
                  <button
                    type="button"
                    onClick={() => loadCreditCheck(selectedUser._id)}
                    className="underline font-medium"
                  >
                    Try again
                  </button>
                </div>
              )}

              {creditCheck && recentCardPayments.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  No card payments from this user in the last 14 days.
                </div>
              )}

              {recentCardPayments.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2 text-amber-900">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold">This user has paid by card recently</p>
                      <p className="text-xs mt-0.5">
                        If they say they paid but nothing happened, check the booking below
                        first. Their payment may already have gone through.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {recentCardPayments.map((p) => (
                      <div
                        key={p.reference}
                        className={`flex items-center justify-between gap-2 text-xs rounded-md px-2.5 py-1.5 ${
                          matchingPayment?.reference === p.reference
                            ? 'bg-red-100 text-red-900 font-medium'
                            : 'bg-white text-gray-700'
                        }`}
                      >
                        <span>
                          {formatCurrency(p.amount)} · {formatDate(p.paidAt)}
                          {p.paymentType ? ` · ${p.paymentType.replace(/_/g, ' ')}` : ''}
                        </span>
                        <span className="text-right">
                          {p.booking
                            ? `Booking ${p.booking.status.replace(/_/g, ' ')}`
                            : p.hasOrder
                            ? 'Order placed'
                            : p.paymentType === 'wallet_funding'
                            ? 'Added to wallet'
                            : 'No booking linked'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {matchingPayment && (
                    <p className="text-xs font-semibold text-red-700">
                      The amount you entered matches a card payment this user already made.
                    </p>
                  )}

                  {(creditCheck?.manualCredits.length ?? 0) > 0 && (
                    <p className="text-xs text-amber-900">
                      Already manually credited in the last 14 days:{' '}
                      {creditCheck!.manualCredits
                        .map((c) => `${formatCurrency(c.amount)} (${formatDate(c.createdAt)})`)
                        .join(', ')}
                    </p>
                  )}

                  <label className="flex items-start gap-2 text-xs text-amber-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentsReviewed}
                      onChange={(e) => setPaymentsReviewed(e.target.checked)}
                      className="mt-0.5"
                    />
                    I've checked these payments. This credit is not for something they already paid for.
                  </label>
                </div>
              )}

              {creditCheckFailed && (
                <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentsReviewed}
                    onChange={(e) => setPaymentsReviewed(e.target.checked)}
                    className="mt-0.5"
                  />
                  I've checked this user's payments manually.
                </label>
              )}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₦)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description / Reason
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a clear reason for this operation (required for audit)"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedUser || needsPaymentReview}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                operationType === 'credit'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {submitting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : operationType === 'credit' ? (
                <PlusCircle className="w-4 h-4" />
              ) : (
                <MinusCircle className="w-4 h-4" />
              )}
              {submitting
                ? 'Processing...'
                : operationType === 'credit'
                ? 'Credit Wallet'
                : 'Debit Wallet'}
            </button>
          </form>

          {/* Success Result */}
          {lastResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                <CheckCircle className="w-4 h-4" />
                Operation Successful
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Previous Balance:</span>
                  <span className="font-medium">{formatCurrency(lastResult.user.previousBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Balance:</span>
                  <span className="font-medium text-green-700">{formatCurrency(lastResult.user.newBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-mono text-xs">{lastResult.transaction.reference}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Audit Trail */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Wallet Audit Trail</h2>
            <button
              type="button"
              onClick={() => fetchAuditLogs(1)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {auditLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">No wallet audit logs yet.</div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log._id} className="border border-gray-100 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-xs ${
                        ACTION_BADGE[log.action] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {log.action.replace('_', ' ')}
                    </span>
                    <span className="text-gray-400">{formatDate(log.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 leading-snug">{log.details}</p>
                  <p className="text-gray-400">
                    By:{' '}
                    <span className="font-medium text-gray-600">
                      {(log.actor as any)?.email || log.actorEmail || 'Admin'}
                    </span>
                    {log.actorRole && (
                      <span className="ml-1 text-gray-400">({log.actorRole})</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {auditTotalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
              <span>{auditTotal} total entries</span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchAuditLogs(auditPage - 1)}
                  disabled={auditPage === 1}
                  className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="px-3 py-1">
                  {auditPage} / {auditTotalPages}
                </span>
                <button
                  onClick={() => fetchAuditLogs(auditPage + 1)}
                  disabled={auditPage === auditTotalPages}
                  className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
