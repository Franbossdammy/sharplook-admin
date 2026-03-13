import React, { useEffect, useState } from 'react';
import {
  Bell,
  Send,
  CheckCircle,
  Mail,
  MessageSquare,
  Smartphone,
  Filter,
  Search,
  X,
  ChevronDown,
} from 'lucide-react';
import { notificationService } from '../services/notification.service';
import {
  Notification,
  NotificationStats,
  NotificationType,
  SendNotificationRequest,
} from '../types/notification.types';
import { Toast } from '../components/ui/Toast';

export const NotificationsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSendForm, setShowSendForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState<{
    type?: string;
    isRead?: boolean;
    isSent?: boolean;
  }>({});

  // Stats
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    sent: 0,
    read: 0,
    unread: 0,
    byType: {},
  });

  // Send Notification Form
  const [sendForm, setSendForm] = useState<SendNotificationRequest>({
    type: NotificationType.SYSTEM_ANNOUNCEMENT,
    title: '',
    message: '',
    actionUrl: '',
    channels: {
      push: true,
      email: false,
      sms: false,
      inApp: true,
    },
    filters: {
      role: 'all',
    },
  });

  const [sending, setSending] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [page, filters]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const result = await notificationService.getAllNotifications(filters, page, limit);
      setNotifications(result.notifications || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast('Failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await notificationService.getNotificationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!sendForm.title || !sendForm.message) {
      showToast('Title and message are required', 'warning');
      return;
    }

    setSending(true);
    try {
      const result = await notificationService.sendToAllUsers(sendForm);
      showToast(`Notification sent to ${result.userCount} users successfully!`, 'success');
      
      // Reset form
      setSendForm({
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        title: '',
        message: '',
        actionUrl: '',
        channels: {
          push: true,
          email: false,
          sms: false,
          inApp: true,
        },
        filters: {
          role: 'all',
        },
      });
      
      setShowSendForm(false);
      fetchNotifications();
      fetchStats();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to send notification', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value === '' ? undefined : value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

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

  const getNotificationTypeLabel = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Send and manage platform notifications</p>
        </div>
        <button
          onClick={() => setShowSendForm(!showSendForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          Send Notification
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-gray-600" />
            <p className="text-xs font-medium text-gray-600">Total</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Send className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-gray-600">Sent</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-gray-600">Read</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.read}</p>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-xl shadow-sm border border-primary-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-primary-600" />
            <p className="text-xs font-medium text-primary-700">Unread</p>
          </div>
          <p className="text-2xl font-bold text-primary-900">{stats.unread}</p>
        </div>
      </div>

      {/* Send Notification Form */}
      {showSendForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Send Notification</h2>
            <button
              onClick={() => setShowSendForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Type
              </label>
              <select
                value={sendForm.type}
                onChange={(e) =>
                  setSendForm({ ...sendForm, type: e.target.value as NotificationType })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={NotificationType.SYSTEM_ANNOUNCEMENT}>System Announcement</option>
                <option value={NotificationType.PROMOTIONAL}>Promotional</option>
                <option value={NotificationType.NEW_OFFER}>New Offer</option>
                <option value={NotificationType.ACCOUNT_UPDATE}>Account Update</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={sendForm.title}
                onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                placeholder="Enter notification title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={sendForm.message}
                onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                placeholder="Enter notification message"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Action URL (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action URL (Optional)
              </label>
              <input
                type="text"
                value={sendForm.actionUrl}
                onChange={(e) => setSendForm({ ...sendForm, actionUrl: e.target.value })}
                placeholder="https://example.com/action"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Channels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Delivery Channels
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={sendForm.channels?.inApp}
                    onChange={(e) =>
                      setSendForm({
                        ...sendForm,
                        channels: { ...sendForm.channels, inApp: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600"
                  />
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">In-App</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={sendForm.channels?.push}
                    onChange={(e) =>
                      setSendForm({
                        ...sendForm,
                        channels: { ...sendForm.channels, push: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600"
                  />
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Push</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={sendForm.channels?.email}
                    onChange={(e) =>
                      setSendForm({
                        ...sendForm,
                        channels: { ...sendForm.channels, email: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600"
                  />
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={sendForm.channels?.sms}
                    onChange={(e) =>
                      setSendForm({
                        ...sendForm,
                        channels: { ...sendForm.channels, sms: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-primary-600"
                  />
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">SMS</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <select
                value={sendForm.filters?.role}
                onChange={(e) =>
                  setSendForm({
                    ...sendForm,
                    filters: { ...sendForm.filters, role: e.target.value as any },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="vendor">Vendors Only</option>
                <option value="client">Clients Only</option>
              </select>
            </div>

            {/* Send Button */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowSendForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                disabled={sending}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value={NotificationType.BOOKING_CREATED}>Booking Created</option>
                  <option value={NotificationType.PAYMENT_SUCCESSFUL}>Payment Successful</option>
                  <option value={NotificationType.SYSTEM_ANNOUNCEMENT}>System Announcement</option>
                  <option value={NotificationType.PROMOTIONAL}>Promotional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={
                    filters.isRead === undefined ? '' : filters.isRead ? 'read' : 'unread'
                  }
                  onChange={(e) =>
                    handleFilterChange(
                      'isRead',
                      e.target.value === '' ? undefined : e.target.value === 'read'
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="read">Read</option>
                  <option value="unread">Unread</option>
                </select>
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

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 font-medium text-sm text-gray-700">
              <div className="col-span-3">Title</div>
              <div className="col-span-2">User</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Channels</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Date</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {notifications
                .filter(
                  (notif) =>
                    !searchTerm ||
                    notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    notif.message.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((notification) => (
                  <div
                    key={notification._id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.user.firstName} {notification.user.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{notification.user.email}</p>
                    </div>

                    <div className="col-span-2">
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {getNotificationTypeLabel(notification.type)}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <div className="flex gap-1">
                        {notification.channels.inApp && (
                          <Bell className="w-4 h-4 text-gray-600" />
                        )}
                        {notification.channels.push && (
                          <Smartphone className="w-4 h-4 text-gray-600" />
                        )}
                        {notification.channels.email && (
                          <Mail className="w-4 h-4 text-gray-600" />
                        )}
                        {notification.channels.sms && (
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex flex-col gap-1">
                        {notification.isSent && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                            Sent
                          </span>
                        )}
                        {notification.isRead && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                            Read
                          </span>
                        )}
                        {!notification.isSent && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1">
                      <p className="text-xs text-gray-600">{formatDate(notification.createdAt)}</p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Empty State */}
            {notifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notifications found</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
              notifications
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