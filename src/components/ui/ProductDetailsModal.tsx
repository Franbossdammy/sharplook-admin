import React from 'react';
import { getImageUrl } from '@/utils/image';
import {
  X,
  MapPin,
  Ruler,
  Tag, 
  Truck, 
  Star, 
  Calendar, 
  Eye, 
  ShoppingCart,
  User,
  BadgeCheck,
  Store,
  Mail,
  Phone,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Product } from '@/types/product.types';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [selectedImage, setSelectedImage] = React.useState(0);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get seller display name
  const getSellerDisplayName = () => {
    if (product.seller?.vendorProfile?.businessName) {
      return product.seller.vendorProfile.businessName;
    }
    return product.seller?.fullName || 
           `${product.seller?.firstName || ''} ${product.seller?.lastName || ''}`.trim() || 
           'Unknown Seller';
  };

  // Check if vendor is verified
  const isVerifiedVendor = product.seller?.vendorProfile?.isVerified || 
                           product.seller?.vendorProfile?.verificationStatus === 'approved';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images Section */}
            <div>
              {/* Main Image */}
              <div className="mb-4 aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(product.images[selectedImage]) || '/placeholder-product.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-product.png';
                  }}
                />
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-primary-600'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h1>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    product.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    product.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.approvalStatus.charAt(0).toUpperCase() + product.approvalStatus.slice(1)}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    product.status === 'active' || product.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    product.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status === 'out_of_stock' ? 'Out of Stock' : 
                     product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                  {product.isFeatured && (
                    <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                  {product.isSponsored && (
                    <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Sponsored
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary-600">
                      {formatPrice(product.finalPrice || product.price)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-xl text-gray-500 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="inline-block mt-2 px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded">
                      Save {formatPrice(product.compareAtPrice - product.price)} 
                      ({Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF)
                    </span>
                  )}
                </div>

                {/* Short Description */}
                {product.shortDescription && (
                  <p className="text-gray-700 font-medium mb-3">
                    {product.shortDescription}
                  </p>
                )}

                {/* Full Description */}
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Enhanced Seller Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  {product.sellerType === 'admin' ? (
                    <Store className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  Seller Information
                </h3>
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {/* Seller Avatar */}
                    <div className="flex-shrink-0">
                      {product.seller?.avatar ? (
                        <img
                          src={getImageUrl(product.seller.avatar)}
                          alt={getSellerDisplayName()}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          {product.sellerType === 'admin' ? (
                            <Store className="w-8 h-8 text-primary-600" />
                          ) : (
                            <User className="w-8 h-8 text-primary-600" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Seller Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold text-gray-900">
                          {getSellerDisplayName()}
                        </h4>
                        {isVerifiedVendor && (
                          <BadgeCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        )}
                      </div>

                      {/* Seller Type Badge */}
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded mb-3 ${
                        product.sellerType === 'admin' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-600 text-white'
                      }`}>
                        {product.sellerType === 'admin' ? 'Official Store' : 'Verified Vendor'}
                      </span>

                      {/* Vendor Rating */}
                      {product.seller?.vendorProfile?.rating !== undefined && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.seller.vendorProfile!.rating!)
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {product.seller.vendorProfile.rating.toFixed(1)}
                          </span>
                          {product.seller.vendorProfile.totalSales !== undefined && (
                            <span className="text-sm text-gray-600">
                              ({product.seller.vendorProfile.totalSales} sales)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Business Description */}
                      {product.seller?.vendorProfile?.businessDescription && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {product.seller.vendorProfile.businessDescription}
                        </p>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-2">
                        {product.seller?.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <a 
                              href={`mailto:${product.seller.email}`}
                              className="text-primary-600 hover:text-primary-700 hover:underline"
                            >
                              {product.seller.email}
                            </a>
                          </div>
                        )}
                        {product.seller?.vendorProfile?.businessPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <a 
                              href={`tel:${product.seller.vendorProfile.businessPhone}`}
                              className="text-primary-600 hover:text-primary-700 hover:underline"
                            >
                              {product.seller.vendorProfile.businessPhone}
                            </a>
                          </div>
                        )}
                        {product.seller?.vendorProfile?.businessAddress && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <span className="text-gray-700">
                              {product.seller.vendorProfile.businessAddress}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock & SKU Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Stock Available
                    </span>
                    <span className={`text-sm font-semibold ${
                      product.stock > (product.lowStockThreshold || 10) 
                        ? 'text-green-600' 
                        : product.stock > 0 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {product.stock} units
                    </span>
                  </div>
                  
                  {product.sku && (
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <span className="text-sm text-gray-600">SKU</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {product.sku}
                      </span>
                    </div>
                  )}
                </div>
                
                {product.lowStockThreshold && product.stock <= product.lowStockThreshold && product.stock > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ Low stock alert! Only {product.stock} units remaining
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                      <Eye className="w-4 h-4" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{product.views || 0}</p>
                    <p className="text-xs text-gray-600">Views</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{product.orders || 0}</p>
                    <p className="text-xs text-gray-600">Orders</p>
                  </div>
                  
                  {product.revenue !== undefined && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(product.revenue)}
                      </p>
                      <p className="text-xs text-gray-600">Revenue</p>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">Listed</p>
                  </div>
                </div>
              </div>

              {/* Category & Brand */}
              {(product.category || product.brand) && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {product.category && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Category</span>
                        <p className="text-sm text-gray-900 font-semibold mt-1">
                          {product.category.name}
                        </p>
                      </div>
                    )}
                    {product.brand && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Brand</span>
                        <p className="text-sm text-gray-900 font-semibold mt-1">
                          {product.brand}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              {product.location && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                    <p>{product.location.address}</p>
                    <p>{product.location.city}, {product.location.state}</p>
                    <p>{product.location.country}</p>
                  </div>
                </div>
              )}

              {/* Dimensions & Weight */}
              {(product.dimensions || product.weight) && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Dimensions & Weight
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {product.dimensions && product.dimensions.length && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-600">Size:</span>
                        <p className="font-medium text-gray-900 mt-1">
                          {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                        </p>
                      </div>
                    )}
                    {(product.dimensions?.weight || product.weight) && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-600">Weight:</span>
                        <p className="font-medium text-gray-900 mt-1">
                          {product.dimensions?.weight || product.weight} {product.dimensions?.weightUnit || 'kg'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Options */}
              {product.deliveryOptions && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Delivery Options
                  </h3>
                  <div className="space-y-2">
                    {product.deliveryOptions.homeDelivery && (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Home Delivery</p>
                          {product.deliveryOptions.estimatedDeliveryDays && (
                            <p className="text-xs text-gray-600 mt-1">
                              Estimated: {product.deliveryOptions.estimatedDeliveryDays} day{product.deliveryOptions.estimatedDeliveryDays !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {product.deliveryOptions.freeDelivery 
                            ? 'Free' 
                            : formatPrice(product.deliveryOptions.deliveryFee || 0)}
                        </span>
                      </div>
                    )}
                    {product.deliveryOptions.pickup && (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Pickup Available</p>
                          <p className="text-xs text-gray-600 mt-1">Free</p>
                        </div>
                        <span className="text-sm font-semibold text-green-600">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Variants</h3>
                  <div className="space-y-3">
                    {product.variants.map((variant, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900 mb-2">{variant.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {variant.options.map((option, optIndex) => (
                            <span
                              key={optIndex}
                              className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded"
                            >
                              {option}
                              {variant.priceModifier && variant.priceModifier !== 0 && (
                                <span className="ml-1 text-primary-600">
                                  (+{formatPrice(variant.priceModifier)})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval Info */}
              {product.approvedAt && product.approvedBy && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Approval Information</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Approved on:</span> {formatDate(product.approvedAt)}
                    </p>
                    {product.featuredUntil && product.isFeatured && (
                      <p>
                        <span className="font-medium">Featured until:</span> {formatDate(product.featuredUntil)}
                      </p>
                    )}
                    {product.sponsoredUntil && product.isSponsored && (
                      <p>
                        <span className="font-medium">Sponsored until:</span> {formatDate(product.sponsoredUntil)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {product.approvalStatus === 'rejected' && product.rejectionReason && (
                <div className="border-t border-red-200 pt-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Rejection Reason
                    </h3>
                    <p className="text-sm text-red-700">{product.rejectionReason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};