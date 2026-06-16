import { supabase } from '@/lib/supabase';
import type { Message } from '@/types/database.types';

export async function getMessages(choirId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('choir_id', choirId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Message[];
}

export async function sendMessage(
  choirId: string,
  senderId: string,
  payload: {
    channel: 'sms' | 'push' | 'in_app';
    subject?: string;
    body: string;
    targetType: 'all' | 'role' | 'voice_part' | 'individual';
    targetValue?: string;
  }
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      choir_id: choirId,
      sender_id: senderId,
      channel: payload.channel,
      subject: payload.subject || null,
      body: payload.body,
      target_type: payload.targetType,
      target_value: payload.targetValue || null,
      sent_at: new Date().toISOString(),
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}
