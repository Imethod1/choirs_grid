import { supabase } from '@/lib/supabase';
import type { MemberWithUser } from '@/types/app.types';
import type { MemberRole, VoicePart } from '@/types/database.types';

export async function getMembers(choirId: string): Promise<MemberWithUser[]> {
  const { data, error } = await supabase
    .from('choir_members')
    .select('*, users(*)')
    .eq('choir_id', choirId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((row: Record<string, unknown>) => ({
    ...row,
    user: row.users,
  })) as MemberWithUser[];
}

export async function getMember(memberId: string): Promise<MemberWithUser | null> {
  const { data, error } = await supabase
    .from('choir_members')
    .select('*, users(*)')
    .eq('id', memberId)
    .single();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  return {
    ...row,
    user: row.users,
  } as MemberWithUser;
}

export async function addMember(
  choirId: string,
  payload: {
    phone: string;
    fullName: string;
    voicePart: VoicePart;
    role: MemberRole;
  }
): Promise<MemberWithUser> {
  // Step 1: Check if user already exists by phone
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('phone', payload.phone)
    .maybeSingle();

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
  } else {
    // Create user record (auth user must be created separately via signUp)
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        phone: payload.phone,
        full_name: payload.fullName,
      } as never)
      .select('id')
      .single();

    if (userError) throw userError;
    userId = (newUser as { id: string }).id;
  }

  // Step 2: Check if already a member of this choir
  const { data: existingMember } = await supabase
    .from('choir_members')
    .select('id')
    .eq('choir_id', choirId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingMember) {
    throw new Error('This person is already a member of this choir');
  }

  // Step 3: Create choir membership
  const { data: member, error: memberError } = await supabase
    .from('choir_members')
    .insert({
      choir_id: choirId,
      user_id: userId,
      role: payload.role,
      voice_part: payload.voicePart,
      status: 'probation',
      joined_at: new Date().toISOString().split('T')[0],
    } as never)
    .select('*, users(*)')
    .single();

  if (memberError) throw memberError;

  const row = member as Record<string, unknown>;
  return {
    ...row,
    user: row.users,
  } as MemberWithUser;
}

export async function updateMemberStatus(
  memberId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from('choir_members')
    .update({ status } as never)
    .eq('id', memberId);

  if (error) throw error;
}

export async function updateMemberRole(
  memberId: string,
  role: MemberRole
): Promise<void> {
  const { error } = await supabase
    .from('choir_members')
    .update({ role } as never)
    .eq('id', memberId);

  if (error) throw error;
}
