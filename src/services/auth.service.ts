import { supabase } from '@/lib/supabase';
import type { User, Choir, ChoirMember } from '@/types/database.types';

export interface AuthResult {
  user: User;
  choir: Choir | null;
  choirMember: ChoirMember | null;
}

// ─── Internal: fetch profile + membership ──────────────────────────────────
async function fetchProfileAndMembership(userId: string): Promise<AuthResult> {
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();                          // ← was .single() — won't throw on 0 rows

  if (profileError) throw profileError;
  if (!profile) throw new Error('Profile not found');

  const { data: membership } = await supabase
    .from('choir_members')
    .select('*, choirs(*)')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();                          // ← null safe — new users have no choir yet

  return {
    user: profile as User,
    choir: (membership as any)?.choirs as Choir ?? null,
    choirMember: membership as unknown as ChoirMember ?? null,
  };
}

// ─── Sign In (phone + password) ────────────────────────────────────────────
export async function signInWithPhone(
  phone: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    phone,
    password,
  });
  if (error) throw error;
  return fetchProfileAndMembership(data.user.id);
}

// ─── Register — sends OTP via Supabase phone auth ─────────────────────────
export async function signUp(
  phone: string,
  password: string,
  fullName: string
): Promise<{ phone: string }> {
  const { error } = await supabase.auth.signUp({
    phone,
    password,
    options: {
      data: {
        full_name: fullName,               // ← picked up by handle_new_user trigger
        display_name: fullName,
        preferred_language: 'sw',
      },
    },
  });
  if (error) throw error;
  return { phone };
}

// ─── Verify OTP ────────────────────────────────────────────────────────────
export async function verifyOtp(
  phone: string,
  otp: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: 'sms',
  });
  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error('No user returned from OTP verification');

  // Update phone + verified timestamp now that OTP is confirmed
  await supabase
    .from('users')
    .update({
      phone,
      phone_verified_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return fetchProfileAndMembership(userId);
}

// ─── Sign Out ──────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Get Session ───────────────────────────────────────────────────────────
export async function getSession(): Promise<AuthResult | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  try {
    return await fetchProfileAndMembership(session.user.id);
  } catch {
    return null;                             // ← session exists but profile missing
  }
}

// ─── Refresh Session ───────────────────────────────────────────────────────
export async function refreshSession(): Promise<AuthResult | null> {
  const { error } = await supabase.auth.refreshSession();
  if (error) return null;
  return getSession();
}
