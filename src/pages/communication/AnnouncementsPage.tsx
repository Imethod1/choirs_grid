import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronRight, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';

const AnnouncementsPage: React.FC = () => {
  const { t } = useTranslation();
  const { choirMember } = useAuthStore();
  const canCompose = ['choir_leader', 'assistant_leader', 'secretary', 'super_admin'].includes(choirMember?.role || '');

  const announcements = [
    {
      id: '1',
      sender: 'Amina Saleh',
      subject: 'Rehearsal Postponed',
      body: 'Dear members, tomorrow rehearsal is postponed to Friday due to parish meeting.',
      sent_at: new Date().toISOString(),
      channel: 'sms',
    },
    {
      id: '2',
      sender: 'John Mwamba',
      subject: 'Easter Song List',
      body: 'Please find the attached song list for the Easter concert in the Music library.',
      sent_at: new Date(Date.now() - 86400000).toISOString(),
      channel: 'push',
    }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-main)]">{t('nav.messages')}</h1>
          <p className="text-sm text-[var(--text-muted)]">{announcements.length} {t('nav.messages').toLowerCase()}</p>
        </div>
        {canCompose && (
          <Link to="/messages/compose">
            <Button size="sm" icon={<Plus className="h-4 w-4" />}>
              {t('common.add')}
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((msg) => (
            <Card key={msg.id} hoverable className="transition-all">
              <div className="flex items-start gap-4">
                <Avatar name={msg.sender} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-[var(--text-main)]">{msg.sender}</p>
                    <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(msg.sent_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[var(--text-main)] text-sm mb-1">{msg.subject}</h3>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-2">{msg.body}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge size="sm" variant="default" className="capitalize">{msg.channel}</Badge>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--text-subtle)] self-center" />
              </div>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="messages"
            title={t('common.no_results')}
            description={t('empty.messages')}
          />
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
