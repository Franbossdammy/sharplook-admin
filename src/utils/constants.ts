// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  VENDOR_DETAILS : (id:string)=> `users/vendors/${id}`,
  VERIFY_VENDOR: (id: string) => `/users/${id}/verify-vendor`,
  CREATE_ADMIN: '/users/admin',
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
  TOGGLE_CATEGORY: (id: string) => `/categories/${id}/toggle`,
  
  // Services
  SERVICES: '/services',
  SERVICE_BY_ID: (id: string) => `/services/${id}`,
  SERVICE_IMAGES: (id: string) => `/services/${id}/images`,
  SERVICE_IMAGE_BY_ID: (serviceId: string, imageId: string) => `/services/${serviceId}/images/${imageId}`,
  SERVICE_APPROVE: (id: string) => `/services/${id}/approve`,
  SERVICE_REJECT: (id: string) => `/services/${id}/reject`,
  SERVICE_ADMIN_STATS: '/services/admin/stats',
  SERVICE_PENDING: '/services/admin/pending',
  SERVICE_TRENDING: '/services/trending',
  SERVICE_POPULAR_BY_CATEGORY: (categoryId: string) => `/services/popular/${categoryId}`,
  SERVICE_SEARCH: '/services/search',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  PRODUCT_FEATURED: '/products/featured',
  PRODUCT_SPONSORED: '/products/sponsored',
  PRODUCT_MY_PRODUCTS: '/products/seller/my-products',
  PRODUCT_UPDATE_STOCK: (id: string) => `/products/${id}/stock`,
  PRODUCT_ADMIN_PENDING: '/products/admin/pending',
  PRODUCT_ADMIN_REJECTED: '/products/admin/rejected',
  PRODUCT_ADMIN_STATS: '/products/admin/stats',
  PRODUCT_APPROVE: (id: string) => `/products/${id}/approve`,
  PRODUCT_REJECT: (id: string) => `/products/${id}/reject`,
  PRODUCT_FEATURE: (id: string) => `/products/${id}/feature`,
  PRODUCT_SPONSOR: (id: string) => `/products/${id}/sponsor`,
  PRODUCT_CONVERT_TO_SERVICE: (id: string) => `/products/${id}/convert-to-service`,
  
  // Analytics
  DASHBOARD: '/analytics/dashboard',
  USER_ANALYTICS: '/analytics/users',
  BOOKING_ANALYTICS: '/analytics/bookings',
  REVENUE_ANALYTICS: '/analytics/revenue',
  SERVICE_ANALYTICS: '/analytics/services',
  VENDOR_ANALYTICS: '/analytics/vendors',
  DISPUTE_ANALYTICS: '/analytics/disputes',
  REFERRAL_ANALYTICS: '/analytics/referrals',
  ACQUISITION_ANALYTICS: '/analytics/acquisition',
  USER_DETAILS_ANALYTICS: '/analytics/users/details',
  EXPORT_USER_DATA: '/analytics/users/export',
  EXPORT_ANALYTICS: (type: string) => `/analytics/export/${type}`,
  
  // Disputes
  DISPUTES: '/disputes',
  DISPUTE_BY_ID: (id: string) => `/disputes/${id}`,
  RESOLVE_DISPUTE: (id: string) => `/disputes/${id}/resolve`,

  
  
  
  // Referrals
  REFERRALS: '/referrals',
  REFERRAL_STATS: '/referrals/admin/stats',
  RED_FLAGS: '/redFlags',

  // Bookings (admin)
  BOOKINGS: '/bookings',
  BOOKING_BY_ID: (id: string) => `/bookings/${id}`,
  BOOKING_STATS: '/bookings/stats',

  // Reviews (admin)
  REVIEWS: '/reviews',
  REVIEW_BY_ID: (id: string) => `/reviews/${id}`,
  REVIEW_APPROVE: (id: string) => `/reviews/${id}/approve`,
  REVIEW_HIDE: (id: string) => `/reviews/${id}/hide`,
  REVIEW_UNHIDE: (id: string) => `/reviews/${id}/unhide`,

  // Subscriptions (admin)
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTION_STATS: '/subscriptions/stats',

  // Bookings for offers
  BOOKING_OFFERS: '/bookings/offers',

  // Orders (admin)
  ORDERS_ALL: '/orders',

  // Notifications admin
  NOTIFICATION_SEND_ALL: '/notifications/admin/send-to-all',
  NOTIFICATION_SEND_USERS: '/notifications/admin/send-to-users',
  NOTIFICATION_ADMIN_STATS: '/notifications/admin/stats',
  NOTIFICATION_ADMIN_ALL: '/notifications/admin/all',

  // Audit Logs
  AUDIT_LOGS: '/audit-logs',

  // Wallet Admin
  WALLET_CREDIT: '/payments/wallet/fund/credit',
  WALLET_DEBIT: '/payments/wallet/fund/debit',

  // Blog
  BLOG_ADMIN: '/blog/admin',
  BLOG_ADMIN_PENDING: '/blog/admin/pending',
  BLOG_ADMIN_STATS: '/blog/admin/stats',
  BLOG_ADMIN_BY_ID: (id: string) => `/blog/admin/${id}`,
  BLOG_APPROVE: (id: string) => `/blog/admin/${id}/approve`,
  BLOG_REJECT: (id: string) => `/blog/admin/${id}/reject`,
  BLOG_HIDE: (id: string) => `/blog/admin/${id}/hide`,
  BLOG_FEATURE: (id: string) => `/blog/admin/${id}/feature`,
  BLOG_TOGGLE_COMMENT: (postId: string, commentId: string) => `/blog/admin/${postId}/comment/${commentId}/toggle`,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sharplook_admin_token',
  REFRESH_TOKEN: 'sharplook_admin_refresh_token',
  USER_DATA: 'sharplook_admin_user',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  CATEGORIES: '/categories',
  SERVICES: '/services',
  PRODUCTS: '/products', // Add this
  ANALYTICS: '/analytics',
  DISPUTES: '/disputes',
  REFERRALS: '/referrals',
  ORDERS: '/orders',
  OFFERS: '/offers',
  NOTIFICATIONS: '/notifications',
  TRANSACTIONS: '/transactions',
  WITHDRAWALS: '/withdrawals',
  REDFLAGS: '/redFlags',
  BOOKINGS: '/bookings',
  REVIEWS: '/reviews',
  SUBSCRIPTIONS: '/subscriptions',
  ADMIN_MANAGEMENT: '/admin-management',
  AUDIT_LOGS: '/audit-logs',
  WALLET_TOPUP: '/wallet-topup',
  BLOG: '/blog',
  APP_SETTINGS: '/app-settings',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  FINANCIAL_ADMIN: 'financial_admin',
  ANALYTICS_ADMIN: 'analytics_admin',
  SUPPORT: 'support',
  USER: 'user',
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
  CLIENT: 'client',
} as const;

// Product Conditions
export const PRODUCT_CONDITIONS = {
  NEW: 'new',
  USED: 'used',
  REFURBISHED: 'refurbished',
} as const;

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
} as const;

// Approval Status
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;