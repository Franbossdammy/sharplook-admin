import React, { useEffect, useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  X,
  DollarSign,
  User,
  MapPin,
} from 'lucide-react';
import { orderService } from '../services/order.service';
import { Order, OrderStatus, OrderFilters } from '../types/order.types';
import { OrderDetailsModal } from '../components/ui/OrderDetailsModal';

export const OrdersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState<OrderFilters>({
    status: undefined,
    seller: '',
    customer: '',
    startDate: '',
    endDate: '',
  });

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [page, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await orderService.getAllOrders(filters, page, limit);
      setOrders(result.orders || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch orders in batches with max limit of 100
      let allOrders: Order[] = [];
      let currentPage = 1;
      let hasMore = true;
      const maxLimit = 100; // Backend max limit

      // Fetch up to 5 pages (500 orders max) for stats calculation
      while (hasMore && currentPage <= 5) {
        const result = await orderService.getAllOrders({}, currentPage, maxLimit);
        allOrders = [...allOrders, ...(result.orders || [])];
        
        // Check if there are more pages
        if (currentPage >= result.totalPages) {
          hasMore = false;
        }
        currentPage++;
      }

      const stats = {
        pending: allOrders.filter((o) => o.status === OrderStatus.PENDING).length,
        processing: allOrders.filter((o) => o.status === OrderStatus.PROCESSING).length,
        shipped: allOrders.filter((o) => o.status === OrderStatus.SHIPPED).length,
        delivered: allOrders.filter((o) => o.status === OrderStatus.DELIVERED).length,
        completed: allOrders.filter((o) => o.status === OrderStatus.COMPLETED).length,
        cancelled: allOrders.filter((o) => o.status === OrderStatus.CANCELLED).length,
        total: allOrders.length,
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        completed: 0,
        cancelled: 0,
        total: 0,
      });
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      seller: '',
      customer: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-700';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-700';
      case OrderStatus.PROCESSING:
        return 'bg-purple-100 text-purple-700';
      case OrderStatus.SHIPPED:
        return 'bg-indigo-100 text-indigo-700';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'bg-cyan-100 text-cyan-700';
      case OrderStatus.DELIVERED:
        return 'bg-teal-100 text-teal-700';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-700';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-700';
      case OrderStatus.DISPUTED:
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
      case OrderStatus.CONFIRMED:
        return <Clock className="w-4 h-4" />;
      case OrderStatus.PROCESSING:
        return <Package className="w-4 h-4" />;
      case OrderStatus.SHIPPED:
      case OrderStatus.OUT_FOR_DELIVERY:
        return <Truck className="w-4 h-4" />;
      case OrderStatus.DELIVERED:
      case OrderStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="w-4 h-4" />;
      case OrderStatus.DISPUTED:
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600" />
            <p className="text-xs font-medium text-gray-600">Pending</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-medium text-gray-600">Processing</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-indigo-600" />
            <p className="text-xs font-medium text-gray-600">Shipped</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-cyan-600" />
            <p className="text-xs font-medium text-gray-600">Delivered</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-gray-600">Completed</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <p className="text-xs font-medium text-gray-600">Cancelled</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-xl shadow-sm border border-primary-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-primary-600" />
            <p className="text-xs font-medium text-primary-700">Total</p>
          </div>
          <p className="text-2xl font-bold text-primary-900">{stats.total}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number, customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-primary-50 border-primary-600 text-primary-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value={OrderStatus.PENDING}>Pending</option>
                  <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                  <option value={OrderStatus.PROCESSING}>Processing</option>
                  <option value={OrderStatus.SHIPPED}>Shipped</option>
                  <option value={OrderStatus.OUT_FOR_DELIVERY}>Out for Delivery</option>
                  <option value={OrderStatus.DELIVERED}>Delivered</option>
                  <option value={OrderStatus.COMPLETED}>Completed</option>
                  <option value={OrderStatus.CANCELLED}>Cancelled</option>
                  <option value={OrderStatus.DISPUTED}>Disputed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 font-medium text-sm text-gray-700">
              <div className="col-span-2">Order</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-2">Seller</div>
              <div className="col-span-1">Items</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {orders
                .filter(
                  (order) =>
                    !searchTerm ||
                    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    `${order.customer.firstName} ${order.customer.lastName}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((order) => (
                  <div
                    key={order._id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                      {order.isPaid && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                          Paid
                        </span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{order.customer.email}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {order.seller.firstName} {order.seller.lastName}
                      </p>
                      {order.seller.vendorProfile?.businessName && (
                        <p className="text-xs text-gray-600">
                          {order.seller.vendorProfile.businessName}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1">
                      <p className="text-sm text-gray-900">{order.items.length}</p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.replace(/_/g, ' ')}
                      </div>
                      {order.hasDispute && (
                        <div className="mt-1">
                          <span className="inline-block px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                            Disputed
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Empty State */}
            {orders.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders found</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrder(null);
          }}
          onRefresh={() => {
            fetchOrders();
            fetchStats();
          }}
        />
      )}
    </div>
  );
};