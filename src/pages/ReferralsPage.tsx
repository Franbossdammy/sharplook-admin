import React, { useEffect, useState } from 'react';
import {
  Gift,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  Filter,
} from 'lucide-react';
import { referralService } from '../services/referral.service';

interface ReferralUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Referral {
  _id: string;
  referrer: ReferralUser;
  referee: ReferralUser;
  referralCode?: string;
  status: 'pending' | 'completed' | 'expired';
  referrerReward?: number;
  refereeReward?: number;
  rewardAmount?: number;
  referrerPaid?: boolean;
  refereePaid?: boolean;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
}

interface ReferralStats {
  totalReferrals: number;
  completed: number;
  pending: number;
  totalRewards: number;
  conversionRate?: string;
  avgRewardPerReferral?: number;
}

export const ReferralsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Stats
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    completed: 0,
    pending: 0,
    totalRewards: 0,
  });

  useEffect(() => {
    fetchReferrals();
    fetchStats();
  }, [page, statusFilter]);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const status = statusFilter !== 'all' ? statusFilter : undefined;
      const result = await referralService.getReferrals(page, limit, status);
      setReferrals(result.referrals || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await referralService.getReferralStats();
      setStats(result);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
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

  const formatCurrency = (amount?: number) => {
    if (amount == null || isNaN(amount)) return '₦0';
    return `₦${amount.toLocaleString()}`;
  };

  const getRewardAmount = (referral: Referral) => {
    // Backend may use referrerReward/refereeReward or rewardAmount
    return referral.referrerReward || referral.rewardAmount || 0;
  };

  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'expired', label: 'Expired' },
  ];

  const filteredReferrals = referrals.filter((referral) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const referrerName = `${referral.referrer?.firstName || ''} ${referral.referrer?.lastName || ''}`.toLowerCase();
    const refereeName = `${referral.referee?.firstName || ''} ${referral.referee?.lastName || ''}`.toLowerCase();
    const referrerEmail = (referral.referrer?.email || '').toLowerCase();
    const refereeEmail = (referral.referee?.email || '').toLowerCase();
    return (
      referrerName.includes(term) ||
      refereeName.includes(term) ||
      referrerEmail.includes(term) ||
      refereeEmail.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Management</h1>
          <p className="text-gray-600 mt-1">Track and manage user referrals and rewards</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-gray-600">Total Referrals</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-gray-600">Completed</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <p className="text-xs font-medium text-gray-600">Pending</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-xl shadow-sm border border-primary-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-primary-600" />
            <p className="text-xs font-medium text-primary-700">Total Rewards Paid</p>
          </div>
          <p className="text-2xl font-bold text-primary-900">{formatCurrency(stats.totalRewards)}</p>
        </div>
      </div>

      {/* Search and Status Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by referrer or referee name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Filter className="w-4 h-4" />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-t border-gray-200 pt-4">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === tab.key
                  ? 'bg-primary-50 text-primary-600 border border-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading referrals...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 font-medium text-sm text-gray-700">
              <div className="col-span-1">ID</div>
              <div className="col-span-2">Referrer</div>
              <div className="col-span-2">Referee</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Reward Amount</div>
              <div className="col-span-2">Created Date</div>
              <div className="col-span-1">Completed</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredReferrals.map((referral) => (
                <div
                  key={referral._id}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-1">
                    <p className="text-sm font-medium text-gray-900">
                      {referral._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900">
                      {referral.referrer?.firstName || 'N/A'} {referral.referrer?.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-600">{referral.referrer?.email || ''}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900">
                      {referral.referee?.firstName || 'N/A'} {referral.referee?.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-600">{referral.referee?.email || ''}</p>
                  </div>
                  <div className="col-span-2">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        referral.status
                      )}`}
                    >
                      {getStatusIcon(referral.status)}
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(getRewardAmount(referral))}
                    </p>
                    {referral.referrerPaid && (
                      <p className="text-xs text-green-600">Paid</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600">{formatDate(referral.createdAt)}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs text-gray-600">
                      {referral.completedAt ? formatDate(referral.completedAt) : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredReferrals.length === 0 && (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No referrals found</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
              referrals
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
    </div>
  );
};
