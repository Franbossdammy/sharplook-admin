import React, { useState } from 'react';
import { getImageUrl } from '@/utils/image';
import {
  X,
  Package,
  User,
  MapPin,
  Truck,
  XCircle,
  Edit,
} from 'lucide-react';
import { orderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../types/order.types';
import { Toast } from '../ui/Toast';

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'status'>('details');
  const [actionLoading, setActionLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  if (!isOpen) return null;

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
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
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Order Details</h3>
                <p className="text-sm text-white/80">#{order.orderNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 px-6">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Order Details
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'items'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Items ({order.items.length})
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'status'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Status History
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Status</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  {order.isPaid && (
                    <span className="ml-2 inline-block px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
                      Paid
                    </span>
                  )}
                  {order.hasDispute && (
                    <span className="ml-2 inline-block px-3 py-1 text-sm font-medium bg-orange-100 text-orange-700 rounded-full">
                      Disputed
                    </span>
                  )}
                </div>

                {/* Customer & Seller */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Customer
                    </p>
                    <p className="font-medium text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{order.customer.email}</p>
                    {order.customer.phone && (
                      <p className="text-sm text-gray-600">{order.customer.phone}</p>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Seller
                    </p>
                    <p className="font-medium text-gray-900">
                      {order.seller.firstName} {order.seller.lastName}
                    </p>
                    {order.seller.vendorProfile?.businessName && (
                      <p className="text-sm text-primary-600">
                        {order.seller.vendorProfile.businessName}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">{order.seller.email}</p>
                  </div>
                </div>

                {/* Delivery Address */}
                {order.deliveryAddress && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Delivery Address
                    </p>
                    <p className="font-medium text-gray-900">{order.deliveryAddress.fullName}</p>
                    <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress.address}</p>
                    <p className="text-sm text-gray-600">
                      {order.deliveryAddress.city}, {order.deliveryAddress.state}
                    </p>
                    <p className="text-sm text-gray-600">{order.deliveryAddress.phone}</p>
                  </div>
                )}

                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(order.subtotal)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Delivery Fee</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(order.deliveryFee)}
                    </p>
                  </div>
                  <div className="col-span-2 p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-sm text-primary-700 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-primary-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Tracking Info */}
                {order.trackingNumber && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Tracking Information
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                    </p>
                    {order.courierService && (
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Courier:</span> {order.courierService}
                      </p>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                  {order.paidAt && (
                    <div>
                      <p className="text-gray-600">Payment Date</p>
                      <p className="font-medium text-gray-900">{formatDate(order.paidAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items Tab */}
            {activeTab === 'items' && (
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {item.product.images && item.product.images[0] && (
                      <img
                        src={getImageUrl(item.product.images[0])}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.selectedVariant && (
                        <p className="text-xs text-gray-600 mt-1">
                          {item.selectedVariant.name}: {item.selectedVariant.option}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Status History Tab */}
            {activeTab === 'status' && (
              <div className="space-y-3">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                      </div>
                      {index < order.statusHistory.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-medium text-gray-900 capitalize">
                        {history.status.replace(/_/g, ' ')}
                      </p>
                      {history.note && (
                        <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(history.updatedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            {!showStatusForm ? (
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
                    <button
                      onClick={() => setShowStatusForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Update Status
                    </button>
                  )}
                  {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.COMPLETED && (
                    <button
                      onClick={async () => {
                        if (!confirm('Are you sure you want to cancel this order?')) return;
                        setActionLoading(true);
                        try {
                          await orderService.deleteOrder(order._id, 'Cancelled by admin');
                          showToast('Order cancelled successfully', 'success');
                          setTimeout(() => { onRefresh?.(); onClose(); }, 1000);
                        } catch (error: any) {
                          showToast(error?.response?.data?.message || 'Failed to cancel order', 'error');
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Order
                    </button>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-medium text-gray-900">Update Order Status</p>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select status...</option>
                    <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                    <option value={OrderStatus.PROCESSING}>Processing</option>
                    <option value={OrderStatus.SHIPPED}>Shipped</option>
                    <option value={OrderStatus.OUT_FOR_DELIVERY}>Out for Delivery</option>
                    <option value={OrderStatus.DELIVERED}>Delivered</option>
                    <option value={OrderStatus.COMPLETED}>Completed</option>
                  </select>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Note (optional)"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowStatusForm(false); setNewStatus(''); setStatusNote(''); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!newStatus) { showToast('Please select a status', 'warning'); return; }
                      setActionLoading(true);
                      try {
                        await orderService.updateOrderStatus(order._id, { status: newStatus as OrderStatus, note: statusNote });
                        showToast('Order status updated', 'success');
                        setShowStatusForm(false);
                        setTimeout(() => { onRefresh?.(); onClose(); }, 1000);
                      } catch (error: any) {
                        showToast(error?.response?.data?.message || 'Failed to update status', 'error');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading || !newStatus}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    {actionLoading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};