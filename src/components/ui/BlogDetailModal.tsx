import React from 'react';
import {
  X,
  Eye,
  Star,
  Calendar,
  User,
  Tag,
  Hash,
  EyeOff,
  Check,
} from 'lucide-react';
import { BlogPost } from '@/services/blog.service';

interface Props {
  post: BlogPost;
  onClose: () => void;
  onToggleComment: (postId: string, commentId: string) => void;
}

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
  hidden: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800',
};

export const BlogDetailModal: React.FC<Props> = ({ post, onClose, onToggleComment }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const reactionCounts = {
    like: post.reactions?.filter(r => r.type === 'like').length || 0,
    love: post.reactions?.filter(r => r.type === 'love').length || 0,
    insightful: post.reactions?.filter(r => r.type === 'insightful').length || 0,
    helpful: post.reactions?.filter(r => r.type === 'helpful').length || 0,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8">
      <div className="bg-white rounded-xl w-full max-w-4xl mx-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Blog Post Details</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Cover Image */}
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}

          {/* Title & Status */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[post.status]}`}>
                {post.status}
              </span>
              {post.isFeatured && (
                <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                  <Star className="w-3 h-3 fill-yellow-500" /> Featured
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
            <p className="text-gray-500 mt-2">{post.excerpt}</p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{post.author?.firstName} {post.author?.lastName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>{post.views} views</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tag className="w-4 h-4" />
              <span>{post.category}</span>
            </div>
          </div>

          {/* Reactions Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Reactions ({post.likesCount})</h3>
            <div className="flex gap-4">
              <span className="text-sm">👍 {reactionCounts.like}</span>
              <span className="text-sm">❤️ {reactionCounts.love}</span>
              <span className="text-sm">💡 {reactionCounts.insightful}</span>
              <span className="text-sm">🙌 {reactionCounts.helpful}</span>
            </div>
          </div>

          {/* Tags & Keywords */}
          <div className="space-y-3">
            {post.tags?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map(tag => (
                    <span key={tag} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {post.keywords?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">SEO Keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {post.keywords.map(kw => (
                    <span key={kw} className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                      <Hash className="w-3 h-3 inline mr-0.5" />{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SEO Info */}
          {(post.metaTitle || post.metaDescription) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">SEO Preview</h3>
              <p className="text-blue-700 text-sm font-medium">{post.metaTitle || post.title}</p>
              <p className="text-green-700 text-xs mt-0.5">{post.slug}</p>
              <p className="text-gray-600 text-sm mt-1">{post.metaDescription || post.excerpt}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {post.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-red-700 mb-1">Rejection Reason</h3>
              <p className="text-red-600 text-sm">{post.rejectionReason}</p>
            </div>
          )}

          {/* Content Preview */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">Content</h3>
            <div
              className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              Comments ({post.comments?.length || 0})
            </h3>
            {post.comments?.length > 0 ? (
              <div className="space-y-3">
                {post.comments.map((comment) => (
                  <div
                    key={comment._id}
                    className={`border rounded-lg p-3 ${
                      comment.isHidden ? 'bg-gray-50 border-gray-300 opacity-60' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {comment.user?.avatar ? (
                          <img src={comment.user.avatar} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">
                            {comment.user?.firstName?.[0]}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                        {comment.isHidden && (
                          <span className="text-xs text-orange-500 font-medium">Hidden</span>
                        )}
                      </div>
                      <button
                        onClick={() => onToggleComment(post._id, comment._id)}
                        className={`p-1 rounded hover:bg-gray-100 ${
                          comment.isHidden ? 'text-green-500' : 'text-orange-500'
                        }`}
                        title={comment.isHidden ? 'Show comment' : 'Hide comment'}
                      >
                        {comment.isHidden ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No comments yet</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
