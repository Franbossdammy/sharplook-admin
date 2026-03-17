import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/utils/constants';

export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
  images: string[];
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  category: string;
  tags: string[];
  status: 'draft' | 'pending' | 'published' | 'hidden' | 'rejected';
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email?: string;
  };
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  publishedAt?: string;
  views: number;
  likesCount: number;
  commentsCount: number;
  reactions: Array<{
    user: string;
    type: string;
    createdAt: string;
  }>;
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    content: string;
    isApproved: boolean;
    isHidden: boolean;
    createdAt: string;
  }>;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogPostsResponse {
  success: boolean;
  message: string;
  data: BlogPost[];
  meta?: {
    pagination: {
      currentPage: number;
      totalPages: number;
      pageSize: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

interface BlogPostResponse {
  success: boolean;
  message: string;
  data: {
    post: BlogPost;
  };
}

interface BlogStatsResponse {
  success: boolean;
  data: {
    total: number;
    published: number;
    pending: number;
    draft: number;
    hidden: number;
    totalViews: number;
    totalReactions: number;
  };
}

class BlogService {
  async getAllPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<BlogPostsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    return apiService.get<BlogPostsResponse>(
      `${API_ENDPOINTS.BLOG_ADMIN}?${query.toString()}`
    );
  }

  async getPendingPosts(page: number = 1, limit: number = 10): Promise<BlogPostsResponse> {
    return apiService.get<BlogPostsResponse>(
      `${API_ENDPOINTS.BLOG_ADMIN_PENDING}?page=${page}&limit=${limit}`
    );
  }

  async getPostById(id: string): Promise<BlogPostResponse> {
    return apiService.get<BlogPostResponse>(API_ENDPOINTS.BLOG_ADMIN_BY_ID(id));
  }

  async createPost(data: FormData): Promise<BlogPostResponse> {
    return apiService.post<BlogPostResponse>(API_ENDPOINTS.BLOG_ADMIN, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async updatePost(id: string, data: FormData): Promise<BlogPostResponse> {
    return apiService.put<BlogPostResponse>(API_ENDPOINTS.BLOG_ADMIN_BY_ID(id), data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async deletePost(id: string): Promise<{ success: boolean }> {
    return apiService.delete<{ success: boolean }>(API_ENDPOINTS.BLOG_ADMIN_BY_ID(id));
  }

  async approvePost(id: string): Promise<BlogPostResponse> {
    return apiService.post<BlogPostResponse>(API_ENDPOINTS.BLOG_APPROVE(id));
  }

  async rejectPost(id: string, reason: string): Promise<BlogPostResponse> {
    return apiService.post<BlogPostResponse>(API_ENDPOINTS.BLOG_REJECT(id), { reason });
  }

  async hidePost(id: string): Promise<BlogPostResponse> {
    return apiService.post<BlogPostResponse>(API_ENDPOINTS.BLOG_HIDE(id));
  }

  async toggleFeatured(id: string): Promise<BlogPostResponse> {
    return apiService.post<BlogPostResponse>(API_ENDPOINTS.BLOG_FEATURE(id));
  }

  async toggleCommentVisibility(postId: string, commentId: string): Promise<any> {
    return apiService.post(API_ENDPOINTS.BLOG_TOGGLE_COMMENT(postId, commentId));
  }

  async getStats(): Promise<BlogStatsResponse> {
    return apiService.get<BlogStatsResponse>(API_ENDPOINTS.BLOG_ADMIN_STATS);
  }
}

export const blogService = new BlogService();
