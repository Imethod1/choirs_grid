import { mockCurrentUser, mockChoir, mockCurrentMember, delay } from '@/lib/mock-data';
import type { User, Choir, ChoirMember } from '@/types/database.types';

export interface AuthResult {
  user: User;
  choir: Choir;
  choirMember: ChoirMember;
}

export async function signInWithPhone(phone: string, _password: string): Promise<AuthResult> {
  await delay(800);
  console.log('[MOCK AUTH] signInWithPhone:', phone);
  return { user: mockCurrentUser, choir: mockChoir, choirMember: mockCurrentMember };
}

export async function signUp(phone: string, _password: string, fullName: string): Promise<{ phone: string }> {
  await delay(800);
  console.log('[MOCK AUTH] signUp:', phone, fullName);
  return { phone };
}

export async function verifyOtp(phone: string, otp: string): Promise<AuthResult> {
  await delay(800);
  console.log('[MOCK AUTH] verifyOtp:', phone, otp);
  return { user: mockCurrentUser, choir: mockChoir, choirMember: mockCurrentMember };
}

export async function signOut(): Promise<void> {
  await delay(300);
  console.log('[MOCK AUTH] signOut');
}

export async function getSession(): Promise<AuthResult | null> {
  await delay(200);
  return { user: mockCurrentUser, choir: mockChoir, choirMember: mockCurrentMember };
}

export async function refreshSession(): Promise<AuthResult | null> {
  await delay(200);
  return { user: mockCurrentUser, choir: mockChoir, choirMember: mockCurrentMember };
}
