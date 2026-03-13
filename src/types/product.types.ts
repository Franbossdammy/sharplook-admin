export interface Seller {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
  vendorProfile?: {
    businessName?: string;
    businessDescription?: string;
    businessAddress?: string;
    businessPhone?: string;
    isVerified?: boolean;
    verificationStatus?: string;
    rating?: number;
    totalSales?: number;
  };
}

export interface Category {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface SubCategory {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  shortDescription?: string;
  slug: string;
  
  // Pricing
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  finalPrice?: number;
  
  // Images and Media
  images: string[];
  
  // Categorization
  category: Category;
  subCategory?: SubCategory;
  tags?: string[];
  
  // Seller Info - Updated to match backend
  seller: Seller;
  sellerType: 'vendor' | 'admin';
  
  // Inventory
  stock: number;
  lowStockThreshold?: number;
  sku?: string;
  barcode?: string;
  
  // Status and Approval
  status: 'active' | 'inactive' | 'out_of_stock' | 'approved' | 'pending' | 'rejected' | 'discontinued';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  
  // Product Details
  condition: 'new' | 'used' | 'refurbished';
  brand?: string;
  weight?: number;
  
  // Delivery
  deliveryOptions: {
    homeDelivery: boolean;
    pickup: boolean;
    freeDelivery?: boolean;
    deliveryFee?: number;
    estimatedDeliveryDays?: number;
  };
  
  location?: Location;
  dimensions?: Dimensions;
  variants?: ProductVariant[];
  discount?: Discount;
  
  // Featured and Sponsored
  isFeatured: boolean;
  isSponsored: boolean;
  featuredUntil?: Date | string;
  sponsoredUntil?: Date | string;
  sponsoredAmount?: number;
  sponsorshipAmount?: number;
  featuredBy?: string;
  sponsoredBy?: string;
  
  // Metrics
  views: number;
  favorites?: number;
  orders?: number;
  revenue?: number;
  totalRatings?: number;
  averageRating?: number;
  
  // Approval Details
  rejectionReason?: string;
  approvedBy?: string;
  rejectedBy?: string;
  approvedAt?: Date | string;
  
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
  isDeleted?: boolean;
  deletedAt?: Date | string;
  deletedBy?: string;
  
  __v?: number;
}

export interface ProductVariant {
  name: string;
  options: string[];
  priceModifier?: number;
}

export interface DeliveryOption {
  method: string;
  cost: number;
  estimatedDays: number;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Dimensions {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  unit: 'cm' | 'inches';
  weightUnit?: 'kg' | 'lbs';
}

export interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  startDate: Date | string;
  endDate: Date | string;
}

export interface ProductFilters {
  category?: string;
  subCategory?: string;
  seller?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  brand?: string;
  search?: string;
  tags?: string[];
  isFeatured?: boolean;
  isSponsored?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  timestamp?: string;
  data: {
    products: Product[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    count?: number;
  } | Product[]; // Handle both structures
  meta?: {
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
  };
}

export interface ProductResponse {
  success: boolean;
  message: string;
  timestamp?: string;
  data: {
    product: Product;
  };
}

export interface ProductStatsResponse {
  success: boolean;
  message: string;
  timestamp?: string;
  data: ProductStats;
}

export interface ProductStats {
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  rejectedProducts: number;
  featuredProducts?: number;
  sponsoredProducts?: number;
  activeProducts?: number;
  outOfStockProducts?: number;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  timestamp?: string;
  data: {
    product: Product;
  };
}

export interface FeatureProductRequest {
  featuredUntil: string | Date;
}

export interface SponsorProductRequest {
  sponsoredUntil: string | Date;
  amount: number;
}

export interface UpdateStockRequest {
  quantity: number;
}