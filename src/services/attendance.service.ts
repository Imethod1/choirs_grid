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
  (data || []).forEach((row: { member_id: string; status: string }) => {
    marks[row.member_id] = row.status as AttendanceStatus;
  });
  return marks;
}

export async function saveAttendance(eventId: string, marks: AttendanceMark[]): Promise<void> {
  // Get current authenticated user for marked_by
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Upsert all marks
  const records = marks.map((mark) => ({
    event_id: eventId,
    member_id: mark.memberId,
    status: mark.status,
    marked_by: user.id,
    marked_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('attendance_records')
    .upsert(records as never[], { onConflict: 'event_id,member_id' });

  if (error) throw error;
}
