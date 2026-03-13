import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flag,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  MapPin,
  MessageSquare,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Filter,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserX,
  Ban,
  FileText,
  TrendingUp,
  Users,
  Shield,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { redFlagService } from '../services/redFlag.service';
import type {
  RedFlag,
  RedFlagStats,
  RedFlagFilters,
  TopFlaggedUser,
  RedFlagSeverity,
  RedFlagStatus,
  RedFlagType,
} from '../types/redFlag.types';

// Helper functions using service methods
const getSeverityColor = (severity: string) => redFlagService.getSeverityColor(severity);
const getStatusColor = (status: string) => redFlagService.getStatusColor(status);
const formatType = (type: string) => redFlagService.formatType(type);

const getTypeIcon = (type: string) => {
  if (type.includes('cancellation')) return <XCircle className="w-4 h-4" />;
  if (type.includes('location') || type.includes('meeting')) return <MapPin className="w-4 h-4" />;
  if (type.includes('chat') || type.includes('contact')) return <MessageSquare className="w-4 h-4" />;
  if (type.includes('payment')) return <DollarSign className="w-4 h-4" />;
  if (type.includes('review')) return <FileText className="w-4 h-4" />;
  return <Flag className="w-4 h-4" />;
};

export const RedFlagsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [flags, setFlags] = useState<RedFlag[]>([]);
  const [stats, setStats] = useState<RedFlagStats | null>(null);
  const [topUsers, setTopUsers] = useState<TopFlaggedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    status: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Selected flag for detail view
  const [selectedFlag, setSelectedFlag] = useState<RedFlag | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Action modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<string>('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams: RedFlagFilters = {};
      if (filters.type) filterParams.type = filters.type as RedFlagType;
      if (filters.severity) filterParams.severity = filters.severity as RedFlagSeverity;
      if (filters.status) filterParams.status = filters.status as RedFlagStatus;

      const [flagsRes, statsRes, topUsersRes] = await Promise.all([
        redFlagService.getRedFlags(filterParams, page, 20),
        redFlagService.getStats(),
        redFlagService.getTopFlaggedUsers(5),
      ]);

      setFlags(flagsRes.flags || []);
      setTotalPages(flagsRes.totalPages || 1);
      setTotal(flagsRes.total || 0);
      setStats(statsRes);
      setTopUsers(topUsersRes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load red flags');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter flags by search
  const filteredFlags = flags.filter((flag) => {
    if (!filters.search) return true;
    const search = filters.search.toLowerCase();
    return (
      flag.title.toLowerCase().includes(search) ||
      flag.description.toLowerCase().includes(search) ||
      flag.flaggedUser?.firstName?.toLowerCase().includes(search) ||
      flag.flaggedUser?.lastName?.toLowerCase().includes(search) ||
      flag.flaggedUser?.email?.toLowerCase().includes(search) ||
      flag.flaggedUser?.vendorProfile?.businessName?.toLowerCase().includes(search)
    );
  });

  // Handle status update
  const handleStatusUpdate = async (flagId: string, status: RedFlagStatus) => {
    try {
      await redFlagService.updateStatus(flagId, { status });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle resolve action
  const handleResolve = async () => {
    if (!selectedFlag || !actionType) return;
    
    setActionLoading(true);
    try {
      await redFlagService.resolve(selectedFlag._id, {
        action: actionType as any,
        notes: actionNotes,
      });
      setShowActionModal(false);
      setActionType('');
      setActionNotes('');
      setSelectedFlag(null);
      setShowDetailModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // View flag details
  const viewFlagDetails = async (flag: RedFlag) => {
    try {
      const fullFlag = await redFlagService.getRedFlagById(flag._id);
      setSelectedFlag(fullFlag);
      setShowDetailModal(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && flags.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading red flags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Flag className="w-8 h-8 text-red-600" />
            Red Flags Management
          </h1>
          <p className="text-gray-600 mt-1">Monitor and resolve suspicious activities</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Open Flags */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-xs text-red-600 font-medium">Needs Action</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">{stats.byStatus.open}</p>
            <p className="text-sm text-gray-600">Open Flags</p>
          </div>

          {/* Under Review */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-xs text-yellow-600 font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">{stats.byStatus.underReview}</p>
            <p className="text-sm text-gray-600">Under Review</p>
          </div>

          {/* Resolved */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">{stats.byStatus.resolved}</p>
            <p className="text-sm text-gray-600">Resolved</p>
          </div>

          {/* This Week */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-blue-600 font-medium">7 Days</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">{stats.trends.last7Days}</p>
            <p className="text-sm text-gray-600">New This Week</p>
          </div>

          {/* Total */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Activity className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-xs text-gray-600 font-medium">All Time</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-3">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Flags</p>
          </div>
        </div>
      )}

      {/* Severity Breakdown */}
      {stats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Severity Breakdown</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-sm text-gray-600">Critical: {stats.bySeverity.critical || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span className="text-sm text-gray-600">High: {stats.bySeverity.high || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-sm text-gray-600">Medium: {stats.bySeverity.medium || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-sm text-gray-600">Low: {stats.bySeverity.low || 0}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - Flags List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search flags..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                    showFilters ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <span className="text-sm text-gray-600">{total} total flags</span>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="vendor_late_cancellation">Vendor Late Cancellation</option>
                    <option value="client_frequent_cancellation">Client Frequent Cancellation</option>
                    <option value="suspected_off_platform_meeting">Off-Platform Meeting</option>
                    <option value="location_proximity_no_booking">Location Proximity</option>
                    <option value="chat_contains_contact_info">Contact Info in Chat</option>
                    <option value="chat_suggests_outside_payment">Outside Payment Suggested</option>
                  </select>
                </div>

                {/* Severity Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                    <option value="escalated">Escalated</option>
                    <option value="action_taken">Action Taken</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Flags List */}
          <div className="space-y-3">
            {filteredFlags.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No red flags found</p>
              </div>
            ) : (
              filteredFlags.map((flag) => (
                <div
                  key={flag._id}
                  className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    flag.severity === 'critical' ? 'border-red-200 border-l-4 border-l-red-500' :
                    flag.severity === 'high' ? 'border-orange-200 border-l-4 border-l-orange-500' :
                    'border-gray-100'
                  }`}
                  onClick={() => viewFlagDetails(flag)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${
                        flag.severity === 'critical' ? 'bg-red-100 text-red-600' :
                        flag.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                        flag.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {getTypeIcon(flag.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 truncate">{flag.title}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(flag.severity)}`}>
                            {flag.severity.toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(flag.status)}`}>
                            {flag.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{flag.description}</p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {flag.flaggedUser?.vendorProfile?.businessName || 
                             `${flag.flaggedUser?.firstName} ${flag.flaggedUser?.lastName}`}
                            <span className="text-gray-400">({flag.flaggedUserRole})</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(flag.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                          <span className="flex items-center gap-1">
                            {flag.triggerSource === 'system_auto' && <Activity className="w-3 h-3" />}
                            {flag.triggerSource === 'ai_detection' && <Shield className="w-3 h-3" />}
                            {flag.triggerSource === 'user_report' && <Users className="w-3 h-3" />}
                            {flag.triggerSource === 'admin_manual' && <User className="w-3 h-3" />}
                            {flag.triggerSource.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      {flag.status === 'open' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(flag._id, 'under_review');
                          }}
                          className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                        >
                          Review
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewFlagDetails(flag);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - Top Flagged Users */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-600" />
              Most Flagged Users
            </h3>
            <div className="space-y-3">
              {topUsers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No flagged users</p>
              ) : (
                topUsers.map((item, index) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                      index === 0 ? 'bg-red-100 text-red-600' :
                      index === 1 ? 'bg-orange-100 text-orange-600' :
                      index === 2 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.user?.vendorProfile?.businessName || 
                         `${item.user?.firstName} ${item.user?.lastName}`}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{item.user?.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {item.flagCount} flags
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Type Stats */}
          {stats && Object.keys(stats.byType).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Flags by Type</h3>
              <div className="space-y-2">
                {Object.entries(stats.byType)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate flex-1">
                        {formatType(type)}
                      </span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedFlag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b ${
              selectedFlag.severity === 'critical' ? 'bg-red-50 border-red-200' :
              selectedFlag.severity === 'high' ? 'bg-orange-50 border-orange-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{selectedFlag.title}</h2>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(selectedFlag.severity)}`}>
                      {selectedFlag.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{formatType(selectedFlag.type)}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedFlag(null);
                  }}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              {/* Status & Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedFlag.status)}`}>
                    {selectedFlag.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(selectedFlag.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selectedFlag.description}</p>
              </div>

              {/* Flagged User */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Flagged User</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFlag.flaggedUser?.vendorProfile?.businessName || 
                     `${selectedFlag.flaggedUser?.firstName} ${selectedFlag.flaggedUser?.lastName}`}
                  </p>
                  <p className="text-xs text-gray-500">{selectedFlag.flaggedUser?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                    {selectedFlag.flaggedUserRole}
                  </span>
                </div>
              </div>

              {/* Related User */}
              {selectedFlag.relatedUser && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Related User</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFlag.relatedUser.firstName} {selectedFlag.relatedUser.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{selectedFlag.relatedUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                      {selectedFlag.relatedUserRole}
                    </span>
                  </div>
                </div>
              )}

              {/* Booking Info */}
              {selectedFlag.booking && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Related Booking</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {format(new Date(selectedFlag.booking.scheduledDate), 'MMM d, yyyy')} at {selectedFlag.booking.scheduledTime}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        ₦{selectedFlag.booking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Analysis */}
              {selectedFlag.chatAnalysis && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Chat Analysis</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Risk Score: <span className="font-semibold">{(selectedFlag.chatAnalysis.overallRiskScore * 100).toFixed(0)}%</span>
                    </p>
                    {selectedFlag.chatAnalysis.suspiciousMessages?.map((msg, idx) => (
                      <div key={idx} className="bg-white rounded p-2 mb-2 text-sm">
                        <p className="text-gray-600">{msg.content}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {msg.detectedPatterns.map((pattern, pIdx) => (
                            <span key={pIdx} className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                              {pattern}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              {selectedFlag.metrics && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Metrics</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedFlag.metrics.occurrenceCount !== undefined && (
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-gray-900">{selectedFlag.metrics.occurrenceCount}</p>
                        <p className="text-xs text-gray-500">Occurrences</p>
                      </div>
                    )}
                    {selectedFlag.metrics.previousFlagsCount !== undefined && (
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-gray-900">{selectedFlag.metrics.previousFlagsCount}</p>
                        <p className="text-xs text-gray-500">Previous Flags</p>
                      </div>
                    )}
                    {selectedFlag.metrics.financialImpact !== undefined && (
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-gray-900">₦{selectedFlag.metrics.financialImpact.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Financial Impact</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedFlag.adminNotes && selectedFlag.adminNotes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Admin Notes</h4>
                  <div className="space-y-2">
                    {selectedFlag.adminNotes.map((note, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">{note.note}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {note.addedBy?.firstName} {note.addedBy?.lastName} • {format(new Date(note.addedAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution */}
              {selectedFlag.resolution && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Resolution</h4>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-sm font-medium text-green-800">
                      Action: {selectedFlag.resolution.action.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    {selectedFlag.resolution.notes && (
                      <p className="text-sm text-green-700 mt-1">{selectedFlag.resolution.notes}</p>
                    )}
                    <p className="text-xs text-green-600 mt-2">
                      Resolved by {selectedFlag.resolution.resolvedBy?.firstName} {selectedFlag.resolution.resolvedBy?.lastName} on {format(new Date(selectedFlag.resolution.resolvedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Actions */}
            {selectedFlag.status !== 'resolved' && selectedFlag.status !== 'action_taken' && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedFlag.status === 'open' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedFlag._id, 'under_review')}
                        className="px-4 py-2 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                      >
                        Start Review
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusUpdate(selectedFlag._id, 'dismissed')}
                      className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActionType('warning_issued');
                        setShowActionModal(true);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                    >
                      <AlertOctagon className="w-4 h-4" />
                      Issue Warning
                    </button>
                    <button
                      onClick={() => {
                        setActionType('temporary_suspension');
                        setShowActionModal(true);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Suspend (7 days)
                    </button>
                    <button
                      onClick={() => {
                        setActionType('permanent_ban');
                        setShowActionModal(true);
                      }}
                      className="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      Ban User
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Action: {actionType.replace(/_/g, ' ').toUpperCase()}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {actionType === 'warning_issued' && 'A warning notification will be sent to the user.'}
              {actionType === 'temporary_suspension' && 'The user will be suspended for 7 days and unable to use the platform.'}
              {actionType === 'permanent_ban' && 'The user will be permanently banned from the platform. This action is irreversible.'}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Add any notes about this action..."
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setActionType('');
                  setActionNotes('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={actionLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${
                  actionType === 'permanent_ban' ? 'bg-red-600 hover:bg-red-700' :
                  actionType === 'temporary_suspension' ? 'bg-orange-600 hover:bg-orange-700' :
                  'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50`}
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedFlagsPage;