import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Check,
  X,
  HelpCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { CreateEventForm } from '@/components/forms/CreateEventForm';
import { mockEvents } from '@/lib/mock-data';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday } from 'date-fns';
import type { Event } from '@/types/database.types';

const EventsPage: React.FC = () => {
  const { t } = useTranslation();
  const { openBottomSheet } = useUIStore();
  const { hasAnyRole } = useAuthStore();
  const canCreateEvent = hasAnyRole(['choir_leader', 'assistant_leader', 'super_admin']);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startDay = start.getDay();
    const paddedDays: (Date | null)[] = Array(startDay).fill(null).concat(days);
    return paddedDays;
  }, [currentMonth]);

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter((event) => isSameDay(new Date(event.starts_at), date));
  };

  const upcomingEvents = useMemo(() => {
    return mockEvents
      .filter((event) => new Date(event.starts_at) >= new Date())
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  }, []);

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const handleEventClick = (event: Event) => {
    openBottomSheet(<EventDetailSheet event={event} />);
  };

  const eventTypeColors: Record<string, string> = {
    rehearsal: 'bg-[var(--action-primary)]',
    mass: 'bg-[var(--cta-accent)]',
    wedding: 'bg-pink-500',
    funeral: 'bg-gray-500',
    concert: 'bg-purple-500',
    meeting: 'bg-[var(--cta-accent)]',
    other: 'bg-[var(--text-subtle)]',
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-main)]">
            {t('events.title')}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {upcomingEvents.length} {t('events.upcoming').toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreateEvent && (
            <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openBottomSheet(<CreateEventForm />)}>
              {t('events.create_event')}
            </Button>
          )}
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-2 p-1 bg-[var(--bg-hover)] rounded-lg w-fit">
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'calendar'
              ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm'
              : 'text-[var(--text-muted)]'
          }`}
        >
          {t('events.calendar')}
        </button>
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'list'
              ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm'
              : 'text-[var(--text-muted)]'
          }`}
        >
          {t('events.upcoming')}
        </button>
      </div>

      {view === 'calendar' ? (
        <>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-[var(--text-muted)]" />
              </button>
              <h2 className="text-lg font-semibold text-[var(--text-main)]">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-[var(--text-muted)] py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} className="aspect-square" />;
                
                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square p-1 rounded-lg flex flex-col items-center justify-start transition-colors ${
                      isSelected
                        ? 'bg-[var(--action-primary)] text-white'
                        : isToday(day)
                        ? 'bg-[var(--primary-container)]'
                        : 'hover:bg-[var(--bg-hover)]'
                    } ${!isCurrentMonth && 'opacity-30'}`}
                  >
                    <span className={`text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-[var(--text-main)]'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <span
                            key={event.id}
                            className={`h-1.5 w-1.5 rounded-full ${
                              isSelected ? 'bg-white' : eventTypeColors[event.event_type]
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {selectedDate && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-muted)]">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <EventCard key={event.id} event={event} onClick={() => handleEventClick(event)} />
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)] py-4 text-center">
                  {t('events.no_events')}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} onClick={() => handleEventClick(event)} />
            ))
          ) : (
            <EmptyState
              icon="events"
              title={t('events.no_events')}
              description={t('empty.events')}
              action={canCreateEvent ? { label: t('events.create_event'), onClick: () => {} } : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
};

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const { t } = useTranslation();
  
  const eventTypeBorders: Record<string, string> = {
    rehearsal: 'border-l-[var(--action-primary)]',
    mass: 'border-l-[var(--cta-accent)]',
    wedding: 'border-l-pink-500',
    funeral: 'border-l-gray-500',
    concert: 'border-l-purple-500',
    meeting: 'border-l-[var(--cta-accent)]',
    other: 'border-l-[var(--text-subtle)]',
  };

  return (
    <Card
      hoverable
      padding="none"
      className={`border-l-4 ${eventTypeBorders[event.event_type]} cursor-pointer`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-[var(--text-main)]">
              {event.title}
            </h4>
            <div className="flex items-center gap-3 mt-2 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(event.starts_at), 'h:mm a')}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
          <Badge variant={event.event_type === 'rehearsal' ? 'default' : 'accent'}>
            {t(`events.${event.event_type}`)}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

interface EventDetailSheetProps {
  event: Event;
}

const EventDetailSheet: React.FC<EventDetailSheetProps> = ({ event }) => {
  const { t } = useTranslation();
  const { closeBottomSheet } = useUIStore();
  const navigate = useNavigate();
  const { hasAnyRole: canMark } = useAuthStore();
  const [rsvp, setRsvp] = useState<'yes' | 'no' | 'maybe' | null>(null);

  const handleMarkAttendance = () => {
    closeBottomSheet();
    navigate(`/events/${event.id}/attendance`);
  };

  return (
    <div className="pt-2">
      <Badge variant="accent" className="mb-3">
        {t(`events.${event.event_type}`)}
      </Badge>
      
      <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">
        {event.title}
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <Calendar className="h-5 w-5" />
          <span>{format(new Date(event.starts_at), 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <Clock className="h-5 w-5" />
          <span>{format(new Date(event.starts_at), 'h:mm a')}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-3 text-[var(--text-muted)]">
            <MapPin className="h-5 w-5" />
            <span>{event.location}</span>
          </div>
        )}
      </div>

      {event.description && (
        <p className="text-sm text-[var(--text-muted)] mb-6">{event.description}</p>
      )}

      <div className="border-t border-[var(--border-light)] pt-4 mb-4">
        <p className="text-sm font-medium text-[var(--text-main)] mb-3">
          {t('events.rsvp')}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setRsvp('yes')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors ${
              rsvp === 'yes'
                ? 'border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-success)]'
                : 'border-[var(--border-light)] text-[var(--text-muted)]'
            }`}
          >
            <Check className="h-5 w-5" />
            {t('events.rsvp_yes')}
          </button>
          <button
            onClick={() => setRsvp('no')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors ${
              rsvp === 'no'
                ? 'border-[var(--color-error)] bg-[var(--color-error-bg)] text-[var(--color-error)]'
                : 'border-[var(--border-light)] text-[var(--text-muted)]'
            }`}
          >
            <X className="h-5 w-5" />
            {t('events.rsvp_no')}
          </button>
          <button
            onClick={() => setRsvp('maybe')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors ${
              rsvp === 'maybe'
                ? 'border-[var(--color-warning)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
                : 'border-[var(--border-light)] text-[var(--text-muted)]'
            }`}
          >
            <HelpCircle className="h-5 w-5" />
            {t('events.rsvp_maybe')}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        {canMark(['choir_leader', 'assistant_leader', 'super_admin']) && (
          <Button variant="outline" fullWidth onClick={handleMarkAttendance}>
            {t('attendance.mark_attendance')}
          </Button>
        )}
        <Button variant="primary" fullWidth onClick={closeBottomSheet}>
          {t('common.done')}
        </Button>
      </div>
    </div>
  );
};

export default EventsPage;
