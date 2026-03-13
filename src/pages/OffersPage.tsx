import React, { useEffect, useState } from 'react';
import {
  Megaphone,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  X,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { offerService } from '../services/offer.service';
import { Offer, OfferStatus, OfferFilters, OfferStats } from '../types/offer.types';
import { OfferDetailsModal } from '../components/ui/OfferDetailsModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Toast } from '../components/ui/Toast';

export const OffersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState<OfferFilters>({
    status: undefined,
    category: '',
    client: '',
    startDate: '',
    endDate: '',
  });

  // Stats
  const [stats, setStats] = useState<OfferStats>({
    total: 0,
    open: 0,
    accepted: 0,
    closed: 0,
    expired: 0,
    totalResponses: 0,
    avgResponsesPerOffer: 0,
  });

  // Toast
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    fetchOffers();
    fetchStats();
  }, [page, filters]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const result = await offerService.getAllOffers(filters, page, limit);
      console.log('=== OFFERS FETCHED ===');
      console.log('Offers:', result.offers);
      console.log('Total:', result.total);

      setOffers(result.offers || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching offers:', error);
      showToast('Failed to fetch offers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await offerService.getOfferStats();
      console.log('=== OFFER STATS ===');
      console.log('Stats:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewDetails = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (offer: Offer) => {
    setOfferToDelete(offer);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!offerToDelete) return;

    try {
      await offerService.deleteOffer(offerToDelete._id);
      showToast('Offer deleted successfully', 'success');
      setShowDeleteModal(false);
      setOfferToDelete(null);
      fetchOffers();
      fetchStats();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to delete offer', 'error');
    }
  };

  const handleFilterChange = (key: keyof OfferFilters, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      category: '',
      client: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
  };

  const getStatusColor = (status: OfferStatus) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700';
      case 'accepted':
        return 'bg-blue-100 text-blue-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      case 'expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: OfferStatus) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
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

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const isExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry < 24;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offer Requests</h1>
          <p className="text-gray-600 mt-1">Manage client offer requests and vendor responses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-gray-600">Open</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-gray-600">Accepted</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-gray-600" />
            <p className="text-xs font-medium text-gray-600">Closed</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-red-600" />
            <p className="text-xs font-medium text-gray-600">Expired</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-medium text-gray-600">Responses</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <p className="text-xs font-medium text-gray-600">Avg/Offer</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgResponsesPerOffer}</p>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-xl shadow-sm border border-primary-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="w-4 h-4 text-primary-600" />
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
              placeholder="Search by title, client name, or category..."
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
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="accepted">Accepted</option>
                  <option value="closed">Closed</option>
                  <option value="expired">Expired</option>
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

      {/* Offers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading offers...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 font-medium text-sm text-gray-700">
              <div className="col-span-3">Offer Details</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1">Responses</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {offers
                .filter(
                  (offer) =>
                    !searchTerm ||
                    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    `${offer.client.firstName} ${offer.client.lastName}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    offer.category.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((offer) => (
                  <div
                    key={offer._id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {offer.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {offer.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(offer.createdAt)}
                      </div>
                      {isExpiringSoon(offer.expiresAt) && offer.status === 'open' && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                          Expiring Soon
                        </span>
                      )}
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {offer.client.firstName} {offer.client.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{offer.client.email}</p>
                      {offer.location && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {offer.location.city}
                        </div>
                      )}
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">{offer.category.name}</p>
                      {offer.service && (
                        <p className="text-xs text-gray-600">{offer.service.name}</p>
                      )}
                    </div>

                    <div className="col-span-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(offer.proposedPrice)}
                      </p>
                    </div>

                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <Megaphone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {offer.responses.length}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          offer.status
                        )}`}
                      >
                        {getStatusIcon(offer.status)}
                        {offer.status}
                      </div>
                    </div>

                    <div className="col-span-1 flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(offer)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(offer)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Offer"
                        disabled={offer.status === 'accepted' && !!offer.bookingId}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Empty State */}
            {offers.length === 0 && (
              <div className="text-center py-12">
                <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No offers found</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} offers
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

      {/* Offer Details Modal */}
      {showDetailsModal && selectedOffer && (
        <OfferDetailsModal
          offer={selectedOffer}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOffer(null);
            fetchOffers();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && offerToDelete && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Offer"
          message={`Are you sure you want to delete "${offerToDelete.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            setShowDeleteModal(false);
            setOfferToDelete(null);
          }}
          
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};