import React, { useEffect, useState } from 'react';
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  ChevronDown,
  X,
  Loader,
} from 'lucide-react';
import { withdrawalService } from '../services/withdrawal.service';
import {
  Withdrawal,
  WithdrawalStats,
  WithdrawalStatus,
  WithdrawalFilters,
} from '../types/withdrawal.types';
import { WithdrawalDetailsModal } from '../components/ui/WithdrawalDetailsModal';
import { RejectWithdrawalModal } from '../components/ui/RejectWithdrawalModal';
import { Toast } from '../components/ui/Toast';

export const WithdrawalsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState<WithdrawalFilters>({
    status: undefined,
    startDate: '',
    endDate: '',
  });

  // Stats
  const [stats, setStats] = useState<WithdrawalStats>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    rejected: 0,
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0,
  });

  // Toast
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    fetchWithdrawals();
    fetchStats();
  }, [page, filters]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const result = await withdrawalService.getAllWithdrawals(filters, page, limit);
      setWithdrawals(result.withdrawals || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      showToast('Failed to fetch withdrawals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await withdrawalService.getWithdrawalStats(
        filters.startDate,
        filters.endDate
      );
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProcessWithdrawal = async (withdrawalId: string) => {
    if (!confirm('Are you sure you want to mark this withdrawal as paid? This confirms that the payment has been made manually to the vendor.')) return;

    setProcessingId(withdrawalId);
    try {
      await withdrawalService.processWithdrawal(withdrawalId);
      showToast('Withdrawal marked as paid successfully', 'success');
      fetchWithdrawals();
      fetchStats();
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      showToast(error?.response?.data?.message || 'Failed to process withdrawal', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedWithdrawal) return;

    try {
      await withdrawalService.rejectWithdrawal(selectedWithdrawal._id, reason);
      showToast('Withdrawal rejected successfully', 'success');
      setShowRejectModal(false);
      setSelectedWithdrawal(null);
      fetchWithdrawals();
      fetchStats();
    } catch (error: any) {
      console.error('Error rejecting withdrawal:', error);
      showToast(error?.response?.data?.message || 'Failed to reject withdrawal', 'error');
    }
  };

  const handleViewDetails = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
  };

  const handleFilterChange = (key: keyof WithdrawalFilters, value: any) => {
    setFilters({ ...filters, [key]: value || undefined });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
        return <Clock className="w-4 h-4" />;
      case WithdrawalStatus.PROCESSING:
        return <Loader className="w-4 h-4 animate-spin" />;
      case WithdrawalStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case WithdrawalStatus.FAILED:
        return <XCircle className="w-4 h-4" />;
      case WithdrawalStatus.REJECTED:
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1>
          <p className="text-gray-600 mt-1">Manage and process vendor withdrawal requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-gray-600" />
            <p className="text-xs font-medium text-gray-600">Total</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.totalAmount)}</p>
        </div>

        <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <p className="text-xs font-medium text-yellow-700">Pending</p>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
          <p className="text-xs text-yellow-600 mt-1">{formatCurrency(stats.pendingAmount)}</p>
        </div>

        <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Loader className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-blue-700">Processing</p>
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.processing}</p>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-xl shadow-sm border border-primary-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-primary-600" />
            <p className="text-xs font-medium text-primary-700">Completed</p>
          </div>
          <p className="text-2xl font-bold text-primary-900">{stats.completed}</p>
          <p className="text-xs text-primary-600 mt-1">{formatCurrency(stats.completedAmount)}</p>
        </div>

        <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <p className="text-xs font-medium text-red-700">Failed</p>
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
        </div>

        <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-gray-600" />
            <p className="text-xs font-medium text-gray-600">Rejected</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference, user name, or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-primary-50 border-primary-600 text-primary-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value={WithdrawalStatus.PENDING}>Pending</option>
                  <option value={WithdrawalStatus.PROCESSING}>Processing</option>
                  <option value={WithdrawalStatus.COMPLETED}>Completed</option>
                  <option value={WithdrawalStatus.FAILED}>Failed</option>
                  <option value={WithdrawalStatus.REJECTED}>Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Withdrawals List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading withdrawals...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 font-medium text-sm text-gray-700">
              <div className="col-span-2">Reference</div>
              <div className="col-span-2">Vendor</div>
              <div className="col-span-2">Bank Details</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-1">Net Amount</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {withdrawals
                .filter(
                  (withdrawal) =>
                    !searchTerm ||
                    withdrawal.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    `${withdrawal.user.firstName} ${withdrawal.user.lastName}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    withdrawal.accountNumber.includes(searchTerm) ||
                    withdrawal.bankName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((withdrawal) => (
                  <div
                    key={withdrawal._id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {withdrawal.reference}
                      </p>
                      {withdrawal.user.vendorProfile?.businessName && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                          {withdrawal.user.vendorProfile.businessName}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {withdrawal.user.firstName} {withdrawal.user.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{withdrawal.user.email}</p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">{withdrawal.bankName}</p>
                      <p className="text-xs text-gray-600">
                        {withdrawal.accountNumber} - {withdrawal.accountName}
                      </p>
                    </div>

                    <div className="col-span-1">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Fee: {formatCurrency(withdrawal.withdrawalFee)}
                      </p>
                    </div>

                    <div className="col-span-1">
                      <p className="text-sm font-bold text-primary-600">
                        {formatCurrency(withdrawal.netAmount)}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          withdrawal.status
                        )}`}
                      >
                        {getStatusIcon(withdrawal.status)}
                        {withdrawal.status.toUpperCase()}
                      </span>
                      {withdrawal.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 line-clamp-1">
                          {withdrawal.rejectionReason}
                        </p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <p className="text-xs text-gray-600">{formatDate(withdrawal.requestedAt)}</p>
                    </div>

                    <div className="col-span-1 flex justify-end gap-1">
                      <button
                        onClick={() => handleViewDetails(withdrawal)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {withdrawal.status === WithdrawalStatus.PENDING && (
                        <>
                          <button
                            onClick={() => handleProcessWithdrawal(withdrawal._id)}
                            disabled={processingId === withdrawal._id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Mark as Paid"
                          >
                            {processingId === withdrawal._id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectWithdrawal(withdrawal)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Empty State */}
            {withdrawals.length === 0 && (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No withdrawals found</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
              withdrawals
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Details Modal */}
      {showDetailsModal && selectedWithdrawal && (
        <WithdrawalDetailsModal
          withdrawal={selectedWithdrawal}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedWithdrawal(null);
          }}
        />
      )}

      {/* Reject Withdrawal Modal */}
      {showRejectModal && selectedWithdrawal && (
        <RejectWithdrawalModal
          withdrawal={selectedWithdrawal}
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedWithdrawal(null);
          }}
          onConfirm={handleRejectConfirm}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};