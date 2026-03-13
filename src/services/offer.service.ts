import { apiService } from './api.service';
import { Offer, OfferStats, OfferFilters } from '../types/offer.types';

export class OfferService {
  /**
   * Get all offers (admin)
   */
  async getAllOffers(
    filters?: OfferFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ offers: Offer[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.client) params.append('client', filters.client);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiService.get<any>(`/offers/admin/all?${params.toString()}`);

    console.log('📡 OFFERS API RESPONSE:', response);
    console.log('📊 Response Data:', response.data);

    // Handle direct array response
    if (Array.isArray(response.data)) {
      return {
        offers: response.data,
        total: response.data.length,
        page: page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    // Handle nested data structure
    if (response.data?.data) {
      return response.data.data;
    }

    // Handle offers property
    if (response.data?.offers) {
      return {
        offers: response.data.offers,
        total: response.data.total || response.data.offers.length,
        page: response.data.page || page,
        totalPages:
          response.data.totalPages ||
          Math.ceil((response.data.total || response.data.offers.length) / limit),
      };
    }

    return response.data;
  }

  /**
   * Get offer statistics (admin)
   */
  async getOfferStats(): Promise<OfferStats> {
    const response = await apiService.get<any>('/offers/admin/stats');
    
    console.log('📡 OFFER STATS API RESPONSE:', response);
    console.log('📊 Stats Data:', response.data?.stats || response.data?.data || response.data);
    
    return response.data?.stats || response.data?.data || response.data;
  }

  /**
   * Get offer by ID
   */
  async getOfferById(offerId: string): Promise<Offer> {
    const response = await apiService.get<any>(`/offers/${offerId}`);
    return response.data?.offer || response.data?.data || response.data;
  }

  /**
   * Delete offer (admin)
   */
  async deleteOffer(offerId: string): Promise<void> {
    await apiService.delete(`/offers/${offerId}`);
  }

  /**
   * Get client offers
   */
  async getClientOffers(
    page: number = 1,
    limit: number = 10
  ): Promise<{ offers: Offer[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const response = await apiService.get<any>(`/offers/my-offers?${params.toString()}`);

    if (Array.isArray(response.data)) {
      return {
        offers: response.data,
        total: response.data.length,
        page: page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    return response.data?.data || response.data;
  }

  /**
   * Get vendor responses
   */
  async getVendorResponses(
    page: number = 1,
    limit: number = 10
  ): Promise<{ offers: Offer[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const response = await apiService.get<any>(
      `/offers/responses/my-responses?${params.toString()}`
    );

    if (Array.isArray(response.data)) {
      return {
        offers: response.data,
        total: response.data.length,
        page: page,
        totalPages: Math.ceil(response.data.length / limit),
      };
    }

    return response.data?.data || response.data;
  }

  /**
   * Get available offers (vendor)
   */
  async getAvailableOffers(
    filters?: {
      category?: string;
      priceMin?: number;
      priceMax?: number;
      latitude?: number;
      longitude?: number;
      maxDistance?: number;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<{ offers: Offer[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.category) params.append('category', filters.category);
    if (filters?.priceMin) params.append('priceMin', String(filters.priceMin));
    if (filters?.priceMax) params.append('priceMax', String(filters.priceMax));
    if (filters?.latitude) params.append('latitude', String(filters.latitude));
    if (filters?.longitude) params.append('longitude', String(filters.longitude));
    if (filters?.maxDistance) params.append('maxDistance', String(filters.maxDistance));

    const response = await apiService.get<any>(`/offers/available/list?${params.toString()}`);

    return response.data?.data || response.data;
  }
}

export const offerService = new OfferService();