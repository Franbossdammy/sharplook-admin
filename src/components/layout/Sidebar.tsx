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
  LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  allowedRoles?: string[]; // if undefined, all admin roles can see it
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: ROUTES.DASHBOARD },
  { id: 'users', label: 'Users', icon: Users, path: ROUTES.USERS, allowedRoles: ['super_admin', 'admin', 'support'] },
  { id: 'categories', label: 'Categories', icon: FolderTree, path: ROUTES.CATEGORIES, allowedRoles: ['super_admin', 'admin'] },
  { id: 'services', label: 'Services', icon: Briefcase, path: ROUTES.SERVICES, allowedRoles: ['super_admin', 'admin'] },
  { id: 'products', label: 'Products', icon: Package, path: ROUTES.PRODUCTS, allowedRoles: ['super_admin', 'admin'] },
  { id: 'bookings', label: 'Bookings', icon: Calendar, path: ROUTES.BOOKINGS, allowedRoles: ['super_admin', 'admin', 'support'] },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, path: ROUTES.ORDERS, allowedRoles: ['super_admin', 'admin', 'support'] },
  { id: 'offers', label: 'Offers', icon: Tag, path: ROUTES.OFFERS, allowedRoles: ['super_admin', 'admin'] },
  { id: 'reviews', label: 'Reviews', icon: Star, path: ROUTES.REVIEWS, allowedRoles: ['super_admin', 'admin', 'support'] },
  { id: 'disputes', label: 'Disputes', icon: MessageSquare, path: ROUTES.DISPUTES, allowedRoles: ['super_admin', 'admin', 'support'] },
  { id: 'transactions', label: 'Transactions', icon: CreditCard, path: ROUTES.TRANSACTIONS, allowedRoles: ['super_admin', 'admin', 'financial_admin'] },
  { id: 'withdrawals', label: 'Withdrawals', icon: Wallet, path: ROUTES.WITHDRAWALS, allowedRoles: ['super_admin', 'admin', 'financial_admin'] },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: ROUTES.NOTIFICATIONS, allowedRoles: ['super_admin', 'admin'] },
  { id: 'referrals', label: 'Referrals', icon: Gift, path: ROUTES.REFERRALS, allowedRoles: ['super_admin', 'admin'] },
  { id: 'subscriptions', label: 'Subscriptions', icon: Crown, path: ROUTES.SUBSCRIPTIONS, allowedRoles: ['super_admin', 'admin', 'financial_admin'] },
  { id: 'redflags', label: 'Red Flags', icon: AlertTriangle, path: ROUTES.REDFLAGS, allowedRoles: ['super_admin', 'admin', 'support'] },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: ROUTES.ANALYTICS, allowedRoles: ['super_admin', 'admin', 'financial_admin', 'analytics_admin'] },
  { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList, path: ROUTES.AUDIT_LOGS, allowedRoles: ['super_admin', 'admin'] },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const visibleItems = navItems.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!user?.role) return false;
    return item.allowedRoles.includes(user.role);
  });

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
      <nav className="p-4 space-y-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
