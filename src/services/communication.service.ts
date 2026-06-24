import { supabase } from '@/lib/supabase';
import type { Message } from '@/types/database.types';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

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
  // Step 1: Run content filter edge function
  try {
    const filterRes = await fetch(`${FUNCTIONS_URL}/content-filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY,
      },
      body: JSON.stringify({ body: payload.body }),
    });
    const filterData = await filterRes.json();
    if (filterData?.allowed === false) {
      throw new Error(filterData.reason || 'Message blocked by content filter');
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('blocked')) throw err;
    // If content filter is unavailable, log but allow (fail-open for availability)
    console.warn('[COMM] Content filter unavailable:', err);
  }

  // Step 2: Insert the message record
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
    } as never)
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}
