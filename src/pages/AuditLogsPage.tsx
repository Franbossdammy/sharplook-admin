import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { auditLogService, AuditLog, AuditLogFilters } from '@/services/auditLog.service';
import { Loading } from '@/components/ui/Loading';
import toast from 'react-hot-toast';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  APPROVE: 'bg-green-100 text-green-800',
  REJECT: 'bg-red-100 text-red-800',
  CANCEL: 'bg-orange-100 text-orange-800',
  ACCEPT: 'bg-green-100 text-green-800',
  START: 'bg-blue-100 text-blue-800',
  COMPLETE: 'bg-emerald-100 text-emerald-800',
  RESOLVE: 'bg-teal-100 text-teal-800',
  ASSIGN: 'bg-indigo-100 text-indigo-800',
  HIDE: 'bg-gray-100 text-gray-800',
  UNHIDE: 'bg-gray-100 text-gray-800',
  TOGGLE: 'bg-yellow-100 text-yellow-800',
  LOGIN: 'bg-blue-100 text-blue-800',
  REGISTER: 'bg-green-100 text-green-800',
  APPROVE_SERVICE: 'bg-green-100 text-green-800',
  REJECT_SERVICE: 'bg-red-100 text-red-800',
  PROCESS_WITHDRAWAL: 'bg-purple-100 text-purple-800',
  REJECT_WITHDRAWAL: 'bg-red-100 text-red-800',
};

const RESOURCE_OPTIONS = [
  'auth', 'user', 'category', 'service', 'booking', 'order',
  'payment', 'product', 'review', 'dispute', 'dispute-product',
  'offer', 'referral', 'subscription', 'vendor', 'red-flag',
];

const ACTION_OPTIONS = [
  'CREATE', 'UPDATE', 'DELETE',
  'APPROVE', 'REJECT', 'CANCEL', 'ACCEPT',
  'START', 'COMPLETE', 'RESOLVE', 'ASSIGN',
  'HIDE', 'UNHIDE', 'TOGGLE',
  'LOGIN', 'REGISTER',
];

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const activeFilters: AuditLogFilters = { ...filters };
      if (searchQuery.trim()) activeFilters.search = searchQuery;

      const result = await auditLogService.getAll(page, 20, activeFilters);
      setLogs(result.logs);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, filters, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActorDisplay = (log: AuditLog) => {
    if (typeof log.actor === 'object' && log.actor) {
      return `${log.actor.firstName} ${log.actor.lastName}`;
    }
    return log.actorEmail || 'System';
  };

  const getActorEmail = (log: AuditLog) => {
    if (typeof log.actor === 'object' && log.actor) {
      return log.actor.email;
    }
    return log.actorEmail || '';
  };

  const getActorRole = (log: AuditLog): string => {
    if (typeof log.actor === 'object' && log.actor) {
      return log.actor.role || 'user';
    }
    return log.actorRole || 'user';
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'vendor': return 'bg-orange-100 text-orange-800';
      case 'financial_admin': return 'bg-emerald-100 text-emerald-800';
      case 'support': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track all admin actions on the platform ({total} entries)
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            showFilters
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
              <select
                value={filters.resource || ''}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, resource: e.target.value || undefined }));
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Resources</option>
                {RESOURCE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filters.action || ''}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, action: e.target.value || undefined }));
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Actions</option>
                {ACTION_OPTIONS.map((a) => (
                  <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, startDate: e.target.value || undefined }));
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
              <select
                value={(filters as any).role || ''}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, role: e.target.value || undefined } as any));
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="vendor">Vendor</option>
                <option value="user">User</option>
                <option value="support">Support</option>
                <option value="financial_admin">Financial Admin</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              setFilters({});
              setSearchQuery('');
              setPage(1);
            }}
            className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loading size="md" text="Loading audit logs..." />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit logs found</h3>
          <p className="text-sm text-gray-600">
            {searchQuery || Object.keys(filters).length > 0
              ? 'Try adjusting your filters'
              : 'Audit logs will appear here as admin actions are performed'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                      {log.resource}
                      {log.resourceId && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({log.resourceId.slice(-6)})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{getActorDisplay(log)}</div>
                      <div className="text-xs text-gray-500">{getActorEmail(log)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        getRoleColor(getActorRole(log))
                      }`}>
                        {getActorRole(log).replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages} ({total} entries)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
