import { delay } from '@/lib/mock-data';
import type { Message } from '@/types/database.types';

const mockMessages: Message[] = [
  {
    id: 'msg_001',
    choir_id: 'chr_001',
    sender_id: 'usr_001',
    channel: 'in_app',
    subject: 'Rehearsal Postponed',
    body: 'Dear members, tomorrow rehearsal is postponed to Friday due to parish meeting.',
    target_type: 'all',
    target_value: null,
    sent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

export async function getMessages(_choirId: string): Promise<Message[]> {
  await delay(400);
  return mockMessages;
}

export async function sendMessage(
  _choirId: string,
  _senderId: string,
  payload: {
    channel: 'sms' | 'push' | 'in_app';
    subject?: string;
    body: string;
    targetType: 'all' | 'role' | 'voice_part' | 'individual';
    targetValue?: string;
  }
): Promise<Message> {
  await delay(800);
  console.log('[MOCK] sendMessage:', payload.targetType, payload.body.slice(0, 50));
  return {
    id: 'msg_' + Date.now(),
    choir_id: 'chr_001',
    sender_id: 'usr_001',
    channel: payload.channel,
    subject: payload.subject || null,
    body: payload.body,
    target_type: payload.targetType,
    target_value: payload.targetValue || null,
    sent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}
