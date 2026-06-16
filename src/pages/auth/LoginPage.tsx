import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Lock, ChevronRight, Music2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/Toast';
import { isAccountLocked, recordFailedAttempt, clearLockout } from '@/lib/security';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const toast = useToast();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!phone) e.phone = t('auth.invalid_phone');
    else if (!/^\+?255\d{9}$/.test(phone.replace(/\s/g, ''))) e.phone = t('auth.invalid_phone');
    if (!password) e.password = t('errors.validation');
    else if (password.length < 6) e.password = t('errors.validation');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isAccountLocked()) {
      toast.error('Account locked. Try again in 30 minutes.');
      return;
    }

    setIsLoading(true);
    try {
      await login(phone.replace(/\s/g, ''), password);
      clearLockout();
      navigate('/');
    } catch {
      const locked = recordFailedAttempt();
      if (locked) {
        toast.error('Account locked after too many attempts.');
      } else {
        toast.error(t('auth.login_failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--action-primary)] text-[var(--on-primary)] mb-4 shadow-lg">
            <Music2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-main)]">{t('common.app_name')}</h1>
          <p className="text-[var(--text-muted)] mt-2">{t('auth.welcome_back')}</p>
        </div>

        <Card padding="lg" className="shadow-xl border border-[var(--border-light)]">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label={t('auth.phone_number')}
              placeholder={t('auth.phone_placeholder')}
              value={phone}
              onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: undefined })); }}
              icon={<Phone className="h-5 w-5" />}
              type="tel"
              error={errors.phone}
            />
            <div className="space-y-1">
              <Input
                label={t('auth.password')}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                icon={<Lock className="h-5 w-5" />}
                type="password"
                error={errors.password}
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-[var(--action-primary)] font-medium hover:underline">
                  {t('auth.forgot_password')}
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth variant="primary" size="lg" loading={isLoading} icon={<ChevronRight className="h-5 w-5" />} iconPosition="right">
              {t('auth.login')}
            </Button>
          </form>
        </Card>

        <p className="text-center text-[var(--text-muted)]">
          {t('auth.create_account')}{' '}
          <Link to="/register" className="text-[var(--action-primary)] font-bold hover:underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
