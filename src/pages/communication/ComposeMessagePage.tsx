import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, ChevronLeft, Users, User, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

const ComposeMessagePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [targetType, setTargetType] = useState<'all' | 'role' | 'voice_part'>('all');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body) {
      toast.error(t('errors.validation'));
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast.success(t('common.done'));
    navigate('/messages');
  };

  const targets = [
    { key: 'all' as const, icon: Users, label: t('members.all_members') },
    { key: 'role' as const, icon: User, label: t('roles.member') },
    { key: 'voice_part' as const, icon: MessageCircle, label: t('members.voice_parts') },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--bg-hover)] rounded-lg">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-[var(--text-main)]">{t('nav.messages')}</h1>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSend} className="space-y-6">
          {/* Target Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--text-main)]">{t('common.filter')}:</label>
            <div className="grid grid-cols-3 gap-2">
              {targets.map((tgt) => {
                const Icon = tgt.icon;
                return (
                  <button
                    key={tgt.key}
                    type="button"
                    onClick={() => setTargetType(tgt.key)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      targetType === tgt.key 
                        ? 'border-[var(--action-primary)] bg-[var(--primary-container)] text-[var(--on-primary-container)]' 
                        : 'border-[var(--border-light)] text-[var(--text-muted)]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-bold">{tgt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label={t('common.search')}
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Next Rehearsal Update"
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-main)]">{t('nav.messages')}</label>
            <textarea
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-surface)] p-4 text-sm min-h-[150px] text-[var(--text-main)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--action-primary)] transition-all"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="..."
            />
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isLoading}
            icon={<Send className="h-5 w-5" />}
          >
            {t('common.confirm')}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ComposeMessagePage;
