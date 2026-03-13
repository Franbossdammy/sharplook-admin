import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '@/services/category.service';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/category.types';
import { toast } from 'react-hot-toast';

// Normalize _id to id for frontend compatibility
const normalizeCategory = (cat: any): Category => ({
  ...cat,
  id: cat.id || cat._id,
});

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.getAllCategories();

      // response.data is the categories array (from paginated response)
      const rawCategories = Array.isArray(response.data) ? response.data :
                            Array.isArray(response) ? response : [];
      setCategories(rawCategories.map(normalizeCategory));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch categories';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (data: CreateCategoryDto): Promise<boolean> => {
    try {
      await categoryService.createCategory(data);
      toast.success('Category created successfully');
      await fetchCategories();
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create category';
      toast.error(errorMessage);
      return false;
    }
  };

  const updateCategory = async (categoryId: string, data: UpdateCategoryDto): Promise<boolean> => {
    try {
      await categoryService.updateCategory(categoryId, data);
      toast.success('Category updated successfully');
      await fetchCategories();
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update category';
      toast.error(errorMessage);
      return false;
    }
  };

  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    try {
      await categoryService.deleteCategory(categoryId);
      toast.success('Category deleted successfully');
      await fetchCategories();
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete category';
      toast.error(errorMessage);
      return false;
    }
  };

  const toggleStatus = async (categoryId: string): Promise<boolean> => {
    try {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) return false;

      await categoryService.updateCategory(categoryId, { isActive: !category.isActive } as any);
      toast.success('Category status updated');
      await fetchCategories();
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to toggle status';
      toast.error(errorMessage);
      return false;
    }
  };

  const searchCategories = async (query: string) => {
    try {
      setLoading(true);
      const response = await categoryService.searchCategories(query);
      const rawCategories = Array.isArray(response.data) ? response.data :
                            Array.isArray(response) ? response : [];
      setCategories(rawCategories.map(normalizeCategory));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to search categories';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleStatus,
    searchCategories,
    refetch: fetchCategories,
  };
};
