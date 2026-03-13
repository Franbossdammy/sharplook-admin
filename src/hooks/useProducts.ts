import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/services/product.service';
import { Product, ProductStats, ProductFilters } from '@/types/product.types';
import { toast } from 'react-hot-toast';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (filters?: ProductFilters, page: number = 1, limit: number = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts(filters, page, limit);

      console.log("All response:", response);
      
      
      // ✅ Handle both response structures
      // If data is an array, use it directly. If it's an object with products, extract it
      const productsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.products || [];
      
      setProducts(productsData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch products';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      toast.success('Product deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete product';
      toast.error(errorMessage);
      return false;
    }
  };

  const approveProduct = async (productId: string): Promise<boolean> => {
    try {
      const response = await productService.approveProduct(productId);
      
      // ✅ Extract product from response
      const updatedProduct = response.data.product || response.data;
      
      setProducts((prev) =>
        prev.map((product) => (product.id === productId ? updatedProduct : product))
      );
      toast.success('Product approved successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to approve product';
      toast.error(errorMessage);
      return false;
    }
  };

  const rejectProduct = async (productId: string, reason: string): Promise<boolean> => {
    try {
      const response = await productService.rejectProduct(productId, reason);
      
      // ✅ Extract product from response
      const updatedProduct = response.data.product || response.data;
      
      setProducts((prev) =>
        prev.map((product) => (product.id === productId ? updatedProduct : product))
      );
      toast.success('Product rejected');
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to reject product';
      toast.error(errorMessage);
      return false;
    }
  };

  const featureProduct = async (productId: string, featuredUntil: Date): Promise<boolean> => {
    try {
      const response = await productService.featureProduct(productId, {
        featuredUntil: featuredUntil.toISOString(),
      });
      
      // ✅ Extract product from response
      const updatedProduct = response.data.product || response.data;
      
      setProducts((prev) =>
        prev.map((product) => (product.id === productId ? updatedProduct : product))
      );
      toast.success('Product featured successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to feature product';
      toast.error(errorMessage);
      return false;
    }
  };

  const sponsorProduct = async (productId: string, sponsoredUntil: Date, amount: number): Promise<boolean> => {
    try {
      const response = await productService.sponsorProduct(productId, {
        sponsoredUntil: sponsoredUntil.toISOString(),
        amount,
      });
      
      // ✅ Extract product from response
      const updatedProduct = response.data.product || response.data;
      
      setProducts((prev) =>
        prev.map((product) => (product.id === productId ? updatedProduct : product))
      );
      toast.success('Product sponsored successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to sponsor product';
      toast.error(errorMessage);
      return false;
    }
  };

  const searchProducts = async (query: string) => {
    try {
      setLoading(true);
      const response = await productService.searchProducts(query);
      
      // ✅ Handle both response structures
      const productsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.products || [];
      
      setProducts(productsData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to search products';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: string, quantity: number): Promise<boolean> => {
    try {
      const response = await productService.updateStock(productId, { quantity });
      
      // ✅ Extract product from response
      const updatedProduct = response.data.product || response.data;
      
      setProducts((prev) =>
        prev.map((product) => (product.id === productId ? updatedProduct : product))
      );
      toast.success('Stock updated successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update stock';
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    products,
    loading,
    error,
    deleteProduct,
    approveProduct,
    rejectProduct,
    featureProduct,
    sponsorProduct,
    searchProducts,
    updateStock,
    refetch: fetchProducts,
  };
};

export const useProductStats = () => {
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getAdminStats();
        
        // ✅ Extract stats from response.data
        setStats(response.data);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Failed to fetch stats';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

export const usePendingProducts = () => {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getPendingProducts();

      console.log("pending response",response);
      
      
      // ✅ Handle both response structures
      const productsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.products || [];
      
      setPendingProducts(productsData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch pending products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingProducts();
  }, [fetchPendingProducts]);

  return {
    pendingProducts,
    loading,
    error,
    refetch: fetchPendingProducts,
  };
};

export const useFeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getFeaturedProducts(20);
        
        // ✅ Extract products from response - featured endpoint returns { products, count }
        const productsData = Array.isArray(response.data) ? response.data : (response.data as any).products || [];
        
        setFeaturedProducts(productsData);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Failed to fetch featured products';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return { featuredProducts, loading, error };
};

export const useSponsoredProducts = () => {
  const [sponsoredProducts, setSponsoredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSponsoredProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getSponsoredProducts(20);
        
        // ✅ Extract products from response - sponsored endpoint returns { products, count }
        const productsData = Array.isArray(response.data) ? response.data : (response.data as any).products || [];
        
        setSponsoredProducts(productsData);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || 'Failed to fetch sponsored products';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsoredProducts();
  }, []);

  return { sponsoredProducts, loading, error };
};


export const useRejectedProducts = () => {
  const [rejectedProducts, setRejectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRejectedProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getRejectedProducts();
      
      console.log('Rejected Products Response:', response); // ✅ Add this debug log
      
      // Handle both response structures
      const productsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.products || [];
      
      console.log('Rejected Products Data:', productsData); // ✅ Add this debug log
      
      setRejectedProducts(productsData);
    } catch (err: any) {
      console.error('Error fetching rejected products:', err); // ✅ Add this debug log
      const errorMessage = err?.response?.data?.message || 'Failed to fetch rejected products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRejectedProducts();
  }, [fetchRejectedProducts]);

  return {
    rejectedProducts,
    loading,
    error,
    refetch: fetchRejectedProducts,
  };
};