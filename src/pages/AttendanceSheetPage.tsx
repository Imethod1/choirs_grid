import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  X,
  Clock,
  MessageSquare,
  ChevronLeft,
  Save,
  Search,
  UserCheck
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { attendanceService, membersService } from '@/services';
import { useRealtimeAttendance } from '@/hooks/useRealtimeSubscription';
import { enqueue } from '@/lib/offline-queue';
import { format } from 'date-fns';
import type { AttendanceStatus } from '@/types/database.types';
import { mockEvents } from '@/lib/mock-data';
import { isMockMode } from '@/lib/service-factory';

const AttendanceSheetPage: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { choir } = useAuthStore();
  const { isOffline } = useUIStore();

  // Realtime subscription for collaborative attendance marking
  useRealtimeAttendance(eventId);

  // In mock mode, use mock events; in production, we'd fetch the event
  const event = useMemo(() => {
    if (isMockMode()) {
      return mockEvents.find(e => e.id === eventId);
    }
    // In production this would be fetched — for now use mock as fallback
    return mockEvents.find(e => e.id === eventId);
  }, [eventId]);

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch members
  const { data: members = [] } = useQuery({
    queryKey: ['members', choir?.id],
    queryFn: () => membersService.getMembers(choir?.id ?? ''),
    enabled: !!choir?.id,
  });

  // Fetch existing attendance
  const { data: serverAttendance = {} } = useQuery({
    queryKey: ['attendance', eventId],
    queryFn: () => attendanceService.getAttendance(eventId!),
    enabled: !!eventId,
  });

  // Local state for attendance marks (merge server + local edits)
  const [localEdits, setLocalEdits] = useState<Record<string, AttendanceStatus>>({});

  // Merged view: server data + local edits
  const attendance = useMemo(() => ({
    ...serverAttendance,
    ...localEdits,
  }), [serverAttendance, localEdits]);

  const filteredMembers = useMemo(() => {
    return members.filter(m =>
      m.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.voice_part?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const handleMark = useCallback((memberId: string, status: AttendanceStatus) => {
    setLocalEdits(prev => ({
      ...prev,
      [memberId]: prev[memberId] === status ? 'absent' : status,
    }));
  }, []);

  const markAllPresent = useCallback(() => {
    const newMarks: Record<string, AttendanceStatus> = {};
    filteredMembers.forEach(m => {
      newMarks[m.id] = 'present';
    });
    setLocalEdits(prev => ({ ...prev, ...newMarks }));
    toast.info(t('attendance.mark_all_present'));
  }, [filteredMembers, toast, t]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) throw new Error('No event ID');

      const marks = Object.entries(attendance).map(([memberId, status]) => ({
        memberId,
        status: status as AttendanceStatus,
      }));

      if (marks.length === 0) {
        throw new Error('No attendance marks to save');
      }

      // If offline, queue the action
      if (isOffline) {
        enqueue({
          type: 'attendance',
          payload: { eventId, marks },
        });
        return;
      }

      await attendanceService.saveAttendance(eventId, marks);
    },
    onSuccess: () => {
      toast.success(t('attendance.attendance_saved'));
      queryClient.invalidateQueries({ queryKey: ['attendance', eventId] });
      setLocalEdits({});
      navigate('/events');
    },
    onError: (err: Error) => {
      toast.error(err.message || t('errors.save_failed'));
    },
  });

  if (!event) return <div className="p-8 text-center">{t('errors.not_found')}</div>;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-[var(--bg-surface)] border-b border-[var(--border-light)] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--bg-hover)] rounded-lg">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg text-[var(--text-main)] truncate max-w-[200px]">
                {event.title}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                {format(new Date(event.starts_at), 'EEEE, d MMM')}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            icon={<Save className="h-4 w-4" />}
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
            disabled={Object.keys(localEdits).length === 0}
          >
            {isOffline ? 'Queue' : t('common.save')}
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder={t('members.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button variant="outline" size="sm" icon={<UserCheck className="h-4 w-4" />} onClick={markAllPresent}>
            {t('attendance.mark_all_present')}
          </Button>
        </div>
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredMembers.map((member) => {
          const status = attendance[member.id] || 'absent';

          return (
            <Card key={member.id} padding="none" className="overflow-hidden">
              <div className="flex items-center p-3 gap-3">
                <Avatar name={member.user.full_name} src={member.user.photo_url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-main)] text-sm truncate">
                    {member.user.full_name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {member.voice_part ? t(`voice_parts.${member.voice_part}`) : '—'}
                  </p>
                </div>

                {/* Status Toggles */}
                <div className="flex gap-1 bg-[var(--bg-hover)] p-1 rounded-xl">
                  <AttendanceButton
                    active={status === 'present'}
                    onClick={() => handleMark(member.id, 'present')}
                    variant="present"
                    icon={<Check className="h-4 w-4" />}
                  />
                  <AttendanceButton
                    active={status === 'late'}
                    onClick={() => handleMark(member.id, 'late')}
                    variant="late"
                    icon={<Clock className="h-4 w-4" />}
                  />
                  <AttendanceButton
                    active={status === 'excused'}
                    onClick={() => handleMark(member.id, 'excused')}
                    variant="excused"
                    icon={<MessageSquare className="h-4 w-4" />}
                  />
                  <AttendanceButton
                    active={status === 'absent'}
                    onClick={() => handleMark(member.id, 'absent')}
                    variant="absent"
                    icon={<X className="h-4 w-4" />}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

interface AttendanceButtonProps {
  active: boolean;
  onClick: () => void;
  variant: 'present' | 'late' | 'excused' | 'absent';
  icon: React.ReactNode;
}

const AttendanceButton: React.FC<AttendanceButtonProps> = ({ active, onClick, variant, icon }) => {
  const styles = {
    present: active ? 'bg-[var(--color-success)] text-white' : 'text-[var(--color-success)] hover:bg-[var(--color-success-bg)]',
    late: active ? 'bg-[var(--color-warning)] text-white' : 'text-[var(--color-warning)] hover:bg-[var(--color-warning-bg)]',
    excused: active ? 'bg-[var(--color-info)] text-white' : 'text-[var(--color-info)] hover:bg-[var(--color-info-bg)]',
    absent: active ? 'bg-[var(--color-error)] text-white' : 'text-[var(--color-error)] hover:bg-[var(--color-error-bg)]',
  };

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all duration-200 ${styles[variant]} ${active ? 'scale-110 shadow-sm' : 'opacity-60'}`}
    >
      {icon}
    </button>
  );
};

export default AttendanceSheetPage;
