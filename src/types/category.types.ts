export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  icon: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  message?: string;
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
  message?: string;
}