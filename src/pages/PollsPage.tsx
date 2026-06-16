import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/Toast';

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  closesAt: string | null;
  totalVotes: number;
  hasVoted: boolean;
  myVote: string | null;
}

const mockPolls: Poll[] = [
  {
    id: 'poll_001',
    question: 'Siku gani tuwe na mazoezi ya ziada? / Which day for extra rehearsal?',
    options: [
      { id: 'opt_1', label: 'Jumamosi / Saturday', votes: 8 },
      { id: 'opt_2', label: 'Jumapili alasiri / Sunday afternoon', votes: 5 },
      { id: 'opt_3', label: 'Ijumaa jioni / Friday evening', votes: 3 },
    ],
    isActive: true,
    closesAt: null,
    totalVotes: 16,
    hasVoted: false,
    myVote: null,
  },
  {
    id: 'poll_002',
    question: 'Rangi ya sare mpya? / New uniform color?',
    options: [
      { id: 'opt_a', label: 'Kijani / Green', votes: 10 },
      { id: 'opt_b', label: 'Samawati / Blue', votes: 7 },
      { id: 'opt_c', label: 'Nyeupe / White', votes: 4 },
    ],
    isActive: false,
    closesAt: '2024-02-28',
    totalVotes: 21,
    hasVoted: true,
    myVote: 'opt_a',
  },
];

const PollsPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasAnyRole } = useAuthStore();
  const toast = useToast();
  const canCreate = hasAnyRole(['choir_leader', 'assistant_leader', 'super_admin']);

  const [polls, setPolls] = useState(mockPolls);

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id !== pollId || poll.hasVoted) return poll;
      return {
        ...poll,
        hasVoted: true,
        myVote: optionId,
        totalVotes: poll.totalVotes + 1,
        options: poll.options.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt),
      };
    }));
    toast.success(t('common.done'));
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-main)]">Polls</h1>
          <p className="text-sm text-[var(--text-muted)]">{polls.length} polls</p>
        </div>
        {canCreate && (
          <Button size="sm" icon={<Plus className="h-4 w-4" />}>
            {t('common.add')}
          </Button>
        )}
      </div>

      {polls.length > 0 ? (
        polls.map(poll => (
          <Card key={poll.id}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-main)] flex-1">{poll.question}</h3>
              <Badge variant={poll.isActive ? 'success' : 'default'} size="sm">
                {poll.isActive ? t('members.active') : t('common.done')}
              </Badge>
            </div>

            <div className="space-y-3">
              {poll.options.map(option => {
                const pct = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                const isMyVote = poll.myVote === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => !poll.hasVoted && poll.isActive && handleVote(poll.id, option.id)}
                    disabled={poll.hasVoted || !poll.isActive}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all relative overflow-hidden ${
                      isMyVote
                        ? 'border-[var(--action-primary)] bg-[var(--primary-container)]/30'
                        : 'border-[var(--border-light)] hover:border-[var(--border-primary)]'
                    } ${(!poll.hasVoted && poll.isActive) ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {/* Progress bar background */}
                    {poll.hasVoted && (
                      <div
                        className="absolute inset-y-0 left-0 bg-[var(--action-primary)]/10 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    )}

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isMyVote && <Check className="h-4 w-4 text-[var(--action-primary)]" />}
                        <span className={`text-sm font-medium ${isMyVote ? 'text-[var(--action-primary)]' : 'text-[var(--text-main)]'}`}>
                          {option.label}
                        </span>
                      </div>
                      {poll.hasVoted && (
                        <span className="text-xs font-bold text-[var(--text-muted)]">{pct}%</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-[var(--text-muted)] mt-3">
              {poll.totalVotes} {t('members.title').toLowerCase()} voted
              {poll.hasVoted && ' • ✓ Voted'}
            </p>
          </Card>
        ))
      ) : (
        <EmptyState icon="messages" title={t('common.no_results')} description="No polls yet." />
      )}
    </div>
  );
};

export default PollsPage;
