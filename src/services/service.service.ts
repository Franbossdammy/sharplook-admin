import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/utils/constants';
import {
  
  ServicesResponse,
  ServiceResponse,
  ServiceStatsResponse,
  DeleteImageResponse,
  ApprovalResponse,
} from '@/types/service.types';

export class ServiceService {
  // Get all services
  async getAllServices(): Promise<ServicesResponse> {
    return await apiService.get<ServicesResponse>(API_ENDPOINTS.SERVICES);
  }

  // Search services
  async searchServices(query: string): Promise<ServicesResponse> {
    return await apiService.get<ServicesResponse>(`${API_ENDPOINTS.SERVICES}/search?q=${query}`);
  }

  // Get service by ID
  async getServiceById(serviceId: string): Promise<ServiceResponse> {
    return await apiService.get<ServiceResponse>(`${API_ENDPOINTS.SERVICES}/${serviceId}`);
  }

  // Delete service
  async deleteService(serviceId: string): Promise<{ success: boolean; message?: string }> {
    return await apiService.delete<{ success: boolean; message?: string }>(
      `${API_ENDPOINTS.SERVICES}/admin/${serviceId}`
    );
  }

  // Upload service image
  async uploadServiceImage(serviceId: string, imageFile: File): Promise<ServiceResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return await apiService.post<ServiceResponse>(
      `${API_ENDPOINTS.SERVICES}/${serviceId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  // Delete service image
  async deleteServiceImage(serviceId: string, imageId: string): Promise<DeleteImageResponse> {
    return await apiService.delete<DeleteImageResponse>(
      `${API_ENDPOINTS.SERVICES}/${serviceId}/images/${imageId}`
    );
  }

  // Get admin stats
  async getAdminStats(): Promise<ServiceStatsResponse> {
    return await apiService.get<ServiceStatsResponse>(`${API_ENDPOINTS.SERVICES}/admin/stats`);
  }

  // Get pending services
  async getPendingServices(): Promise<ServicesResponse> {
    return await apiService.get<ServicesResponse>(`${API_ENDPOINTS.SERVICES}/admin/pending`);
  }

  // Approve service
  async approveService(serviceId: string): Promise<ApprovalResponse> {
    return await apiService.post<ApprovalResponse>(
      `${API_ENDPOINTS.SERVICES}/${serviceId}/approve`
    );
  }

  // Reject service
    async rejectService(serviceId: string, reason: string): Promise<ApprovalResponse> {
      return await apiService.post<ApprovalResponse>(
        `${API_ENDPOINTS.SERVICES}/${serviceId}/reject`,
        { reason } // always send reason
      );
    }

  // Get trending services
  async getTrendingServices(): Promise<ServicesResponse> {
    return await apiService.get<ServicesResponse>(`${API_ENDPOINTS.SERVICES}/trending`);
  }

  // Get popular services by category
  async getPopularByCategory(categoryId: string): Promise<ServicesResponse> {
    return await apiService.get<ServicesResponse>(
      `${API_ENDPOINTS.SERVICES}/popular/${categoryId}`
    );
  }
}

export const serviceService = new ServiceService();