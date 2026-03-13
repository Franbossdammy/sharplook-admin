import React, { useState, useEffect } from 'react';
import { Search, Check, X, Eye, Trash2, RefreshCw, Filter } from 'lucide-react';
import { userService, GetUsersParams } from '@/services/user.service';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { UserDetailsModal } from '@/components/ui/UserDetailsModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast } from '@/components/ui/Toast';
import { User } from '@/types';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: User | null }>({
    show: false,
    user: null,
  });
  const [verifyModal, setVerifyModal] = useState<{ show: boolean; user: User | null }>({
    show: false,
    user: null,
  });
  const [actionLoading, setActionLoading] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<GetUsersParams>({
    page: 1,
    limit: 20,
    search: '',
    role: '',
    status: '',
    isVendor: undefined,
  });

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
      console.error('Failed to fetch users:', error);
      showToast('Failed to load users: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof GetUsersParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      await userService.updateUserStatus(userId, status);
      showToast('User status updated successfully', 'success');
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

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      search: '',
      role: '',
      status: '',
      isVendor: undefined,
    });
  };

  return (
    <div>
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage all users, vendors, and administrators
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchUsers}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              icon={<Search className="w-5 h-5" />}
              className="w-full"
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Roles</option>
                    <option value="client">Client</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending_verification">Pending Verification</option>
                  </select>
                </div>

                {/* Vendor Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Type
                  </label>
                  <select
                    value={
                      filters.isVendor === undefined
                        ? ''
                        : filters.isVendor
                        ? 'true'
                        : 'false'
                    }
                    onChange={(e) =>
                      handleFilterChange(
                        'isVendor',
                        e.target.value === '' ? undefined : e.target.value === 'true'
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Users</option>
                    <option value="true">Vendors Only</option>
                    <option value="false">Clients Only</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Users Table */}
      {loading ? (
        <Card>
          <Loading size="lg" text="Loading users..." />
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetFilters}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card padding={false}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.firstName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-primary-600">
                                {user.firstName?.[0]?.toUpperCase()}
                                {user.lastName?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            {user.isVendor && user.vendorProfile?.isVerified && (
                              <span className="inline-flex items-center text-xs text-green-600">
                                <Check className="w-3 h-3 mr-1" />
                                Verified Vendor
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 break-all">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-gray-500">{user.phone}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' || user.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'vendor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role === 'admin'
                            ? 'Admin'
                            : user.role === 'super_admin'
                            ? 'Super Admin'
                            : user.role === 'vendor'
                            ? 'Vendor'
                            : 'Client'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.status}
                          onChange={(e) => handleUpdateStatus(user._id, e.target.value)}
                          className={`text-xs font-medium rounded-lg px-2 py-1 border-0 focus:ring-2 focus:ring-primary-500 capitalize ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : user.status === 'suspended'
                              ? 'bg-yellow-100 text-yellow-800'
                              : user.status === 'pending_verification'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                          <option value="pending_verification">Pending</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user.isVendor && !user.vendorProfile?.isVerified && (
                            <button
                              onClick={() => setVerifyModal({ show: true, user })}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Verify Vendor"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteModal({ show: true, user })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Showing{' '}
              <span className="font-medium">
                {(page - 1) * (filters.limit || 20) + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(page * (filters.limit || 20), total)}
              </span>{' '}
              of <span className="font-medium">{total}</span> users
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, user: null })}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteModal.user?.firstName} ${deleteModal.user?.lastName}? This action will soft-delete the user and they can be restored later.`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        loading={actionLoading}
      />

      {/* Verify Vendor Modal */}
      <ConfirmModal
        isOpen={verifyModal.show}
        onClose={() => setVerifyModal({ show: false, user: null })}
        onConfirm={confirmVerify}
        title="Verify Vendor"
        message={`Are you sure you want to verify ${verifyModal.user?.firstName} ${verifyModal.user?.lastName} as a vendor? This will grant them vendor privileges and their business will be marked as verified.`}
        confirmText="Verify Vendor"
        cancelText="Cancel"
        variant="success"
        loading={actionLoading}
      />
    </div>
  );
};