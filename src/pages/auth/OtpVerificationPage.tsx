import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/Toast';

const OtpVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuthStore();
  const toast = useToast();

  const phone = (location.state as any)?.phone || '+255712345678';
  const maskedPhone = phone.replace(/(\+255)\d{6}(\d{3})/, '$1 *** *** $2');

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState('');

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError(t('auth.invalid_otp'));
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await verifyOtp(phone, otp);
      toast.success(t('common.done'));
      navigate('/');
    } catch {
      setError(t('auth.invalid_otp'));
      toast.error(t('auth.invalid_otp'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    toast.info(t('auth.otp_sent', { phone: maskedPhone }));
    // In production: call authService or edge function to resend OTP
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--action-primary)] text-[var(--on-primary)] mb-4 mx-auto">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-main)]">{t('auth.enter_otp')}</h1>
        <p className="text-[var(--text-muted)]">
          {t('auth.otp_sent', { phone: maskedPhone })}
        </p>

        <Card padding="lg" className="border border-[var(--border-light)]">
          <form onSubmit={handleVerify} className="space-y-6">
            <Input
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
              placeholder="0 0 0 0 0 0"
              className="text-center text-2xl tracking-[0.5em] font-mono"
              type="text"
              inputMode="numeric"
              error={error}
            />
            
            <Button type="submit" fullWidth size="lg" loading={isLoading} icon={<ChevronRight className="h-5 w-5" />} iconPosition="right">
              {t('auth.verify')}
            </Button>
            
            <div>
              {resendTimer > 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  {t('auth.resend_in', { seconds: resendTimer })}
                </p>
              ) : (
                <button type="button" onClick={handleResend} className="text-sm text-[var(--action-primary)] font-medium hover:underline">
                  {t('auth.resend_otp')}
                </button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
