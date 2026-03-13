export interface ReviewUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface Review {
  _id: string;
  booking?: {
    _id: string;
    service?: string;
    scheduledDate?: string;
    totalAmount?: number;
  } | string;
  reviewer: ReviewUser;
  reviewee: ReviewUser;
  reviewerType?: 'client' | 'vendor';
  rating: number;
  title?: string;
  comment: string;
  detailedRatings?: {
    serviceQuality?: number;
    communication?: number;
    punctuality?: number;
    professionalism?: number;
    valueForMoney?: number;
  };
  images?: string[];
  response?: {
    comment: string;
    respondedAt: string;
  };
  helpfulCount: number;
  notHelpfulCount: number;
  isApproved: boolean;
  isFlagged: boolean;
  flagReason?: string;
  flaggedBy?: string;
  flaggedAt?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  moderationNotes?: string;
  isHidden: boolean;
  hiddenReason?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFilters {
  isFlagged?: string;
  isApproved?: string;
  rating?: string;
}
