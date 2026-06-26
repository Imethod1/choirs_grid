// src/services/auth.service.ts

import { supabase } from '@/lib/supabase'
import type { User, Choir, ChoirMember } from '@/types/database.types'

// ── Constants ──────────────────────────────────────────────────────────────
const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
const ANON_KEY      = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export interface AuthResult {
  user: User
  choir: Choir | null
  choirMember: ChoirMember | null
}

// ── Internal: normalise phone to E.164 for Edge Functions/public.users ─────
function toE164(phone: string): string {
  return phone.startsWith('+') ? phone : `+${phone}`
}

// ── Internal: convert phone to private synthetic email for Supabase Auth ───
// This avoids Supabase native Phone Provider while users still login by phone.
function phoneToAuthEmail(phone: string): string {
  const digits = toE164(phone).replace(/\D/g, '')
  return `${digits}@auth.choirgrid.app`
}

/**
 * Client-facing error from an Edge Function. Carries the HTTP status so
 * callers can distinguish "expired/invalid OTP" (4xx) from transient
 * network/server problems (5xx / no response).
 */
class EdgeFunctionError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'EdgeFunctionError'
    this.status = status
  }
}

// ── Internal: call Edge Function with retry ───────────────────────────────
// Retries ONLY on network failures and 5xx (transient) errors with
// exponential backoff. 4xx client errors (invalid/expired OTP, validation,
// rate-limit) fail fast — retrying them is wasteful and can burn OTP attempts.
async function callFunction<T>(
  name: string,
  body: Record<string, unknown>,
  retries = 2
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
          'apikey':        ANON_KEY,
        },
        body: JSON.stringify(body),
      })

      let data: any = null
      try {
        data = await res.json()
      } catch {
        // Non-JSON body (e.g. gateway HTML on 5xx) — treat as transient.
        if (!res.ok && res.status >= 500) {
          throw new EdgeFunctionError(`${name} unavailable (status ${res.status})`, res.status)
        }
      }

      if (!res.ok) {
        const message = data?.error ?? `${name} failed with status ${res.status}`
        const httpErr = new EdgeFunctionError(message, res.status)
        // 4xx → caller's input problem: do not retry, surface immediately.
        if (res.status >= 400 && res.status < 500) throw httpErr
        // 5xx → transient: allow retry below.
        lastError = httpErr
      } else {
        return data as T
      }
    } catch (err) {
      // A 4xx EdgeFunctionError must bubble out without retrying.
      if (err instanceof EdgeFunctionError && err.status >= 400 && err.status < 500) {
        throw err
      }
      lastError = err instanceof Error ? err : new Error(String(err))
    }

    if (attempt < retries) {
      // Exponential backoff: 500ms, 1000ms
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
    }
  }

  throw lastError ?? new Error(`${name} failed after ${retries + 1} attempts`)
}

// ── Internal: fetch profile + choir membership ─────────────────────────────
async function fetchProfileAndMembership(userId: string): Promise<AuthResult> {
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) throw profileError
  if (!profile) throw new Error('Profile not found')

  const { data: membership } = await supabase
    .from('choir_members')
    .select('*, choirs(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  return {
    user:        profile as User,
    choir:       (membership as Record<string, unknown>)?.choirs as Choir ?? null,
    choirMember: membership as unknown as ChoirMember ?? null,
  }
}

// ── Register ───────────────────────────────────────────────────────────────
export async function signUp(
  phone: string,
  password: string,
  fullName: string
): Promise<{ phone: string }> {
  const e164Phone = toE164(phone)
  const authEmail = phoneToAuthEmail(phone)

  const { error } = await supabase.auth.signUp({
    email: authEmail,
    password,
    options: {
      data: {
        phone_e164:          e164Phone,
        full_name:          fullName,
        display_name:       fullName,
        preferred_language: 'sw',
      },
    },
  })

  if (error) throw error

  // Send OTP via Edge Function using E.164 format
  await callFunction('send-otp', { phone: e164Phone })

  return { phone: e164Phone }
}

// ── Resend OTP ─────────────────────────────────────────────────────────────
export async function resendOtp(phone: string): Promise<void> {
  await callFunction('send-otp', { phone: toE164(phone) })
}

// ── Verify OTP ─────────────────────────────────────────────────────────────
export async function verifyOtp(
  phone: string,
  otp: string,
  password: string
): Promise<AuthResult> {
  const e164Phone = toE164(phone)
  const authEmail = phoneToAuthEmail(phone)

  // Step 1: validate OTP via our Edge Function (E.164 format)
  await callFunction<{ success: boolean; verified: boolean }>(
    'verify-otp',
    { phone: e164Phone, otp }
  )

  // Step 2: sign in with password using private synthetic email
  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  })

  if (error) throw new Error(`Sign-in after OTP failed: ${error.message}`)

  const userId = data.user?.id
  if (!userId) throw new Error('No user returned after sign-in')

  return fetchProfileAndMembership(userId)
}

// ── Sign In ────────────────────────────────────────────────────────────────
export async function signInWithPhone(
  phone: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: phoneToAuthEmail(phone),
    password,
  })

  if (error) throw error

  return fetchProfileAndMembership(data.user.id)
}

// ── Sign Out ───────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ── Get Session ────────────────────────────────────────────────────────────
export async function getSession(): Promise<AuthResult | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  try {
    return await fetchProfileAndMembership(session.user.id)
  } catch {
    return null
  }
}

// ── Refresh Session ────────────────────────────────────────────────────────
export async function refreshSession(): Promise<AuthResult | null> {
  const { error } = await supabase.auth.refreshSession()
  if (error) return null
  return getSession()
}
