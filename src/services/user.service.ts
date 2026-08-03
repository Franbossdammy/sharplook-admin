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
  dateJoinedFrom?: string;
  dateJoinedTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
  state?: string;
  minWalletBalance?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
    const {
      page = 1,
      limit = 20,
      role,
      status,
      isVendor,
      search,
      dateJoinedFrom,
      dateJoinedTo,
      lastLoginFrom,
      lastLoginTo,
      state,
      minWalletBalance,
      sortBy,
      sortOrder,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (role) queryParams.append('role', role);
    if (status) queryParams.append('status', status);
    if (isVendor !== undefined) queryParams.append('isVendor', isVendor.toString());
    if (search) queryParams.append('search', search);
    if (dateJoinedFrom) queryParams.append('dateJoinedFrom', dateJoinedFrom);
    if (dateJoinedTo) queryParams.append('dateJoinedTo', dateJoinedTo);
    if (lastLoginFrom) queryParams.append('lastLoginFrom', lastLoginFrom);
    if (lastLoginTo) queryParams.append('lastLoginTo', lastLoginTo);
    if (state) queryParams.append('state', state);
    if (minWalletBalance !== undefined) queryParams.append('minWalletBalance', minWalletBalance.toString());
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);

    const response: any = await apiService.get(
      `${API_ENDPOINTS.USERS}?${queryParams.toString()}`
    );

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

  async approveKyc(id: string): Promise<any> {
    return apiService.post(`${API_ENDPOINTS.USER_BY_ID(id)}/approve-kyc`);
  }

  async rejectKyc(id: string, reason: string): Promise<any> {
    return apiService.post(`${API_ENDPOINTS.USER_BY_ID(id)}/reject-kyc`, { reason });
  }

  async setKycEditAllowed(id: string, allowed: boolean): Promise<any> {
    return apiService.post(`${API_ENDPOINTS.USER_BY_ID(id)}/kyc-edit-access`, { allowed });
  }

  async unlockAccount(id: string): Promise<{ user: User }> {
    return apiService.post<{ user: User }>(`${API_ENDPOINTS.USER_BY_ID(id)}/unlock`);
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
