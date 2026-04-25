import React, { useState } from 'react';
import { X, ArrowRightLeft, Info } from 'lucide-react';
import { Product } from '@/types/product.types';
import { getImageUrl } from '@/utils/image';

interface ConvertToServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (
    productId: string,
    data: { priceType: 'fixed' | 'hourly' | 'negotiable'; duration?: number }
  ) => Promise<boolean>;
}

const DURATION_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hr', value: 60 },
  { label: '1.5 hr', value: 90 },
  { label: '2 hr', value: 120 },
  { label: '3 hr', value: 180 },
  { label: '4 hr', value: 240 },
];

export const ConvertToServiceModal: React.FC<ConvertToServiceModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit,
}) => {
  const [priceType, setPriceType] = useState<'fixed' | 'hourly' | 'negotiable'>('fixed');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const sellerName =
    product.seller?.vendorProfile?.businessName ||
    product.seller?.fullName ||
    `${product.seller?.firstName ?? ''} ${product.seller?.lastName ?? ''}`.trim() ||
    'Unknown Vendor';

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(price);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Convert "${product.name}" to a service? The original product will be removed.`)) return;

    setIsSubmitting(true);
    const success = await onSubmit(product.id, {
      priceType,
      duration: duration ?? undefined,
    });
    setIsSubmitting(false);
    if (success) {
      setPriceType('fixed');
      setDuration(undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Convert to Service</h3>
              <p className="text-xs text-gray-500 mt-0.5">Admin action — irreversible</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Info banner */}
          <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              This will create a new service under <strong>{sellerName}</strong>'s account using the
              product's name, description, category, price, and images. The original product will be
              soft-deleted. The service starts as <strong>pending</strong> and requires approval.
            </p>
          </div>

          {/* Product preview */}
          <div className="flex gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            {product.images?.[0] && (
              <img
                src={getImageUrl(product.images[0])}
                alt={product.name}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">by {sellerName}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-bold text-primary-600">
                  {formatPrice(product.finalPrice ?? product.price)}
                </span>
                <span className="text-xs text-gray-500 capitalize">{product.category?.name}</span>
              </div>
            </div>
          </div>

          {/* What carries over */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Carried over automatically
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['Name', 'Description', 'Category', 'Price → Base price', 'Images', 'Tags'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Price Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['fixed', 'hourly', 'negotiable'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPriceType(type)}
                  className={`py-2 px-3 text-sm font-medium rounded-lg border transition-colors capitalize ${
                    priceType === type
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              {priceType === 'fixed' && 'Customer pays the listed base price.'}
              {priceType === 'hourly' && 'Base price is charged per hour.'}
              {priceType === 'negotiable' && 'Price is discussed between vendor and customer.'}
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Duration <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(duration === opt.value ? undefined : opt.value)}
                  className={`py-1.5 px-3 text-sm font-medium rounded-lg border transition-colors ${
                    duration === opt.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRightLeft className="w-4 h-4" />
              {isSubmitting ? 'Converting...' : 'Convert to Service'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
