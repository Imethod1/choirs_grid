import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { ChevronLeft, Bell, Sun, Moon, Globe } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export const TopBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, isFinanceModule, language, setLanguage } = useUIStore();
  const { user } = useAuthStore();

  // Determine page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return t('nav.dashboard');
    if (path.startsWith('/members')) return t('nav.members');
    if (path.startsWith('/events')) return t('nav.events');
    if (path.startsWith('/finance')) return t('nav.finance');
    if (path.startsWith('/messages')) return t('nav.messages');
    if (path.startsWith('/music')) return t('nav.music');
    if (path.startsWith('/documents')) return t('nav.documents');
    if (path.startsWith('/reports')) return t('nav.reports');
    if (path.startsWith('/settings')) return t('nav.settings');
    return t('common.app_name');
  };

  // Check if we should show back button
  const showBackButton = location.pathname !== '/';

  // Toggle language
  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'sw' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  // Check if dark mode
  const isDark = theme === 'dark';

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b lg:hidden transition-theme backdrop-blur-md',
        isFinanceModule
          ? 'bg-[var(--finance-header)]/95 border-[var(--border-light)]'
          : 'bg-[var(--bg-surface)]/90 border-[var(--border-light)]'
      )}
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className={cn(
              'flex items-center justify-center h-9 w-9 rounded-lg transition-colors',
              isFinanceModule
                ? 'text-white hover:bg-white/10'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <h1
          className={cn(
            'text-lg font-semibold',
            isFinanceModule ? 'text-white' : 'text-[var(--text-main)]'
          )}
        >
          {getPageTitle()}
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={handleLanguageToggle}
          className={cn(
            'flex items-center justify-center h-9 px-2 rounded-lg transition-colors text-xs font-medium',
            isFinanceModule
              ? 'text-white/80 hover:bg-white/10'
              : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
          )}
        >
          <Globe className="h-4 w-4 mr-1" />
          {language.toUpperCase()}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center justify-center h-9 w-9 rounded-lg transition-colors',
            isFinanceModule
              ? 'text-white/80 hover:bg-white/10'
              : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
          )}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <button
          className={cn(
            'relative flex items-center justify-center h-9 w-9 rounded-lg transition-colors',
            isFinanceModule
              ? 'text-white/80 hover:bg-white/10'
              : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
          )}
        >
          <Bell className="h-5 w-5" />
          {/* Notification badge */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-error)]" />
        </button>

        {/* User avatar - visible on desktop only in topbar */}
        <div className="hidden sm:block">
          <Avatar name={user?.full_name || 'User'} size="sm" />
        </div>
      </div>
    </header>
  );
};
