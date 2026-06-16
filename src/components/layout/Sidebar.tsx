import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  Music,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  Lock,
  Music2,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface NavItem {
  key: string;
  labelKey: string;
  icon: React.FC<{ className?: string }>;
  path: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'members', labelKey: 'nav.members', icon: Users, path: '/members' },
  { key: 'events', labelKey: 'nav.events', icon: Calendar, path: '/events' },
  { key: 'finance', labelKey: 'nav.finance', icon: DollarSign, path: '/finance', roles: ['choir_leader', 'treasurer', 'super_admin'] },
  { key: 'messages', labelKey: 'nav.messages', icon: MessageSquare, path: '/messages' },
  { key: 'music', labelKey: 'nav.music', icon: Music, path: '/music' },
  { key: 'documents', labelKey: 'nav.documents', icon: FileText, path: '/documents' },
  { key: 'reports', labelKey: 'nav.reports', icon: BarChart3, path: '/reports' },
  { key: 'settings', labelKey: 'nav.settings', icon: Settings, path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { choir, choirMember, user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const hasAccess = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.includes(choirMember?.role || '');
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20',
        'bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]'
      )}
    >
      {/* Header — choir name & logo */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--sidebar-hover)]">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[var(--sidebar-active)]">
          <Music2 className="h-5 w-5 text-white" />
        </div>
        {sidebarOpen && (
          <div className="flex-1 min-w-0">
            <h1 className="text-[var(--sidebar-text)] font-bold truncate">
              {choir?.name || t('common.app_name')}
            </h1>
            <p className="text-xs text-[var(--sidebar-text-muted)] truncate">{choir?.parish}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const accessible = hasAccess(item);
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.key}
              to={accessible ? item.path : '#'}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                isActive
                  ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-text)]'
                  : 'text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]',
                !accessible && 'opacity-50 cursor-not-allowed'
              )}
              onClick={(e) => !accessible && e.preventDefault()}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', !sidebarOpen && 'mx-auto')} />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-sm font-medium">{t(item.labelKey)}</span>
                  {!accessible && <Lock className="h-4 w-4 opacity-50" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[var(--sidebar-hover)]">
        <div className="flex items-center gap-3">
          <Avatar name={user?.full_name || 'User'} size="sm" />
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--sidebar-text)] truncate">
                {user?.display_name || user?.full_name}
              </p>
              <p className="text-xs text-[var(--sidebar-text-muted)] capitalize">
                {choirMember?.role?.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'flex items-center justify-center p-2 m-3 rounded-lg transition-colors',
          'text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]'
        )}
      >
        <ChevronLeft className={cn('h-5 w-5 transition-transform', !sidebarOpen && 'rotate-180')} />
      </button>
    </aside>
  );
};
