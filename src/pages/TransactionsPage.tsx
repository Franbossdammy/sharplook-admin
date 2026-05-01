import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  X,
  AlertCircle,
  User,
} from 'lucide-react';
import { transactionService } from '../services/transaction.service';
import {
  Transaction,
  TransactionStats,
  TransactionType,
  TransactionFilters,
  PaymentStatus,
} from '../types/transaction.types';
import { TransactionDetailsModal } from '../components/ui/TransactionDetailsModal';
import { Toast } from '../components/ui/Toast';

export const TransactionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters — pre-seed userId from URL params on mount
  const [filteredUserName, setFilteredUserName] = useState(searchParams.get('userName') || '');
  const [filters, setFilters] = useState<TransactionFilters>({
    userId: searchParams.get('userId') || '',
    type: undefined,
    status: undefined,
    startDate: '',
    endDate: '',
  });

  // Per-user summary stats (computed when userId filter is active)
  const [userSummaryStats, setUserSummaryStats] = useState<{
    totalPaid: number;
    totalEarned: number;
    totalRefunded: number;
    totalWithdrawn: number;
    totalDeposited: number;
    transactionCount: number;
    walletBalance: number;
  } | null>(null);

  // Stats
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    totalVolume: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalCommissions: 0,
    totalWithdrawals: 0,
    totalRefunds: 0,
    bookingEarnings: 0,
    orderEarnings: 0,
    totalCreditsIssued: 0,
    netRevenue: 0,
    byType: {},
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
    fetchTransactions();
    fetchStats();
  }, [page, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const result = await transactionService.getAllTransactions(filters, page, limit);
      console.log('=== TRANSACTIONS FETCHED ===');
      console.log('Transactions:', result.transactions);
      console.log('Total:', result.total);

      setTransactions(result.transactions || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showToast('Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await transactionService.getPlatformStats(
        filters.startDate,
        filters.endDate
      );
      console.log('=== TRANSACTION STATS ===');
      console.log('Stats:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUserSummaryStats = async (userId: string) => {
    try {
      const result = await transactionService.getAllTransactions({ userId }, 1, 1000);
      const txns = result.transactions;

      let totalPaid = 0, totalEarned = 0, totalRefunded = 0, totalWithdrawn = 0, totalDeposited = 0;

      for (const txn of txns) {
        if (txn.status !== PaymentStatus.COMPLETED && txn.status !== PaymentStatus.REFUNDED) continue;
        switch (txn.type) {
          case TransactionType.BOOKING_PAYMENT:
          case TransactionType.ORDER_PAYMENT:
            totalPaid += txn.amount;
            break;
          case TransactionType.BOOKING_EARNING:
          case TransactionType.ORDER_EARNING:
          case TransactionType.PAYMENT_RECEIVED:
            totalEarned += txn.amount;
            break;
          case TransactionType.BOOKING_REFUND:
          case TransactionType.ORDER_REFUND:
          case TransactionType.REFUND:
            totalRefunded += txn.amount;
            break;
          case TransactionType.WITHDRAWAL:
            totalWithdrawn += txn.amount;
            break;
          case TransactionType.DEPOSIT:
            totalDeposited += txn.amount;
            break;
        }
      }

      const sorted = [...txns].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const walletBalance = sorted[0]?.balanceAfter ?? 0;

      setUserSummaryStats({
        totalPaid,
        totalEarned,
        totalRefunded,
        totalWithdrawn,
        totalDeposited,
        transactionCount: result.total,
        walletBalance,
      });
    } catch (error) {
      console.error('Error fetching user summary stats:', error);
    }
  };

  useEffect(() => {
    if (filters.userId) {
      fetchUserSummaryStats(filters.userId);
    } else {
      setUserSummaryStats(null);
    }
  }, [filters.userId]);

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    setFilters({ ...filters, [key]: value || undefined });
    setPage(1);
  };

  const clearUserFilter = () => {
    setFilteredUserName('');
    setFilters((prev) => ({ ...prev, userId: '' }));
    setUserSummaryStats(null);
    setSearchParams({});
    setPage(1);
  };

  const clearFilters = () => {
    setFilteredUserName('');
    setFilters({
      userId: '',
      type: undefined,
      status: undefined,
      startDate: '',
      endDate: '',
    });
    setUserSummaryStats(null);
    setSearchParams({});
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

  const getTransactionTypeLabel = (type: TransactionType) => {
    if (type === TransactionType.WALLET_CREDIT) return 'Manual Credit (Debt)';
    if (type === TransactionType.DEPOSIT) return 'Wallet Top-Up';
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getTransactionTypeColor = (type: TransactionType) => {
    // Platform debt: admin credits given out — money owed, not earned
    if (type === TransactionType.WALLET_CREDIT) {
      return 'bg-orange-100 text-orange-700';
    }
    const incomeTypes = [
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
    if (incomeTypes.includes(type)) {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-red-100 text-red-700';
  };

  const getTransactionIcon = (type: TransactionType) => {
    if (type === TransactionType.WALLET_CREDIT) {
      return <AlertCircle className="w-4 h-4" />;
    }
    const incomeTypes = [
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
    if (incomeTypes.includes(type)) {
      return <ArrowUpRight className="w-4 h-4" />;
    }
    return <ArrowDownLeft className="w-4 h-4" />;
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'bg-green-100 text-green-700';
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-700';
      case PaymentStatus.PROCESSING:
        return 'bg-blue-100 text-blue-700';
      case PaymentStatus.FAILED:
        return 'bg-red-100 text-red-700';
      case PaymentStatus.REFUNDED:
        return 'bg-purple-100 text-purple-700';
      case PaymentStatus.CANCELLED:
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">
            {filters.userId && filteredUserName
              ? `Showing transactions for ${filteredUserName}`
              : 'Monitor and manage all platform transactions'}
          </p>
        </div>
      </div>

      {/* Per-User Banner (shown when filtering by a specific user) */}
      {filters.userId && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-indigo-900">
                  {filteredUserName || 'User'}'s Transaction History
                </p>
                <p className="text-xs text-indigo-600">
                  {userSummaryStats
                    ? `${userSummaryStats.transactionCount} total transactions found`
                    : 'Loading summary...'}
                </p>
              </div>
            </div>
            <button
              onClick={clearUserFilter}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-900 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear user filter
            </button>
          </div>

          {userSummaryStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white rounded-lg p-3 border border-red-100">
                <p className="text-xs text-gray-500 mb-1">Total Spent (client)</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(userSummaryStats.totalPaid)}
                </p>
                <p className="text-xs text-gray-400">bookings + orders paid</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs text-gray-500 mb-1">Total Earned (vendor)</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(userSummaryStats.totalEarned)}
                </p>
                <p className="text-xs text-gray-400">service earnings</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">Total Refunded</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(userSummaryStats.totalRefunded)}
                </p>
                <p className="text-xs text-gray-400">returned to wallet</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <p className="text-xs text-gray-500 mb-1">Total Withdrawn</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(userSummaryStats.totalWithdrawn)}
                </p>
                <p className="text-xs text-gray-400">cashed out</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-indigo-100">
                <p className="text-xs text-gray-500 mb-1">Wallet Balance (last)</p>
                <p className="text-lg font-bold text-indigo-700">
                  {formatCurrency(userSummaryStats.walletBalance)}
                </p>
                <p className="text-xs text-gray-400">after last transaction</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <p className="text-xs font-medium text-gray-600">Total Volume</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalVolume)}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.totalTransactions} transactions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-gray-600">Total Income</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</p>
          <p className="text-xs text-gray-500 mt-1">Earned (bookings + orders)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <p className="text-xs font-medium text-gray-600">Total Expense</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpense)}</p>
          <p className="text-xs text-gray-500 mt-1">Withdrawals + deductions</p>
        </div>

        <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <p className="text-xs font-medium text-orange-700">Credits Issued</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats.totalCreditsIssued || 0)}
          </p>
          <p className="text-xs text-orange-500 mt-1">Platform debt (given to users)</p>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-xl shadow-sm border border-primary-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-primary-600" />
            <p className="text-xs font-medium text-primary-700">Net Revenue</p>
          </div>
          <p className={`text-2xl font-bold ${stats.netRevenue >= 0 ? 'text-primary-900' : 'text-red-600'}`}>
            {formatCurrency(stats.netRevenue)}
          </p>
          <p className="text-xs text-primary-500 mt-1">Income − Expense − Credits</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-medium text-gray-600">Commissions</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(stats.totalCommissions)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Platform cut earned</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Booking Earnings</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(stats.bookingEarnings)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Order Earnings</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.orderEarnings)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Total Withdrawals</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(stats.totalWithdrawals)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Total Refunds</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRefunds)}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference, user name, or description..."
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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  placeholder="Paste user ID..."
                  value={filters.userId || ''}
                  onChange={(e) => {
                    handleFilterChange('userId', e.target.value);
                    if (!e.target.value) setFilteredUserName('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value={TransactionType.BOOKING_EARNING}>Booking Earning</option>
                  <option value={TransactionType.ORDER_EARNING}>Order Earning</option>
                  <option value={TransactionType.BOOKING_PAYMENT}>Booking Payment</option>
                  <option value={TransactionType.ORDER_PAYMENT}>Order Payment</option>
                  <option value={TransactionType.DEPOSIT}>Wallet Top-Up (User Funded)</option>
                  <option value={TransactionType.WALLET_CREDIT}>Manual Credit (Admin Debt)</option>
                  <option value={TransactionType.WALLET_DEBIT}>Wallet Debit</option>
                  <option value={TransactionType.WITHDRAWAL}>Withdrawal</option>
                  <option value={TransactionType.REFUND}>Refund</option>
                  <option value={TransactionType.BOOKING_REFUND}>Booking Refund</option>
                  <option value={TransactionType.ORDER_REFUND}>Order Refund</option>
                  <option value={TransactionType.COMMISSION_DEDUCTION}>Commission</option>
                  <option value={TransactionType.ESCROW_LOCK}>Escrow Lock</option>
                  <option value={TransactionType.ESCROW_RELEASE}>Escrow Release</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value={PaymentStatus.COMPLETED}>Completed</option>
                  <option value={PaymentStatus.PENDING}>Pending</option>
                  <option value={PaymentStatus.FAILED}>Failed</option>
                  <option value={PaymentStatus.REFUNDED}>Refunded</option>
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

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 font-medium text-sm text-gray-700">
              <div className="col-span-2">Reference</div>
              <div className="col-span-2">User</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {transactions
                .filter(
                  (txn) =>
                    !searchTerm ||
                    txn.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    `${txn.user.firstName} ${txn.user.lastName}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    txn.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((transaction) => (
                  <div
                    key={transaction._id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {transaction.reference}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {transaction.description}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.user.firstName} {transaction.user.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{transaction.user.email}</p>
                    </div>

                    <div className="col-span-2">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(
                          transaction.type
                        )}`}
                      >
                        {getTransactionIcon(transaction.type)}
                        {getTransactionTypeLabel(transaction.type)}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Balance: {formatCurrency(transaction.balanceAfter)}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </div>

                    <div className="col-span-1">
                      <p className="text-xs text-gray-600">{formatDate(transaction.createdAt)}</p>
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => handleViewDetails(transaction)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Empty State */}
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No transactions found</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
              transactions
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

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTransaction(null);
          }}
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