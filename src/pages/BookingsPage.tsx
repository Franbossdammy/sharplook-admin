import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  X,
  DollarSign,
  User,
  Star,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  AlertTriangle,
  ArrowRightLeft,
  Hash,
  Navigation,
  MessageSquare,
  History,
  Package,
  Building2,
} from 'lucide-react';
import { bookingService } from '../services/booking.service';
import { Booking, BookingFilters, BookingStats } from '../types/booking.types';
import { getImageUrl } from '@/utils/image';

// ==================== Booking Details Modal ====================

interface BookingDetailsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = 'overview' | 'schedule' | 'payment' | 'activity' | 'notes';

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');

  if (!isOpen) return null;

  const fmt = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : '—';

  const fmtCurrency = (amount?: number) =>
    amount != null ? `₦${amount.toLocaleString()}` : '—';

  const statusColor = (s: string) => {
    switch (s) {
      case 'pending':       return 'bg-yellow-100 text-yellow-700';
      case 'accepted':      return 'bg-blue-100 text-blue-700';
      case 'in_progress':   return 'bg-purple-100 text-purple-700';
      case 'completed':     return 'bg-green-100 text-green-700';
      case 'cancelled':     return 'bg-red-100 text-red-700';
      case 'rejected':      return 'bg-orange-100 text-orange-700';
      case 'disputed':      return 'bg-rose-100 text-rose-700';
      default:              return 'bg-gray-100 text-gray-700';
    }
  };

  const payStatusColor = (s?: string) => {
    switch (s) {
      case 'released': case 'paid': return 'bg-green-100 text-green-700';
      case 'escrowed':              return 'bg-blue-100 text-blue-700';
      case 'pending':               return 'bg-yellow-100 text-yellow-700';
      case 'refunded':              return 'bg-red-100 text-red-700';
      case 'partially_refunded':    return 'bg-orange-100 text-orange-700';
      default:                      return 'bg-gray-100 text-gray-700';
    }
  };

  const serviceImage = booking.service?.images?.[0];
  const categoryName = typeof booking.service?.category === 'object'
    ? booking.service.category?.name
    : booking.service?.category;

  const tabs: { id: ModalTab; label: string }[] = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'schedule',  label: 'Schedule & Location' },
    { id: 'payment',   label: 'Payment'   },
    { id: 'activity',  label: 'Activity'  },
    { id: 'notes',     label: 'Notes & Review' },
  ];

  const Row = ({ label, value }: { label: string; value?: React.ReactNode }) =>
    value ? (
      <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-500 flex-shrink-0 w-40">{label}</span>
        <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto my-8 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Booking Details</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-white/80 font-mono">#{booking._id.slice(-8).toUpperCase()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(booking.status)} bg-white/90`}>
                    {booking.status.replace(/_/g, ' ')}
                  </span>
                  {booking.bookingType === 'offer_based' && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 text-indigo-700">
                      Offer-Based
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 px-4 overflow-x-auto">
            <div className="flex gap-0 min-w-max">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === t.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[65vh] overflow-y-auto space-y-5">

            {/* ── OVERVIEW ─────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Service card */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  {serviceImage ? (
                    <img
                      src={getImageUrl(serviceImage)}
                      alt={booking.service?.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Package className="w-8 h-8 text-primary-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">Service</p>
                    <p className="font-semibold text-gray-900 text-base">{booking.service?.name || '—'}</p>
                    {categoryName && <p className="text-sm text-gray-500 mt-0.5">{categoryName}</p>}
                    <p className="text-sm font-bold text-primary-600 mt-1">
                      {fmtCurrency(booking.service?.basePrice ?? booking.servicePrice)}
                    </p>
                  </div>
                </div>

                {/* Client & Vendor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Client */}
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Client
                    </p>
                    {booking.client?.avatar && (
                      <img src={getImageUrl(booking.client.avatar)} className="w-10 h-10 rounded-full object-cover mb-2" alt="" />
                    )}
                    <p className="font-semibold text-gray-900">
                      {booking.client?.firstName} {booking.client?.lastName}
                    </p>
                    {booking.client?.email && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" /> {booking.client.email}
                      </p>
                    )}
                    {booking.client?.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {booking.client.phone}
                      </p>
                    )}
                  </div>

                  {/* Vendor */}
                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Vendor
                    </p>
                    {booking.vendor?.avatar && (
                      <img src={getImageUrl(booking.vendor.avatar)} className="w-10 h-10 rounded-full object-cover mb-2" alt="" />
                    )}
                    <p className="font-semibold text-gray-900">
                      {booking.vendor?.vendorProfile?.businessName ||
                        `${booking.vendor?.firstName} ${booking.vendor?.lastName}`}
                    </p>
                    {booking.vendor?.vendorProfile?.businessName && (
                      <p className="text-xs text-gray-500">
                        {booking.vendor.firstName} {booking.vendor.lastName}
                      </p>
                    )}
                    {booking.vendor?.email && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" /> {booking.vendor.email}
                      </p>
                    )}
                    {booking.vendor?.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {booking.vendor.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick summary */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <Row label="Booking Type"     value={booking.bookingType === 'offer_based' ? 'Offer-Based' : 'Standard'} />
                  <Row label="Booking Status"   value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(booking.status)}`}>{booking.status.replace(/_/g,'  ')}</span>} />
                  <Row label="Payment Status"   value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payStatusColor(booking.paymentStatus)}`}>{booking.paymentStatus?.replace(/_/g,' ')}</span>} />
                  <Row label="Total Amount"     value={<span className="font-bold text-primary-600">{fmtCurrency(booking.totalAmount)}</span>} />
                  <Row label="Created"          value={fmt(booking.createdAt)} />
                  <Row label="Last Updated"     value={fmt(booking.updatedAt)} />
                  {booking.hasDispute && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span className="text-sm font-medium text-rose-700">This booking has an active dispute</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SCHEDULE & LOCATION ──────────────────────── */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" /> Schedule
                  </p>
                  <Row label="Scheduled Date" value={fmt(booking.scheduledDate)} />
                  <Row label="Time"           value={booking.scheduledTime} />
                  <Row label="Duration"       value={booking.duration ? `${booking.duration} minutes` : undefined} />
                  <Row label="Accepted At"    value={booking.acceptedAt ? fmt(booking.acceptedAt) : undefined} />
                  <Row label="Completed At"   value={booking.completedAt ? fmt(booking.completedAt) : undefined} />
                  <Row label="Completed By"   value={booking.completedBy} />
                </div>

                {/* Completion tracking */}
                {(booking.clientMarkedComplete !== undefined || booking.vendorMarkedComplete !== undefined) && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Completion Confirmation</p>
                    <div className="flex gap-4">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${booking.clientMarkedComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <CheckCircle className="w-4 h-4" />
                        Client {booking.clientMarkedComplete ? 'confirmed' : 'pending'}
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${booking.vendorMarkedComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <CheckCircle className="w-4 h-4" />
                        Vendor {booking.vendorMarkedComplete ? 'confirmed' : 'pending'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Location */}
                {booking.location?.address ? (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Service Location (Home Service)
                    </p>
                    <p className="text-sm font-medium text-gray-900">{booking.location.address}</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {booking.location.city}{booking.location.state ? `, ${booking.location.state}` : ''}
                    </p>
                    {booking.location.coordinates?.[0] != null && (
                      <a
                        href={`https://maps.google.com/?q=${booking.location.coordinates[1]},${booking.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600 hover:text-primary-800 font-medium"
                      >
                        <Navigation className="w-3 h-3" /> View on Google Maps
                      </a>
                    )}
                    {booking.distanceCharge > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Distance charge: <span className="font-semibold text-gray-900">{fmtCurrency(booking.distanceCharge)}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm text-gray-500">
                    <MapPin className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                    No location recorded — likely an in-shop service
                  </div>
                )}

                {/* Offer info */}
                {booking.bookingType === 'offer_based' && booking.offer && (
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <ArrowRightLeft className="w-3.5 h-3.5" /> Offer Details
                    </p>
                    <Row label="Offer ID"    value={typeof booking.offer === 'object' ? booking.offer._id?.slice(-8).toUpperCase() : String(booking.offer).slice(-8).toUpperCase()} />
                    {typeof booking.offer === 'object' && booking.offer.title && <Row label="Title" value={booking.offer.title} />}
                    {typeof booking.offer === 'object' && booking.offer.price && <Row label="Offer Price" value={fmtCurrency(booking.offer.price)} />}
                  </div>
                )}
              </div>
            )}

            {/* ── PAYMENT ──────────────────────────────────── */}
            {activeTab === 'payment' && (
              <div className="space-y-4">
                {/* Payment status banner */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${payStatusColor(booking.paymentStatus)}`}>
                  <CreditCard className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold capitalize">{booking.paymentStatus?.replace(/_/g, ' ')} payment</p>
                    {booking.paymentReference && (
                      <p className="text-xs mt-0.5 opacity-80 font-mono">Ref: {booking.paymentReference}</p>
                    )}
                  </div>
                </div>

                {/* Breakdown */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Price Breakdown</p>
                  <Row label="Service Price"    value={fmtCurrency(booking.servicePrice)} />
                  {booking.distanceCharge > 0 && (
                    <Row label="Distance Charge" value={fmtCurrency(booking.distanceCharge)} />
                  )}
                  {booking.cancellationPenalty != null && booking.cancellationPenalty > 0 && (
                    <Row label="Cancellation Penalty" value={fmtCurrency(booking.cancellationPenalty)} />
                  )}
                  <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-200">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-base font-bold text-primary-600">{fmtCurrency(booking.totalAmount)}</span>
                  </div>
                </div>

                {/* Earnings */}
                {(booking.platformFee != null || booking.vendorEarnings != null) && (
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Distribution</p>
                    <Row label="Platform Fee"    value={booking.platformFee != null ? fmtCurrency(booking.platformFee) : undefined} />
                    <Row label="Vendor Earnings" value={booking.vendorEarnings != null ? <span className="text-green-700 font-bold">{fmtCurrency(booking.vendorEarnings)}</span> : undefined} />
                  </div>
                )}

                {/* Method & reference */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment Details</p>
                  <Row label="Payment Method"    value={booking.paymentMethod ? <span className="capitalize">{booking.paymentMethod}</span> : undefined} />
                  <Row label="Payment Reference" value={booking.paymentReference ? <span className="font-mono text-xs">{booking.paymentReference}</span> : undefined} />
                  <Row label="Payment ID"        value={booking.paymentId ? <span className="font-mono text-xs">{String(booking.paymentId).slice(-10).toUpperCase()}</span> : undefined} />
                  <Row label="Expires At"        value={booking.paymentExpiresAt ? fmt(booking.paymentExpiresAt) : undefined} />
                </div>
              </div>
            )}

            {/* ── ACTIVITY ─────────────────────────────────── */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                {/* Cancellation */}
                {booking.cancellationReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Cancellation
                    </p>
                    <Row label="Reason"       value={booking.cancellationReason} />
                    <Row label="Cancelled At" value={booking.cancelledAt ? fmt(booking.cancelledAt) : undefined} />
                    {booking.cancellationPenalty != null && booking.cancellationPenalty > 0 && (
                      <Row label="Penalty" value={fmtCurrency(booking.cancellationPenalty)} />
                    )}
                  </div>
                )}

                {/* Dispute */}
                {booking.hasDispute && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Dispute
                    </p>
                    <p className="text-sm text-rose-700">This booking has an active dispute.</p>
                    {booking.disputeId && (
                      <p className="text-xs text-rose-500 font-mono mt-1">ID: {String(booking.disputeId).slice(-8).toUpperCase()}</p>
                    )}
                  </div>
                )}

                {/* Status history timeline */}
                {booking.statusHistory && booking.statusHistory.length > 0 ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-1">
                      <History className="w-3.5 h-3.5" /> Status History
                    </p>
                    <div className="relative pl-6">
                      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200" />
                      {[...booking.statusHistory].reverse().map((h, i) => (
                        <div key={i} className="relative mb-4 last:mb-0">
                          <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 border-white ${statusColor(h.status).replace('text-', 'bg-').split(' ')[0]}`} />
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(h.status)}`}>
                                {h.status.replace(/_/g, ' ')}
                              </span>
                              {h.reason && <p className="text-xs text-gray-500 mt-1 ml-1">{h.reason}</p>}
                            </div>
                            <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{fmt(h.changedAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm text-gray-400">
                    <History className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                    No status history recorded
                  </div>
                )}

                {/* Key timestamps */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Timestamps</p>
                  <Row label="Created"      value={fmt(booking.createdAt)} />
                  <Row label="Accepted"     value={booking.acceptedAt ? fmt(booking.acceptedAt) : undefined} />
                  <Row label="Rejected"     value={booking.rejectedAt ? fmt(booking.rejectedAt) : undefined} />
                  <Row label="Completed"    value={booking.completedAt ? fmt(booking.completedAt) : undefined} />
                  <Row label="Cancelled"    value={booking.cancelledAt ? fmt(booking.cancelledAt) : undefined} />
                  <Row label="Last Updated" value={fmt(booking.updatedAt)} />
                </div>
              </div>
            )}

            {/* ── NOTES & REVIEW ───────────────────────────── */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                {/* Client notes */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Client Notes
                  </p>
                  <p className="text-sm text-gray-700">
                    {booking.clientNotes || booking.notes || <span className="text-gray-400 italic">No notes from client</span>}
                  </p>
                </div>

                {/* Vendor notes */}
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Vendor Notes
                  </p>
                  <p className="text-sm text-gray-700">
                    {booking.vendorNotes || <span className="text-gray-400 italic">No notes from vendor</span>}
                  </p>
                </div>

                {/* Review */}
                {booking.review ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-3 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" /> Client Review
                    </p>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-5 h-5 ${s <= booking.review!.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                      <span className="ml-2 text-sm font-bold text-gray-700">{booking.review.rating}/5</span>
                    </div>
                    {booking.review.comment && (
                      <p className="text-sm text-gray-700 italic">"{booking.review.comment}"</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm text-gray-400">
                    <Star className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                    {booking.hasReview ? 'Review submitted but not populated' : 'No review yet'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== Bookings Page ====================

export const BookingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState<BookingFilters>({
    status: undefined,
    paymentStatus: undefined,
    startDate: '',
    endDate: '',
  });

  // Stats
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [page, filters]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const result = await bookingService.getAllBookings(filters, page, limit);
      setBookings(result.bookings || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await bookingService.getBookingStats();
      if (result) {
        setStats({
          total: result.total || 0,
          pending: result.pending || 0,
          accepted: result.accepted || 0,
          inProgress: result.inProgress || 0,
          completed: result.completed || 0,
          cancelled: result.cancelled || 0,
          totalRevenue: result.totalRevenue || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      // Fallback: calculate stats from fetched bookings
      try {
        let allBookings: Booking[] = [];
        let currentPage = 1;
        let hasMore = true;
        const maxLimit = 100;

        while (hasMore && currentPage <= 5) {
          const result = await bookingService.getAllBookings({}, currentPage, maxLimit);
          allBookings = [...allBookings, ...(result.bookings || [])];
          if (currentPage >= result.totalPages) {
            hasMore = false;
          }
          currentPage++;
        }

        setStats({
          total: allBookings.length,
          pending: allBookings.filter((b) => b.status === 'pending').length,
          accepted: allBookings.filter((b) => b.status === 'accepted').length,
          inProgress: allBookings.filter((b) => b.status === 'in_progress').length,
          completed: allBookings.filter((b) => b.status === 'completed').length,
          cancelled: allBookings.filter((b) => b.status === 'cancelled').length,
          totalRevenue: allBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        });
      } catch (fallbackError) {
        console.error('Error calculating stats from bookings:', fallbackError);
        setStats({
          total: 0,
          pending: 0,
          accepted: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          totalRevenue: 0,
        });
      }
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      paymentStatus: undefined,
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'accepted':
        return 'bg-blue-100 text-blue-700';
      case 'rejected':
        return 'bg-orange-100 text-orange-700';
      case 'in_progress':
        return 'bg-purple-100 text-purple-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <ThumbsUp className="w-4 h-4" />;
      case 'rejected':
        return <ThumbsDown className="w-4 h-4" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <CalendarDays className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'released':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'escrowed':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'refunded':
        return 'bg-red-100 text-red-700';
      case 'partially_refunded':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatShortDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => `₦${(amount || 0).toLocaleString()}`;

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const clientName = `${booking.client?.firstName || ''} ${booking.client?.lastName || ''}`.toLowerCase();
    const vendorName = `${booking.vendor?.firstName || ''} ${booking.vendor?.lastName || ''}`.toLowerCase();
    const serviceName = (booking.service?.name || '').toLowerCase();
    return clientName.includes(term) || vendorName.includes(term) || serviceName.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all service bookings</p>
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
            <ThumbsUp className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-gray-600">Accepted</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <PlayCircle className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-medium text-gray-600">In Progress</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-medium text-gray-600">Revenue</p>
          </div>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-xl shadow-sm border border-primary-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-primary-600" />
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
              placeholder="Search by client, vendor, or service name..."
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  value={filters.paymentStatus || ''}
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Payment Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="escrowed">Escrowed</option>
                  <option value="released">Released</option>
                  <option value="refunded">Refunded</option>
                  <option value="partially_refunded">Partially Refunded</option>
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

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 font-medium text-sm text-gray-700">
              <div className="col-span-1">Booking ID</div>
              <div className="col-span-2">Service</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2">Vendor</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Payment</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-1">
                    <p className="text-sm font-medium text-gray-900">
                      #{booking._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {booking.service?.name || 'N/A'}
                    </p>
                    {booking.service?.category && (
                      <p className="text-xs text-gray-600 truncate">{booking.service.category}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.client?.firstName} {booking.client?.lastName}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{booking.client?.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.vendor?.firstName} {booking.vendor?.lastName}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{booking.vendor?.email}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)}
                      <span className="hidden xl:inline">{booking.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    {booking.paymentStatus ? (
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs text-gray-600">{formatShortDate(booking.scheduledDate)}</p>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => handleViewDetails(booking)}
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
            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No bookings found</p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} bookings
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

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
            fetchBookings(); // Refresh list
          }}
        />
      )}
    </div>
  );
};
