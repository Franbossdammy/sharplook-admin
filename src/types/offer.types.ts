// Offer Status
export type OfferStatus = 'open' | 'accepted' | 'closed' | 'expired';

// Flexibility Type
export type FlexibilityType = 'flexible' | 'specific' | 'urgent';

// Location Interface
export interface OfferLocation {
  type: 'Point';
  coordinates: [number, number];
  address: string;
  city: string;
  state: string;
}

// Offer Response Interface
export interface OfferResponse {
  _id: string;
  vendor: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    vendorProfile?: {
      businessName?: string;
      rating?: number;
      completedBookings?: number;
    };
  };
  proposedPrice: number;
  message?: string;
  estimatedDuration?: number;
  counterOffer?: number;
  isAccepted: boolean;
  acceptedAt?: string;
  respondedAt: string;
}

// Offer Interface
export interface Offer {
  _id: string;
  client: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  category: {
    _id: string;
    name: string;
    icon?: string;
  };
  service?: {
    _id: string;
    name: string;
    images?: string[];
  };
  title: string;
  description: string;
  proposedPrice: number;
  location: OfferLocation;
  preferredDate?: string;
  preferredTime?: string;
  flexibility: FlexibilityType;
  images?: string[];
  status: OfferStatus;
  responses: OfferResponse[];
  selectedVendor?: string;
  selectedResponse?: string;
  bookingId?: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Offer Stats Interface
export interface OfferStats {
  total: number;
  open: number;
  accepted: number;
  closed: number;
  expired: number;
  totalResponses: number;
  avgResponsesPerOffer: number;
}

// Offer Filters
export interface OfferFilters {
  status?: OfferStatus;
  category?: string;
  client?: string;
  startDate?: string;
  endDate?: string;
}

// Create Offer Request
export interface CreateOfferRequest {
  title: string;
  description: string;
  category: string;
  service?: string;
  proposedPrice: number;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: [number, number];
  };
  preferredDate?: Date;
  preferredTime?: string;
  flexibility?: FlexibilityType;
  images?: string[];
  expiresInDays?: number;
}

// Respond to Offer Request
export interface RespondToOfferRequest {
  proposedPrice: number;
  message?: string;
  estimatedDuration?: number;
}

// Counter Offer Request
export interface CounterOfferRequest {
  counterPrice: number;
}