import React, { useState } from 'react';
import { getImageUrl } from '@/utils/image';
import {
  X,
  Send,
  CheckCircle,
  XCircle,
  Flag,
  UserPlus,
  AlertTriangle,
  MessageSquare,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { disputeService } from '../../services/dispute.service';
import {
  BookingDispute,
  ProductDispute,
  BookingDisputeResolution,
  ProductDisputeResolution,
  BookingDisputeStatus,
  ProductDisputeStatus,
} from '../../types/dispute.types';
import { Toast } from '../ui/Toast';

interface DisputeDetailsModalProps {
  dispute: BookingDispute | ProductDispute;
  disputeType: 'booking' | 'product';
  isOpen: boolean;
  onClose: () => void;
}

export const DisputeDetailsModal: React.FC<DisputeDetailsModalProps> = ({
  dispute,
  disputeType,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'messages' | 'evidence'>('details');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showPriorityForm, setShowPriorityForm] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  // Admin users for assignment
  const [admins, setAdmins] = useState<Array<{ _id: string; firstName: string; lastName: string; email: string }>>([]);

  React.useEffect(() => {
    disputeService.getAdminUsers().then(setAdmins).catch(console.error);
  }, []);

  // Resolution form state
  const [resolution, setResolution] = useState<BookingDisputeResolution | ProductDisputeResolution>(
    disputeType === 'booking'
      ? BookingDisputeResolution.NO_ACTION
      : ProductDisputeResolution.SELLER_WINS
  );
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [vendorPaymentAmount, setVendorPaymentAmount] = useState('');
  const [closureNote, setClosureNote] = useState('');
  const [assignToId, setAssignToId] = useState('');
  const [newPriority, setNewPriority] = useState(dispute.priority);

  if (!isOpen) return null;

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      if (disputeType === 'booking') {
        await disputeService.addBookingDisputeMessage(dispute._id, message);
      } else {
        await disputeService.addProductDisputeMessage(dispute._id, message);
      }
      showToast('Message sent successfully');
      setMessage('');
      // Refresh dispute data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      showToast(error.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async () => {
    if (!assignToId.trim()) {
      showToast('Please enter admin ID', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      if (disputeType === 'booking') {
        await disputeService.assignBookingDispute(dispute._id, assignToId);
      } else {
        await disputeService.assignProductDispute(dispute._id, assignToId);
      }
      showToast('Dispute assigned successfully');
      setShowAssignForm(false);
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      showToast(error.message || 'Failed to assign dispute', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePriority = async () => {
    if (disputeType !== 'booking') return;

    setActionLoading(true);
    try {
      await disputeService.updateBookingDisputePriority(
        dispute._id,
        newPriority as 'low' | 'medium' | 'high' | 'urgent'
      );
      showToast('Priority updated successfully');
      setShowPriorityForm(false);
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      showToast(error.message || 'Failed to update priority', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionDetails.trim()) {
      showToast('Please provide resolution details', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      if (disputeType === 'booking') {
        await disputeService.resolveBookingDispute(dispute._id, {
          resolution: resolution as BookingDisputeResolution,
          resolutionDetails,
          refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
          vendorPaymentAmount: vendorPaymentAmount ? parseFloat(vendorPaymentAmount) : undefined,
        });
      } else {
        await disputeService.resolveProductDispute(dispute._id, {
          resolution: resolution as ProductDisputeResolution,
          resolutionNote: resolutionDetails,
          refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
        });
      }
      showToast('Dispute resolved successfully');
      setShowResolveForm(false);
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      showToast(error.message || 'Failed to resolve dispute', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    setActionLoading(true);
    try {
      if (disputeType === 'booking') {
        await disputeService.closeBookingDispute(dispute._id);
      } else {
        if (!closureNote.trim()) {
          showToast('Please provide closure note', 'warning');
          return;
        }
        await disputeService.closeProductDispute(dispute._id, closureNote);
      }
      showToast('Dispute closed successfully');
      setShowCloseForm(false);
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      showToast(error.message || 'Failed to close dispute', 'error');
    } finally {
      setActionLoading(false);
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

  const isBookingDispute = (_d: BookingDispute | ProductDispute): _d is BookingDispute => {
    return disputeType === 'booking';
  };

  const canResolve =
    dispute.status === BookingDisputeStatus.OPEN ||
    dispute.status === BookingDisputeStatus.IN_REVIEW ||
    dispute.status === ProductDisputeStatus.OPEN ||
    dispute.status === ProductDisputeStatus.UNDER_REVIEW;

  const canClose =
    dispute.status === BookingDisputeStatus.RESOLVED ||
    dispute.status === ProductDisputeStatus.RESOLVED;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Dispute Details</h3>
                <p className="text-sm text-white/80">ID: {dispute._id}</p>
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
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Details
                </div>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'messages'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Messages ({dispute.messages?.length || 0})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'evidence'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Evidence{' '}
                  {isBookingDispute(dispute) &&
                    dispute.evidence &&
                    `(${dispute.evidence.length})`}
                  {!isBookingDispute(dispute) &&
                    (dispute as ProductDispute).evidence &&
                    `(${(dispute as ProductDispute).evidence?.length})`}
                </div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Parties */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {isBookingDispute(dispute) ? 'Raised By' : 'Customer'}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                        {isBookingDispute(dispute)
                          ? dispute.raisedBy.firstName[0]
                          : (dispute as ProductDispute).customer.firstName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {isBookingDispute(dispute)
                            ? `${dispute.raisedBy.firstName} ${dispute.raisedBy.lastName}`
                            : `${(dispute as ProductDispute).customer.firstName} ${
                                (dispute as ProductDispute).customer.lastName
                              }`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isBookingDispute(dispute)
                            ? dispute.raisedBy.email
                            : (dispute as ProductDispute).customer.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {isBookingDispute(dispute) ? 'Against' : 'Seller'}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold">
                        {isBookingDispute(dispute)
                          ? dispute.against.firstName[0]
                          : (dispute as ProductDispute).seller.firstName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {isBookingDispute(dispute)
                            ? `${dispute.against.firstName} ${dispute.against.lastName}`
                            : `${(dispute as ProductDispute).seller.firstName} ${
                                (dispute as ProductDispute).seller.lastName
                              }`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isBookingDispute(dispute)
                            ? dispute.against.email
                            : (dispute as ProductDispute).seller.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                        dispute.status === BookingDisputeStatus.OPEN ||
                        dispute.status === ProductDisputeStatus.OPEN
                          ? 'bg-red-100 text-red-700'
                          : dispute.status === BookingDisputeStatus.RESOLVED ||
                            dispute.status === ProductDisputeStatus.RESOLVED
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {dispute.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Priority</p>
                    <div className="flex items-center gap-2">
                      <Flag
                        className={`w-4 h-4 ${
                          dispute.priority === 'urgent' || dispute.priority === 'high'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}
                      />
                      <span className="capitalize text-gray-900">{dispute.priority}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Created</p>
                    <p className="text-sm text-gray-900">{formatDate(dispute.createdAt)}</p>
                  </div>
                </div>

                {/* Reason and Description */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason</p>
                    <p className="text-gray-900 capitalize">
                      {isBookingDispute(dispute)
                        ? dispute.reason
                        : (dispute as ProductDispute).reason.replace(/_/g, ' ')}
                    </p>
                    {isBookingDispute(dispute) && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {dispute.category}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{dispute.description}</p>
                  </div>
                </div>

                {/* Related Booking/Order Details */}
                {isBookingDispute(dispute) && dispute.booking && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-700 mb-2">Related Booking</p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        Booking ID: <span className="font-mono font-medium">#{dispute.booking._id?.slice(-8).toUpperCase()}</span>
                      </p>
                      {dispute.booking.service && (
                        <p className="text-sm text-gray-600">
                          Service: {typeof dispute.booking.service === 'object' ? (dispute.booking.service as any).name : dispute.booking.service}
                        </p>
                      )}
                      {dispute.booking.scheduledDate && (
                        <p className="text-sm text-gray-600">Date: {formatDate(dispute.booking.scheduledDate)}</p>
                      )}
                      {dispute.booking.totalAmount != null && (
                        <p className="text-sm text-gray-600">Amount: {formatCurrency(dispute.booking.totalAmount)}</p>
                      )}
                    </div>
                  </div>
                )}

                {!isBookingDispute(dispute) && (dispute as ProductDispute).order && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-700 mb-2">Related Order</p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        Order: <span className="font-mono font-medium">
                          #{(dispute as ProductDispute).order.orderNumber || (dispute as ProductDispute).order._id?.slice(-8).toUpperCase()}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Amount: {formatCurrency((dispute as ProductDispute).order.totalAmount)}
                      </p>
                    </div>
                  </div>
                )}

                {!isBookingDispute(dispute) && (dispute as ProductDispute).product && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Disputed Product</p>
                    <div className="flex items-center gap-3">
                      {(dispute as ProductDispute).product?.images?.[0] && (
                        <img src={getImageUrl((dispute as ProductDispute).product!.images![0])} alt="Product" className="w-16 h-16 object-cover rounded-lg border" />
                      )}
                      <p className="text-sm font-medium text-gray-900">{(dispute as ProductDispute).product?.name}</p>
                    </div>
                  </div>
                )}

                {/* Assignment */}
                {dispute.assignedTo && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-700 mb-2">Assigned To</p>
                    <p className="text-gray-900">
                      {dispute.assignedTo.firstName} {dispute.assignedTo.lastName}
                    </p>
                  </div>
                )}

                {/* Resolution */}
                {dispute.resolution && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-700 mb-2">Resolution</p>
                    <p className="text-gray-900 capitalize mb-2">
                      {dispute.resolution.replace(/_/g, ' ')}
                    </p>
                    {isBookingDispute(dispute) && dispute.resolutionDetails && (
                      <p className="text-sm text-gray-700">{dispute.resolutionDetails}</p>
                    )}
                    {!isBookingDispute(dispute) && (dispute as ProductDispute).resolutionNote && (
                      <p className="text-sm text-gray-700">
                        {(dispute as ProductDispute).resolutionNote}
                      </p>
                    )}
                    {dispute.refundAmount && (
                      <p className="text-sm text-gray-700 mt-2">
                        Refund: {formatCurrency(dispute.refundAmount)}
                      </p>
                    )}
                    {isBookingDispute(dispute) && dispute.vendorPaymentAmount && (
                      <p className="text-sm text-gray-700">
                        Vendor Payment: {formatCurrency(dispute.vendorPaymentAmount)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                {dispute.messages && dispute.messages.length > 0 ? (
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {dispute.messages.map((msg, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                            {msg.sender.firstName[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-gray-900">
                                {msg.sender.firstName} {msg.sender.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{formatDate(msg.sentAt)}</p>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 flex gap-2">
                                {msg.attachments.map((att, i) => (
                                  <a
                                    key={i}
                                    href={att}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary-600 hover:underline"
                                  >
                                    Attachment {i + 1}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No messages yet</div>
                )}

                {/* Send Message */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex gap-3">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !message.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Evidence Tab */}
            {activeTab === 'evidence' && (
              <div className="space-y-4">
                {isBookingDispute(dispute) && dispute.evidence && dispute.evidence.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {dispute.evidence.map((ev, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Evidence {index + 1}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">Type: {ev.type}</p>
                        {ev.type === 'image' ? (
                          <img
                            src={getImageUrl(ev.content)}
                            alt="Evidence"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{ev.content}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Uploaded: {formatDate(ev.uploadedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : !isBookingDispute(dispute) &&
                  (dispute as ProductDispute).evidence &&
                  (dispute as ProductDispute).evidence!.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {(dispute as ProductDispute).evidence!.map((url, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Evidence {index + 1}
                        </p>
                        <img
                          src={getImageUrl(url)}
                          alt="Evidence"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No evidence submitted</div>
                )}
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            {!showResolveForm && !showCloseForm && !showAssignForm && !showPriorityForm && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  {!dispute.assignedTo && (
                    <button
                      onClick={() => setShowAssignForm(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Assign
                    </button>
                  )}
                  {disputeType === 'booking' && (
                    <button
                      onClick={() => setShowPriorityForm(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Flag className="w-4 h-4" />
                      Update Priority
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {canResolve && (
                    <button
                      onClick={() => setShowResolveForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolve
                    </button>
                  )}
                  {canClose && (
                    <button
                      onClick={() => setShowCloseForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Close
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Assign Form */}
            {showAssignForm && (
              <div className="space-y-3">
                <p className="font-medium text-gray-900">Assign Dispute</p>
                <select
                  value={assignToId}
                  onChange={(e) => setAssignToId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Self-assign (me)</option>
                  {admins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.firstName} {admin.lastName} ({admin.email})
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAssignForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>
            )}

            {/* Priority Form */}
            {showPriorityForm && (
              <div className="space-y-3">
                <p className="font-medium text-gray-900">Update Priority</p>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowPriorityForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePriority}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            )}

            {/* Resolve Form */}
            {showResolveForm && (
              <div className="space-y-3">
                <p className="font-medium text-gray-900">Resolve Dispute</p>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {disputeType === 'booking' ? (
                    <>
                      <option value={BookingDisputeResolution.REFUND_CLIENT}>
                        Refund Client (Full)
                      </option>
                      <option value={BookingDisputeResolution.PAY_VENDOR}>Pay Vendor</option>
                      <option value={BookingDisputeResolution.PARTIAL_REFUND}>
                        Partial Refund
                      </option>
                      <option value={BookingDisputeResolution.NO_ACTION}>No Action</option>
                    </>
                  ) : (
                    <>
                      <option value={ProductDisputeResolution.FULL_REFUND}>
                        Full Refund (Customer Wins)
                      </option>
                      <option value={ProductDisputeResolution.PARTIAL_REFUND}>
                        Partial Refund
                      </option>
                      <option value={ProductDisputeResolution.SELLER_WINS}>Seller Wins</option>
                      <option value={ProductDisputeResolution.CUSTOMER_WINS}>
                        Customer Wins
                      </option>
                    </>
                  )}
                </select>

                {(resolution === BookingDisputeResolution.PARTIAL_REFUND ||
                  resolution === ProductDisputeResolution.PARTIAL_REFUND) && (
                  <>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Refund amount"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {disputeType === 'booking' && (
                      <input
                        type="number"
                        value={vendorPaymentAmount}
                        onChange={(e) => setVendorPaymentAmount(e.target.value)}
                        placeholder="Vendor payment amount"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    )}
                  </>
                )}

                <textarea
                  value={resolutionDetails}
                  onChange={(e) => setResolutionDetails(e.target.value)}
                  placeholder="Resolution details/notes"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowResolveForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolve}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Resolving...' : 'Resolve Dispute'}
                  </button>
                </div>
              </div>
            )}

            {/* Close Form */}
            {showCloseForm && (
              <div className="space-y-3">
                <p className="font-medium text-gray-900">Close Dispute</p>
                {disputeType === 'product' && (
                  <textarea
                    value={closureNote}
                    onChange={(e) => setClosureNote(e.target.value)}
                    placeholder="Closure note"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                )}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowCloseForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClose}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Closing...' : 'Close Dispute'}
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