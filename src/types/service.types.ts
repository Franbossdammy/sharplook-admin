export interface ServiceVendor {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  fullName?: string;
  vendorProfile?: {
    businessName?: string;
  };
}

export interface ServiceCategory {
  _id: string;
  name: string;
}

export interface Service {
  _id: string;
  id: string; // alias for _id compatibility
  name: string;
  title?: string; // alias for backward compat
  slug?: string;
  description: string;
  basePrice: number;
  price?: number; // alias for backward compat
  priceType?: 'fixed' | 'starting_from' | 'hourly';
  category: ServiceCategory | string;
  categoryId?: string;
  categoryName?: string;
  vendor: ServiceVendor | string;
  providerId?: string;
  providerName?: string;
  providerEmail?: string;
  images: string[];
  tags?: string[];
  requirements?: string[];
  whatIsIncluded?: string[];
  faqs?: { question: string; answer: string }[];
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  isActive: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  rating: number;
  reviewCount: number;
  metadata?: {
    views?: number;
    bookings?: number;
    averageRating?: number;
    totalReviews?: number;
  };
  location?: string;
  duration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  name: string;
  description: string;
  basePrice: number;
  category: string;
  vendor: string;
  location?: string;
  duration?: string;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  basePrice?: number;
  category?: string;
  location?: string;
  duration?: string;
  isActive?: boolean;
}

export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  pendingServices: number;
  approvedServices: number;
  rejectedServices: number;
  totalRevenue: number;
  averagePrice: number;
  averageRating: number;
}

export interface ServicesResponse {
  success: boolean;
  data: any;
  message?: string;
}

export interface ServiceResponse {
  success: boolean;
  data: any;
  message?: string;
}

export interface ServiceStatsResponse {
  success: boolean;
  data: any;
  message?: string;
}

export interface DeleteImageResponse {
  success: boolean;
  message?: string;
}

export interface ApprovalResponse {
  success: boolean;
  data: any;
  message?: string;
}
