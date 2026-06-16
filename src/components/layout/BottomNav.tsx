import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Music,
  MoreHorizontal,
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { MoreMenu } from './MoreMenu';

interface NavItem {
  key: string;
  labelKey: string;
  icon: React.FC<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  { key: 'home', labelKey: 'nav.dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'members', labelKey: 'nav.members', icon: Users, path: '/members' },
  { key: 'events', labelKey: 'nav.events', icon: Calendar, path: '/events' },
  { key: 'music', labelKey: 'nav.music', icon: Music, path: '/music' },
];

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { openBottomSheet } = useUIStore();

  const handleMoreClick = () => {
    openBottomSheet(<MoreMenu />);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-[var(--bg-surface)] border-t border-[var(--border-light)] safe-bottom transition-theme">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-lg transition-colors touch-feedback relative',
                isActive
                  ? 'text-[var(--action-primary)]'
                  : 'text-[var(--text-muted)]'
              )}
            >
              <Icon className={cn('h-6 w-6', isActive && 'text-[var(--action-primary)]')} />
              <span className={cn(
                'text-[10px] mt-1 font-medium',
                isActive ? 'text-[var(--action-primary)]' : 'text-[var(--text-muted)]'
              )}>
                {t(item.labelKey)}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-[var(--action-primary)]" />
              )}
            </NavLink>
          );
        })}
        
        {/* More button */}
        <button
          onClick={handleMoreClick}
          className="flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-lg text-[var(--text-muted)] touch-feedback"
        >
          <MoreHorizontal className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">{t('nav.more')}</span>
        </button>
      </div>
    </nav>
  );
};
