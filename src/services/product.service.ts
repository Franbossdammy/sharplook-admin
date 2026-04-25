import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/utils/constants';
import {
  
  ProductsResponse,
  ProductResponse,
  ProductStatsResponse,
  ApprovalResponse,
  ProductFilters,
  FeatureProductRequest,
  SponsorProductRequest,
  UpdateStockRequest,
} from '@/types/product.types';

export class ProductService {
  // ==================== PUBLIC ENDPOINTS ====================

  /**
   * Get all approved products with filters
   * GET /api/v1/products
   */
  async getProducts(
    filters?: ProductFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<ProductsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.subCategory && { subCategory: filters.subCategory }),
      ...(filters?.seller && { seller: filters.seller }),
      ...(filters?.minPrice && { minPrice: filters.minPrice.toString() }),
      ...(filters?.maxPrice && { maxPrice: filters.maxPrice.toString() }),
      ...(filters?.condition && { condition: filters.condition }),
      ...(filters?.brand && { brand: filters.brand }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.sortBy && { sortBy: filters.sortBy }),
      ...(filters?.sortOrder && { sortOrder: filters.sortOrder }),
      ...(filters?.isFeatured !== undefined && { isFeatured: filters.isFeatured.toString() }),
      ...(filters?.isSponsored !== undefined && { isSponsored: filters.isSponsored.toString() }),
      ...(filters?.tags && { tags: filters.tags.join(',') }),
    });

    return await apiService.get<ProductsResponse>(
      `${API_ENDPOINTS.PRODUCTS}?${params.toString()}`
    );
  }

  /**
   * Get featured products
   * GET /api/v1/products/featured
   */
  async getFeaturedProducts(limit: number = 10): Promise<ProductsResponse> {
    return await apiService.get<ProductsResponse>(
      `${API_ENDPOINTS.PRODUCT_FEATURED}?limit=${limit}`
    );
  }

  /**
   * Get sponsored products
   * GET /api/v1/products/sponsored
   */
  async getSponsoredProducts(limit: number = 10): Promise<ProductsResponse> {
    return await apiService.get<ProductsResponse>(
      `${API_ENDPOINTS.PRODUCT_SPONSORED}?limit=${limit}`
    );
  }

  /**
   * Get product by ID
   * GET /api/v1/products/:productId
   */
  async getProductById(
    productId: string,
    incrementView: boolean = true
  ): Promise<ProductResponse> {
    return await apiService.get<ProductResponse>(
      `${API_ENDPOINTS.PRODUCT_BY_ID(productId)}?incrementView=${incrementView}`
    );
  }

  // ==================== SELLER ENDPOINTS ====================

  /**
   * Create a new product
   * POST /api/v1/products
   */
  async createProduct(productData: FormData): Promise<ProductResponse> {
    return await apiService.post<ProductResponse>(
      API_ENDPOINTS.PRODUCTS,
      productData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  /**
   * Get seller's products
   * GET /api/v1/products/seller/my-products
   */
  async getMyProducts(page: number = 1, limit: number = 20): Promise<ProductsResponse> {
    return await apiService.get<ProductsResponse>(
      `${API_ENDPOINTS.PRODUCT_MY_PRODUCTS}?page=${page}&limit=${limit}`
    );
  }

  /**
   * Update product
   * PUT /api/v1/products/:productId
   */
  async updateProduct(productId: string, productData: FormData): Promise<ProductResponse> {
    return await apiService.put<ProductResponse>(
      API_ENDPOINTS.PRODUCT_BY_ID(productId),
      productData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  /**
   * Delete product (soft delete)
   * DELETE /api/v1/products/:productId
   */
  async deleteProduct(productId: string): Promise<{ success: boolean; message?: string }> {
    return await apiService.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.PRODUCT_BY_ID(productId)
    );
  }

  /**
   * Update product stock
   * PATCH /api/v1/products/:productId/stock
   */
  async updateStock(productId: string, data: UpdateStockRequest): Promise<ProductResponse> {
    return await apiService.patch<ProductResponse>(
      API_ENDPOINTS.PRODUCT_UPDATE_STOCK(productId),
      data
    );
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Get pending products for approval
   * GET /api/v1/products/admin/pending
   */
  async getPendingProducts(page: number = 1, limit: number = 20): Promise<ProductsResponse> {
    return await apiService.get<ProductsResponse>(
      `${API_ENDPOINTS.PRODUCT_ADMIN_PENDING}?page=${page}&limit=${limit}`
    );
  }

  /**
   * Get admin stats
   * GET /api/v1/products/admin/stats
   */
  async getAdminStats(): Promise<ProductStatsResponse> {
    return await apiService.get<ProductStatsResponse>(
      API_ENDPOINTS.PRODUCT_ADMIN_STATS
    );
  }

  /**
   * Approve product
   * POST /api/v1/products/:productId/approve
   */
  async approveProduct(productId: string): Promise<ApprovalResponse> {
    return await apiService.post<ApprovalResponse>(
      API_ENDPOINTS.PRODUCT_APPROVE(productId)
    );
  }

  /**
   * Reject product
   * POST /api/v1/products/:productId/reject
   */
  async rejectProduct(productId: string, reason: string): Promise<ApprovalResponse> {
    return await apiService.post<ApprovalResponse>(
      API_ENDPOINTS.PRODUCT_REJECT(productId),
      { reason }
    );
  }

  /**
   * Feature product
   * POST /api/v1/products/:productId/feature
   */
  async featureProduct(
    productId: string,
    data: FeatureProductRequest
  ): Promise<ApprovalResponse> {
    return await apiService.post<ApprovalResponse>(
      API_ENDPOINTS.PRODUCT_FEATURE(productId),
      data
    );
  }

  /**
   * Sponsor product
   * POST /api/v1/products/:productId/sponsor
   */
  async sponsorProduct(
    productId: string,
    data: SponsorProductRequest
  ): Promise<ApprovalResponse> {
    return await apiService.post<ApprovalResponse>(
      API_ENDPOINTS.PRODUCT_SPONSOR(productId),
      data
    );
  }


  async convertToService(
    productId: string,
    data: { priceType: 'fixed' | 'hourly' | 'negotiable'; duration?: number }
  ): Promise<{ success: boolean; message: string; data: { service: any } }> {
    return await apiService.post(
      API_ENDPOINTS.PRODUCT_CONVERT_TO_SERVICE(productId),
      data
    );
  }

  async getRejectedProducts(page: number = 1, limit: number = 20): Promise<ProductsResponse> {
  return await apiService.get<ProductsResponse>(
    `${API_ENDPOINTS.PRODUCT_ADMIN_REJECTED}?page=${page}&limit=${limit}`
  );
}

  /**
   * Search products
   * GET /api/v1/products?search=query
   */
  async searchProducts(query: string, page: number = 1, limit: number = 20): Promise<ProductsResponse> {
    return await apiService.get<ProductsResponse>(
      `${API_ENDPOINTS.PRODUCTS}?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  }
}

export const productService = new ProductService();