import { useState, useEffect, useCallback } from 'react';
import { serviceService } from '@/services/service.service';
import { Service, ServiceStats } from '@/types/service.types';
import { toast } from 'react-hot-toast';

const SERVICES_PER_PAGE = 20;

export const useServices = (page: number = 1) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceService.getAllServices(page, SERVICES_PER_PAGE);
      const data = response.data as any;
      const servicesData = data.services || (Array.isArray(data) ? data : []);
      setServices(servicesData);
      setTotal(data.total ?? servicesData.length);
      setTotalPages(data.totalPages ?? Math.ceil((data.total ?? servicesData.length) / SERVICES_PER_PAGE));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch services';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const deleteService = async (serviceId: string): Promise<boolean> => {
    try {
      await serviceService.deleteService(serviceId);
      setServices((prev) => prev.filter((service) => (service._id || service.id) !== serviceId));
      toast.success('Service deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete service';
      toast.error(errorMessage);
      return false;
    }
  };

  const uploadImage = async (serviceId: string, imageFile: File): Promise<boolean> => {
    try {
      const response = await serviceService.uploadServiceImage(serviceId, imageFile);
      setServices((prev) =>
        prev.map((service) => ((service._id || service.id) === serviceId ? response.data : service))
      );
      toast.success('Image uploaded successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to upload image';
      toast.error(errorMessage);
      return false;
    }
  };

  const deleteImage = async (serviceId: string, imageId: string): Promise<boolean> => {
    try {
      await serviceService.deleteServiceImage(serviceId, imageId);
      setServices((prev) =>
        prev.map((service) =>
          (service._id || service.id) === serviceId
            ? {
                ...service,
                images: service.images.filter((img: any) => {
                  const id = typeof img === 'string' ? img : (img.id || img._id);
                  return id !== imageId;
                }),
              }
            : service
        )
      );
      toast.success('Image deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete image';
      toast.error(errorMessage);
      return false;
    }
  };

  const approveService = async (serviceId: string): Promise<boolean> => {
    try {
      const response = await serviceService.approveService(serviceId);

      setServices((prev) =>
        prev.map((service) => ((service._id || service.id) === serviceId ? response.data : service))
      );
      toast.success('Service approved successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to approve service';
      toast.error(errorMessage);
      return false;
    }
  };

  const rejectService = async (serviceId: string, reason: string): Promise<boolean> => {
  try {
    const response = await serviceService.rejectService(serviceId, reason); // reason is required
    setServices((prev) =>
      prev.map((service) => ((service._id || service.id) === serviceId ? response.data : service))
    );
    toast.success('Service rejected');
    return true;
  } catch (err: any) {
    const errorMessage = err?.response?.data?.message || 'Failed to reject service';
    toast.error(errorMessage);
    return false;
  }
};


  const searchServices = async (query: string) => {
  try {
    setLoading(true);
    const response = await serviceService.searchServices(query);
    
    // ✅ Extract the services array
    setServices(response.data.services || []);
  } catch (err: any) {
    const errorMessage = err?.response?.data?.message || 'Failed to search services';
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return {
    services,
    loading,
    error,
    total,
    totalPages,
    limit: SERVICES_PER_PAGE,
    deleteService,
    uploadImage,
    deleteImage,
    approveService,
    rejectService,
    searchServices,
    refetch: fetchServices,
  };
};

export const useServiceStats = () => {
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await serviceService.getAdminStats();

        // Map backend field names to frontend ServiceStats interface
        const rawStats = response.data || response;
        setStats({
          totalServices: rawStats.total ?? rawStats.totalServices ?? 0,
          activeServices: rawStats.active ?? rawStats.activeServices ?? 0,
          inactiveServices: rawStats.inactive ?? rawStats.inactiveServices ?? 0,
          pendingServices: rawStats.pending ?? rawStats.pendingServices ?? 0,
          approvedServices: rawStats.approved ?? rawStats.approvedServices ?? 0,
          rejectedServices: rawStats.rejected ?? rawStats.rejectedServices ?? 0,
          totalRevenue: rawStats.totalRevenue ?? 0,
          averagePrice: rawStats.averagePrice ?? 0,
          averageRating: rawStats.averageRating ?? 0,
        });
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
export const usePendingServices = (page: number = 1) => {
  const [pendingServices, setPendingServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPendingServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceService.getPendingServices(page, SERVICES_PER_PAGE);
      const data = (response.data || response) as any;
      const servicesData = data.services || (Array.isArray(data) ? data : []);
      setPendingServices(servicesData);
      setTotal(data.total ?? servicesData.length);
      setTotalPages(data.totalPages ?? Math.ceil((data.total ?? servicesData.length) / SERVICES_PER_PAGE));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch pending services';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPendingServices();
  }, [fetchPendingServices]);

  return {
    pendingServices,
    loading,
    error,
    total,
    totalPages,
    limit: SERVICES_PER_PAGE,
    refetch: fetchPendingServices,
  };
};