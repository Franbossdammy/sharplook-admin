import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Eye,
  Flag,
  X,
  ChevronDown,
} from 'lucide-react';
import { disputeService } from '../services/dispute.service';
import {
  BookingDispute,
  ProductDispute,
  DisputeStats,
  DisputeFilters,
  BookingDisputeStatus,
  ProductDisputeStatus,
} from '../types/dispute.types';
import { DisputeDetailsModal } from '../components/ui/DisputeDetailsModal';

type DisputeType = 'booking' | 'product';

export const DisputesPage: React.FC = () => {
  const [disputeType, setDisputeType] = useState<DisputeType>('booking');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<BookingDispute | ProductDispute | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState<DisputeFilters>({
    status: '',
    priority: '',
    category: '',
    reason: '',
  });

  // Data
  const [bookingDisputes, setBookingDisputes] = useState<BookingDispute[]>([]);
  const [productDisputes, setProductDisputes] = useState<ProductDispute[]>([]);
  const [stats, setStats] = useState<DisputeStats | null>(null);

  useEffect(() => {
    fetchDisputes();
    fetchStats();
  }, [disputeType, page, filters]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      if (disputeType === 'booking') {
        const result = await disputeService.getBookingDisputes(filters, page, limit);
        
        setBookingDisputes(result.disputes || []);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
      } else {
        const result = await disputeService.getProductDisputes(filters, page, limit);
        
        setProductDisputes(result.disputes || []);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (disputeType === 'booking') {
        const statsData = await disputeService.getBookingDisputeStats();
        
        setStats(statsData);
      } else {
        const statsData = await disputeService.getProductDisputeStats();
        
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewDetails = (dispute: BookingDispute | ProductDispute) => {
    setSelectedDispute(dispute);
    setShowDetailsModal(true);
  };

  const handleFilterChange = (key: keyof DisputeFilters, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      reason: '',
    });
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case BookingDisputeStatus.OPEN:
      case ProductDisputeStatus.OPEN:
        return 'bg-red-100 text-red-700';
      case BookingDisputeStatus.IN_REVIEW:
      case ProductDisputeStatus.UNDER_REVIEW:
        return 'bg-yellow-100 text-yellow-700';
      case BookingDisputeStatus.RESOLVED:
      case ProductDisputeStatus.RESOLVED:
        return 'bg-green-100 text-green-700';
      case BookingDisputeStatus.CLOSED:
      case ProductDisputeStatus.CLOSED:
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
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

  const activeDisputes = disputeType === 'booking' 
    ? (stats?.open || 0) + (stats?.inReview || 0)
    : (stats?.activeDisputes || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
          <p className="text-gray-600 mt-1">Manage and resolve customer disputes</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeDisputes}</p>
                <p className="text-sm text-gray-600">Active Disputes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inReview || stats.underReview || 0}
                </p>
                <p className="text-sm text-gray-600">Under Review</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Disputes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setDisputeType('booking');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              disputeType === 'booking'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Booking Disputes
          </button>
          <button
            onClick={() => {
              setDisputeType('product');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              disputeType === 'product'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Product Disputes
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search disputes..."
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value={disputeType === 'booking' ? 'in_review' : 'under_review'}>
                    {disputeType === 'booking' ? 'In Review' : 'Under Review'}
                  </option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Priorities</option>
                  {disputeType === 'booking' && <option value="urgent">Urgent</option>}
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {disputeType === 'booking' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    <option value="service_quality">Service Quality</option>
                    <option value="payment">Payment</option>
                    <option value="cancellation">Cancellation</option>
                    <option value="communication">Communication</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {disputeType === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <select
                    value={filters.reason}
                    onChange={(e) => handleFilterChange('reason', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Reasons</option>
                    <option value="product_not_received">Product Not Received</option>
                    <option value="product_not_as_described">Not As Described</option>
                    <option value="defective_product">Defective Product</option>
                    <option value="wrong_item">Wrong Item</option>
                    <option value="payment_issue">Payment Issue</option>
                    <option value="seller_unresponsive">Seller Unresponsive</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

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

      {/* Disputes List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading disputes...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 font-medium text-sm text-gray-700">
              <div className="col-span-1">ID</div>
              <div className="col-span-2">
                {disputeType === 'booking' ? 'Client/Vendor' : 'Customer/Seller'}
              </div>
              <div className="col-span-2">Reason</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-2">Assigned To</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {disputeType === 'booking' &&
                bookingDisputes
                  .filter(
                    (dispute) =>
                      !searchTerm ||
                      dispute._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      dispute.reason.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((dispute) => (
                    <div
                      key={dispute._id}
                      className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="col-span-1">
                        <p className="text-sm font-mono text-gray-600">
                          ...{dispute._id.slice(-6)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-900">
                          {dispute.raisedBy.firstName} {dispute.raisedBy.lastName}
                        </p>
                        <p className="text-xs text-gray-600">vs</p>
                        <p className="text-sm text-gray-600">
                          {dispute.against.firstName} {dispute.against.lastName}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-900">{dispute.reason}</p>
                        <p className="text-xs text-gray-600 capitalize">{dispute.category}</p>
                      </div>
                      <div className="col-span-1">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            dispute.status
                          )}`}
                        >
                          {dispute.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-1">
                          <Flag className={`w-4 h-4 ${getPriorityColor(dispute.priority)}`} />
                          <span className={`text-sm capitalize ${getPriorityColor(dispute.priority)}`}>
                            {dispute.priority}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">{formatDate(dispute.createdAt)}</p>
                      </div>
                      <div className="col-span-2">
                        {dispute.assignedTo ? (
                          <p className="text-sm text-gray-900">
                            {dispute.assignedTo.firstName} {dispute.assignedTo.lastName}
                          </p>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => handleViewDetails(dispute)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

              {disputeType === 'product' &&
                productDisputes
                  .filter(
                    (dispute) =>
                      !searchTerm ||
                      dispute._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      dispute.reason.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((dispute) => (
                    <div
                      key={dispute._id}
                      className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="col-span-1">
                        <p className="text-sm font-mono text-gray-600">
                          ...{dispute._id.slice(-6)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-900">
                          {dispute.customer.firstName} {dispute.customer.lastName}
                        </p>
                        <p className="text-xs text-gray-600">vs</p>
                        <p className="text-sm text-gray-600">
                          {dispute.seller.firstName} {dispute.seller.lastName}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-900 capitalize">
                          {dispute.reason.replace(/_/g, ' ')}
                        </p>
                        {dispute.product && (
                          <p className="text-xs text-gray-600">{dispute.product.name}</p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            dispute.status
                          )}`}
                        >
                          {dispute.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-1">
                          <Flag className={`w-4 h-4 ${getPriorityColor(dispute.priority)}`} />
                          <span className={`text-sm capitalize ${getPriorityColor(dispute.priority)}`}>
                            {dispute.priority}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">{formatDate(dispute.createdAt)}</p>
                      </div>
                      <div className="col-span-2">
                        {dispute.assignedTo ? (
                          <p className="text-sm text-gray-900">
                            {dispute.assignedTo.firstName} {dispute.assignedTo.lastName}
                          </p>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => handleViewDetails(dispute)}
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
            {((disputeType === 'booking' && bookingDisputes.length === 0) ||
              (disputeType === 'product' && productDisputes.length === 0)) && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No disputes found</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
              disputes
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

      {/* Dispute Details Modal */}
      {showDetailsModal && selectedDispute && (
        <DisputeDetailsModal
          dispute={selectedDispute}
          disputeType={disputeType}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDispute(null);
            fetchDisputes(); // Refresh list
          }}
        />
      )}
    </div>
  );
};