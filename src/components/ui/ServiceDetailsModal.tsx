import React, { useState } from 'react';
import { X, Star, MapPin, Clock, Calendar, User, Mail, Tag, Trash2, Upload } from 'lucide-react';
import { Service } from '@/types/service.types';

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  onDeleteImage?: (serviceId: string, imageId: string) => void;
  onUploadImage?: (serviceId: string, file: File) => void;
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  isOpen,
  onClose,
  service,
  onDeleteImage,
  onUploadImage,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  console.log("service oo",service);
  

  if (!isOpen) return null;

  const serviceId = service._id || service.id;

  // Helper to get image URL from either string or object format
  const getImageUrl = (img: any): string => {
    if (typeof img === 'string') return img;
    return img?.url || '';
  };

  const getImageId = (img: any): string => {
    if (typeof img === 'string') return img;
    return img?.id || img?._id || '';
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      setIsUploading(true);
      await onUploadImage(serviceId, file);
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    if (onDeleteImage && window.confirm('Are you sure you want to delete this image?')) {
      onDeleteImage(serviceId, imageId);
      if (selectedImageIndex >= service.images.length - 1) {
        setSelectedImageIndex(Math.max(0, service.images.length - 2));
      }
    }
  };

  const getStatusBadge = () => {
    switch (service.approvalStatus) {
      case 'approved':
        return <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'pending':
        return <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-gray-900">Service Details</h3>
              {getStatusBadge()}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Images Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Images</h4>
                {service.images && service.images.length > 0 ? (
                  <div className="space-y-3">
                    {/* Main Image */}
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(service.images[selectedImageIndex])}
                        alt={service.name || service.title}
                        className="w-full h-full object-cover"
                      />
                      {onDeleteImage && (
                        <button
                          onClick={() => handleDeleteImage(getImageId(service.images[selectedImageIndex]))}
                          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {service.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {service.images.map((image, index) => (
                          <button
                            key={getImageId(image) || index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === index
                                ? 'border-primary-600'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={getImageUrl(image)}
                              alt={`${service.name || service.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">No images available</p>
                  </div>
                )}

                {/* Upload Image Button */}
                {onUploadImage && (
                  <div className="mt-3">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.name || service.title}</h3>
                      <p className="text-3xl font-bold text-primary-600">₦{(service.basePrice || service.price || 0).toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>

                    {(service.metadata?.averageRating || service.rating || 0) > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="text-lg font-semibold text-gray-900">{(service.metadata?.averageRating || service.rating || 0).toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({service.metadata?.totalReviews || service.reviewCount || 0} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Provider Info */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Provider Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900 block">
                        {typeof service.vendor === 'object'
                          ? (service.vendor?.fullName || `${service.vendor?.firstName || ''} ${service.vendor?.lastName || ''}`.trim() || 'N/A')
                          : (service.providerName || 'N/A')}
                      </span>
                    </div>
                    {typeof service.vendor === 'object' && service.vendor?.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">{service.vendor.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900">{typeof service.category === 'object' ? (service.category?.name || 'N/A') : (service.categoryName || 'N/A')}</span>
                    </div>

                    {service.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-900">{service.location}</span>
                      </div>
                    )}

                    {service.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">{service.duration}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(service.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Status</h4>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      service.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {getStatusBadge()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};