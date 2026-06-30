import { supabase } from '@/lib/supabase';
import type { Event, EventType } from '@/types/database.types';

export interface CreateEventInput {
  choirId: string;
  title: string;
  eventType: EventType;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  description?: string | null;
  createdBy: string;
}

export async function getEvents(choirId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('choir_id', choirId)
    .is('deleted_at', null)
    .order('starts_at', { ascending: true })
    .limit(500);

  if (error) throw error;
  return (data ?? []) as Event[];
}

export async function getUpcomingEvents(choirId: string, limit = 10): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('choir_id', choirId)
    .is('deleted_at', null)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Event[];
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as Event | null;
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      choir_id: input.choirId,
      title: input.title.trim(),
      event_type: input.eventType,
      starts_at: input.startsAt,
      ends_at: input.endsAt ?? null,
      location: input.location?.trim() || null,
      description: input.description?.trim() || null,
      created_by: input.createdBy,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Event;
}

export async function getAttendanceRate(choirId: string): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id')
    .eq('choir_id', choirId)
    .is('deleted_at', null)
    .gte('starts_at', since.toISOString())
    .lte('starts_at', new Date().toISOString());

  if (eventsError) throw eventsError;

  const eventIds = (events ?? []).map((event) => event.id);
  if (eventIds.length === 0) return 0;

  const { data: records, error: recordsError } = await supabase
    .from('attendance_records')
    .select('status')
    .in('event_id', eventIds);

  if (recordsError) throw recordsError;
  if (!records?.length) return 0;

  const attended = records.filter((record) => record.status === 'present' || record.status === 'late').length;
  return Math.round((attended / records.length) * 100);
}
