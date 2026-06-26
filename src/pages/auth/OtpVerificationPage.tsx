// src/pages/auth/OtpVerificationPage.tsx

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/components/ui/Toast'
import { authService } from '@/services'

interface LocationState {
  phone?: string
  password?: string
}

const OtpVerificationPage: React.FC = () => {
  const { t }        = useTranslation()
  const navigate     = useNavigate()
  const location     = useLocation()
  const { verifyOtp } = useAuthStore()
  const toast        = useToast()

  // phone + password passed from RegisterPage via navigate() state
  // password is in-memory only — never in the URL or localStorage
  const state    = (location.state as LocationState) ?? {}
  const phone    = state.phone    ?? ''
  const password = state.password ?? ''

  const maskedPhone = phone.replace(/(\+255)\d{6}(\d{3})/, '$1 *** *** $2')

  const [otp, setOtp]                   = useState('')
  const [isLoading, setIsLoading]       = useState(false)
  const [isResending, setIsResending]   = useState(false)
  const [resendTimer, setResendTimer]   = useState(60)
  const [error, setError]               = useState('')

  // Guard: if user landed here without going through RegisterPage, send them back
  useEffect(() => {
    if (!phone) {
      toast.error('Session expired. Please register again.')
      navigate('/register', { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  // ── Verify ──────────────────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) {
      setError(t('auth.invalid_otp'))
      return
    }

    // Guard: password lost means state was wiped (e.g. hard refresh mid-flow)
    if (!password) {
      toast.error('Session expired. Please register again.')
      navigate('/register', { replace: true })
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 1. POST verify-otp Edge Function → validates hash, marks OTP used
      // 2. signInWithPassword → Supabase session
      // 3. fetchProfileAndMembership → user + choir
      await verifyOtp(phone, otp, password)
      toast.success(t('common.done'))
      navigate('/', { replace: true })
    } catch (err: any) {
      // Map raw errors to clear, user-friendly messaging.
      const raw = (err?.message ?? '').toLowerCase()
      let message: string
      if (raw.includes('expired')) {
        message = t('auth.otp_expired', {
          defaultValue: 'This code has expired. Tap "Resend" to get a new one.',
        })
      } else if (
        raw.includes('network') ||
        raw.includes('failed to fetch') ||
        raw.includes('unavailable') ||
        err?.status >= 500
      ) {
        message = t('errors.network')
      } else if (raw.includes('attempts') || raw.includes('too many')) {
        message = t('auth.otp_too_many', {
          defaultValue: 'Too many attempts. Please request a new code.',
        })
      } else {
        message = err?.message || t('auth.invalid_otp')
      }
      setError(message)
      toast.error(message)
      // Clear the field on a definitively wrong/expired code so the user re-enters.
      if (!raw.includes('network') && !raw.includes('unavailable')) setOtp('')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Resend ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return

    setIsResending(true)
    try {
      // Calls send-otp Edge Function — rate limiting enforced server-side (3/10min)
      await authService.resendOtp(phone)
      setResendTimer(60)
      setOtp('')
      setError('')
      toast.info(t('auth.otp_sent', { phone: maskedPhone }))
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to resend OTP. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">

        {/* Icon */}
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl
                        bg-[var(--action-primary)] text-[var(--on-primary)] mb-4 mx-auto">
          <ShieldCheck className="h-10 w-10" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[var(--text-main)]">
          {t('auth.enter_otp')}
        </h1>
        <p className="text-[var(--text-muted)]">
          {t('auth.otp_sent', { phone: maskedPhone })}
        </p>

        {/* Card */}
        <Card padding="lg" className="border border-[var(--border-light)]">
          <form onSubmit={handleVerify} className="space-y-6">

            {/* OTP input */}
            <Input
              value={otp}
              onChange={e => {
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                setError('')
              }}
              placeholder="0 0 0 0 0 0"
              className="text-center text-2xl tracking-[0.5em] font-mono"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              error={error}
            />

            {/* Verify button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              icon={<ChevronRight className="h-5 w-5" />}
              iconPosition="right"
            >
              {t('auth.verify')}
            </Button>

            {/* Resend */}
            <div>
              {resendTimer > 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  {t('auth.resend_in', { seconds: resendTimer })}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-sm text-[var(--action-primary)] font-medium
                             hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? t('common.loading') : t('auth.resend_otp')}
                </button>
              )}
            </div>

          </form>
        </Card>

      </div>
    </div>
  )
}

export default OtpVerificationPage
