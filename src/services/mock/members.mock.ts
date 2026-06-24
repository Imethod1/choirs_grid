import { mockMembersWithUsers, delay } from '@/lib/mock-data';
import type { MemberWithUser } from '@/types/app.types';
import type { MemberRole, VoicePart } from '@/types/database.types';

export async function getMembers(_choirId: string): Promise<MemberWithUser[]> {
  await delay(500);
  return mockMembersWithUsers;
}

export async function getMember(memberId: string): Promise<MemberWithUser | null> {
  await delay(300);
  return mockMembersWithUsers.find(m => m.id === memberId) || null;
}

export async function addMember(
  _choirId: string,
  payload: {
    phone: string;
    fullName: string;
    voicePart: VoicePart;
    role: MemberRole;
  }
): Promise<MemberWithUser> {
  await delay(800);
  console.log('[MOCK] addMember:', payload);
  const newMember: MemberWithUser = {
    id: 'mem_' + Date.now(),
    choir_id: 'chr_001',
    user_id: 'usr_' + Date.now(),
    role: payload.role,
    voice_part: payload.voicePart,
    status: 'probation',
    joined_at: new Date().toISOString().split('T')[0],
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      id: 'usr_' + Date.now(),
      phone: payload.phone,
      email: null,
      full_name: payload.fullName,
      display_name: payload.fullName,
      gender: null,
      date_of_birth: null,
      photo_url: null,
      preferred_language: 'sw',
      biometric_enabled: false,
      low_data_mode: false,
      is_super_admin: false,
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: null,
      last_login_ip: null as unknown,
      phone_verified_at: null,
      deleted_at: null,
      deleted_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
  return newMember;
}

export async function updateMemberStatus(_memberId: string, status: string): Promise<void> {
  await delay(400);
  console.log('[MOCK] updateMemberStatus:', status);
}

export async function updateMemberRole(_memberId: string, role: MemberRole): Promise<void> {
  await delay(400);
  console.log('[MOCK] updateMemberRole:', role);
}
