import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@/utils/image';
import {
  Search, Check, Eye, Trash2, RefreshCw, Filter, Download,
  KeyRound, Lock, Receipt, MapPin, Wallet, Clock, Calendar,
  X, Users,
} from 'lucide-react';
import { userService, GetUsersParams } from '@/services/user.service';
import { analyticsService } from '@/services/analytics.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { UserDetailsModal } from '@/components/ui/UserDetailsModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast } from '@/components/ui/Toast';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const DEFAULT_FILTERS: GetUsersParams = {
  page: 1,
  limit: 20,
  search: '',
  role: '',
  status: '',
  isVendor: undefined,
  dateJoinedFrom: '',
  dateJoinedTo: '',
  lastLoginFrom: '',
  lastLoginTo: '',
  state: '',
  minWalletBalance: undefined,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const UsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const navigate = useNavigate();
  const isAnalyticsAdmin = currentAdmin?.role === 'analytics_admin';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: User | null }>({ show: false, user: null });
  const [verifyModal, setVerifyModal] = useState<{ show: boolean; user: User | null }>({ show: false, user: null });
  const [unlockModal, setUnlockModal] = useState<{ show: boolean; user: User | null }>({ show: false, user: null });
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<GetUsersParams>(DEFAULT_FILTERS);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ show: true, message, type });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(filters);
      setUsers(response.data || response.users || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
      setPage(response.page || filters.page || 1);
    } catch (error: any) {
      showToast('Failed to load users: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => setFilters((p) => ({ ...p, search: value, page: 1 }));
  const handleFilterChange = (key: keyof GetUsersParams, value: any) =>
    setFilters((p) => ({ ...p, [key]: value, page: 1 }));
  const handlePageChange = (newPage: number) => {
    setFilters((p) => ({ ...p, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      await userService.updateUserStatus(userId, status);
      showToast('Status updated', 'success');
      fetchUsers();
    } catch (error: any) {
      showToast('Failed to update status: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.user) return;
    try {
      setActionLoading(true);
      await userService.deleteUser(deleteModal.user._id);
      showToast('User deleted successfully', 'success');
      setDeleteModal({ show: false, user: null });
      fetchUsers();
    } catch (error: any) {
      showToast('Failed to delete user: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const isAccountLocked = (u: User) => !!(u.lockUntil && new Date(u.lockUntil) > new Date());

  const confirmUnlock = async () => {
    if (!unlockModal.user) return;
    try {
      setActionLoading(true);
      await userService.unlockAccount(unlockModal.user._id);
      showToast(`Account unlocked for ${unlockModal.user.firstName} ${unlockModal.user.lastName}`, 'success');
      setUnlockModal({ show: false, user: null });
      fetchUsers();
    } catch (error: any) {
      showToast('Failed to unlock: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmVerify = async () => {
    if (!verifyModal.user) return;
    try {
      setActionLoading(true);
      await userService.verifyVendor(verifyModal.user._id);
      showToast('Vendor verified successfully', 'success');
      setVerifyModal({ show: false, user: null });
      fetchUsers();
    } catch (error: any) {
      showToast('Failed to verify vendor: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      const blob = await analyticsService.exportUserDataCSV({ role: filters.role, status: filters.status });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      showToast('Failed to export: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setExportingCSV(false);
    }
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const activeFilterCount = [
    filters.role, filters.status,
    filters.isVendor !== undefined ? '1' : '',
    filters.dateJoinedFrom, filters.dateJoinedTo,
    filters.lastLoginFrom, filters.lastLoginTo,
    filters.state,
    filters.minWalletBalance !== undefined ? '1' : '',
  ].filter(Boolean).length;

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—';
  const fmtLastLogin = (d?: string) => {
    if (!d) return '—';
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return fmtDate(d);
  };

  const selectClass = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none';
  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';

  return (
    <div>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users & Vendors</h2>
          <p className="text-sm text-gray-500 mt-1">
            {total > 0 ? `${total.toLocaleString()} total users` : 'Manage all users, vendors, and administrators'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" onClick={handleExportCSV} disabled={exportingCSV}>
            <Download className="w-4 h-4 mr-1 inline" />
            {exportingCSV ? 'Exporting…' : 'Export CSV'}
          </Button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={fetchUsers}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone…"
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
        {filters.search && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Role */}
            <div>
              <label className={labelClass}>Role</label>
              <select value={filters.role} onChange={(e) => handleFilterChange('role', e.target.value)} className={selectClass}>
                <option value="">All Roles</option>
                <option value="client">Client</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>Status</label>
              <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className={selectClass}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending_verification">Pending Verification</option>
              </select>
            </div>

            {/* User Type */}
            <div>
              <label className={labelClass}>User Type</label>
              <select
                value={filters.isVendor === undefined ? '' : filters.isVendor ? 'true' : 'false'}
                onChange={(e) => handleFilterChange('isVendor', e.target.value === '' ? undefined : e.target.value === 'true')}
                className={selectClass}
              >
                <option value="">All Users</option>
                <option value="true">Vendors Only</option>
                <option value="false">Clients Only</option>
              </select>
            </div>

            {/* State / Location */}
            <div>
              <label className={labelClass}>State / Location</label>
              <select value={filters.state} onChange={(e) => handleFilterChange('state', e.target.value)} className={selectClass}>
                <option value="">All States</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Joined From */}
            <div>
              <label className={labelClass}>Joined From</label>
              <input
                type="date"
                value={filters.dateJoinedFrom}
                onChange={(e) => handleFilterChange('dateJoinedFrom', e.target.value)}
                className={selectClass}
              />
            </div>

            {/* Joined To */}
            <div>
              <label className={labelClass}>Joined To</label>
              <input
                type="date"
                value={filters.dateJoinedTo}
                onChange={(e) => handleFilterChange('dateJoinedTo', e.target.value)}
                className={selectClass}
              />
            </div>

            {/* Last Login From */}
            <div>
              <label className={labelClass}>Last Login After</label>
              <input
                type="date"
                value={filters.lastLoginFrom}
                onChange={(e) => handleFilterChange('lastLoginFrom', e.target.value)}
                className={selectClass}
              />
            </div>

            {/* Last Login To */}
            <div>
              <label className={labelClass}>Last Login Before</label>
              <input
                type="date"
                value={filters.lastLoginTo}
                onChange={(e) => handleFilterChange('lastLoginTo', e.target.value)}
                className={selectClass}
              />
            </div>

            {/* Min Wallet Balance */}
            <div>
              <label className={labelClass}>Min Wallet (₦)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 5000"
                value={filters.minWalletBalance ?? ''}
                onChange={(e) => handleFilterChange('minWalletBalance', e.target.value ? Number(e.target.value) : undefined)}
                className={selectClass}
              />
            </div>

            {/* Sort By */}
            <div>
              <label className={labelClass}>Sort By</label>
              <select value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)} className={selectClass}>
                <option value="createdAt">Date Joined</option>
                <option value="lastLogin">Last Login</option>
                <option value="walletBalance">Wallet Balance</option>
                <option value="firstName">Name</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className={labelClass}>Sort Order</label>
              <select value={filters.sortOrder} onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')} className={selectClass}>
                <option value="desc">Newest / Highest</option>
                <option value="asc">Oldest / Lowest</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</p>
            <button onClick={resetFilters} className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center space-x-1">
              <X className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          </div>
        </Card>
      )}

      {/* Users Table */}
      {loading ? (
        <Card>
          <Loading size="lg" text="Loading users…" />
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No users found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
            <button onClick={resetFilters} className="mt-4 text-sm text-primary-600 hover:text-primary-800 font-medium">
              Clear filters
            </button>
          </div>
        </Card>
      ) : (
        <>
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Wallet</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => {
                    const locationState = user.location?.state || user.vendorProfile?.location?.state;
                    return (
                      <tr key={user._id} className="hover:bg-gray-50/70 transition-colors">
                        {/* User */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {user.avatar ? (
                                <img src={getImageUrl(user.avatar)} alt={user.firstName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-primary-600">
                                  {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors text-left"
                              >
                                {user.firstName} {user.lastName}
                              </button>
                              {user.isVendor && user.vendorProfile?.isVerified && (
                                <div className="flex items-center text-xs text-green-600 mt-0.5">
                                  <Check className="w-3 h-3 mr-0.5" />
                                  Verified
                                </div>
                              )}
                              {user.isVendor && user.vendorProfile?.businessName && (
                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[130px]">
                                  {user.vendorProfile.businessName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-gray-800 truncate max-w-[160px]">{user.email}</p>
                          {user.phone && <p className="text-xs text-gray-400 mt-0.5">{user.phone}</p>}
                        </td>

                        {/* Role */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                            user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                            user.isVendor ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role === 'super_admin' ? 'Super Admin' :
                             user.role === 'admin' ? 'Admin' :
                             user.isVendor ? 'Vendor' : 'Client'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-1">
                            {isAnalyticsAdmin ? (
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' :
                                user.status === 'suspended' ? 'bg-amber-100 text-amber-800' :
                                user.status === 'pending_verification' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {user.status?.replace('_', ' ')}
                              </span>
                            ) : (
                              <select
                                value={user.status}
                                onChange={(e) => handleUpdateStatus(user._id, e.target.value)}
                                className={`text-xs font-semibold rounded-full px-2 py-0.5 border-0 outline-none focus:ring-1 focus:ring-primary-400 capitalize cursor-pointer ${
                                  user.status === 'active' ? 'bg-green-100 text-green-800' :
                                  user.status === 'suspended' ? 'bg-amber-100 text-amber-800' :
                                  user.status === 'pending_verification' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                                <option value="pending_verification">Pending</option>
                              </select>
                            )}
                            {isAccountLocked(user) && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full w-fit">
                                <Lock className="w-2.5 h-2.5" />
                                Locked
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-5 py-3.5">
                          {locationState ? (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0" />
                              <span className="truncate max-w-[90px]">{locationState}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>

                        {/* Wallet */}
                        <td className="px-5 py-3.5">
                          {user.walletBalance !== undefined ? (
                            <div className="flex items-center text-sm">
                              <Wallet className="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0" />
                              <span className={`font-semibold ${user.walletBalance > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                ₦{user.walletBalance.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>

                        {/* Joined */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-gray-300 flex-shrink-0" />
                            {fmtDate(user.createdAt)}
                          </div>
                        </td>

                        {/* Last Login */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5 mr-1 text-gray-300 flex-shrink-0" />
                            {fmtLastLogin(user.lastLogin || user.lastSeen)}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/transactions?userId=${user._id}&userName=${encodeURIComponent(`${user.firstName} ${user.lastName}`)}`)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Transactions"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                            {!isAnalyticsAdmin && isAccountLocked(user) && (
                              <button
                                onClick={() => setUnlockModal({ show: true, user })}
                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Unlock Account"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                            )}
                            {!isAnalyticsAdmin && user.isVendor && !user.vendorProfile?.isVerified && (
                              <button
                                onClick={() => setVerifyModal({ show: true, user })}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Verify Vendor"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {!isAnalyticsAdmin && (
                              <button
                                onClick={() => setDeleteModal({ show: true, user })}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-5">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-900">{((page - 1) * (filters.limit || 20) + 1).toLocaleString()}</span>
              {' '}–{' '}
              <span className="font-semibold text-gray-900">{Math.min(page * (filters.limit || 20), total).toLocaleString()}</span>
              {' '}of{' '}
              <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> users
            </p>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {selectedUser && (
        <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      <ConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, user: null })}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteModal.user?.firstName} ${deleteModal.user?.lastName}? This will soft-delete the account — it can be restored later.`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        loading={actionLoading}
      />

      <ConfirmModal
        isOpen={verifyModal.show}
        onClose={() => setVerifyModal({ show: false, user: null })}
        onConfirm={confirmVerify}
        title="Verify Vendor"
        message={`Verify ${verifyModal.user?.firstName} ${verifyModal.user?.lastName} as a vendor? Their business will be marked as verified and they'll gain full vendor privileges.`}
        confirmText="Verify Vendor"
        cancelText="Cancel"
        variant="success"
        loading={actionLoading}
      />

      <ConfirmModal
        isOpen={unlockModal.show}
        onClose={() => setUnlockModal({ show: false, user: null })}
        onConfirm={confirmUnlock}
        title="Unlock Account"
        message={`Unlock ${unlockModal.user?.firstName} ${unlockModal.user?.lastName}'s account? Their login attempts will be reset and they can log in immediately.`}
        confirmText="Unlock Account"
        cancelText="Cancel"
        variant="success"
        loading={actionLoading}
      />
    </div>
  );
};
