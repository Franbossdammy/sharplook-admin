import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/utils/constants';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoriesResponse,
  CategoryResponse,
} from '@/types/category.types';

export class CategoryService {
  async getAllCategories(): Promise<CategoriesResponse> {
    return await apiService.get<CategoriesResponse>(`${API_ENDPOINTS.CATEGORIES}?limit=100`);
  }

  async getCategoryById(categoryId: string): Promise<CategoryResponse> {
    return await apiService.get<CategoryResponse>(`${API_ENDPOINTS.CATEGORIES}/${categoryId}`);
  }

  async searchCategories(query: string): Promise<CategoriesResponse> {
    return await apiService.get<CategoriesResponse>(`${API_ENDPOINTS.CATEGORIES}?search=${encodeURIComponent(query)}`);
  }

  async createCategory(data: CreateCategoryDto): Promise<CategoryResponse> {
    return await apiService.post<CategoryResponse>(API_ENDPOINTS.CATEGORIES, data);
  }

  async updateCategory(categoryId: string, data: UpdateCategoryDto): Promise<CategoryResponse> {
    return await apiService.put<CategoryResponse>(`${API_ENDPOINTS.CATEGORIES}/${categoryId}`, data);
  }

  async deleteCategory(categoryId: string): Promise<{ success: boolean; message?: string }> {
    return await apiService.delete<{ success: boolean; message?: string }>(
      `${API_ENDPOINTS.CATEGORIES}/${categoryId}`
    );
  }
}

export const categoryService = new CategoryService();
