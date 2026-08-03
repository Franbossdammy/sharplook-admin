import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  FolderTree,
  Briefcase,
  Package,
  Calendar,
  ShoppingCart,
  Tag,
  Star,
  MessageSquare,
  CreditCard,
  Wallet,
  Bell,
  Gift,
  Crown,
  AlertTriangle,
  TrendingUp,
  ClipboardList,
  Shield,
  FileText,
  Settings,
  PlusCircle,
  LucideIcon,
  ChevronRight,
} from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  allowedRoles?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: ROUTES.DASHBOARD },
    ],
  },
  {
    label: 'People',
    items: [
      { id: 'users', label: 'Users & Vendors', icon: Users, path: ROUTES.USERS, allowedRoles: ['super_admin', 'admin', 'support', 'analytics_admin'] },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { id: 'categories', label: 'Categories', icon: FolderTree, path: ROUTES.CATEGORIES, allowedRoles: ['super_admin', 'admin'] },
      { id: 'services', label: 'Services', icon: Briefcase, path: ROUTES.SERVICES, allowedRoles: ['super_admin', 'admin'] },
      { id: 'products', label: 'Products', icon: Package, path: ROUTES.PRODUCTS, allowedRoles: ['super_admin', 'admin'] },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { id: 'bookings', label: 'Bookings', icon: Calendar, path: ROUTES.BOOKINGS, allowedRoles: ['super_admin', 'admin', 'support'] },
      { id: 'orders', label: 'Orders', icon: ShoppingCart, path: ROUTES.ORDERS, allowedRoles: ['super_admin', 'admin', 'support'] },
      { id: 'offers', label: 'Offers', icon: Tag, path: ROUTES.OFFERS, allowedRoles: ['super_admin', 'admin'] },
      { id: 'subscriptions', label: 'Subscriptions', icon: Crown, path: ROUTES.SUBSCRIPTIONS, allowedRoles: ['super_admin', 'admin', 'financial_admin'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'transactions', label: 'Transactions', icon: CreditCard, path: ROUTES.TRANSACTIONS, allowedRoles: ['super_admin', 'admin', 'financial_admin'] },
      { id: 'withdrawals', label: 'Withdrawals', icon: Wallet, path: ROUTES.WITHDRAWALS, allowedRoles: ['super_admin', 'admin', 'financial_admin'] },
      { id: 'wallet-topup', label: 'Wallet Top-Up', icon: PlusCircle, path: ROUTES.WALLET_TOPUP, allowedRoles: ['super_admin', 'admin', 'financial_admin'] },
    ],
  },
  {
    label: 'Support',
    items: [
      { id: 'reviews', label: 'Reviews', icon: Star, path: ROUTES.REVIEWS, allowedRoles: ['super_admin', 'admin', 'support'] },
      { id: 'disputes', label: 'Disputes', icon: MessageSquare, path: ROUTES.DISPUTES, allowedRoles: ['super_admin', 'admin', 'support'] },
      { id: 'redflags', label: 'Red Flags', icon: AlertTriangle, path: ROUTES.REDFLAGS, allowedRoles: ['super_admin', 'admin', 'support'] },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell, path: ROUTES.NOTIFICATIONS, allowedRoles: ['super_admin', 'admin'] },
      { id: 'referrals', label: 'Referrals', icon: Gift, path: ROUTES.REFERRALS, allowedRoles: ['super_admin', 'admin'] },
      { id: 'blog', label: 'Blog', icon: FileText, path: ROUTES.BLOG, allowedRoles: ['super_admin', 'admin', 'support', 'content_admin', 'analytics_admin'] },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: ROUTES.ANALYTICS, allowedRoles: ['super_admin', 'admin', 'financial_admin', 'analytics_admin'] },
      { id: 'admin-management', label: 'Admin Management', icon: Shield, path: ROUTES.ADMIN_MANAGEMENT, allowedRoles: ['super_admin', 'admin'] },
      { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList, path: ROUTES.AUDIT_LOGS, allowedRoles: ['super_admin', 'admin'] },
      { id: 'app-settings', label: 'App Settings', icon: Settings, path: ROUTES.APP_SETTINGS, allowedRoles: ['super_admin', 'admin'] },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const isItemVisible = (item: NavItem) => {
    if (!item.allowedRoles) return true;
    if (!user?.role) return false;
    return item.allowedRoles.includes(user.role);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen sticky top-16 flex-shrink-0">
      <nav className="pb-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(isItemVisible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-1">
              <p className="px-5 pt-5 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                {group.label}
              </p>
              <div className="space-y-0.5 px-3">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `group w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-150 ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center space-x-2.5">
                          <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                            isActive
                              ? 'bg-primary-100 text-primary-600'
                              : 'text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-100'
                          }`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                            {item.label}
                          </span>
                        </div>
                        {isActive && (
                          <ChevronRight className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mx-3 mt-6 p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-100">
          <p className="text-xs font-bold text-primary-700">LookReal Admin</p>
          <p className="text-xs text-primary-500 mt-0.5">v2.3 · Beauty Platform</p>
        </div>
      </nav>
    </aside>
  );
};
