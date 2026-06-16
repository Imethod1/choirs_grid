import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { format } from 'date-fns';
import type { AttendanceStatus } from '@/types/database.types';

// Mock personal attendance records
const myRecords: Array<{ eventId: string; status: AttendanceStatus; date: string }> = [
  { eventId: 'evt_001', status: 'present', date: '2024-02-04' },
  { eventId: 'evt_002', status: 'present', date: '2024-02-11' },
  { eventId: 'evt_003', status: 'late', date: '2024-02-18' },
  { eventId: 'evt_004', status: 'present', date: '2024-02-25' },
  { eventId: 'evt_005', status: 'excused', date: '2024-03-03' },
  { eventId: 'evt_006', status: 'present', date: '2024-03-10' },
  { eventId: 'evt_007', status: 'present', date: '2024-03-17' },
  { eventId: 'evt_008', status: 'absent', date: '2024-03-24' },
];

const MyAttendancePage: React.FC = () => {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const total = myRecords.length;
    const present = myRecords.filter(r => r.status === 'present').length;
    const late = myRecords.filter(r => r.status === 'late').length;
    const excused = myRecords.filter(r => r.status === 'excused').length;
    const absent = myRecords.filter(r => r.status === 'absent').length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, late, excused, absent, rate };
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[var(--primary-container)] flex items-center justify-center">
          <CalendarCheck className="h-6 w-6 text-[var(--on-primary-container)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-main)]">{t('attendance.my_attendance')}</h1>
          <p className="text-sm text-[var(--text-muted)]">{stats.total} {t('events.title').toLowerCase()}</p>
        </div>
      </div>

      {/* Rate Card */}
      <Card className="bg-[var(--primary-container)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--on-primary-container)]">{t('dashboard.attendance_rate')}</p>
            <p className="text-4xl font-bold text-[var(--on-primary-container)] mt-1 animate-number">{stats.rate}%</p>
          </div>
          <TrendingUp className="h-10 w-10 text-[var(--on-primary-container)] opacity-40" />
        </div>
        <div className="flex gap-4 mt-4 pt-3 border-t border-[var(--on-primary-container)]/20">
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-[var(--on-primary-container)]">{stats.present}</p>
            <p className="text-[10px] text-[var(--on-primary-container)]/70">{t('attendance.present')}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-[var(--on-primary-container)]">{stats.late}</p>
            <p className="text-[10px] text-[var(--on-primary-container)]/70">{t('attendance.late')}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-[var(--on-primary-container)]">{stats.excused}</p>
            <p className="text-[10px] text-[var(--on-primary-container)]/70">{t('attendance.excused')}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-[var(--on-primary-container)]">{stats.absent}</p>
            <p className="text-[10px] text-[var(--on-primary-container)]/70">{t('attendance.absent')}</p>
          </div>
        </div>
      </Card>

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">{t('dashboard.recent_activity')}</h3>
        {myRecords.length > 0 ? (
          <Card padding="none" className="divide-y divide-[var(--border-light)]">
            {myRecords.map((record, idx) => (
              <div key={idx} className="flex items-center p-4 gap-4">
                <div className="flex flex-col items-center justify-center min-w-[44px] h-11 rounded-lg bg-[var(--bg-hover)]">
                  <span className="text-[10px] text-[var(--text-muted)]">{format(new Date(record.date), 'MMM')}</span>
                  <span className="text-sm font-bold text-[var(--text-main)]">{format(new Date(record.date), 'd')}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-main)]">{t('events.rehearsal')}</p>
                  <p className="text-xs text-[var(--text-muted)]">{format(new Date(record.date), 'EEEE')}</p>
                </div>
                <StatusBadge status={record.status} />
              </div>
            ))}
          </Card>
        ) : (
          <EmptyState icon="attendance" title={t('common.no_results')} description={t('empty.attendance')} />
        )}
      </div>
    </div>
  );
};

export default MyAttendancePage;
