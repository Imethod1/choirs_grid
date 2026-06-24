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

// ── Internal: normalise phone for Supabase auth ────────────────────────────
// Supabase auth stores phone WITHOUT + prefix (e.g. 255789467876)
// Our Edge Functions and public.users use WITH + prefix (E.164)
function toSupabasePhone(phone: string): string {
  return phone.startsWith('+') ? phone.slice(1) : phone
}

// ── Internal: normalise phone to E.164 for Edge Functions ─────────────────
function toE164(phone: string): string {
  return phone.startsWith('+') ? phone : `+${phone}`
}

// ── Internal: call Edge Function with retry ───────────────────────────────
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

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error ?? `${name} failed with status ${res.status}`)
      }

      return data as T
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < retries) {
        // Exponential backoff: 500ms, 1000ms
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
      }
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
  const supabasePhone = toSupabasePhone(phone)
  const e164Phone     = toE164(phone)

  const { error } = await supabase.auth.signUp({
    phone:    supabasePhone,
    password,
    options: {
      data: {
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
  const supabasePhone = toSupabasePhone(phone)
  const e164Phone     = toE164(phone)

  // Step 1: validate OTP via our Edge Function (E.164 format)
  await callFunction<{ success: boolean; verified: boolean }>(
    'verify-otp',
    { phone: e164Phone, otp }
  )

  // Step 2: sign in with password using Supabase format (no +)
  const { data, error } = await supabase.auth.signInWithPassword({
    phone:    supabasePhone,
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
    phone:    toSupabasePhone(phone),
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
