import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Settings,
  Star,
  Award,
  Package,
  UserCheck,
  Clock,
  Activity,
  ArrowUp,
  ArrowDown,
  Flag,
  AlertTriangle,
} from 'lucide-react';
import { analyticsService } from '../services/analytics.service';
import { redFlagService } from '../services/redFlag.service';
import { Link } from 'react-router-dom';
import type {
  DashboardOverview,
  VendorPerformance,
  DisputeAnalytics,
  ReferralAnalytics,
} from '../types/analytics.types';
import type { RedFlagStats } from '../types/redFlag.types';
import { ROUTES } from '../utils/constants';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [vendors, setVendors] = useState<VendorPerformance | null>(null);
  const [disputes, setDisputes] = useState<DisputeAnalytics | null>(null);
  const [referrals, setReferrals] = useState<ReferralAnalytics | null>(null);
  const [redFlagStats, setRedFlagStats] = useState<RedFlagStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, vendorData, disputeData, referralData] = await Promise.all([
        analyticsService.getDashboardOverview(),
        analyticsService.getVendorPerformance(),
        analyticsService.getDisputeAnalytics(),
        analyticsService.getReferralAnalytics(),
      ]);

      // Fetch red flag stats using the service
      try {
        const stats = await redFlagService.getStats();
        setRedFlagStats(stats);
      } catch (err) {
        console.warn('Could not fetch red flag stats:', err);
      }

      console.log('=== DASHBOARD DATA DEBUG ===');
      console.log('Overview Data:', overviewData);
      console.log('Vendor Data:', vendorData);
      console.log('Dispute Data:', disputeData);
      console.log('Referral Data:', referralData);
      console.log('=== END DEBUG ===');

      setOverview(overviewData);
      setVendors(vendorData);
      setDisputes(disputeData);
      setReferrals(referralData);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: string | number) => {
    return `${typeof value === 'string' ? value : value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <MessageSquare className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-900 font-medium mb-2">Failed to load dashboard</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  // Calculate active disputes
  const activeDisputes = disputes?.byStatus?.find((s) => s._id === 'open')?.count || 0;

  // Calculate open red flags
  const openRedFlags = redFlagStats?.byStatus?.open || 0;
  const criticalRedFlags = redFlagStats?.bySeverity?.critical || 0;
  const highRedFlags = redFlagStats?.bySeverity?.high || 0;
  const urgentRedFlags = criticalRedFlags + highRedFlags;

  // Calculate revenue growth (comparing this month to total average)
  const avgMonthlyRevenue = overview.revenue.total / 12; // Rough estimate
  const revenueGrowth =
    avgMonthlyRevenue > 0
      ? (((overview.revenue.thisMonth - avgMonthlyRevenue) / avgMonthlyRevenue) * 100).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.ANALYTICS)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          View Analytics
        </button>
      </div>

      {/* 🚩 RED FLAG ALERT BANNER - Shows only if there are urgent flags */}
      {urgentRedFlags > 0 && (
        <Link 
          to={ROUTES.REDFLAGS}
          className="block bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 cursor-pointer hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-[1.01] shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg animate-pulse">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {urgentRedFlags} Urgent Red Flag{urgentRedFlags > 1 ? 's' : ''} Require Attention!
                </h3>
                <p className="text-white/80 text-sm">
                  {criticalRedFlags > 0 && `${criticalRedFlags} critical`}
                  {criticalRedFlags > 0 && highRedFlags > 0 && ' • '}
                  {highRedFlags > 0 && `${highRedFlags} high priority`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white font-medium">
              <span>Review Now</span>
              <ArrowUp className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </Link>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              {overview.users.activeVendors} Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{overview.users.total.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Users</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Vendors: {overview.users.vendors}</span>
              <span className="text-gray-600">Clients: {overview.users.clients}</span>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
              {formatPercentage(overview.bookings.completionRate)} Complete
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {overview.bookings.total.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600 mt-1">Total Bookings</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Active: {overview.bookings.active}</span>
              <span className="text-gray-600">Completed: {overview.bookings.completed}</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span
              className={`text-xs font-medium flex items-center gap-1 ${
                parseFloat(revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {parseFloat(revenueGrowth) >= 0 ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              {Math.abs(parseFloat(revenueGrowth))}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {formatCurrency(overview.revenue.total)}
          </h3>
          <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">This Month:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(overview.revenue.thisMonth)}
              </span>
            </div>
          </div>
        </div>

        {/* 🚩 RED FLAGS CARD - Replaced Active Disputes */}
        <Link 
          to={ROUTES.REDFLAGS}
          className={`block bg-white rounded-xl shadow-sm border p-6 cursor-pointer hover:shadow-md transition-all ${
            urgentRedFlags > 0 ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${urgentRedFlags > 0 ? 'bg-red-100' : 'bg-orange-100'}`}>
              <Flag className={`w-6 h-6 ${urgentRedFlags > 0 ? 'text-red-600' : 'text-orange-600'}`} />
            </div>
            {urgentRedFlags > 0 ? (
              <span className="text-xs font-medium text-red-600 flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                {urgentRedFlags} Urgent
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-600">
                {redFlagStats?.trends?.last7Days || 0} this week
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{openRedFlags}</h3>
          <p className="text-sm text-gray-600 mt-1">Open Red Flags</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Total: {redFlagStats?.total || 0}</span>
              <span className="text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Active Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{overview.services.total}</p>
              <p className="text-xs text-gray-600">Active Services</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span>{overview.services.avgRating} Avg Rating</span>
          </div>
        </div>

        {/* Active Vendors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{overview.users.activeVendors}</p>
              <p className="text-xs text-gray-600">Verified Vendors</p>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {overview.users.vendors} Total Vendors
          </div>
        </div>

        {/* Referral Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {referrals?.completedReferrals || 0}
              </p>
              <p className="text-xs text-gray-600">Completed Referrals</p>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {formatPercentage(referrals?.conversionRate || '0')} Conversion
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {vendors?.avgResponseTime.toFixed(0) || 0}m
              </p>
              <p className="text-xs text-gray-600">Avg Response Time</p>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">Vendor Response</div>
        </div>

        {/* Active Disputes - Moved here */}
        <div 
          onClick={() => navigate(ROUTES.DISPUTES)}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{activeDisputes}</p>
              <p className="text-xs text-gray-600">Active Disputes</p>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {disputes?.avgResolutionTime || 0}h Avg Resolution
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Vendors</h3>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {vendors?.topVendors.slice(0, 5).map((vendor, index) => (
              <div
                key={vendor._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full text-primary-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vendor.vendorName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <span>{vendor.totalBookings} bookings</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{vendor.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(vendor.totalRevenue)}
                  </p>
                </div>
              </div>
            ))}
            {(!vendors?.topVendors || vendors.topVendors.length === 0) && (
              <p className="text-center text-gray-500 text-sm py-8">No vendor data available</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <Activity className="w-5 h-5 text-primary-600" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* 🚩 RED FLAGS QUICK ACTION */}
            <Link
              to={ROUTES.REDFLAGS}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all group relative ${
                urgentRedFlags > 0 
                  ? 'border-red-300 bg-red-50 hover:border-red-500 hover:bg-red-100' 
                  : 'border-gray-200 hover:border-primary-600 hover:bg-primary-50'
              }`}
            >
              {urgentRedFlags > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {urgentRedFlags}
                </span>
              )}
              <Flag className={`w-6 h-6 mb-2 group-hover:scale-110 transition-transform ${
                urgentRedFlags > 0 ? 'text-red-600' : 'text-primary-600'
              }`} />
              <p className="text-sm font-medium text-gray-900">Red Flags</p>
              <p className="text-xs text-gray-500 mt-1">{openRedFlags} open</p>
            </Link>

            <button
              onClick={() => navigate(ROUTES.USERS)}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all group"
            >
              <Users className="w-6 h-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900">Manage Users</p>
              <p className="text-xs text-gray-500 mt-1">{overview.users.total} users</p>
            </button>

            <button
              onClick={() => navigate(ROUTES.DISPUTES)}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all group"
            >
              <MessageSquare className="w-6 h-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900">Resolve Disputes</p>
              <p className="text-xs text-gray-500 mt-1">{activeDisputes} active</p>
            </button>

            <button
              onClick={() => navigate(ROUTES.ANALYTICS)}
              className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all group"
            >
              <TrendingUp className="w-6 h-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-900">View Analytics</p>
              <p className="text-xs text-gray-500 mt-1">Detailed reports</p>
            </button>
          </div>
        </div>
      </div>

      {/* Platform Health Indicators */}
      <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-xl shadow-sm border border-primary-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Booking Completion</span>
              <span className="text-lg font-bold text-primary-600">
                {formatPercentage(overview.bookings.completionRate)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${overview.bookings.completionRate}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Referral Conversion</span>
              <span className="text-lg font-bold text-green-600">
                {formatPercentage(referrals?.conversionRate || '0')}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${referrals?.conversionRate || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Service Rating</span>
              <span className="text-lg font-bold text-yellow-600">
                {overview.services.avgRating}/5.0
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full transition-all"
                style={{ width: `${(parseFloat(overview.services.avgRating) / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* 🚩 RED FLAG HEALTH INDICATOR */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Trust Score</span>
              <span className={`text-lg font-bold ${
                openRedFlags === 0 ? 'text-green-600' : 
                openRedFlags < 5 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {openRedFlags === 0 ? 'Excellent' : 
                 openRedFlags < 5 ? 'Good' : 
                 openRedFlags < 10 ? 'Fair' : 'Needs Review'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  openRedFlags === 0 ? 'bg-green-600' : 
                  openRedFlags < 5 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${Math.max(0, 100 - (openRedFlags * 10))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};