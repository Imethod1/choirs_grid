import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, ChevronRight, KeyRound } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !/^\+?255\d{9}$/.test(phone.replace(/\s/g, ''))) {
      toast.error(t('auth.invalid_phone'));
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
    setSent(true);
    toast.success(t('common.done'));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--action-primary)] text-[var(--on-primary)] mb-4">
            <KeyRound className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-main)]">{t('auth.forgot_password')}</h1>
          <p className="text-[var(--text-muted)] mt-2">{t('auth.phone_number')}</p>
        </div>

        <Card padding="lg" className="border border-[var(--border-light)]">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="h-12 w-12 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mx-auto">
                <ChevronRight className="h-6 w-6 text-[var(--color-success)]" />
              </div>
              <p className="text-sm text-[var(--text-main)] font-medium">{t('auth.otp_sent', { phone })}</p>
              <Link to="/login">
                <Button variant="outline" fullWidth>{t('auth.login')}</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label={t('auth.phone_number')} placeholder={t('auth.phone_placeholder')} value={phone} onChange={e => setPhone(e.target.value)} icon={<Phone className="h-5 w-5" />} type="tel" />
              <Button type="submit" fullWidth size="lg" loading={isLoading}>{t('common.next')}</Button>
            </form>
          )}
        </Card>

        <p className="text-center">
          <Link to="/login" className="text-sm text-[var(--action-primary)] font-medium hover:underline">{t('common.back')} {t('auth.login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
