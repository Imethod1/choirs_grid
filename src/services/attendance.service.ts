import { supabase } from '@/lib/supabase';
import type { AttendanceStatus } from '@/types/database.types';

export interface AttendanceMark {
  memberId: string;
  status: AttendanceStatus;
}

export async function getAttendance(eventId: string): Promise<Record<string, AttendanceStatus>> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('member_id, status')
    .eq('event_id', eventId);

  if (error) throw error;

  const marks: Record<string, AttendanceStatus> = {};
  (data || []).forEach((row: any) => {
    marks[row.member_id] = row.status;
  });
  return marks;
}

export async function saveAttendance(eventId: string, marks: AttendanceMark[]): Promise<void> {
  // Upsert all marks in a single transaction
  const records = marks.map((mark) => ({
    event_id: eventId,
    member_id: mark.memberId,
    status: mark.status,
    marked_by: '', // Will be set by RLS/trigger
    marked_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('attendance_records')
    .upsert(records as any, { onConflict: 'event_id,member_id' });

  if (error) throw error;
}
