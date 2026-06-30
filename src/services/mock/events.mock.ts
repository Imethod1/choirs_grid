import { mockEvents } from '@/lib/mock-data';
import type { Event } from '@/types/database.types';
import type { CreateEventInput } from '../events.service';

let events: Event[] = [...mockEvents] as Event[];

export async function getEvents(_choirId: string): Promise<Event[]> {
  return [...events].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
}

export async function getUpcomingEvents(_choirId: string, limit = 10): Promise<Event[]> {
  return events
    .filter((event) => new Date(event.starts_at) >= new Date())
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, limit);
}

export async function getEvent(eventId: string): Promise<Event | null> {
  return events.find((event) => event.id === eventId) ?? null;
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const event: Event = {
    id: crypto.randomUUID(),
    choir_id: input.choirId,
    title: input.title,
    event_type: input.eventType,
    description: input.description ?? null,
    location: input.location ?? null,
    starts_at: input.startsAt,
    ends_at: input.endsAt ?? null,
    reminder_sent_24h: false,
    reminder_sent_2h: false,
    created_by: input.createdBy,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  events = [...events, event];
  return event;
}

export async function getAttendanceRate(_choirId: string): Promise<number> {
  return 87;
}
