import React, { useState, useEffect } from 'react';
import { getImageUrl } from '@/utils/image';
import {
  X, Megaphone, User, MapPin, Calendar, DollarSign, Clock,
  CheckCircle, Tag, MessageSquare, Star, Navigation,
  Building2, Phone, Mail, CreditCard, AlertTriangle,
  XCircle, History, ArrowRightLeft, Home, Store, Layers,
  CalendarDays, PlayCircle, ThumbsUp, ThumbsDown,
  ArrowRight, RefreshCw,
} from 'lucide-react';
import { Offer } from '../../types/offer.types';
import { Booking } from '../../types/booking.types';
import { bookingService } from '../../services/booking.service';

interface OfferDetailsModalProps {
  offer: Offer;
  isOpen: boolean;
  onClose: () => void;
  onBookingCancelled?: () => void;
}

type ModalTab = 'details' | 'responses' | 'booking';

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  offer,
  isOpen,
  onClose,
  onBookingCancelled,
}) => {
  const hasLinkedBooking = offer.status === 'accepted' && !!offer.bookingId;

  const [activeTab, setActiveTab] = useState<ModalTab>('details');
  const [linkedBooking, setLinkedBooking] = useState<Booking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    if (activeTab === 'booking' && hasLinkedBooking && !linkedBooking && !bookingLoading) {
      fetchLinkedBooking();
    }
  }, [activeTab]);

  const fetchLinkedBooking = async () => {
    setBookingLoading(true);
    setBookingError('');
    try {
      const booking = await bookingService.getAdminBookingById(offer.bookingId!);
      setLinkedBooking(booking);
    } catch {
      setBookingError('Failed to load booking details. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (cancelReason.trim().length < 10) {
      setCancelError('Please provide a reason of at least 10 characters');
      return;
    }
    setCancelLoading(true);
    setCancelError('');
    try {
      await bookingService.cancelBooking(linkedBooking!._id, cancelReason.trim());
      setCancelSuccess(true);
      setShowCancelConfirm(false);
      setCancelReason('');
      await fetchLinkedBooking();
      if (onBookingCancelled) onBookingCancelled();
    } catch (err: any) {
      setCancelError(err?.response?.data?.message || err?.message || 'Failed to cancel booking');
      setCancelLoading(false);
    }
  };

  if (!isOpen) return null;

  // ── helpers ────────────────────────────────────────────
  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : '—';

  const fmtCurrency = (n?: number) =>
    n != null ? `₦${n.toLocaleString()}` : '—';

  const statusColor = (s: string) => {
    switch (s) {
      case 'open':     return 'bg-green-100 text-green-700';
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'closed':   return 'bg-gray-100 text-gray-700';
      case 'expired':  return 'bg-red-100 text-red-700';
      default:         return 'bg-gray-100 text-gray-700';
    }
  };

  const bookingStatusColor = (s: string) => {
    switch (s) {
      case 'pending':     return 'bg-yellow-100 text-yellow-700';
      case 'accepted':    return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'completed':   return 'bg-green-100 text-green-700';
      case 'cancelled':   return 'bg-red-100 text-red-700';
      case 'rejected':    return 'bg-orange-100 text-orange-700';
      default:            return 'bg-gray-100 text-gray-700';
    }
  };

  const bookingStatusIcon = (s: string) => {
    switch (s) {
      case 'pending':     return <Clock className="w-3.5 h-3.5" />;
      case 'accepted':    return <ThumbsUp className="w-3.5 h-3.5" />;
      case 'in_progress': return <PlayCircle className="w-3.5 h-3.5" />;
      case 'completed':   return <CheckCircle className="w-3.5 h-3.5" />;
      case 'cancelled':   return <XCircle className="w-3.5 h-3.5" />;
      case 'rejected':    return <ThumbsDown className="w-3.5 h-3.5" />;
      default:            return <CalendarDays className="w-3.5 h-3.5" />;
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

  const flexColor = (f: string) => {
    switch (f) {
      case 'flexible': return 'bg-green-100 text-green-700';
      case 'specific': return 'bg-blue-100 text-blue-700';
      case 'urgent':   return 'bg-red-100 text-red-700';
      default:         return 'bg-gray-100 text-gray-700';
    }
  };

  const serviceTypeInfo = (t?: string) => {
    switch (t) {
      case 'home':  return { label: 'Home Service', icon: <Home className="w-3 h-3" />, color: 'bg-emerald-100 text-emerald-700' };
      case 'shop':  return { label: 'In-Shop',      icon: <Store className="w-3 h-3" />, color: 'bg-sky-100 text-sky-700' };
      case 'both':  return { label: 'Home & Shop',  icon: <Layers className="w-3 h-3" />, color: 'bg-violet-100 text-violet-700' };
      default:      return { label: 'Any',          icon: <Layers className="w-3 h-3" />, color: 'bg-gray-100 text-gray-600' };
    }
  };

  const isExpired = new Date(offer.expiresAt) < new Date();
  const acceptedResponse = offer.responses.find(r => r.isAccepted);
  const stInfo = serviceTypeInfo(offer.serviceType);
  const isCancelable = linkedBooking && ['pending', 'accepted', 'in_progress'].includes(linkedBooking.status);

  const Row = ({ label, value }: { label: string; value?: React.ReactNode }) =>
    value ? (
      <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-500 flex-shrink-0 w-36">{label}</span>
        <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
      </div>
    ) : null;

  const tabs: { id: ModalTab; label: string }[] = [
    { id: 'details',   label: 'Offer Details' },
    { id: 'responses', label: `Responses (${offer.responses.length})` },
    ...(hasLinkedBooking ? [{ id: 'booking' as ModalTab, label: 'Linked Booking' }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto my-8 overflow-hidden">

          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-primary-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white line-clamp-1">{offer.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-white/80 font-mono">#{offer._id.slice(-8).toUpperCase()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 ${statusColor(offer.status)}`}>
                    {offer.status}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-white/90 flex items-center gap-1 ${stInfo.color}`}>
                    {stInfo.icon} {stInfo.label}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Tabs ── */}
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
                  {t.id === 'booking' && cancelSuccess && (
                    <span className="ml-1.5 w-2 h-2 rounded-full bg-green-500 inline-block" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="px-6 py-5 max-h-[65vh] overflow-y-auto space-y-5">

            {/* ════════ DETAILS TAB ════════ */}
            {activeTab === 'details' && (
              <div className="space-y-5">
                {/* Badges row */}
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusColor(offer.status)}`}>
                    {offer.status === 'open' ? <CheckCircle className="w-3 h-3" /> : offer.status === 'accepted' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${flexColor(offer.flexibility)}`}>
                    {offer.flexibility.charAt(0).toUpperCase() + offer.flexibility.slice(1)}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${stInfo.color}`}>
                    {stInfo.icon} {stInfo.label}
                  </span>
                  {isExpired && offer.status === 'open' && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                      Expired
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{offer.description}</p>
                </div>

                {/* Proposed budget */}
                <div className="p-4 bg-primary-50 rounded-xl border border-primary-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                    <p className="text-sm font-semibold text-primary-700">Client's Proposed Budget</p>
                  </div>
                  <p className="text-2xl font-bold text-primary-900">{fmtCurrency(offer.proposedPrice)}</p>
                </div>

                {/* Client + Category grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Client */}
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Client
                    </p>
                    {offer.client.avatar && (
                      <img src={getImageUrl(offer.client.avatar)} className="w-10 h-10 rounded-full object-cover mb-2" alt="" />
                    )}
                    <p className="font-semibold text-gray-900">{offer.client.firstName} {offer.client.lastName}</p>
                    {offer.client.email && (
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-1"><Mail className="w-3 h-3" /> {offer.client.email}</p>
                    )}
                    {offer.client.phone && (
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {offer.client.phone}</p>
                    )}
                  </div>

                  {/* Category + Service */}
                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Category
                    </p>
                    <p className="font-semibold text-gray-900">{offer.category.name}</p>
                    {offer.service && (
                      <>
                        <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mt-3 mb-1">Service</p>
                        <p className="text-sm text-gray-800">{offer.service.name}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Location */}
                {offer.location && (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Service Location
                    </p>
                    <p className="text-sm font-medium text-gray-900">{offer.location.address}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{offer.location.city}, {offer.location.state}</p>
                    {offer.location.coordinates?.[0] != null && (
                      <a
                        href={`https://maps.google.com/?q=${offer.location.coordinates[1]},${offer.location.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600 hover:text-primary-800 font-medium"
                      >
                        <Navigation className="w-3 h-3" /> View on Google Maps
                      </a>
                    )}
                  </div>
                )}

                {/* Preferred date/time */}
                {(offer.preferredDate || offer.preferredTime) && (
                  <div className="grid grid-cols-2 gap-4">
                    {offer.preferredDate && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Preferred Date</p>
                        <p className="text-sm font-medium text-gray-900">{fmt(offer.preferredDate)}</p>
                      </div>
                    )}
                    {offer.preferredTime && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Preferred Time</p>
                        <p className="text-sm font-medium text-gray-900">{offer.preferredTime}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Images */}
                {offer.images && offer.images.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Attached Images</p>
                    <div className="grid grid-cols-3 gap-2">
                      {offer.images.map((img, i) => (
                        <img key={i} src={getImageUrl(img)} alt={`offer-img-${i}`} className="w-full h-28 object-cover rounded-lg" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Timeline</p>
                  <Row label="Created"    value={fmt(offer.createdAt)} />
                  <Row label="Expires"    value={<span className={isExpired ? 'text-red-600' : 'text-gray-900'}>{fmt(offer.expiresAt)}</span>} />
                  {offer.acceptedAt && <Row label="Accepted At" value={fmt(offer.acceptedAt)} />}
                  {hasLinkedBooking && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => setActiveTab('booking')}
                        className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        <ArrowRightLeft className="w-4 h-4" /> View Linked Booking
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════ RESPONSES TAB ════════ */}
            {activeTab === 'responses' && (
              <div className="space-y-4">
                {offer.responses.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No vendor responses yet</p>
                  </div>
                ) : (
                  offer.responses.map((resp, idx) => {
                    const finalPrice = resp.counterOffer ?? resp.proposedPrice;
                    const hasNegotiation = resp.counterOffer != null;
                    return (
                      <div
                        key={resp._id}
                        className={`rounded-xl border-2 overflow-hidden ${
                          resp.isAccepted ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        {/* Vendor header */}
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                              {resp.vendor.avatar ? (
                                <img src={getImageUrl(resp.vendor.avatar)} className="w-10 h-10 rounded-full object-cover" alt="" />
                              ) : (
                                <span className="text-sm font-bold text-primary-600">
                                  {resp.vendor.firstName[0]}{resp.vendor.lastName[0]}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {resp.vendor.firstName} {resp.vendor.lastName}
                                <span className="ml-1.5 text-xs text-gray-400">#{idx + 1}</span>
                              </p>
                              {resp.vendor.vendorProfile?.businessName && (
                                <p className="text-xs text-primary-600 font-medium">{resp.vendor.vendorProfile.businessName}</p>
                              )}
                              <div className="flex items-center gap-2 mt-0.5">
                                {resp.vendor.vendorProfile?.rating != null && (
                                  <span className="flex items-center gap-0.5 text-xs text-gray-500">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {resp.vendor.vendorProfile.rating.toFixed(1)}
                                  </span>
                                )}
                                {resp.vendor.vendorProfile?.completedBookings != null && (
                                  <span className="text-xs text-gray-400">
                                    {resp.vendor.vendorProfile.completedBookings} jobs
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {resp.isAccepted && (
                            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full border border-green-300">
                              <CheckCircle className="w-3.5 h-3.5" /> Selected
                            </span>
                          )}
                        </div>

                        {/* Price negotiation chain */}
                        <div className="px-4 pb-4">
                          <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Price Negotiation</p>
                            {/* Client proposed */}
                            <div className="flex items-center gap-2 text-sm">
                              <span className="w-28 text-gray-500 text-xs">Client offered</span>
                              <span className="font-medium text-gray-700">{fmtCurrency(offer.proposedPrice)}</span>
                            </div>
                            {/* Vendor proposed */}
                            <div className="flex items-center gap-2 text-sm">
                              <span className="w-28 text-gray-500 text-xs">Vendor quoted</span>
                              <span className={`font-medium ${hasNegotiation ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                {fmtCurrency(resp.proposedPrice)}
                              </span>
                            </div>
                            {/* Counter offer */}
                            {hasNegotiation && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="w-28 text-gray-500 text-xs">Client counter</span>
                                <span className="font-medium text-blue-700">{fmtCurrency(resp.counterOffer)}</span>
                              </div>
                            )}
                            {/* Final */}
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                              <span className="w-28 text-xs font-semibold text-gray-700">Final Price</span>
                              <span className="font-bold text-primary-700 text-base">{fmtCurrency(finalPrice)}</span>
                              {resp.isAccepted && (
                                <span className="text-xs text-green-600 font-medium ml-1">✓ Agreed</span>
                              )}
                            </div>
                          </div>

                          {/* Duration */}
                          {resp.estimatedDuration && (
                            <p className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Estimated {resp.estimatedDuration} minutes
                            </p>
                          )}

                          {/* Message */}
                          {resp.message && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs font-semibold text-gray-500 mb-1">Vendor Message</p>
                              <p className="text-sm text-gray-800">{resp.message}</p>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                            <span>Responded: {fmt(resp.respondedAt)}</span>
                            {resp.acceptedAt && <span className="text-green-600">Accepted: {fmt(resp.acceptedAt)}</span>}
                          </div>

                          {/* Link to booking if this response is accepted */}
                          {resp.isAccepted && hasLinkedBooking && (
                            <button
                              onClick={() => setActiveTab('booking')}
                              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" /> View created booking
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Selected vendor summary (if accepted) */}
                {offer.status === 'accepted' && acceptedResponse && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Selected Vendor Summary
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {acceptedResponse.vendor.firstName} {acceptedResponse.vendor.lastName}
                      {acceptedResponse.vendor.vendorProfile?.businessName && ` — ${acceptedResponse.vendor.vendorProfile.businessName}`}
                    </p>
                    <p className="text-sm text-primary-700 font-bold mt-1">
                      Final agreed price: {fmtCurrency(acceptedResponse.counterOffer ?? acceptedResponse.proposedPrice)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ════════ LINKED BOOKING TAB ════════ */}
            {activeTab === 'booking' && (
              <div className="space-y-4">
                {bookingLoading && (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
                    <p className="text-sm text-gray-500">Loading booking details...</p>
                  </div>
                )}

                {bookingError && (
                  <div className="flex flex-col items-center py-10 gap-3">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                    <p className="text-sm text-red-600">{bookingError}</p>
                    <button
                      onClick={fetchLinkedBooking}
                      className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-800"
                    >
                      <RefreshCw className="w-4 h-4" /> Retry
                    </button>
                  </div>
                )}

                {!bookingLoading && !bookingError && linkedBooking && (
                  <>
                    {/* Booking header */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 font-mono mb-1">BOOKING #{linkedBooking._id.slice(-8).toUpperCase()}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${bookingStatusColor(linkedBooking.status)}`}>
                            {bookingStatusIcon(linkedBooking.status)}
                            {linkedBooking.status.replace(/_/g, ' ')}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${payStatusColor(linkedBooking.paymentStatus)}`}>
                            <CreditCard className="w-3 h-3" />
                            {linkedBooking.paymentStatus?.replace(/_/g, ' ')}
                          </span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium">
                            Offer-Based
                          </span>
                        </div>
                      </div>
                      {cancelSuccess && (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                      )}
                    </div>

                    {/* Vendor + Client side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> Client
                        </p>
                        {linkedBooking.client?.avatar && (
                          <img src={getImageUrl(linkedBooking.client.avatar)} className="w-9 h-9 rounded-full object-cover mb-2" alt="" />
                        )}
                        <p className="font-semibold text-gray-900 text-sm">{linkedBooking.client?.firstName} {linkedBooking.client?.lastName}</p>
                        {linkedBooking.client?.email && <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{linkedBooking.client.email}</p>}
                        {linkedBooking.client?.phone && <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{linkedBooking.client.phone}</p>}
                      </div>

                      <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" /> Selected Vendor
                        </p>
                        {linkedBooking.vendor?.avatar && (
                          <img src={getImageUrl(linkedBooking.vendor.avatar)} className="w-9 h-9 rounded-full object-cover mb-2" alt="" />
                        )}
                        <p className="font-semibold text-gray-900 text-sm">
                          {linkedBooking.vendor?.vendorProfile?.businessName || `${linkedBooking.vendor?.firstName} ${linkedBooking.vendor?.lastName}`}
                        </p>
                        {linkedBooking.vendor?.vendorProfile?.businessName && (
                          <p className="text-xs text-gray-500">{linkedBooking.vendor.firstName} {linkedBooking.vendor.lastName}</p>
                        )}
                        {linkedBooking.vendor?.email && <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{linkedBooking.vendor.email}</p>}
                        {linkedBooking.vendor?.phone && <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{linkedBooking.vendor.phone}</p>}
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" /> Schedule
                      </p>
                      <Row label="Date"     value={fmt(linkedBooking.scheduledDate)} />
                      <Row label="Time"     value={linkedBooking.scheduledTime} />
                      <Row label="Duration" value={linkedBooking.duration ? `${linkedBooking.duration} min` : undefined} />
                      <Row label="Accepted" value={linkedBooking.acceptedAt ? fmt(linkedBooking.acceptedAt) : undefined} />
                    </div>

                    {/* Location */}
                    {linkedBooking.location?.address && (
                      <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> Service Location
                        </p>
                        <p className="text-sm font-medium">{linkedBooking.location.address}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{linkedBooking.location.city}{linkedBooking.location.state ? `, ${linkedBooking.location.state}` : ''}</p>
                      </div>
                    )}

                    {/* Payment */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" /> Payment
                      </p>
                      <Row label="Service Price"  value={`₦${(linkedBooking.servicePrice || 0).toLocaleString()}`} />
                      {linkedBooking.distanceCharge > 0 && (
                        <Row label="Distance"       value={`₦${linkedBooking.distanceCharge.toLocaleString()}`} />
                      )}
                      <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-200">
                        <span className="text-sm font-bold text-gray-800">Total</span>
                        <span className="text-base font-bold text-primary-700">₦{(linkedBooking.totalAmount || 0).toLocaleString()}</span>
                      </div>
                      {linkedBooking.paymentReference && (
                        <p className="text-xs text-gray-400 font-mono mt-2">Ref: {linkedBooking.paymentReference}</p>
                      )}
                    </div>

                    {/* Cancellation info (if already cancelled) */}
                    {linkedBooking.status === 'cancelled' && linkedBooking.cancellationReason && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Cancellation Details
                        </p>
                        <Row label="Reason"       value={linkedBooking.cancellationReason} />
                        <Row label="Cancelled At" value={linkedBooking.cancelledAt ? fmt(linkedBooking.cancelledAt) : undefined} />
                        <Row label="Refund"       value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payStatusColor(linkedBooking.paymentStatus)}`}>{linkedBooking.paymentStatus?.replace(/_/g, ' ')}</span>} />
                      </div>
                    )}

                    {/* Status history */}
                    {linkedBooking.statusHistory && linkedBooking.statusHistory.length > 0 && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-1">
                          <History className="w-3.5 h-3.5" /> Status History
                        </p>
                        <div className="relative pl-5">
                          <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gray-200" />
                          {[...linkedBooking.statusHistory].reverse().map((h, i) => (
                            <div key={i} className="relative mb-3 last:mb-0">
                              <div className={`absolute -left-3.5 w-3 h-3 rounded-full border-2 border-white ${bookingStatusColor(h.status).split(' ')[0]}`} />
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bookingStatusColor(h.status)}`}>
                                  {h.status.replace(/_/g, ' ')}
                                </span>
                                <span className="text-xs text-gray-400 flex-shrink-0">{fmt(h.changedAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cancel inline */}
                    {isCancelable && !cancelSuccess && (
                      <div className="rounded-xl border border-red-200 overflow-hidden">
                        {!showCancelConfirm ? (
                          <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="w-full px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            <XCircle className="w-4 h-4" /> Cancel This Booking (Full Refund to Client)
                          </button>
                        ) : (
                          <div className="p-4 bg-red-50 space-y-3">
                            <p className="text-sm font-semibold text-red-700 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" /> Confirm — client will receive a full refund
                            </p>
                            <textarea
                              value={cancelReason}
                              onChange={e => { setCancelReason(e.target.value); setCancelError(''); }}
                              placeholder="Reason for cancellation (min 10 characters)..."
                              rows={3}
                              disabled={cancelLoading}
                              className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                            />
                            {cancelError && <p className="text-xs text-red-600">{cancelError}</p>}
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => { setShowCancelConfirm(false); setCancelReason(''); setCancelError(''); }}
                                disabled={cancelLoading}
                                className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                              >
                                Go Back
                              </button>
                              <button
                                onClick={handleCancelBooking}
                                disabled={cancelLoading || cancelReason.trim().length < 10}
                                className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
                              >
                                {cancelLoading ? (
                                  <><span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" /> Cancelling...</>
                                ) : (
                                  <><XCircle className="w-3.5 h-3.5" /> Confirm Cancel</>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-400 font-mono">
              Offer #{offer._id.slice(-8).toUpperCase()} · {offer.responses.length} response{offer.responses.length !== 1 ? 's' : ''}
            </div>
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
