import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import {
  DollarSign,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { BottomSheetHeader } from '../ui/BottomSheet';

interface MenuItem {
  key: string;
  labelKey: string;
  icon: React.FC<{ className?: string }>;
  path: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { key: 'finance', labelKey: 'nav.finance', icon: DollarSign, path: '/finance', roles: ['choir_leader', 'treasurer', 'super_admin'] },
  { key: 'messages', labelKey: 'nav.messages', icon: MessageSquare, path: '/messages' },
  { key: 'documents', labelKey: 'nav.documents', icon: FileText, path: '/documents' },
  { key: 'reports', labelKey: 'nav.reports', icon: BarChart3, path: '/reports' },
  { key: 'settings', labelKey: 'nav.settings', icon: Settings, path: '/settings' },
];

export const MoreMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { closeBottomSheet } = useUIStore();
  const { choirMember } = useAuthStore();

  const hasAccess = (item: MenuItem) => {
    if (!item.roles) return true;
    return item.roles.includes(choirMember?.role || '');
  };

  const handleNavigate = (path: string, accessible: boolean) => {
    if (!accessible) return;
    closeBottomSheet();
    navigate(path);
  };

  return (
    <div>
      <BottomSheetHeader title={t('nav.more')} />
      
      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const accessible = hasAccess(item);

          return (
            <button
              key={item.key}
              onClick={() => handleNavigate(item.path, accessible)}
              className={cn(
                'flex items-center gap-4 w-full p-4 rounded-xl transition-colors',
                accessible
                  ? 'hover:bg-[var(--bg-hover)] active:bg-[var(--border-light)]'
                  : 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className={cn(
                'flex items-center justify-center h-10 w-10 rounded-lg',
                item.key === 'finance' 
                  ? 'bg-[var(--finance-header)] text-white'
                  : 'bg-[var(--primary-container)] text-[var(--on-primary-container)]'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1 text-left">
                <span className="text-sm font-medium text-[var(--text-main)]">
                  {t(item.labelKey)}
                </span>
              </div>

              {accessible ? (
                <ChevronRight className="h-5 w-5 text-[var(--text-subtle)]" />
              ) : (
                <Lock className="h-4 w-4 text-[var(--text-subtle)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
