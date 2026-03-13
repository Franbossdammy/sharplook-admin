import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category, CreateCategoryDto } from '@/types/category.types';

const ICON_OPTIONS = [
  { name: 'cleaning', emoji: '🧹', label: 'Cleaning' },
  { name: 'plumbing', emoji: '🔧', label: 'Plumbing' },
  { name: 'electrical', emoji: '⚡', label: 'Electrical' },
  { name: 'painting', emoji: '🎨', label: 'Painting' },
  { name: 'carpentry', emoji: '🪚', label: 'Carpentry' },
  { name: 'laundry', emoji: '👔', label: 'Laundry' },
  { name: 'gardening', emoji: '🌱', label: 'Gardening' },
  { name: 'moving', emoji: '📦', label: 'Moving' },
  { name: 'beauty', emoji: '💇', label: 'Beauty' },
  { name: 'auto', emoji: '🚗', label: 'Auto' },
  { name: 'tech', emoji: '💻', label: 'Tech' },
  { name: 'tutoring', emoji: '📚', label: 'Tutoring' },
  { name: 'fitness', emoji: '💪', label: 'Fitness' },
  { name: 'cooking', emoji: '🍳', label: 'Cooking' },
  { name: 'photography', emoji: '📷', label: 'Photography' },
  { name: 'tailoring', emoji: '🧵', label: 'Tailoring' },
  { name: 'pest-control', emoji: '🐛', label: 'Pest Control' },
  { name: 'ac-repair', emoji: '❄️', label: 'AC Repair' },
  { name: 'security', emoji: '🔒', label: 'Security' },
  { name: 'delivery', emoji: '🚚', label: 'Delivery' },
];

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryDto) => Promise<boolean>;
  category?: Category | null;
  title: string;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  title,
}) => {
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
    icon: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customIcon, setCustomIcon] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        icon: category.icon,
      });
      // If the category icon is not in predefined list, set it as custom
      if (!ICON_OPTIONS.find((opt) => opt.name === category.icon)) {
        setCustomIcon(category.icon);
      } else {
        setCustomIcon('');
      }
    } else {
      setFormData({ name: '', description: '', icon: '' });
      setCustomIcon('');
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await onSubmit(formData);

    setIsSubmitting(false);

    if (success) {
      onClose();
      setFormData({ name: '', description: '', icon: '' });
      setCustomIcon('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconSelect = (iconName: string) => {
    setFormData((prev) => ({ ...prev, icon: iconName }));
    setCustomIcon('');
  };

  const handleCustomIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomIcon(value);
    setFormData((prev) => ({ ...prev, icon: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Home Cleaning"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="e.g., Professional cleaning services"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2 mb-3 max-h-48 overflow-y-auto p-1">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => handleIconSelect(opt.name)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-center ${
                        formData.icon === opt.name
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="text-[10px] text-gray-600 leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <input
                    type="text"
                    value={customIcon}
                    onChange={handleCustomIconChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Or type a custom icon name..."
                  />
                </div>
                {formData.icon && (
                  <p className="mt-1 text-xs text-primary-600">
                    Selected: <span className="font-medium">{formData.icon}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.icon}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
