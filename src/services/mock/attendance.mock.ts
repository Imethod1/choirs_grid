import { delay } from '@/lib/mock-data';
import type { AttendanceStatus } from '@/types/database.types';

export interface AttendanceMark {
  memberId: string;
  status: AttendanceStatus;
}

export async function getAttendance(_eventId: string): Promise<Record<string, AttendanceStatus>> {
  await delay(400);
  return {};
}

export async function saveAttendance(eventId: string, marks: AttendanceMark[]): Promise<void> {
  await delay(800);
  console.log('[MOCK] saveAttendance:', eventId, marks.length, 'marks');
}
