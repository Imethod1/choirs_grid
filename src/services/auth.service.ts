import { supabase } from '@/lib/supabase';
import type { User, Choir, ChoirMember } from '@/types/database.types';

export interface AuthResult {
  user: User;
  choir: Choir;
  choirMember: ChoirMember;
}

export async function signInWithPhone(phone: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ phone, password });
  if (error) throw error;

  // Fetch user profile + choir membership
  const userId = data.user.id;
  const { data: profile } = await supabase.from('users').select('*').eq('id', userId).single();
  const { data: membership } = await supabase.from('choir_members').select('*, choirs(*)').eq('user_id', userId).limit(1).single();

  if (!profile || !membership) throw new Error('Profile not found');

  return {
    user: profile as User,
    choir: (membership as any).choirs as Choir,
    choirMember: membership as unknown as ChoirMember,
  };
}

export async function signUp(phone: string, password: string, fullName: string): Promise<{ phone: string }> {
  const { error } = await supabase.auth.signUp({
    phone,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return { phone };
}

export async function verifyOtp(phone: string, otp: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error('No user returned');

  const { data: profile } = await supabase.from('users').select('*').eq('id', userId).single();
  const { data: membership } = await supabase.from('choir_members').select('*, choirs(*)').eq('user_id', userId).limit(1).single();

  if (!profile || !membership) throw new Error('Profile not found');

  return {
    user: profile as User,
    choir: (membership as any).choirs as Choir,
    choirMember: membership as unknown as ChoirMember,
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<AuthResult | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const userId = session.user.id;
  const { data: profile } = await supabase.from('users').select('*').eq('id', userId).single();
  const { data: membership } = await supabase.from('choir_members').select('*, choirs(*)').eq('user_id', userId).limit(1).single();

  if (!profile || !membership) return null;

  return {
    user: profile as User,
    choir: (membership as any).choirs as Choir,
    choirMember: membership as unknown as ChoirMember,
  };
}

export async function refreshSession(): Promise<AuthResult | null> {
  const { error } = await supabase.auth.refreshSession();
  if (error) return null;
  return getSession();
}
