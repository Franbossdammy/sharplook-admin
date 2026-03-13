import React from 'react';
import { 
  Package, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Star,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  User,
  BadgeCheck,
  Store
} from 'lucide-react';
import { Product } from '@/types/product.types';

interface ProductCardProps {
  product: Product;
  onDelete: (productId: string) => Promise<boolean>;
  onApprove: (productId: string) => Promise<boolean>;
  onReject: (productId: string, reason: string) => Promise<boolean>;
  onViewDetails: (product: Product) => void;
  onFeature?: (productId: string) => void;
  onSponsor?: (productId: string) => void;
  showApprovalActions?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onDelete,
  onApprove,
  onReject,
  onViewDetails,
  onFeature,
  onSponsor,
  showApprovalActions = false,
}) => {
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setIsDeleting(true);
    await onDelete(product.id);
    setIsDeleting(false);
  };

  const handleApprove = async () => {
    setIsApproving(true);
    await onApprove(product.id);
    setIsApproving(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setIsRejecting(true);
    const success = await onReject(product.id, rejectReason);
    if (success) {
      setShowRejectModal(false);
      setRejectReason('');
    }
    setIsRejecting(false);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  const mainImage = product.images?.[0] || '/placeholder-product.png';

  // Get seller display name
  const getSellerDisplayName = () => {
    if (product.seller?.vendorProfile?.businessName) {
      return product.seller.vendorProfile.businessName;
    }
    return product.seller?.fullName || product.seller?.firstName + ' ' + product.seller?.lastName || 'Unknown Seller';
  };

  // Check if vendor is verified
  const isVerifiedVendor = product.seller?.vendorProfile?.isVerified || 
                           product.seller?.vendorProfile?.verificationStatus === 'approved';

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Product Image */}
        <div className="relative h-48 bg-gray-100">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-product.png';
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                <Star className="w-3 h-3" />
                Featured
              </span>
            )}
            {product.isSponsored && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                <TrendingUp className="w-3 h-3" />
                Sponsored
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(product.approvalStatus)}`}>
              {product.approvalStatus.charAt(0).toUpperCase() + product.approvalStatus.slice(1)}
            </span>
          </div>

          {/* Stock Badge */}
          <div className="absolute bottom-2 right-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${getStockBadgeColor(product.status)}`}>
              {product.status === 'out_of_stock' ? 'Out of Stock' : `${product.stock} in stock`}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {product.name}
            </h3>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>

          {/* Price and Condition */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-2xl font-bold text-primary-600">
                {formatPrice(product.finalPrice || product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
              {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
            </span>
          </div>

          {/* Enhanced Seller Info */}
          <div className="mb-3 pb-3 border-b border-gray-200">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                {product.seller?.avatar ? (
                  <img
                    src={product.seller.avatar}
                    alt={getSellerDisplayName()}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    {product.sellerType === 'admin' ? (
                      <Store className="w-5 h-5 text-primary-600" />
                    ) : (
                      <User className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getSellerDisplayName()}
                  </p>
                  {isVerifiedVendor && (
                    <BadgeCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-500">
                    {product.sellerType === 'admin' ? 'Official Store' : 'Vendor'}
                  </p>
                  
                  {product.seller?.vendorProfile?.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-gray-600">
                        {product.seller.vendorProfile.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                {product.seller?.email && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {product.seller.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Category Info */}
          {product.category && (
            <div className="mb-3 text-xs text-gray-600">
              <span className="font-medium">Category:</span> {product.category.name}
              {product.brand && (
                <span className="ml-2">
                  <span className="font-medium">Brand:</span> {product.brand}
                </span>
              )}
            </div>
          )}

          {/* Meta Info */}
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{product.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingCart className="w-3 h-3" />
              <span>{product.orders || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              <span>{product.stock}</span>
            </div>
          </div>

          {/* Rejection Reason */}
          {product.approvalStatus === 'rejected' && product.rejectionReason && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-red-900">Rejection Reason:</p>
                  <p className="text-xs text-red-700 mt-0.5">{product.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {showApprovalActions ? (
              <>
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isApproving ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isRejecting}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onViewDetails(product)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                {onFeature && product.approvalStatus === 'approved' && (
                  <button
                    onClick={() => onFeature(product.id)}
                    className="px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    title="Feature Product"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                {onSponsor && product.approvalStatus === 'approved' && (
                  <button
                    onClick={() => onSponsor(product.id)}
                    className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    title="Sponsor Product"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Product
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this product:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRejecting ? 'Rejecting...' : 'Reject Product'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={isRejecting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};