import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  X,
  DollarSign,
  User,
  Star,
  Briefcase,
} from 'lucide-react';
import { bookingService } from '../services/booking.service';
import { Booking, BookingFilters, BookingStats } from '../types/booking.types';

// ==================== Booking Details Modal ====================

interface BookingDetailsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'payment' | 'review'>('details');

  if (!isOpen) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount?: number) => `₦${(amount || 0).toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'accepted':
        return 'bg-blue-100 text-blue-700';
      case 'in_progress':
        return 'bg-purple-100 text-purple-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'rejected':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'released':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'escrowed':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'refunded':
        return 'bg-red-100 text-red-700';
      case 'partially_refunded':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Booking Details</h3>
                <p className="text-sm text-white/80">#{booking._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 px-6">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Booking Details
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'payment'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Payment Info
              </button>
              {booking.review && (
                <button
                  onClick={() => setActiveTab('review')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'review'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Review
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Status</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status.replace(/_/g, ' ')}
                  </span>
                  {booking.paymentStatus && (
                    <span
                      className={`ml-2 inline-block px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(
                        booking.paymentStatus
                      )}`}
                    >
                      {booking.paymentStatus.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                {/* Service */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Service
                  </p>
                  <p className="font-medium text-gray-900">{booking.service?.name || 'N/A'}</p>
                  {booking.service?.category && (
                    <p className="text-sm text-gray-600 mt-1">Category: {booking.service.category}</p>
                  )}
                  <p className="text-sm text-primary-600 mt-1">
                    Price: {formatCurrency(booking.service?.basePrice || booking.servicePrice)}
                  </p>
                </div>

                {/* Client & Vendor */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Client
                    </p>
                    <p className="font-medium text-gray-900">
                      {booking.client?.firstName} {booking.client?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{booking.client?.email}</p>
                    {booking.client?.phone && (
                      <p className="text-sm text-gray-600">{booking.client.phone}</p>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Vendor
                    </p>
                    <p className="font-medium text-gray-900">
                      {booking.vendor?.firstName} {booking.vendor?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{booking.vendor?.email}</p>
                    {booking.vendor?.phone && (
                      <p className="text-sm text-gray-600">{booking.vendor.phone}</p>
                    )}
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Schedule
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Date:</span> {formatDate(booking.scheduledDate)}
                  </p>
                  {booking.scheduledTime && (
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Time:</span> {booking.scheduledTime}
                    </p>
                  )}
                  {booking.duration && (
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Duration:</span> {booking.duration} minutes
                    </p>
                  )}
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                    <p className="text-sm text-gray-600">{booking.notes}</p>
                  </div>
                )}

                {/* Cancellation Reason */}
                {booking.cancellationReason && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-700 mb-2">Cancellation Reason</p>
                    <p className="text-sm text-gray-600">{booking.cancellationReason}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium text-gray-900">{formatDate(booking.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p className="font-medium text-gray-900">{formatDate(booking.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>
                  {booking.platformFee !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Platform Fee</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(booking.platformFee)}
                      </p>
                    </div>
                  )}
                  {booking.vendorEarnings !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Vendor Earnings</p>
                      <p className="text-lg font-semibold text-green-700">
                        {formatCurrency(booking.vendorEarnings)}
                      </p>
                    </div>
                  )}
                  {booking.paymentMethod && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {booking.paymentMethod}
                      </p>
                    </div>
                  )}
                </div>
                {booking.paymentStatus && (
                  <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-sm text-primary-700 mb-1">Payment Status</p>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(
                        booking.paymentStatus
                      )}`}
                    >
                      {booking.paymentStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Review Tab */}
            {activeTab === 'review' && booking.review && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Rating
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= booking.review!.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {booking.review.rating}/5
                    </span>
                  </div>
                </div>
                {booking.review.comment && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Comment</p>
                    <p className="text-sm text-gray-600">{booking.review.comment}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== Bookings Page ====================

export const BookingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState<BookingFilters>({
    status: undefined,
    paymentStatus: undefined,
    startDate: '',
    endDate: '',
  });

  // Stats
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [page, filters]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const result = await bookingService.getAllBookings(filters, page, limit);
      setBookings(result.bookings || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await bookingService.getBookingStats();
      if (result) {
        setStats({
          total: result.total || 0,
          pending: result.pending || 0,
          accepted: result.accepted || 0,
          inProgress: result.inProgress || 0,
          completed: result.completed || 0,
          cancelled: result.cancelled || 0,
          totalRevenue: result.totalRevenue || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      // Fallback: calculate stats from fetched bookings
      try {
        let allBookings: Booking[] = [];
        let currentPage = 1;
        let hasMore = true;
        const maxLimit = 100;

        while (hasMore && currentPage <= 5) {
          const result = await bookingService.getAllBookings({}, currentPage, maxLimit);
          allBookings = [...allBookings, ...(result.bookings || [])];
          if (currentPage >= result.totalPages) {
            hasMore = false;
          }
          currentPage++;
        }

        setStats({
          total: allBookings.length,
          pending: allBookings.filter((b) => b.status === 'pending').length,
          accepted: allBookings.filter((b) => b.status === 'accepted').length,
          inProgress: allBookings.filter((b) => b.status === 'in_progress').length,
          completed: allBookings.filter((b) => b.status === 'completed').length,
          cancelled: allBookings.filter((b) => b.status === 'cancelled').length,
          totalRevenue: allBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        });
      } catch (fallbackError) {
        console.error('Error calculating stats from bookings:', fallbackError);
        setStats({
          total: 0,
          pending: 0,
          accepted: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          totalRevenue: 0,
        });
      }
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      paymentStatus: undefined,
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'accepted':
        return 'bg-blue-100 text-blue-700';
      case 'rejected':
        return 'bg-orange-100 text-orange-700';
      case 'in_progress':
        return 'bg-purple-100 text-purple-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <ThumbsUp className="w-4 h-4" />;
      case 'rejected':
        return <ThumbsDown className="w-4 h-4" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <CalendarDays className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'released':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'escrowed':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'refunded':
        return 'bg-red-100 text-red-700';
      case 'partially_refunded':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatShortDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => `₦${(amount || 0).toLocaleString()}`;

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const clientName = `${booking.client?.firstName || ''} ${booking.client?.lastName || ''}`.toLowerCase();
    const vendorName = `${booking.vendor?.firstName || ''} ${booking.vendor?.lastName || ''}`.toLowerCase();
    const serviceName = (booking.service?.name || '').toLowerCase();
    return clientName.includes(term) || vendorName.includes(term) || serviceName.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all service bookings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <p className="text-xs font-medium text-gray-600">Pending</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-gray-600">Accepted</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <PlayCircle className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-medium text-gray-600">In Progress</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
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
            <XCircle className="w-4 h-4 text-red-600" />
            <p className="text-xs font-medium text-gray-600">Cancelled</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-medium text-gray-600">Revenue</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-xl shadow-sm border border-primary-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-primary-600" />
            <p className="text-xs font-medium text-primary-700">Total</p>
          </div>
          <p className="text-2xl font-bold text-primary-900">{stats.total}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client, vendor, or service name..."
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  value={filters.paymentStatus || ''}
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Payment Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="escrowed">Escrowed</option>
                  <option value="released">Released</option>
                  <option value="refunded">Refunded</option>
                  <option value="partially_refunded">Partially Refunded</option>
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

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 font-medium text-sm text-gray-700">
              <div className="col-span-1">Booking ID</div>
              <div className="col-span-2">Service</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2">Vendor</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Payment</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-1">
                    <p className="text-sm font-medium text-gray-900">
                      #{booking._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {booking.service?.name || 'N/A'}
                    </p>
                    {booking.service?.category && (
                      <p className="text-xs text-gray-600 truncate">{booking.service.category}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.client?.firstName} {booking.client?.lastName}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{booking.client?.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.vendor?.firstName} {booking.vendor?.lastName}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{booking.vendor?.email}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)}
                      <span className="hidden xl:inline">{booking.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    {booking.paymentStatus ? (
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs text-gray-600">{formatShortDate(booking.scheduledDate)}</p>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => handleViewDetails(booking)}
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
            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No bookings found</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} bookings
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

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
            fetchBookings(); // Refresh list
          }}
        />
      )}
    </div>
  );
};
