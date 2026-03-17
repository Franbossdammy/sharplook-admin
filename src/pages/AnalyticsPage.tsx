import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Award,
  MessageSquare,
  Gift,
  Filter,
  X,
  Search,
  Eye,
  FileSpreadsheet,
  UserCheck,
} from 'lucide-react';
import { analyticsService } from '../services/analytics.service';
import {
  UserAnalytics,
  BookingAnalytics,
  RevenueAnalytics,
  ServiceAnalytics,
  VendorPerformance,
  DisputeAnalytics,
  ReferralAnalytics,
} from '../types/analytics.types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type TabType =
  | 'users'
  | 'userDetails'
  | 'bookings'
  | 'revenue'
  | 'services'
  | 'vendors'
  | 'disputes'
  | 'referrals';

const COLORS = ['#eb278d', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9f1239'];

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Analytics data states
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalytics | null>(null);
  const [vendorPerformance, setVendorPerformance] = useState<VendorPerformance | null>(null);
  const [disputeAnalytics, setDisputeAnalytics] = useState<DisputeAnalytics | null>(null);
  const [referralAnalytics, setReferralAnalytics] = useState<ReferralAnalytics | null>(null);

  // User details states
  const [userDetails, setUserDetails] = useState<any>(null);
  const [userDetailsSearch, setUserDetailsSearch] = useState('');
  const [userDetailsRole, setUserDetailsRole] = useState('');
  const [userDetailsStatus, setUserDetailsStatus] = useState('');
  const [userDetailsPage, setUserDetailsPage] = useState(1);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);
  const [exportingCSV, setExportingCSV] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [activeTab, dateRange]);

  useEffect(() => {
    if (activeTab === 'userDetails') {
      fetchUserDetails();
    }
  }, [userDetailsSearch, userDetailsRole, userDetailsStatus, userDetailsPage, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = dateRange;

      switch (activeTab) {
        case 'users':
          const userData = await analyticsService.getUserAnalytics(startDate, endDate);
          setUserAnalytics(userData);
          break;
        case 'userDetails':
          await fetchUserDetails();
          break;
        case 'bookings':
          const bookingData = await analyticsService.getBookingAnalytics(startDate, endDate);
          setBookingAnalytics(bookingData);
          break;
        case 'revenue':
          const revenueData = await analyticsService.getRevenueAnalytics(startDate, endDate);
          setRevenueAnalytics(revenueData);
          break;
        case 'services':
          const serviceData = await analyticsService.getServiceAnalytics();
          setServiceAnalytics(serviceData);
          break;
        case 'vendors':
          const vendorData = await analyticsService.getVendorPerformance();
          setVendorPerformance(vendorData);
          break;
        case 'disputes':
          const disputeData = await analyticsService.getDisputeAnalytics();
          setDisputeAnalytics(disputeData);
          break;
        case 'referrals':
          const referralData = await analyticsService.getReferralAnalytics();
          setReferralAnalytics(referralData);
          break;
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getUserDetails({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page: userDetailsPage,
        limit: 50,
        role: userDetailsRole,
        status: userDetailsStatus,
        search: userDetailsSearch,
      });
      setUserDetails(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      const blob = await analyticsService.exportUserDataCSV({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        role: userDetailsRole,
        status: userDetailsStatus,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setExportingCSV(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await analyticsService.exportAnalytics(
        activeTab,
        dateRange.startDate,
        dateRange.endDate
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    setShowDateFilter(false);
  };

  const tabs = [
    { id: 'users' as TabType, label: 'Users', icon: Users },
    { id: 'userDetails' as TabType, label: 'User Details', icon: UserCheck },
    { id: 'bookings' as TabType, label: 'Bookings', icon: Calendar },
    { id: 'revenue' as TabType, label: 'Revenue', icon: DollarSign },
    { id: 'services' as TabType, label: 'Services', icon: Package },
    { id: 'vendors' as TabType, label: 'Vendors', icon: Award },
    { id: 'disputes' as TabType, label: 'Disputes', icon: MessageSquare },
    { id: 'referrals' as TabType, label: 'Referrals', icon: Gift },
  ];

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Detailed insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter by Date
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Date Filter */}
      {showDateFilter && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={clearDateFilter}
              className="mt-6 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {(dateRange.startDate || dateRange.endDate) && (
            <div className="mt-3 text-sm text-gray-600">
              Filtering from{' '}
              <span className="font-medium">{dateRange.startDate || 'beginning'}</span> to{' '}
              <span className="font-medium">{dateRange.endDate || 'now'}</span>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="space-y-6">
          {/* Users Analytics */}
          {activeTab === 'users' && userAnalytics && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{userAnalytics.total}</p>
                      <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{userAnalytics.newToday}</p>
                      <p className="text-sm text-gray-600">New Today</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {userAnalytics.byRole.find((r) => r._id === 'vendor')?.count || 0}
                      </p>
                      <p className="text-sm text-gray-600">Vendors</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={userAnalytics.byMonth.map((item) => ({
                        name: `${getMonthName(item._id.month)} ${item._id.year}`,
                        users: item.count,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#eb278d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* User Distribution Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userAnalytics.byRole.map((item) => ({
                          name: item._id === 'vendor' ? 'Vendors' : 'Clients',
                          value: item.count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userAnalytics.byRole.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* User Details Tab */}
          {activeTab === 'userDetails' && (
            <>
              {/* Header with Export */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Registered Users {userDetails?.total ? `(${userDetails.total})` : ''}
                </h3>
                <button
                  onClick={handleExportCSV}
                  disabled={exportingCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {exportingCSV ? 'Exporting...' : 'Export CSV'}
                </button>
              </div>

              {/* Search & Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone..."
                      value={userDetailsSearch}
                      onChange={(e) => { setUserDetailsSearch(e.target.value); setUserDetailsPage(1); }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={userDetailsRole}
                    onChange={(e) => { setUserDetailsRole(e.target.value); setUserDetailsPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Roles</option>
                    <option value="client">Client</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  <select
                    value={userDetailsStatus}
                    onChange={(e) => { setUserDetailsStatus(e.target.value); setUserDetailsPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending_verification">Pending</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              {userDetails?.users && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {userDetails.users.map((user: any) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-primary-600">
                                  {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 break-all">{user.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                user.role === 'vendor' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'admin' || user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' :
                                user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                                user.status === 'pending_verification' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {user.location?.city ? `${user.location.city}${user.location.state ? ', ' + user.location.state : ''}` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => setSelectedUserDetail(selectedUserDetail?._id === user._id ? null : user)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {userDetails.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Page {userDetails.page} of {userDetails.totalPages} ({userDetails.total} users)
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setUserDetailsPage(Math.max(1, userDetailsPage - 1))}
                          disabled={userDetailsPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setUserDetailsPage(Math.min(userDetails.totalPages, userDetailsPage + 1))}
                          disabled={userDetailsPage === userDetails.totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Detail Modal */}
              {selectedUserDetail && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      User Details: {selectedUserDetail.firstName} {selectedUserDetail.lastName}
                    </h3>
                    <button onClick={() => setSelectedUserDetail(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900 break-all">{selectedUserDetail.email}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUserDetail.phone}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Role</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{selectedUserDetail.role}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{selectedUserDetail.status}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Email Verified</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUserDetail.isEmailVerified ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Phone Verified</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUserDetail.isPhoneVerified ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Is Vendor</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUserDetail.isVendor ? 'Yes' : 'No'}</p>
                    </div>
                    {selectedUserDetail.vendorProfile?.businessName && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Business Name</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUserDetail.vendorProfile.businessName}</p>
                      </div>
                    )}
                    {selectedUserDetail.vendorProfile?.isVerified !== undefined && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Vendor Verified</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUserDetail.vendorProfile.isVerified ? 'Yes' : 'No'}</p>
                      </div>
                    )}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedUserDetail.location?.city
                          ? `${selectedUserDetail.location.city}${selectedUserDetail.location.state ? ', ' + selectedUserDetail.location.state : ''}`
                          : 'Not set'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Joined</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(selectedUserDetail.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Last Login</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedUserDetail.lastLogin ? new Date(selectedUserDetail.lastLogin).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {userDetails?.users?.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-500">No users found matching your filters</p>
                </div>
              )}
            </>
          )}

          {/* Bookings Analytics */}
          {activeTab === 'bookings' && bookingAnalytics && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{bookingAnalytics.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Avg Booking Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(bookingAnalytics.avgValue)}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {bookingAnalytics.byStatus.find((s) => s._id === 'completed')?.count || 0}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {bookingAnalytics.byStatus.find((s) => s._id === 'pending')?.count || 0}
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bookings Over Time */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={bookingAnalytics.byMonth.map((item) => ({
                        name: `${getMonthName(item._id.month)} ${item._id.year}`,
                        bookings: item.count,
                        revenue: item.revenue,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bookings" fill="#eb278d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Booking Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={bookingAnalytics.byStatus.map((item) => ({
                          name: item._id,
                          value: item.count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bookingAnalytics.byStatus.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Services */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Booked Services</h3>
                <div className="space-y-3">
                  {bookingAnalytics.topServices.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full text-primary-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{service.serviceName}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {service.bookings} bookings
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Revenue Analytics */}
          {activeTab === 'revenue' && revenueAnalytics && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(revenueAnalytics.totalRevenue)}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Platform Fees</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatCurrency(revenueAnalytics.platformFees)}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Vendor Payouts</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(revenueAnalytics.vendorPayouts)}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Avg Transaction</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(revenueAnalytics.avgTransactionValue)}
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-6">
                {/* Revenue Over Time */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={revenueAnalytics.byMonth.map((item) => ({
                        name: `${getMonthName(item._id.month)} ${item._id.year}`,
                        revenue: item.revenue,
                        platformFee: item.platformFee,
                        vendorAmount: item.vendorAmount,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10b981" name="Total Revenue" />
                      <Bar dataKey="platformFee" fill="#eb278d" name="Platform Fee" />
                      <Bar dataKey="vendorAmount" fill="#3b82f6" name="Vendor Amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {revenueAnalytics.paymentMethods.map((method, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-gray-900">{method.count}</p>
                        <p className="text-sm text-gray-600 mt-1 capitalize">{method._id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Services Analytics */}
          {activeTab === 'services' && serviceAnalytics && (
            <>
              {/* Stats Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Package className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {serviceAnalytics.totalServices}
                    </p>
                    <p className="text-sm text-gray-600">Active Services</p>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Services by Category */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">By Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={serviceAnalytics.byCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoryName" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#eb278d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Rated Services */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rated Services</h3>
                  <div className="space-y-3">
                    {serviceAnalytics.topRated.slice(0, 5).map((service, index) => (
                      <div
                        key={service._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full text-yellow-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {service.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-600">({service.reviews} reviews)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Most Booked Services */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Booked Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceAnalytics.mostBooked.slice(0, 6).map((service) => (
                    <div key={service._id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{service.name}</span>
                        <span className="text-sm font-semibold text-primary-600">
                          {service.bookings}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {service.completedBookings} completed
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Vendors Performance */}
          {activeTab === 'vendors' && vendorPerformance && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Average Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vendorPerformance.avgResponseTime.toFixed(0)} minutes
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Top Vendors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vendorPerformance.topVendors.length}
                  </p>
                </div>
              </div>

              {/* Top Vendors List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Vendors</h3>
                <div className="space-y-3">
                  {vendorPerformance.topVendors.map((vendor, index) => (
                    <div
                      key={vendor._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full text-primary-600 font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{vendor.vendorName}</p>
                          <p className="text-sm text-gray-600">
                            {vendor.totalBookings} bookings • Rating: {vendor.rating.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(vendor.totalRevenue)}
                        </p>
                        <p className="text-xs text-gray-600">Total Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Disputes Analytics */}
          {activeTab === 'disputes' && disputeAnalytics && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Disputes</p>
                  <p className="text-2xl font-bold text-gray-900">{disputeAnalytics.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Avg Resolution Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {disputeAnalytics.avgResolutionTime}h
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Open Disputes</p>
                  <p className="text-2xl font-bold text-red-600">
                    {disputeAnalytics.byStatus.find((s) => s._id === 'open')?.count || 0}
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">By Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={disputeAnalytics.byStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ _id, count }) => `${_id}: ${count}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {disputeAnalytics.byStatus.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* By Category */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">By Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={disputeAnalytics.byCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#eb278d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Referrals Analytics */}
          {activeTab === 'referrals' && referralAnalytics && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {referralAnalytics.totalReferrals}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {referralAnalytics.completedReferrals}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {referralAnalytics.conversionRate}%
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Rewards Paid</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(referralAnalytics.totalRewardsPaid)}
                  </p>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Funnel</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Total Referrals</span>
                      <span className="text-sm font-bold text-gray-900">
                        {referralAnalytics.totalReferrals}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-primary-600 h-3 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Completed Referrals</span>
                      <span className="text-sm font-bold text-gray-900">
                        {referralAnalytics.completedReferrals}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{
                          width: `${referralAnalytics.conversionRate}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};