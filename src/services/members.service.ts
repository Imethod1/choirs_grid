import { supabase } from '@/lib/supabase';
import type { MemberWithUser } from '@/types/app.types';

export async function getMembers(choirId: string): Promise<MemberWithUser[]> {
  const { data, error } = await supabase
    .from('choir_members')
    .select('*, users(*)')
    .eq('choir_id', choirId)
    .is('deleted_at' as any, null)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    ...row,
    user: row.users,
  }));
}

export async function getMember(memberId: string): Promise<MemberWithUser | null> {
  const { data, error } = await supabase
    .from('choir_members')
    .select('*, users(*)')
    .eq('id', memberId)
    .single();

  if (error || !data) return null;

  const row = data as any;
  return {
    ...row,
    user: row.users,
  } as MemberWithUser;
}
