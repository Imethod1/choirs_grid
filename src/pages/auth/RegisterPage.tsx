import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, User, Music2, ChevronRight, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/Toast';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const toast = useToast();
  
  const [formData, setFormData] = useState({ fullName: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.fullName.trim()) e.fullName = t('errors.validation');
    if (!formData.phone) e.phone = t('auth.invalid_phone');
    else if (!/^\+?255\d{9}$/.test(formData.phone.replace(/\s/g, ''))) e.phone = t('auth.invalid_phone');
    if (!formData.password || formData.password.length < 6) e.password = t('errors.validation');
    if (formData.password !== formData.confirmPassword) e.confirmPassword = t('errors.validation');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(formData.phone.replace(/\s/g, ''), formData.password, formData.fullName.trim());
      toast.success(t('common.done'));
      navigate('/verify-otp', { state: { phone: formData.phone } });
    } catch {
      toast.error(t('errors.save_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--action-primary)] text-[var(--on-primary)] mb-4">
            <Music2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-main)]">{t('auth.register')}</h1>
          <p className="text-[var(--text-muted)] mt-2">{t('auth.create_account')}</p>
        </div>

        <Card padding="lg" className="border border-[var(--border-light)]">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input label={t('members.title')} placeholder="Amina Saleh" value={formData.fullName} onChange={e => set('fullName', e.target.value)} icon={<User className="h-5 w-5" />} error={errors.fullName} />
            <Input label={t('auth.phone_number')} placeholder={t('auth.phone_placeholder')} value={formData.phone} onChange={e => set('phone', e.target.value)} icon={<Phone className="h-5 w-5" />} type="tel" error={errors.phone} />
            <Input label={t('auth.password')} type="password" value={formData.password} onChange={e => set('password', e.target.value)} icon={<Lock className="h-5 w-5" />} error={errors.password} />
            <Input label={t('auth.confirm_password')} type="password" value={formData.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} icon={<Lock className="h-5 w-5" />} error={errors.confirmPassword} />

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg" loading={isLoading} icon={<ChevronRight className="h-5 w-5" />} iconPosition="right">
                {t('common.next')}
              </Button>
            </div>
          </form>
        </Card>

        <p className="text-center text-[var(--text-muted)]">
          {t('auth.welcome_back')}?{' '}
          <Link to="/login" className="text-[var(--action-primary)] font-bold hover:underline">{t('auth.login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
