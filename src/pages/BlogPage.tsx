import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Check,
  X,
  Star,
  EyeOff,
  MessageSquare,
  Heart,
  Filter,
  FileText,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { blogService, BlogPost } from '@/services/blog.service';
import { BlogPostModal } from '@/components/ui/BlogPostModal';
import { BlogDetailModal } from '@/components/ui/BlogDetailModal';

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
  hidden: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800',
};

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState<any>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);

  // Rejection
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectPostId, setRejectPostId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogService.getAllPosts({
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      if (res.success) {
        setPosts(res.data);
        if (res.meta?.pagination) {
          setTotalPages(res.meta.pagination.totalPages);
          setTotalItems(res.meta.pagination.totalItems);
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  const fetchStats = async () => {
    try {
      const res = await blogService.getStats();
      if (res.success) setStats(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await blogService.approvePost(id);
      toast.success('Post approved and published');
      fetchPosts();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      await blogService.rejectPost(rejectPostId, rejectReason);
      toast.success('Post rejected');
      setShowRejectModal(false);
      setRejectReason('');
      fetchPosts();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    }
  };

  const handleHide = async (id: string) => {
    try {
      await blogService.hidePost(id);
      toast.success('Post hidden');
      fetchPosts();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to hide');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await blogService.deletePost(id);
      toast.success('Post deleted');
      fetchPosts();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await blogService.toggleFeatured(id);
      toast.success('Featured status toggled');
      fetchPosts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to toggle featured');
    }
  };

  const handlePostSaved = () => {
    setShowCreateModal(false);
    setEditPost(null);
    fetchPosts();
    fetchStats();
  };

  const handleView = async (id: string) => {
    try {
      const res = await blogService.getPostById(id);
      if (res.success) {
        setSelectedPost(res.data.post);
        setShowDetailModal(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load post');
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await blogService.getPostById(id);
      if (res.success) {
        setEditPost(res.data.post);
        setShowCreateModal(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load post');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create, manage, and moderate blog posts
          </p>
        </div>
        <button
          onClick={() => {
            setEditPost(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: FileText, color: 'text-blue-600 bg-blue-50' },
            { label: 'Published', value: stats.published, icon: Check, color: 'text-green-600 bg-green-50' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Draft', value: stats.draft, icon: Edit2, color: 'text-gray-600 bg-gray-50' },
            { label: 'Hidden', value: stats.hidden, icon: EyeOff, color: 'text-orange-600 bg-orange-50' },
            { label: 'Views', value: stats.totalViews, icon: Eye, color: 'text-purple-600 bg-purple-50' },
            { label: 'Reactions', value: stats.totalReactions, icon: Heart, color: 'text-pink-600 bg-pink-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {stat.value?.toLocaleString() || 0}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No blog posts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Post</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Author</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Engagement</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="max-w-[250px]">
                          <p className="font-medium text-gray-900 truncate">{post.title}</p>
                          <p className="text-xs text-gray-500 truncate">{post.excerpt}</p>
                          {post.isFeatured && (
                            <span className="inline-flex items-center gap-1 text-xs text-yellow-600 mt-0.5">
                              <Star className="w-3 h-3 fill-yellow-500" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {post.author?.firstName} {post.author?.lastName}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[post.status]}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{post.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {post.commentsCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(post.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(post._id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(post._id)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {post.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(post._id)}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setRejectPostId(post._id);
                                setShowRejectModal(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {post.status === 'published' && (
                          <button
                            onClick={() => handleHide(post._id)}
                            className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500"
                            title="Hide"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleFeatured(post._id)}
                          className={`p-1.5 rounded-lg ${
                            post.isFeatured
                              ? 'text-yellow-500 hover:bg-yellow-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={post.isFeatured ? 'Unfeature' : 'Feature'}
                        >
                          <Star className={`w-4 h-4 ${post.isFeatured ? 'fill-yellow-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-500">
              Showing {(page - 1) * 10 + 1} - {Math.min(page * 10, totalItems)} of {totalItems}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Reject Post</h3>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <BlogPostModal
          post={editPost}
          onClose={() => {
            setShowCreateModal(false);
            setEditPost(null);
          }}
          onSaved={handlePostSaved}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPost && (
        <BlogDetailModal
          post={selectedPost}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPost(null);
          }}
          onToggleComment={async (postId, commentId) => {
            await blogService.toggleCommentVisibility(postId, commentId);
            toast.success('Comment visibility toggled');
            // Refresh the post
            const res = await blogService.getPostById(postId);
            if (res.success) setSelectedPost(res.data.post);
          }}
        />
      )}
    </div>
  );
};
