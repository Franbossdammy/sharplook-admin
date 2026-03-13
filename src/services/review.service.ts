import { apiService } from './api.service';

class ReviewService {
  async getAllReviews(filters?: any, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.isFlagged) params.append('isFlagged', filters.isFlagged);
    if (filters?.isApproved) params.append('isApproved', filters.isApproved);
    if (filters?.rating) params.append('rating', filters.rating);

    const response = await apiService.get<any>(`/reviews?${params.toString()}`);

    // Format: { success, data: [...], pagination: { currentPage, totalPages, pageSize, totalItems } }
    if (response.pagination) {
      return {
        reviews: Array.isArray(response.data) ? response.data : [],
        total: response.pagination.totalItems || 0,
        totalPages: response.pagination.totalPages || 1,
        page: response.pagination.currentPage || page,
      };
    }

    // Format: { success, data: { reviews: [...] } }
    if (response.data?.reviews) {
      return {
        reviews: response.data.reviews,
        total: response.data.total || response.data.reviews.length,
        totalPages: response.data.totalPages || 1,
        page: response.data.page || page,
      };
    }

    const reviews = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
    return {
      reviews,
      total: reviews.length,
      totalPages: 1,
      page,
    };
  }

  async approveReview(id: string) {
    const response = await apiService.post<any>(`/reviews/${id}/approve`);
    return response.data?.review || response.data || response;
  }

  async hideReview(id: string, reason?: string) {
    const response = await apiService.post<any>(`/reviews/${id}/hide`, { reason });
    return response.data?.review || response.data || response;
  }

  async unhideReview(id: string) {
    const response = await apiService.post<any>(`/reviews/${id}/unhide`);
    return response.data?.review || response.data || response;
  }
}

export const reviewService = new ReviewService();
