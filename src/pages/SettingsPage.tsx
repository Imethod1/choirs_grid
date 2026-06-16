import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Shield, 
  Smartphone, 
  Globe, 
  Moon, 
  Sun,
  Bell,
  Wifi,
  LogOut,
  ChevronRight,
  Info,
  Monitor
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, language, setLanguage, lowDataMode, setLowDataMode } = useUIStore();
  const { user, choirMember, logout } = useAuthStore();

  const handleLanguageChange = () => {
    const newLang = language === 'en' ? 'sw' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="h-5 w-5" />;
    if (theme === 'system') return <Monitor className="h-5 w-5" />;
    return <Sun className="h-5 w-5" />;
  };

  const getThemeLabel = () => {
    if (theme === 'dark') return 'Dark';
    if (theme === 'system') return 'System';
    return 'Light';
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Profile card */}
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={user?.full_name || 'User'} size="xl" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--text-main)]">
              {user?.full_name}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">{user?.phone}</p>
            <div className="mt-2">
              <Badge variant="accent">
                {t(`roles.${choirMember?.role}`)}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile section */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">
          {t('settings.profile')}
        </h3>
        <Card padding="none" className="divide-y divide-[var(--border-light)]">
          <SettingRow icon={User} label={t('settings.profile')} description={user?.full_name} />
          <SettingRow icon={Shield} label={t('settings.privacy')} />
          <SettingRow icon={Smartphone} label={t('settings.devices')} />
        </Card>
      </div>

      {/* Preferences section */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">
          Preferences
        </h3>
        <Card padding="none" className="divide-y divide-[var(--border-light)]">
          <SettingToggle
            icon={Globe}
            label={t('settings.language')}
            value={language === 'en' ? 'English' : 'Kiswahili'}
            onClick={handleLanguageChange}
          />
          <SettingToggle
            icon={() => getThemeIcon()}
            label={t('settings.dark_mode')}
            value={getThemeLabel()}
            onClick={cycleTheme}
          />
          <SettingRow icon={Bell} label={t('settings.notifications')} />
          <SettingSwitch
            icon={Wifi}
            label={t('settings.low_data_mode')}
            description={t('settings.low_data_description')}
            checked={lowDataMode}
            onChange={() => setLowDataMode(!lowDataMode)}
          />
        </Card>
      </div>

      {/* About section */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">
          {t('settings.about')}
        </h3>
        <Card padding="none">
          <SettingRow icon={Info} label={t('settings.about')} value={`${t('settings.version')} 1.0.0`} />
        </Card>
      </div>

      {/* Logout button */}
      <Card padding="none">
        <button
          onClick={logout}
          className="flex items-center gap-4 p-4 w-full hover:bg-[var(--color-error-bg)] transition-colors rounded-[var(--radius-lg)]"
        >
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--color-error-bg)]">
            <LogOut className="h-5 w-5 text-[var(--color-error)]" />
          </div>
          <span className="font-medium text-[var(--color-error)]">
            {t('settings.logout')}
          </span>
        </button>
      </Card>
    </div>
  );
};

// Setting row component
interface SettingRowProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  description?: string;
  value?: string;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon: Icon, label, description, value }) => (
  <button className="flex items-center gap-4 p-4 w-full hover:bg-[var(--bg-hover)] transition-colors">
    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--bg-hover)]">
      <Icon className="h-5 w-5 text-[var(--text-muted)]" />
    </div>
    <div className="flex-1 text-left">
      <p className="font-medium text-[var(--text-main)]">{label}</p>
      {description && (
        <p className="text-xs text-[var(--text-muted)]">{description}</p>
      )}
    </div>
    {value && <span className="text-sm text-[var(--text-muted)]">{value}</span>}
    <ChevronRight className="h-5 w-5 text-[var(--text-subtle)]" />
  </button>
);

// Setting toggle component
interface SettingToggleProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
  onClick: () => void;
}

const SettingToggle: React.FC<SettingToggleProps> = ({ icon: Icon, label, value, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 p-4 w-full hover:bg-[var(--bg-hover)] transition-colors"
  >
    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--bg-hover)]">
      <Icon className="h-5 w-5 text-[var(--text-muted)]" />
    </div>
    <div className="flex-1 text-left">
      <p className="font-medium text-[var(--text-main)]">{label}</p>
    </div>
    <span className="text-sm text-[var(--text-muted)]">{value}</span>
    <ChevronRight className="h-5 w-5 text-[var(--text-subtle)]" />
  </button>
);

// Setting switch component
interface SettingSwitchProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}

const SettingSwitch: React.FC<SettingSwitchProps> = ({ icon: Icon, label, description, checked, onChange }) => (
  <div className="flex items-center gap-4 p-4">
    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--bg-hover)]">
      <Icon className="h-5 w-5 text-[var(--text-muted)]" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-[var(--text-main)]">{label}</p>
      {description && (
        <p className="text-xs text-[var(--text-muted)]">{description}</p>
      )}
    </div>
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <div className="h-6 w-11 rounded-full bg-[var(--border-primary)] peer-checked:bg-[var(--action-primary)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-5" />
    </label>
  </div>
);

export default SettingsPage;
