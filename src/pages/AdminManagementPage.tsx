import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, X, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '@/services/user.service';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

const ADMIN_ROLES = ['super_admin', 'admin', 'financial_admin', 'analytics_admin', 'support'];

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  financial_admin: 'Financial Admin',
  analytics_admin: 'Analytics Admin',
  support: 'Support',
};

const ROLE_BADGE_CLASSES: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  financial_admin: 'bg-emerald-100 text-emerald-800',
  analytics_admin: 'bg-amber-100 text-amber-800',
  support: 'bg-cyan-100 text-cyan-800',
};

interface CreateAdminForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

const initialForm: CreateAdminForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'admin',
};

export const AdminManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateAdminForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [editRole, setEditRole] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const availableRoles = isSuperAdmin
    ? ADMIN_ROLES
    : ADMIN_ROLES.filter((r) => r !== 'super_admin');

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers({ limit: 100 });
      const allUsers = response.data || response.users || [];
      const adminUsers = allUsers.filter((u: User) => ADMIN_ROLES.includes(u.role));
      setAdmins(adminUsers);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch admin users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim() || !form.password.trim()) {
      toast.error('All fields are required');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setCreating(true);
      await userService.createAdmin(form);
      toast.success('Admin created successfully');
      setShowCreateModal(false);
      setForm(initialForm);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create admin');
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (admin: User) => {
    // Can't edit super_admin unless you're super_admin
    if (admin.role === 'super_admin' && !isSuperAdmin) {
      toast.error('Only super admins can edit super admin accounts');
      return;
    }
    setEditingAdmin(admin);
    setEditRole(admin.role);
    setShowEditModal(true);
  };

  const handleUpdateRole = async () => {
    if (!editingAdmin) return;
    const adminId = editingAdmin._id || editingAdmin.id;
    if (!adminId) return;

    if (editRole === editingAdmin.role) {
      toast.error('Please select a different role');
      return;
    }

    try {
      setSaving(true);
      await userService.updateAdminRole(adminId, editRole);
      toast.success('Admin role updated successfully');
      setShowEditModal(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (admin: User) => {
    // Can't delete super_admin unless you're super_admin
    if (admin.role === 'super_admin' && !isSuperAdmin) {
      toast.error('Only super admins can delete super admin accounts');
      return;
    }
    // Can't delete yourself
    const adminId = admin._id || admin.id;
    const currentId = currentUser?._id || currentUser?.id;
    if (adminId === currentId) {
      toast.error("You can't delete your own account");
      return;
    }
    setDeletingAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAdmin) return;
    const adminId = deletingAdmin._id || deletingAdmin.id;
    if (!adminId) return;

    try {
      setDeleting(true);
      await userService.deleteUser(adminId);
      toast.success('Admin deleted successfully');
      setShowDeleteModal(false);
      setDeletingAdmin(null);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to delete admin');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
            <p className="text-gray-500 text-sm">Manage admin and staff accounts ({admins.length})</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Admin</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No admin users found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const adminId = admin._id || admin.id;
                  const currentId = currentUser?._id || currentUser?.id;
                  const isSelf = adminId === currentId;
                  const isTargetSuperAdmin = admin.role === 'super_admin';
                  const canModify = isSuperAdmin || !isTargetSuperAdmin;

                  return (
                    <tr key={adminId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {admin.firstName} {admin.lastName}
                          {isSelf && <span className="ml-2 text-xs text-gray-400">(You)</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {admin.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ROLE_BADGE_CLASSES[admin.role] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ROLE_LABELS[admin.role] || admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            admin.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : admin.status === 'suspended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {admin.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(admin)}
                            disabled={!canModify}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Edit role"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(admin)}
                            disabled={isSelf || !canModify}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isSelf ? "Can't delete yourself" : 'Delete admin'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Admin</h2>
              <button
                onClick={() => { setShowCreateModal(false); setForm(initialForm); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="admin@lookreal.beauty"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="08012345678"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setForm(initialForm); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit Admin Role</h2>
              <button
                onClick={() => { setShowEditModal(false); setEditingAdmin(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600">
                Changing role for <span className="font-semibold text-gray-900">{editingAdmin.firstName} {editingAdmin.lastName}</span>
                <br />
                <span className="text-gray-400">{editingAdmin.email}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE_CLASSES[editingAdmin.role] || 'bg-gray-100 text-gray-800'}`}>
                  {ROLE_LABELS[editingAdmin.role] || editingAdmin.role}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  {availableRoles.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => { setShowEditModal(false); setEditingAdmin(null); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={saving || editRole === editingAdmin.role}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Delete Admin</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-sm text-gray-600">
                  Are you sure you want to delete <span className="font-semibold text-gray-900">{deletingAdmin.firstName} {deletingAdmin.lastName}</span>?
                  <br />
                  <span className="text-gray-400">{deletingAdmin.email}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                This action will deactivate the account. The user will no longer be able to access the admin dashboard.
              </p>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeletingAdmin(null); }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
