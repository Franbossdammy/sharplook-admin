import React, { useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle, 
  Clock, 
  AlertCircle,
  Package,
  Star,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
import { 
  useProducts, 
  useProductStats, 
  usePendingProducts,
  useRejectedProducts  // ✅ Add this import
} from '@/hooks/useProducts';
import { Product } from '@/types/product.types';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductDetailsModal } from '@/components/ui/ProductDetailsModal';
import { FeatureProductModal } from '@/components/ui/FeatureProductModal';
import { SponsorProductModal } from '@/components/ui/SponsorProductModal';
import { EditProductModal } from '@/components/ui/EditProductModal';
import { Loading } from '@/components/ui/Loading';
import { StatCard } from '@/components/ui/StatCard';

type FilterType = 'all' | 'approved' | 'pending' | 'rejected' | 'featured' | 'sponsored';

export const ProductsPage: React.FC = () => {
  const {
    products,
    loading,
    deleteProduct,
    approveProduct,
    rejectProduct,
    featureProduct,
    sponsorProduct,
    searchProducts,
    updateProduct,
    refetch,
  } = useProducts();

  const { stats, loading: statsLoading } = useProductStats();
  
  const { 
    pendingProducts, 
    loading: pendingLoading, 
    refetch: refetchPending 
  } = usePendingProducts();

  // ✅ Add rejected products hook
  const { 
    rejectedProducts, 
    loading: rejectedLoading, 
    refetch: refetchRejected 
  } = useRejectedProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToFeature, setProductToFeature] = useState<string | null>(null);
  const [productToSponsor, setProductToSponsor] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      searchProducts(query);
    } else {
      refetch();
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (productId: string, data: FormData): Promise<boolean> => {
    const success = await updateProduct(productId, data);
    if (success) {
      refetch();
    }
    return success;
  };

  const handleApprove = async (productId: string): Promise<boolean> => {
    await approveProduct(productId);
    refetch();
    refetchPending();
    refetchRejected(); // Refresh rejected list when approving
    return true;
  };

  const handleReject = async (productId: string, reason: string): Promise<boolean> => {
    await rejectProduct(productId, reason);
    refetch();
    refetchPending();
    refetchRejected(); // Refresh rejected list when rejecting
    return true;
  };

  const handleFeatureClick = (productId: string) => {
    setProductToFeature(productId);
    setIsFeatureModalOpen(true);
  };

  const handleFeatureSubmit = async (featuredUntil: Date) => {
    if (productToFeature) {
      await featureProduct(productToFeature, featuredUntil);
      refetch();
      setIsFeatureModalOpen(false);
      setProductToFeature(null);
    }
  };

  const handleSponsorClick = (productId: string) => {
    setProductToSponsor(productId);
    setIsSponsorModalOpen(true);
  };

  const handleSponsorSubmit = async (sponsoredUntil: Date, amount: number) => {
    if (productToSponsor) {
      await sponsorProduct(productToSponsor, sponsoredUntil, amount);
      refetch();
      setIsSponsorModalOpen(false);
      setProductToSponsor(null);
    }
  };

  // ✅ Update filteredProducts to include rejected products
  const filteredProducts = React.useMemo(() => {
    if (filterType === 'pending' && pendingProducts && pendingProducts.length > 0) {
      return pendingProducts;
    }
    
    // ✅ Add rejected products filter
    if (filterType === 'rejected' && rejectedProducts && rejectedProducts.length > 0) {
      return rejectedProducts;
    }
    
    return products.filter((product) => {
      if (filterType === 'all') return true;
      if (filterType === 'featured') return product.isFeatured;
      if (filterType === 'sponsored') return product.isSponsored;
      return product.approvalStatus === filterType;
    });
  }, [products, filterType, pendingProducts, rejectedProducts]); // ✅ Add rejectedProducts to dependencies

  const pendingCount = pendingProducts?.length || 0;
  const rejectedCount = rejectedProducts?.length || 0; // ✅ Add rejected count

  if (loading && products.length === 0) {
    return <Loading size="lg" text="Loading products..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage all products on your platform
        </p>
      </div>

      {/* Stats Grid */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Approved"
            value={stats.approvedProducts}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Pending"
            value={stats.pendingProducts}
            icon={Clock}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
          />
          <StatCard
            title="Rejected"
            value={stats.rejectedProducts}
            icon={XCircle}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
        </div>
      )}

      {/* Additional Stats Row */}
      {!statsLoading && stats && (stats.featuredProducts || stats.sponsoredProducts) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {stats.featuredProducts !== undefined && (
            <StatCard
              title="Featured"
              value={stats.featuredProducts}
              icon={Star}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100"
            />
          )}
          {stats.sponsoredProducts !== undefined && (
            <StatCard
              title="Sponsored"
              value={stats.sponsoredProducts}
              icon={TrendingUp}
              iconColor="text-indigo-600"
              iconBgColor="bg-indigo-100"
            />
          )}
          {stats.outOfStockProducts !== undefined && (
            <StatCard
              title="Out of Stock"
              value={stats.outOfStockProducts}
              icon={ShoppingCart}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
            />
          )}
        </div>
      )}

      {/* Pending Products Alert */}
      {!pendingLoading && pendingCount > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900">
                Pending Approval Required
              </h3>
              <p className="text-sm text-yellow-800 mt-1">
                You have {pendingCount} product{pendingCount !== 1 ? 's' : ''} waiting for approval.
              </p>
              <button
                onClick={() => setFilterType('pending')}
                className="mt-2 text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
              >
                View pending products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Rejected Products Alert (Optional) */}
      {!rejectedLoading && rejectedCount > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900">
                Rejected Products
              </h3>
              <p className="text-sm text-red-800 mt-1">
                You have {rejectedCount} rejected product{rejectedCount !== 1 ? 's' : ''}.
              </p>
              <button
                onClick={() => setFilterType('rejected')}
                className="mt-2 text-sm font-medium text-red-900 hover:text-red-700 underline"
              >
                View rejected products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilterType('approved')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterType === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilterType('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors relative ${
              filterType === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending Approval
            {!pendingLoading && pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-yellow-800 bg-yellow-200 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterType('rejected')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors relative ${
              filterType === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected
            {/* ✅ Add badge for rejected count */}
            {!rejectedLoading && rejectedCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-red-800 bg-red-200 rounded-full">
                {rejectedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterType('featured')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterType === 'featured'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Featured
          </button>
          <button
            onClick={() => setFilterType('sponsored')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterType === 'sponsored'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sponsored
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {/* ✅ Update loading check to include rejected loading */}
      {(loading || 
        (filterType === 'pending' && pendingLoading) || 
        (filterType === 'rejected' && rejectedLoading)) ? (
        <div className="flex justify-center py-12">
          <Loading size="md" text="Loading..." />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-sm text-gray-600">
            {searchQuery
              ? 'Try adjusting your search query'
              : `No ${filterType === 'all' ? '' : filterType} products available`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={deleteProduct}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetails={handleViewDetails}
              onFeature={handleFeatureClick}
              onSponsor={handleSponsorClick}
              onEdit={handleEditClick}
              showApprovalActions={product.approvalStatus === 'pending'}
            />
          ))}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetails}
          product={selectedProduct}
        />
      )}

      {/* Feature Product Modal */}
      <FeatureProductModal
        isOpen={isFeatureModalOpen}
        onClose={() => {
          setIsFeatureModalOpen(false);
          setProductToFeature(null);
        }}
        onSubmit={handleFeatureSubmit}
      />

      {/* Sponsor Product Modal */}
      <SponsorProductModal
        isOpen={isSponsorModalOpen}
        onClose={() => {
          setIsSponsorModalOpen(false);
          setProductToSponsor(null);
        }}
        onSubmit={handleSponsorSubmit}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProductToEdit(null);
        }}
        product={productToEdit}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
};