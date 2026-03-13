import React, { useState } from 'react';
import { Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Category } from '@/types/category.types';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onToggleStatus: (categoryId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(category.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">
              {({
                cleaning: '🧹', plumbing: '🔧', electrical: '⚡', painting: '🎨',
                carpentry: '🪚', laundry: '👔', gardening: '🌱', moving: '📦',
                beauty: '💇', auto: '🚗', tech: '💻', tutoring: '📚',
                fitness: '💪', cooking: '🍳', photography: '📷', tailoring: '🧵',
                'pest-control': '🐛', 'ac-repair': '❄️', security: '🔒', delivery: '🚚',
              } as Record<string, string>)[category.icon] || '📋'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                category.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(category)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onToggleStatus(category.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          {category.isActive ? (
            <>
              <ToggleRight className="w-4 h-4" />
              Disable
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4" />
              Enable
            </>
          )}
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Category</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{category.name}"? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};