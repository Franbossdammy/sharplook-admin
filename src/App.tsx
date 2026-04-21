import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/layouts/MainLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsersPage } from '@/pages/UsersPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { ROUTES } from '@/utils/constants';
import { Loading } from '@/components/ui/Loading';
import { ProductsPage } from './pages/ProductPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DisputesPage } from './pages/DisputePage';
import { OrdersPage } from './pages/OrdersPage';
import { OffersPage } from './pages/OffersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { WithdrawalsPage } from './pages/WIthdrawalsPage';
import RedFlagsPage from './pages/RedFlagsPage';
import { BookingsPage } from './pages/BookingsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { AdminManagementPage } from './pages/AdminManagementPage';
import { BlogPage } from './pages/BlogPage';
import { AppSettingsPage } from './pages/AppSettingsPage';
import { WalletTopUpPage } from './pages/WalletTopUpPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading size="lg" text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

// Role-Based Route Component
const RoleBasedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // Super admin can access everything
  if (user?.role === 'super_admin') return <>{children}</>;

  // If no role restrictions, allow all authenticated users
  if (!allowedRoles) return <>{children}</>;

  // Check if user's role is in the allowed list
  if (user?.role && allowedRoles.includes(user.role)) return <>{children}</>;

  return <Navigate to={ROUTES.DASHBOARD} replace />;
};

// App Routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <LoginPage />}
      />
      <Route
        path={ROUTES.HOME}
        element={<Navigate to={ROUTES.DASHBOARD} replace />}
      />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'financial_admin', 'analytics_admin', 'support']}>
                <DashboardPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.USERS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'support', 'analytics_admin']}>
                <UsersPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CATEGORIES}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin']}>
                <CategoriesPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SERVICES}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin']}>
                <ServicesPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PRODUCTS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin']}>
                <ProductsPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.BOOKINGS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'support']}>
                <BookingsPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ANALYTICS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'financial_admin', 'analytics_admin']}>
                <AnalyticsPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DISPUTES}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'support']}>
                <DisputesPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ORDERS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'support']}>
                <OrdersPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.OFFERS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin']}>
                <OffersPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.REVIEWS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'support']}>
                <ReviewsPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.NOTIFICATIONS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin']}>
                <NotificationsPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TRANSACTIONS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'financial_admin']}>
                <TransactionsPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.WITHDRAWALS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'financial_admin']}>
                <WithdrawalsPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.REFERRALS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin']}>
                <ReferralsPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SUBSCRIPTIONS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'financial_admin']}>
                <SubscriptionsPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.REDFLAGS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'support']}>
                <RedFlagsPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_MANAGEMENT}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminManagementPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.AUDIT_LOGS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin']}>
                <AuditLogsPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.WALLET_TOPUP}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'financial_admin']}>
                <WalletTopUpPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.BLOG}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin', 'support', 'content_admin', 'analytics_admin']}>
                <BlogPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.APP_SETTINGS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <RoleBasedRoute allowedRoles={['admin']}>
                <AppSettingsPage />
              </RoleBasedRoute>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
