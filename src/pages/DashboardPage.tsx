import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  TrendingUp,
  ChevronRight,
  Music,
  Clock,
  MapPin
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/auth.store';
import { eventsService, membersService } from '@/services';
import { format } from 'date-fns';
import type { Event } from '@/types/database.types';
import type { MemberWithUser } from '@/types/app.types';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, choir } = useAuthStore();

  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    if (!choir?.id) {
      setIsLoading(false);
      setMembers([]);
      setUpcomingEvents([]);
      setAttendanceRate(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [membersData, eventsData, rate] = await Promise.all([
        membersService.getMembers(choir.id),
        eventsService.getUpcomingEvents(choir.id, 3),
        eventsService.getAttendanceRate(choir.id),
      ]);

      setMembers(membersData);
      setUpcomingEvents(eventsData);
      setAttendanceRate(rate);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.server'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choir?.id]);

  const activeMembers = useMemo(
    () => members.filter((member) => member.status === 'active' || member.status === 'probation').length,
    [members]
  );

  const statCards = [
    {
      key: 'members',
      label: t('dashboard.total_members'),
      value: members.length,
      subtitle: `${activeMembers} ${t('dashboard.active_members')}`,
      icon: Users,
      color: 'bg-[var(--primary-container)] text-[var(--on-primary-container)]',
      link: '/members',
    },
    {
      key: 'events',
      label: t('dashboard.upcoming_events'),
      value: upcomingEvents.length,
      subtitle: t('dashboard.this_week'),
      icon: Calendar,
      color: 'bg-[var(--secondary-container)] text-[var(--on-secondary-container)]',
      link: '/events',
    },
    {
      key: 'attendance',
      label: t('dashboard.attendance_rate'),
      value: `${attendanceRate}%`,
      subtitle: t('attendance.attendance_rate', { rate: attendanceRate }),
      icon: TrendingUp,
      color: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
      link: '/events',
    },
  ];

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
        <SkeletonCard />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)]">
            {t('dashboard.welcome', { name: user?.display_name || user?.full_name })}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {choir ? `${choir.name} • ${choir.parish}` : t('errors.no_permission')}
          </p>
        </div>
        <Avatar name={user?.full_name || ''} size="lg" />
      </div>

      {error && (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--color-error)]">{error}</p>
            <Button size="sm" variant="outline" onClick={loadDashboard}>{t('common.retry')}</Button>
          </div>
        </Card>
      )}

      {/* Stats grid — real Supabase data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.key} to={stat.link} className="stagger-item" style={{ ['--stagger-index' as string]: i }}>
              <Card variant="bento" hoverable className="h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
                    <p className="text-3xl font-bold text-[var(--text-main)] mt-1 animate-number">
                      {stat.value}
                    </p>
                    <p className="text-xs text-[var(--text-subtle)] mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming events */}
        <Card>
          <CardHeader
            title={t('dashboard.upcoming_events')}
            action={
              <Link to="/events" className="text-sm text-[var(--action-primary)] font-medium flex items-center gap-1">
                {t('common.view_all')} <ChevronRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <Link
                to="/events"
                key={event.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center min-w-[48px] h-12 rounded-lg bg-[var(--primary-container)]">
                  <span className="text-xs font-medium text-[var(--on-primary-container)]">
                    {format(new Date(event.starts_at), 'MMM')}
                  </span>
                  <span className="text-lg font-bold text-[var(--on-primary-container)]">
                    {format(new Date(event.starts_at), 'd')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[var(--text-main)] truncate">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.starts_at), 'h:mm a')}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant={event.event_type === 'rehearsal' ? 'default' : 'accent'} size="sm">
                  {t(`events.${event.event_type}`)}
                </Badge>
              </Link>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="text-center py-6 text-[var(--text-muted)]">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('dashboard.no_upcoming')}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick actions & recent members */}
        <div className="space-y-6">
          {/* Quick actions */}
          <Card>
            <CardHeader title={t('dashboard.quick_actions')} />
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/events"
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--primary-container)] hover:bg-[var(--primary-container)]/80 transition-colors"
              >
                <Calendar className="h-5 w-5 text-[var(--on-primary-container)]" />
                <span className="text-sm font-medium text-[var(--on-primary-container)]">
                  {t('attendance.mark_attendance')}
                </span>
              </Link>
              <Link
                to="/music"
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--cta-accent)]/10 hover:bg-[var(--cta-accent)]/20 transition-colors"
              >
                <Music className="h-5 w-5 text-[var(--cta-accent)]" />
                <span className="text-sm font-medium text-[var(--cta-accent)]">
                  {t('music.practice')}
                </span>
              </Link>
            </div>
          </Card>

          {/* Recent members */}
          <Card>
            <CardHeader
              title={t('members.title')}
              action={
                <Link to="/members" className="text-sm text-[var(--action-primary)] font-medium flex items-center gap-1">
                  {t('common.view_all')} <ChevronRight className="h-4 w-4" />
                </Link>
              }
            />
            <div className="flex items-center justify-between">
              <AvatarGroup
                users={members.slice(0, 6).map(m => ({
                  name: m.user.full_name,
                  src: m.user.photo_url
                }))}
                max={5}
                size="md"
              />
              <span className="text-sm text-[var(--text-muted)]">
                +{members.length} {t('members.all_members').toLowerCase()}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
