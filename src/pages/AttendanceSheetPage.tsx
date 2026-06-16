import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { mockEvents, mockMembersWithUsers } from '@/lib/mock-data';
import { format } from 'date-fns';
import type { AttendanceStatus } from '@/types/database.types';

const AttendanceSheetPage: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  
  const event = useMemo(() => mockEvents.find(e => e.id === eventId), [eventId]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsPending] = useState(false);

  // Local state for attendance marks
  // In a real app, this would be fetched from attendance_records
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});

  const filteredMembers = useMemo(() => {
    return mockMembersWithUsers.filter(m => 
      m.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.voice_part?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleMark = (memberId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [memberId]: prev[memberId] === status ? 'absent' : status // Toggle behavior
    }));
  };

  const markAllPresent = () => {
    const newMarks: Record<string, AttendanceStatus> = {};
    filteredMembers.forEach(m => {
      newMarks[m.id] = 'present';
    });
    setAttendance(prev => ({ ...prev, ...newMarks }));
    toast.info(t('attendance.mark_all_present'));
  };

  const handleSave = async () => {
    setIsPending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsPending(false);
    toast.success(t('attendance.attendance_saved'));
    navigate('/events');
  };

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
            onClick={handleSave}
            loading={isSaving}
          >
            {t('common.save')}
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
                    {t(`voice_parts.${member.voice_part}`)}
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
