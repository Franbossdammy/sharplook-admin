import React, { useState } from 'react';
import {
  X,
  Megaphone,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Tag,
  Image as ImageIcon,
  MessageSquare,
  Star,
} from 'lucide-react';
import { Offer } from '../../types/offer.types';

interface OfferDetailsModalProps {
  offer: Offer;
  isOpen: boolean;
  onClose: () => void;
}

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({ offer, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'responses'>('details');

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

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const getFlexibilityText = (flexibility: string) => {
    switch (flexibility) {
      case 'flexible':
        return 'Flexible';
      case 'specific':
        return 'Specific Date/Time';
      case 'urgent':
        return 'Urgent';
      default:
        return flexibility;
    }
  };

  const getFlexibilityColor = (flexibility: string) => {
    switch (flexibility) {
      case 'flexible':
        return 'bg-green-100 text-green-700';
      case 'specific':
        return 'bg-blue-100 text-blue-700';
      case 'urgent':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const isExpired = new Date(offer.expiresAt) < new Date();

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
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Offer Details</h3>
                <p className="text-sm text-white/80">{offer.title}</p>
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
                Offer Details
              </button>
              <button
                onClick={() => setActiveTab('responses')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'responses'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Vendor Responses ({offer.responses.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Status and Flexibility */}
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      offer.status === 'open'
                        ? 'bg-green-100 text-green-700'
                        : offer.status === 'accepted'
                        ? 'bg-blue-100 text-blue-700'
                        : offer.status === 'closed'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {offer.status}
                  </span>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getFlexibilityColor(
                      offer.flexibility
                    )}`}
                  >
                    {getFlexibilityText(offer.flexibility)}
                  </span>
                  {isExpired && (
                    <span className="inline-block px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-full">
                      Expired
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{offer.description}</p>
                </div>

                {/* Client Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Client
                  </p>
                  <p className="font-medium text-gray-900">
                    {offer.client.firstName} {offer.client.lastName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{offer.client.email}</p>
                  {offer.client.phone && (
                    <p className="text-sm text-gray-600">{offer.client.phone}</p>
                  )}
                </div>

                {/* Category and Service */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Category
                    </p>
                    <p className="font-medium text-gray-900">{offer.category.name}</p>
                  </div>
                  {offer.service && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Service</p>
                      <p className="font-medium text-gray-900">{offer.service.name}</p>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <p className="text-sm text-primary-700 mb-1 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Proposed Budget
                  </p>
                  <p className="text-2xl font-bold text-primary-900">
                    {formatCurrency(offer.proposedPrice)}
                  </p>
                </div>

                {/* Location */}
                {offer.location && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Service Location
                    </p>
                    <p className="text-sm text-gray-900">{offer.location.address}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {offer.location.city}, {offer.location.state}
                    </p>
                  </div>
                )}

                {/* Preferred Date/Time */}
                {(offer.preferredDate || offer.preferredTime) && (
                  <div className="grid grid-cols-2 gap-4">
                    {offer.preferredDate && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Preferred Date
                        </p>
                        <p className="text-sm text-gray-900">{formatDate(offer.preferredDate)}</p>
                      </div>
                    )}
                    {offer.preferredTime && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Preferred Time
                        </p>
                        <p className="text-sm text-gray-900">{offer.preferredTime}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Images */}
                {offer.images && offer.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Images ({offer.images.length})
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {offer.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Offer image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium text-gray-900">{formatDate(offer.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expires</p>
                    <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(offer.expiresAt)}
                    </p>
                  </div>
                  {offer.acceptedAt && (
                    <div className="col-span-2">
                      <p className="text-gray-600">Accepted</p>
                      <p className="font-medium text-gray-900">{formatDate(offer.acceptedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Responses Tab */}
            {activeTab === 'responses' && (
              <div className="space-y-3">
                {offer.responses.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No vendor responses yet</p>
                  </div>
                ) : (
                  offer.responses.map((response, index) => (
                    <div
                      key={response._id}
                      className={`p-4 rounded-lg border-2 ${
                        response.isAccepted
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary-600">
                              {response.vendor.firstName[0]}
                              {response.vendor.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {response.vendor.firstName} {response.vendor.lastName}
                            </p>
                            {response.vendor.vendorProfile?.businessName && (
                              <p className="text-xs text-primary-600">
                                {response.vendor.vendorProfile.businessName}
                              </p>
                            )}
                            {response.vendor.vendorProfile?.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-600">
                                  {response.vendor.vendorProfile.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {response.isAccepted && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Accepted
                          </span>
                        )}
                      </div>

                      {/* Proposed Price */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-1">Proposed Price</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(response.proposedPrice)}
                        </p>
                        {response.counterOffer && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-xs text-blue-700 mb-1">Counter Offer from Client</p>
                            <p className="text-sm font-semibold text-blue-900">
                              {formatCurrency(response.counterOffer)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      {response.message && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-1">Message</p>
                          <p className="text-sm text-gray-900">{response.message}</p>
                        </div>
                      )}

                      {/* Duration */}
                      {response.estimatedDuration && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 mb-1">Estimated Duration</p>
                          <p className="text-sm text-gray-900">
                            {response.estimatedDuration} minutes
                          </p>
                        </div>
                      )}

                      {/* Response Date */}
                      <p className="text-xs text-gray-500">
                        Responded: {formatDate(response.respondedAt)}
                      </p>
                      {response.acceptedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Accepted: {formatDate(response.acceptedAt)}
                        </p>
                      )}
                    </div>
                  ))
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