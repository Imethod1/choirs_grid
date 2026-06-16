import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';
import { isMockMode } from '@/lib/service-factory';

/**
 * Realtime Subscriptions
 * 
 * Only subscribe where live updates provide genuine value.
 * Over-subscribing wastes bandwidth on slow connections.
 * 
 * ✅ Attendance sheet — real-time marking by multiple leaders
 * ✅ Announcements   — new announcements appear without refresh
 * ❌ Finance records  — not time-critical; React Query polling is sufficient
 * ❌ Member directory — changes rarely; manual refresh is fine
 */

/**
 * Subscribe to real-time attendance changes for a specific event.
 * Multiple leaders can mark attendance simultaneously.
 */
export function useRealtimeAttendance(eventId: string | undefined) {
  useEffect(() => {
    if (!eventId || isMockMode()) return;

    const channel = supabase
      .channel(`attendance:event:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          // Invalidate the attendance query so React Query refetches
          queryClient.invalidateQueries({ queryKey: ['attendance', eventId] });
          console.log('[REALTIME] Attendance update:', payload.eventType, payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);
}

/**
 * Subscribe to new announcements for the current choir.
 */
export function useRealtimeAnnouncements(choirId: string | undefined) {
  useEffect(() => {
    if (!choirId || isMockMode()) return;

    const channel = supabase
      .channel(`announcements:choir:${choirId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `choir_id=eq.${choirId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['messages', choirId] });
          console.log('[REALTIME] New announcement:', payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [choirId]);
}

/**
 * Subscribe to poll response changes (aggregate only — no member linkage).
 */
export function useRealtimePollResults(pollId: string | undefined) {
  useEffect(() => {
    if (!pollId || isMockMode()) return;

    const channel = supabase
      .channel(`poll:${pollId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poll_responses',
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
          console.log('[REALTIME] Poll vote:', payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId]);
}
