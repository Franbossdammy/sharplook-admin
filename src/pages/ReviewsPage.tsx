import React, { useEffect, useState } from 'react';
import { getImageUrl } from '@/utils/image';
import {
  Star,
  Search,
  Eye,
  EyeOff,
  Check,
  Flag,
  X,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';
import { reviewService } from '../services/review.service';
import { Review, ReviewFilters } from '../types/review.types';
import toast from 'react-hot-toast';

// Star Rating Display Component
const StarRating: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'w-4 h-4' }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

// Derive a display status from the boolean flags
const getDisplayStatus = (review: Review): string => {
  if (review.isHidden) return 'hidden';
  if (review.isFlagged) return 'flagged';
  if (!review.isApproved) return 'pending';
  return 'active';
};

export const ReviewsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState<ReviewFilters>({});

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    flagged: 0,
    hidden: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, [page, filters, activeTab]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Map tabs to backend query params (isFlagged, isApproved booleans)
      const activeFilters: any = { ...filters };
      if (activeTab === 'flagged') {
        activeFilters.isFlagged = 'true';
      } else if (activeTab === 'hidden') {
        // Backend doesn't have isHidden filter, we'll filter client-side
      } else if (activeTab === 'pending') {
        activeFilters.isApproved = 'false';
      } else if (activeTab === 'active') {
        activeFilters.isApproved = 'true';
      }

      const result = await reviewService.getAllReviews(activeFilters, page, limit);
      let reviewsList = result.reviews || [];

      // Client-side filter for hidden (backend may not support isHidden query param)
      if (activeTab === 'hidden') {
        reviewsList = reviewsList.filter((r: Review) => r.isHidden);
      }

      setReviews(reviewsList);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);

      // Calculate stats from the fetched data
      if (page === 1 && activeTab === 'all' && !filters.rating) {
        const totalRating = reviewsList.reduce((sum: number, r: Review) => sum + (r.rating || 0), 0);
        setStats({
          total: result.total || reviewsList.length,
          averageRating: reviewsList.length > 0
            ? Math.round((totalRating / reviewsList.length) * 10) / 10
            : 0,
          flagged: reviewsList.filter((r: Review) => r.isFlagged).length,
          hidden: reviewsList.filter((r: Review) => r.isHidden).length,
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (review: Review) => {
    setSelectedReview(review);
    setShowDetailsModal(true);
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await reviewService.approveReview(reviewId);
      toast.success('Review approved');
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  const handleToggleHide = async (review: Review) => {
    try {
      if (review.isHidden) {
        await reviewService.unhideReview(review._id);
        toast.success('Review unhidden');
      } else {
        await reviewService.hideReview(review._id);
        toast.success('Review hidden');
      }
      fetchReviews();
    } catch (error) {
      console.error('Error toggling review visibility:', error);
      toast.error('Failed to update review visibility');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'hidden':
        return 'bg-gray-100 text-gray-700';
      case 'flagged':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateComment = (comment?: string, maxLength = 60) => {
    if (!comment) return '';
    if (comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + '...';
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const reviewerName = `${review.reviewer?.firstName || ''} ${review.reviewer?.lastName || ''}`.toLowerCase();
    const revieweeName = `${review.reviewee?.firstName || ''} ${review.reviewee?.lastName || ''}`.toLowerCase();
    const comment = (review.comment || '').toLowerCase();
    const title = (review.title || '').toLowerCase();
    return reviewerName.includes(term) || revieweeName.includes(term) || comment.includes(term) || title.includes(term);
  });

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Approved' },
    { key: 'flagged', label: 'Flagged' },
    { key: 'hidden', label: 'Hidden' },
    { key: 'pending', label: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage customer reviews</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-gray-600">Total Reviews</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
            <p className="text-xs font-medium text-gray-600">Average Rating</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
            <StarRating rating={Math.round(stats.averageRating)} size="w-3 h-3" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flag className="w-4 h-4 text-red-600" />
            <p className="text-xs font-medium text-gray-600">Flagged Reviews</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.flagged}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <EyeOff className="w-4 h-4 text-gray-600" />
            <p className="text-xs font-medium text-gray-600">Hidden Reviews</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.hidden}</p>
        </div>
      </div>

      {/* Search, Tabs, and Rating Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reviewer name, reviewee name, or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filters.rating || ''}
              onChange={(e) => {
                setFilters({ ...filters, rating: e.target.value || undefined });
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border-t border-gray-200 pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 font-medium text-sm text-gray-700">
              <div className="col-span-1">ID</div>
              <div className="col-span-2">Reviewer</div>
              <div className="col-span-2">Reviewee</div>
              <div className="col-span-1">Rating</div>
              <div className="col-span-3">Comment</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredReviews.map((review) => {
                const displayStatus = getDisplayStatus(review);
                return (
                  <div
                    key={review._id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors items-center"
                  >
                    <div className="col-span-1">
                      <p className="text-sm font-medium text-gray-900 truncate" title={review._id}>
                        {review._id.slice(-6)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {review.reviewer?.firstName || 'N/A'} {review.reviewer?.lastName || ''}
                      </p>
                      <p className="text-xs text-gray-600">{review.reviewer?.email || ''}</p>
                      {review.reviewerType && (
                        <span className="text-xs text-gray-400 capitalize">{review.reviewerType}</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {review.reviewee?.firstName || 'N/A'} {review.reviewee?.lastName || ''}
                      </p>
                      <p className="text-xs text-gray-600">{review.reviewee?.email || ''}</p>
                    </div>
                    <div className="col-span-1">
                      <StarRating rating={review.rating} />
                    </div>
                    <div className="col-span-3">
                      {review.title && (
                        <p className="text-sm font-medium text-gray-900 mb-0.5">{review.title}</p>
                      )}
                      <p className="text-sm text-gray-700" title={review.comment}>
                        {truncateComment(review.comment)}
                      </p>
                      {review.helpfulCount > 0 && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <ThumbsUp className="w-3 h-3" />
                          {review.helpfulCount} helpful
                        </span>
                      )}
                    </div>
                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          displayStatus
                        )}`}
                      >
                        {displayStatus}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="col-span-1 flex justify-end gap-1">
                      <button
                        onClick={() => handleViewDetails(review)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!review.isApproved && (
                        <button
                          onClick={() => handleApprove(review._id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleHide(review)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          review.isHidden
                            ? 'text-blue-600 hover:bg-blue-50'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title={review.isHidden ? 'Unhide' : 'Hide'}
                      >
                        {review.isHidden ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredReviews.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reviews found</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} reviews
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

      {/* Review Details Modal */}
      {showDetailsModal && selectedReview && (() => {
        const displayStatus = getDisplayStatus(selectedReview);
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedReview(null);
                }}
              />

              <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Review Details</h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedReview(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Review Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <StarRating rating={selectedReview.rating} size="w-5 h-5" />
                        <span className="text-lg font-semibold text-gray-900">
                          {selectedReview.rating}/5
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(displayStatus)}`}
                        >
                          {displayStatus}
                        </span>
                        {selectedReview.reviewerType && (
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                            {selectedReview.reviewerType}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedReview.helpfulCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <ThumbsUp className="w-4 h-4" />
                        {selectedReview.helpfulCount} helpful
                      </div>
                    )}
                  </div>

                  {/* Reviewer & Reviewee */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">Reviewer</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedReview.reviewer?.firstName} {selectedReview.reviewer?.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{selectedReview.reviewer?.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">Reviewee</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedReview.reviewee?.firstName} {selectedReview.reviewee?.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{selectedReview.reviewee?.email}</p>
                    </div>
                  </div>

                  {/* Title & Comment */}
                  <div>
                    {selectedReview.title && (
                      <p className="text-sm font-semibold text-gray-900 mb-2">{selectedReview.title}</p>
                    )}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-800 leading-relaxed">{selectedReview.comment}</p>
                    </div>
                  </div>

                  {/* Detailed Ratings */}
                  {selectedReview.detailedRatings && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Detailed Ratings</p>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(selectedReview.detailedRatings).map(([key, value]) => {
                          if (value == null) return null;
                          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                          return (
                            <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 px-3">
                              <span className="text-xs text-gray-600">{label}</span>
                              <StarRating rating={value} size="w-3 h-3" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Images</p>
                      <div className="flex gap-2 flex-wrap">
                        {selectedReview.images.map((img, i) => (
                          <img key={i} src={getImageUrl(img)} alt={`Review image ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vendor Response */}
                  {selectedReview.response && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Vendor Response</p>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {selectedReview.response.comment}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Responded on {formatDate(selectedReview.response.respondedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Flag Info */}
                  {selectedReview.isFlagged && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <p className="text-xs font-medium text-red-600">Flagged</p>
                      </div>
                      {selectedReview.flagReason && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                          <p className="text-sm text-red-800">{selectedReview.flagReason}</p>
                          {selectedReview.flaggedAt && (
                            <p className="text-xs text-red-500 mt-1">Flagged on {formatDate(selectedReview.flaggedAt)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hidden Info */}
                  {selectedReview.isHidden && selectedReview.hiddenReason && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Hidden Reason</p>
                      <p className="text-sm text-gray-800">{selectedReview.hiddenReason}</p>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Review ID:</span> {selectedReview._id}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(selectedReview.createdAt)}
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span> {formatDate(selectedReview.updatedAt)}
                      </div>
                      {selectedReview.moderatedAt && (
                        <div>
                          <span className="font-medium">Moderated:</span> {formatDate(selectedReview.moderatedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                  {!selectedReview.isApproved && (
                    <button
                      onClick={() => {
                        handleApprove(selectedReview._id);
                        setShowDetailsModal(false);
                        setSelectedReview(null);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleToggleHide(selectedReview);
                      setShowDetailsModal(false);
                      setSelectedReview(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      selectedReview.isHidden
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {selectedReview.isHidden ? (
                      <>
                        <Eye className="w-4 h-4" />
                        Unhide
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedReview(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
