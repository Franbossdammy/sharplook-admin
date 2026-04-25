import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useServices, useServiceStats, usePendingServices } from '@/hooks/useServices';
import { Service } from '@/types/service.types';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { ServiceDetailsModal } from '@/components/ui/ServiceDetailsModal';
import { Loading } from '@/components/ui/Loading';
import { StatCard } from '@/components/ui/StatCard';
import { Pagination } from '@/components/ui/Pagination';

type FilterType = 'all' | 'approved' | 'pending' | 'rejected';

export const ServicesPage: React.FC = () => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    services,
    loading,
    total: allTotal,
    totalPages: allTotalPages,
    limit,
    deleteService,
    uploadImage,
    deleteImage,
    approveService,
    rejectService,
    searchServices,
    refetch,
  } = useServices(currentPage);

  const { stats, loading: statsLoading } = useServiceStats();

  const {
    pendingServices,
    loading: pendingLoading,
    total: pendingTotal,
    totalPages: pendingTotalPages,
    refetch: refetchPending,
  } = usePendingServices(currentPage);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleFilterChange = (f: FilterType) => {
    setFilterType(f);
    setCurrentPage(1);
  };

  const activePagination = filterType === 'pending'
    ? { total: pendingTotal, totalPages: pendingTotalPages }
    : { total: allTotal, totalPages: allTotalPages };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      searchServices(query);
    } else {
      refetch();
    }
  };

  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedService(null);
  };

  const handleApprove = async (serviceId: string) => {
    await approveService(serviceId);
    refetch();
    refetchPending(); // Refresh pending services list
  };

  const handleReject = async (serviceId: string, reason: string) => {
    await rejectService(serviceId, reason);
    refetch();
    refetchPending(); // Refresh pending services list
  };

  const handleUploadImage = async (serviceId: string, file: File) => {
    await uploadImage(serviceId, file);
    refetch();
  };

  const handleDeleteImage = async (serviceId: string, imageId: string) => {
    await deleteImage(serviceId, imageId);
    refetch();
  };

  const filteredServices = React.useMemo(() => {
    if (filterType === 'pending') return pendingServices;
    return services.filter((service) => {
      if (filterType === 'all') return true;
      return service.approvalStatus === filterType;
    });
  }, [services, filterType, pendingServices]);

  const pendingCount = pendingTotal || 0;

  if (loading && services.length === 0) {
    return <Loading size="lg" text="Loading services..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Services</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage all services on your platform
        </p>
      </div>

      {/* Stats Grid */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Services"
            value={stats.totalServices}
            icon={Filter}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Approved"
            value={stats.approvedServices}
            icon={CheckCircle}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Pending"
            value={stats.pendingServices}
            icon={Clock}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
          />
          <StatCard
            title="Rejected"
            value={stats.rejectedServices}
            icon={XCircle}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
        </div>
      )}

      {/* Pending Services Alert - New Section */}
      {!pendingLoading && pendingCount > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900">
                Pending Approval Required
              </h3>
              <p className="text-sm text-yellow-800 mt-1">
                You have {pendingCount} service{pendingCount !== 1 ? 's' : ''} waiting for approval.
              </p>
              <button
                onClick={() => handleFilterChange('pending')}
                className="mt-2 text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
              >
                View pending services
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Services
          </button>
          <button
            onClick={() => handleFilterChange('approved')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterType === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => handleFilterChange('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors relative ${
              filterType === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending Approval
            {!pendingLoading && pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-yellow-800 bg-yellow-200 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleFilterChange('rejected')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filterType === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Services Grid */}
      {(loading || (filterType === 'pending' && pendingLoading)) ? (
        <div className="flex justify-center py-12">
          <Loading size="md" text="Loading..." />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
          <p className="text-sm text-gray-600">
            {searchQuery
              ? 'Try adjusting your search query'
              : `No ${filterType === 'all' ? '' : filterType} services available`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service._id || service.id}
              service={service}
              onDelete={deleteService}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetails={handleViewDetails}
              showApprovalActions={service.approvalStatus === 'pending'}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !pendingLoading && filteredServices.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={activePagination.totalPages}
          total={activePagination.total}
          limit={limit}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <ServiceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetails}
          service={selectedService}
          onUploadImage={handleUploadImage}
          onDeleteImage={handleDeleteImage}
        />
      )}
    </div>
  );
};