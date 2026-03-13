import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/utils/constants';
import { User, PaginatedResponse } from '@/types';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  isVendor?: boolean;
  search?: string;
}

export interface UserStats {
  joinedDate: string;
  lastLogin?: string;
  lastSeen?: string;
  isOnline: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  vendorStats?: {
    rating: number;
    totalRatings: number;
    completedBookings: number;
    isVerified: boolean;
  };
}

export interface VendorFullDetails {
  vendor: User;
  services?: any[];
  reviews?: any[];
  stats: {
    totalServices: number;
    activeServices: number;
    totalReviews: number;
    averageRating: number;
    completedBookings: number;
    responseRate: number;
  };
}

export interface GetVendorDetailsOptions {
  includeServices?: boolean;
  includeReviews?: boolean;
  reviewsLimit?: number;
}

export class UserService {
  async getUsers(params: GetUsersParams = {}): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 20, role, status, isVendor, search } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (role) queryParams.append('role', role);
    if (status) queryParams.append('status', status);
    if (isVendor !== undefined) queryParams.append('isVendor', isVendor.toString());
    if (search) queryParams.append('search', search);

    const response: any = await apiService.get(
      `${API_ENDPOINTS.USERS}?${queryParams.toString()}`
    );

    console.log('Users API response:', response);

    // Handle the response structure: 
    // { success, message, data: [...users], meta: { pagination: {...} } }
    return {
      data: response.data || [],
      users: response.data || [],
      total: response.meta?.pagination?.totalItems || 0,
      page: response.meta?.pagination?.currentPage || page,
      totalPages: response.meta?.pagination?.totalPages || 1,
    };
  }

  async getUserById(id: string): Promise<{ user: User }> {
    return apiService.get<{ user: User }>(API_ENDPOINTS.USER_BY_ID(id));
  }

  async getVendorFullDetails(
    vendorId: string,
    options?: GetVendorDetailsOptions
  ): Promise<VendorFullDetails> {
    const queryParams = new URLSearchParams();
    
    if (options?.includeServices !== undefined) {
      queryParams.append('includeServices', options.includeServices.toString());
    }
    if (options?.includeReviews !== undefined) {
      queryParams.append('includeReviews', options.includeReviews.toString());
    }
    if (options?.reviewsLimit) {
      queryParams.append('reviewsLimit', options.reviewsLimit.toString());
    }

    const queryString = queryParams.toString();
    const url = `${API_ENDPOINTS.VENDOR_DETAILS(vendorId)}${queryString ? `?${queryString}` : ''}`;
    
    const response: any = await apiService.get(url);
    
    // Handle response structure: { success, message, data: { vendor, services, reviews, stats } }
    return response.data || response;
  }

  async updateUserStatus(id: string, status: string): Promise<{ user: User }> {
    return apiService.put<{ user: User }>(`${API_ENDPOINTS.USER_BY_ID(id)}/status`, { status });
  }

  async deleteUser(id: string): Promise<void> {
    return apiService.delete<void>(API_ENDPOINTS.USER_BY_ID(id));
  }

  async restoreUser(id: string): Promise<{ user: User }> {
    return apiService.post<{ user: User }>(`${API_ENDPOINTS.USER_BY_ID(id)}/restore`);
  }

  async verifyVendor(id: string): Promise<{ user: User }> {
    return apiService.post<{ user: User }>(`${API_ENDPOINTS.USER_BY_ID(id)}/verify-vendor`);
  }

  async createAdmin(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }): Promise<any> {
    const response: any = await apiService.post(API_ENDPOINTS.CREATE_ADMIN, data);
    return response.data || response;
  }

  async updateAdminRole(userId: string, role: string): Promise<any> {
    const response: any = await apiService.put(`${API_ENDPOINTS.USERS}/admin/${userId}/role`, { role });
    return response.data || response;
  }

  async getUserStats(_id: string): Promise<{ stats: UserStats }> {
    return apiService.get<{ stats: UserStats }>(`${API_ENDPOINTS.USERS}/stats`);
  }
}

export const userService = new UserService();