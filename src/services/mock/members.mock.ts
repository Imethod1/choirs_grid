import { mockMembersWithUsers, delay } from '@/lib/mock-data';
import type { MemberWithUser } from '@/types/app.types';

export async function getMembers(_choirId: string): Promise<MemberWithUser[]> {
  await delay(500);
  return mockMembersWithUsers;
}

export async function getMember(memberId: string): Promise<MemberWithUser | null> {
  await delay(300);
  return mockMembersWithUsers.find(m => m.id === memberId) || null;
}
