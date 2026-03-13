import React, { useState } from 'react';
import { Star, MapPin, Clock, Trash2, Eye, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { Service } from '@/types/service.types';

interface ServiceCardProps {
  service: Service;
  onDelete: (serviceId: string) => void;
  onApprove?: (serviceId: string) => void;
  onReject?: (serviceId: string, reason: string) => void; // Pass reason here
  onViewDetails?: (service: Service) => void;
  showApprovalActions?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onDelete,
  onApprove,
  onReject,
  onViewDetails,
  showApprovalActions = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const handleDelete = () => {
    onDelete((service._id || service.id));
    setShowDeleteConfirm(false);
  };

  const handleReject = () => {
    const reason = rejectReason.trim();
    if (!reason || reason.length < 10 || reason.length > 500) {
      setRejectError('Rejection reason must be between 10 and 500 characters.');
      return;
    }
    if (onReject) {
      onReject((service._id || service.id), reason);
      setShowRejectModal(false);
      setRejectReason('');
      setRejectError('');
    }
  };

  const getStatusBadge = () => {
    switch (service.approvalStatus) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return null;
    }
  };

  // Handle different property names
  const price = service.basePrice || service.price || 0;
  const title = service.name || service.title || 'Untitled Service';
  const categoryName = typeof service.category === 'object' ? ((service.category as any)?.name || 'N/A') : (service.categoryName || 'N/A');
  const vendorObj = typeof service.vendor === 'object' ? service.vendor as any : null;
  const providerName = vendorObj?.firstName
    ? `${vendorObj.firstName} ${vendorObj.lastName || ''}`.trim()
    : service.providerName || 'Unknown';
  const rating = service.metadata?.averageRating || service.rating || 0;
  const reviewCount = service.metadata?.totalReviews || service.reviewCount || 0;

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative h-48 bg-gray-100">
          {service.images && service.images.length > 0 ? (
            <img
              src={typeof service.images[0] === 'string' ? service.images[0] : (service.images[0] as any)?.url}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-gray-300" />
            </div>
          )}
          {service.images && service.images.length > 1 && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded-full">
              +{service.images.length - 1} more
            </div>
          )}
          <div className="absolute top-2 left-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title & Price */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{title}</h3>
            <span className="text-lg font-bold text-primary-600 ml-2">₦{price.toLocaleString()}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>

          {/* Meta Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">{categoryName}</span>
            </div>
            <div className="text-sm text-gray-600">
              By: <span className="font-medium">{providerName}</span>
            </div>
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
              </div>
            )}
            {service.location && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{service.location}</span>
              </div>
            )}
            {service.duration && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{service.duration} min</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {showApprovalActions && service.approvalStatus === 'pending' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onApprove && onApprove((service._id || service.id))}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(service)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Service</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Service</h3>
            <div className="mb-2">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection (required, 10-500 characters)
              </label>
              <textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Enter reason for rejecting this service..."
              />
              {rejectError && <p className="mt-1 text-red-500 text-sm">{rejectError}</p>}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setRejectError('');
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
