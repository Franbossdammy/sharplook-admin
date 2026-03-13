import React, { useEffect, useState } from 'react';
import {
  Crown,
  Users,
  RefreshCw,
  Eye,
  Search,
  Filter,
  ChevronDown,
  X,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { subscriptionService } from '../services/subscription.service';
import {
  Subscription,
  SubscriptionFilters,
  SubscriptionStats,
} from '../types/subscription.types';

export const SubscriptionsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState<SubscriptionFilters>({
    type: undefined,
    status: undefined,
    startDate: '',
    endDate: '',
  });

  // Stats
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    cancelled: 0,
    expired: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, [page, filters]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const result = await subscriptionService.getAllSubscriptions(filters, page, limit);
      setSubscriptions(result.subscriptions || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await subscriptionService.getSubscriptionStats();
      if (statsData) {
        setStats({
          total: statsData.total || 0,
          active: statsData.active || 0,
          cancelled: statsData.cancelled || 0,
          expired: statsData.expired || 0,
          totalRevenue: statsData.totalRevenue || 0,
          revenueByType: statsData.revenueByType || [],
        });
      }
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
    }
  };

  const handleViewDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailsModal(true);
  };

  const handleFilterChange = (key: keyof SubscriptionFilters, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
    setPage(1);
  };

  const handleStatusTabChange = (status: string) => {
    setActiveStatusTab(status);
    if (status === 'all') {
      setFilters({ ...filters, status: undefined });
    } else {
      setFilters({ ...filters, status });
    }
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: undefined,
      status: undefined,
      startDate: '',
      endDate: '',
    });
    setActiveStatusTab('all');
    setPage(1);
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (amount == null || isNaN(amount)) return '₦0';
    return `₦${amount.toLocaleString()}`;
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'in_shop':
        return 'bg-blue-100 text-blue-700';
      case 'home_service':
        return 'bg-purple-100 text-purple-700';
      case 'both':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'in_shop':
        return 'In Shop';
      case 'home_service':
        return 'Home Service';
      case 'both':
        return 'Both';
      default:
        return type;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'expired', label: 'Expired' },
    { key: 'pending', label: 'Pending' },
  ];

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      !searchTerm ||
      `${sub.vendor?.firstName || ''} ${sub.vendor?.lastName || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (sub.vendor?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.vendor?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor vendor subscriptions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-xl shadow-sm border border-primary-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary-600" />
            <p className="text-xs font-medium text-primary-700">Total Subscriptions</p>
          </div>
          <p className="text-2xl font-bold text-primary-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-gray-600">Active</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <p className="text-xs font-medium text-gray-600">Cancelled</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-600" />
            <p className="text-xs font-medium text-gray-600">Expired</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-gray-600">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      {/* Revenue by Type */}
      {stats.revenueByType && stats.revenueByType.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.revenueByType.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block w-3 h-3 rounded-full ${
                  item._id === 'in_shop' ? 'bg-blue-500' :
                  item._id === 'home_service' ? 'bg-purple-500' : 'bg-yellow-500'
                }`}></span>
                <p className="text-xs font-medium text-gray-600">{getTypeLabel(item._id)}</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{item.count} subs</p>
              <p className="text-sm text-gray-600">{formatCurrency(item.revenue)} revenue</p>
            </div>
          ))}
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeStatusTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vendor name, email, or business name..."
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="in_shop">In Shop</option>
                  <option value="home_service">Home Service</option>
                  <option value="both">Both</option>
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

      {/* Subscriptions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading subscriptions...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 font-medium text-sm text-gray-700">
              <div className="col-span-1">ID</div>
              <div className="col-span-2">Vendor</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-1">Monthly Fee</div>
              <div className="col-span-1">Commission</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Start Date</div>
              <div className="col-span-1">End Date</div>
              <div className="col-span-1">Auto-Renew</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => (
                <div
                  key={subscription._id}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors items-center"
                >
                  <div className="col-span-1">
                    <p className="text-xs font-mono text-gray-600 truncate" title={subscription._id}>
                      {subscription._id.slice(-8)}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900">
                      {subscription.vendor?.firstName || 'N/A'} {subscription.vendor?.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-600">{subscription.vendor?.email || ''}</p>
                    {subscription.vendor?.businessName && (
                      <p className="text-xs text-gray-500">{subscription.vendor.businessName}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(
                        subscription.type
                      )}`}
                    >
                      <Crown className="w-3 h-3" />
                      {getTypeLabel(subscription.type)}
                    </span>
                  </div>

                  <div className="col-span-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(subscription.monthlyFee)}
                    </p>
                  </div>

                  <div className="col-span-1">
                    <p className="text-sm text-gray-600">{subscription.commissionRate}%</p>
                  </div>

                  <div className="col-span-1">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                        subscription.status
                      )}`}
                    >
                      {getStatusIcon(subscription.status)}
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <p className="text-xs text-gray-600">{formatDate(subscription.startDate)}</p>
                  </div>

                  <div className="col-span-1">
                    <p className="text-xs text-gray-600">{formatDate(subscription.endDate)}</p>
                  </div>

                  <div className="col-span-1">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        subscription.autoRenew
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {subscription.autoRenew ? (
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          Yes
                        </span>
                      ) : (
                        'No'
                      )}
                    </span>
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => handleViewDetails(subscription)}
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
            {filteredSubscriptions.length === 0 && (
              <div className="text-center py-12">
                <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No subscriptions found</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
              subscriptions
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

      {/* Subscription Details Modal */}
      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedSubscription(null);
              }}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-auto z-10">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Subscription Details</h2>
                    <p className="text-sm text-gray-600">ID: {selectedSubscription._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedSubscription(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Vendor Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Vendor Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {(selectedSubscription.vendor?.firstName || 'N').charAt(0)}
                          {(selectedSubscription.vendor?.lastName || 'A').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedSubscription.vendor?.firstName}{' '}
                          {selectedSubscription.vendor?.lastName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {selectedSubscription.vendor?.email}
                        </p>
                        {selectedSubscription.vendor?.businessName && (
                          <p className="text-xs text-gray-500">
                            {selectedSubscription.vendor.businessName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Subscription Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Type</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(
                          selectedSubscription.type
                        )}`}
                      >
                        <Crown className="w-3 h-3" />
                        {getTypeLabel(selectedSubscription.type)}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Status</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                          selectedSubscription.status
                        )}`}
                      >
                        {getStatusIcon(selectedSubscription.status)}
                        {selectedSubscription.status.charAt(0).toUpperCase() +
                          selectedSubscription.status.slice(1)}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Monthly Fee</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(selectedSubscription.monthlyFee)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Commission Rate</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedSubscription.commissionRate}%
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Start Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(selectedSubscription.startDate)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">End Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(selectedSubscription.endDate)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Auto-Renew</p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          selectedSubscription.autoRenew
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {selectedSubscription.autoRenew ? (
                          <>
                            <RefreshCw className="w-3 h-3" />
                            Enabled
                          </>
                        ) : (
                          'Disabled'
                        )}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Created</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(selectedSubscription.createdAt)}
                      </p>
                    </div>
                    {selectedSubscription.nextPaymentDue && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Next Payment Due</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(selectedSubscription.nextPaymentDue)}
                        </p>
                      </div>
                    )}
                    {selectedSubscription.lastPaymentDate && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Last Payment</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(selectedSubscription.lastPaymentAmount)} on {formatDate(selectedSubscription.lastPaymentDate)}
                        </p>
                      </div>
                    )}
                    {selectedSubscription.cancellationReason && (
                      <div className="bg-red-50 rounded-lg p-3 col-span-2">
                        <p className="text-xs text-red-600 mb-1">Cancellation Reason</p>
                        <p className="text-sm text-red-800">{selectedSubscription.cancellationReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedSubscription(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
