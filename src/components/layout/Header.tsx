import React from 'react';
import { LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
  admin: { label: 'Admin', color: 'bg-primary-100 text-primary-700' },
  financial_admin: { label: 'Finance', color: 'bg-green-100 text-green-700' },
  analytics_admin: { label: 'Analytics', color: 'bg-blue-100 text-blue-700' },
  support: { label: 'Support', color: 'bg-amber-100 text-amber-700' },
  content_admin: { label: 'Content', color: 'bg-indigo-100 text-indigo-700' },
};

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const roleInfo = user?.role ? ROLE_LABELS[user.role] : null;
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="px-5 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">LookReal</h1>
            <p className="text-[11px] text-gray-400 leading-tight">Admin Dashboard</p>
          </div>
        </div>

        {/* Right — admin info + logout */}
        <div className="flex items-center space-x-3">
          {user && (
            <div className="flex items-center space-x-2.5">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary-700">{initials}</span>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                {roleInfo && (
                  <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="w-px h-6 bg-gray-200" />

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
