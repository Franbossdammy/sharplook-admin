import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/utils/constants';

export interface PromoCampaign {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  discountAmount: number;
  vendorBonusAmount: number;
  minServicePrice: number;
  maxSlots: number;
  slotsRemaining: number;
  maxUsesPerUser: number;
  appliesTo: 'ALL' | 'HOME_SERVICE' | 'IN_SHOP';
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromoDto {
  name: string;
  description?: string;
  discountAmount: number;
  vendorBonusAmount: number;
  minServicePrice: number;
  maxSlots: number;
  maxUsesPerUser?: number;
  appliesTo?: 'ALL' | 'HOME_SERVICE' | 'IN_SHOP';
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
}

export interface UpdatePromoDto {
  name?: string;
  description?: string;
  discountAmount?: number;
  vendorBonusAmount?: number;
  minServicePrice?: number;
  maxSlots?: number;
  maxUsesPerUser?: number;
  appliesTo?: 'ALL' | 'HOME_SERVICE' | 'IN_SHOP';
  startsAt?: string;
  endsAt?: string;
}

export interface PromoStats {
  campaign: {
    id: string;
    name: string;
    isActive: boolean;
    maxSlots: number;
    slotsRemaining: number;
    slotsUsed: number;
    discountAmount: number;
    vendorBonusAmount: number;
    minServicePrice: number;
  };
  stats: {
    totalRedemptions: number;
    activeRedemptions: number;
    refundedRedemptions: number;
    totalClientDiscount: number;
    totalVendorBonusCommitted: number;
    totalPlatformSpend: number;
  };
  redemptions: Array<{
    _id: string;
    user: { _id: string; firstName?: string; lastName?: string; email?: string } | string;
    booking: { _id: string; servicePrice?: number; totalAmount?: number; status?: string } | string;
    redeemedAt: string;
    refundedAt?: string;
  }>;
}

export class PromoService {
  async listCampaigns(): Promise<{ success: boolean; data: PromoCampaign[] }> {
    return apiService.get(API_ENDPOINTS.PROMO_ADMIN_LIST);
  }

  async createCampaign(data: CreatePromoDto): Promise<{ success: boolean; data: PromoCampaign }> {
    return apiService.post(API_ENDPOINTS.PROMO_ADMIN_CREATE, data);
  }

  async updateCampaign(id: string, data: UpdatePromoDto): Promise<{ success: boolean; data: PromoCampaign }> {
    return apiService.patch(API_ENDPOINTS.PROMO_ADMIN_UPDATE(id), data);
  }

  async setActive(id: string, isActive: boolean): Promise<{ success: boolean; data: PromoCampaign }> {
    return apiService.patch(API_ENDPOINTS.PROMO_ADMIN_PAUSE(id), { isActive });
  }

  async getStats(id: string): Promise<{ success: boolean; data: PromoStats }> {
    return apiService.get(API_ENDPOINTS.PROMO_ADMIN_STATS(id));
  }
}

export const promoService = new PromoService();
