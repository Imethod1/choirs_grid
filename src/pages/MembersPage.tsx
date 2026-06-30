import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, ChevronRight, Phone, Mail } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Skeleton';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { PII_ROLES, LEADERSHIP_ROLES } from '@/lib/rbac';
import { AddMemberForm } from '@/components/forms/AddMemberForm';
import { membersService } from '@/services';
import type { MemberWithUser } from '@/types/app.types';
import type { VoicePart, MemberStatus } from '@/types/database.types';

const MembersPage: React.FC = () => {
  const { t } = useTranslation();
  const { openBottomSheet } = useUIStore();
  const { hasAnyRole, choir } = useAuthStore();

  const canViewPhone = hasAnyRole(PII_ROLES);
  const canManageMembers = hasAnyRole(LEADERSHIP_ROLES);

  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceFilter, setVoiceFilter] = useState<VoicePart | 'all'>('all');
  const [statusFilter] = useState<MemberStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = async () => {
    if (!choir?.id) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await membersService.getMembers(choir.id);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.server'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choir?.id]);

  const voiceParts: Array<{ value: VoicePart | 'all'; label: string }> = [
    { value: 'all', label: t('members.all_members') },
    { value: 'soprano', label: t('voice_parts.soprano') },
    { value: 'alto', label: t('voice_parts.alto') },
    { value: 'tenor', label: t('voice_parts.tenor') },
    { value: 'bass', label: t('voice_parts.bass') },
  ];

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = member.user.full_name.toLowerCase().includes(query);
        const matchesVoice = member.voice_part?.toLowerCase().includes(query);
        const matchesRole = member.role.toLowerCase().includes(query);

        if (!matchesName && !matchesVoice && !matchesRole) return false;
      }

      if (voiceFilter !== 'all' && member.voice_part !== voiceFilter) {
        return false;
      }

      if (statusFilter !== 'all' && member.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [members, searchQuery, voiceFilter, statusFilter]);

  const groupedMembers = useMemo(() => {
    if (voiceFilter !== 'all') return { [voiceFilter]: filteredMembers };

    const groups: Record<string, MemberWithUser[]> = {};
    filteredMembers.forEach((member) => {
      const part = member.voice_part || 'other';
      if (!groups[part]) groups[part] = [];
      groups[part].push(member);
    });
    return groups;
  }, [filteredMembers, voiceFilter]);

  const handleMemberClick = (member: MemberWithUser) => {
    openBottomSheet(<MemberDetailSheet member={member} canViewPhone={canViewPhone} />);
  };

  const openAddMemberForm = () => {
    openBottomSheet(
      <AddMemberForm
        onCreated={(member) => {
          setMembers((current) => [...current, member]);
        }}
      />
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-main)]">
            {t('members.directory')}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {filteredMembers.length} {t('members.title').toLowerCase()}
          </p>
        </div>
        {canManageMembers && (
          <Button size="sm" icon={<UserPlus className="h-4 w-4" />} onClick={openAddMemberForm}>
            {t('members.add_member')}
          </Button>
        )}
      </div>

      {error && (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--color-error)]">{error}</p>
            <Button size="sm" variant="outline" onClick={loadMembers}>{t('common.retry')}</Button>
          </div>
        </Card>
      )}

      {/* Search and filters */}
      <div className="space-y-3">
        <Input
          placeholder={t('members.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />

        {/* Voice part filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {voiceParts.map((part) => (
            <button
              key={part.value}
              onClick={() => setVoiceFilter(part.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                voiceFilter === part.value
                  ? 'bg-[var(--action-primary)] text-white'
                  : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
              }`}
            >
              {part.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members list */}
      {isLoading ? (
        <SkeletonList count={5} />
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon="members"
          title={t('common.no_results')}
          description={searchQuery ? undefined : t('empty.members')}
          action={
            searchQuery
              ? { label: t('common.clear'), onClick: () => setSearchQuery('') }
              : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMembers).map(([voicePart, members]) => (
            <div key={voicePart}>
              <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-1">
                {t(`voice_parts.${voicePart}`, voicePart)}
                <span className="ml-2 text-[var(--text-subtle)]">({members.length})</span>
              </h3>
              <Card padding="none" className="divide-y divide-[var(--border-light)]">
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleMemberClick(member)}
                    className="flex items-center gap-4 w-full p-4 hover:bg-[var(--bg-hover)] transition-colors text-left"
                  >
                    <Avatar name={member.user.full_name} src={member.user.photo_url} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-main)] truncate">
                          {member.user.full_name}
                        </span>
                        {member.role !== 'member' && (
                          <Badge variant="accent" size="sm">
                            {t(`roles.${member.role}`)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-muted)] truncate">
                        {member.voice_part ? t(`voice_parts.${member.voice_part}`) : t('common.not_found')}
                      </p>
                    </div>
                    <StatusBadge status={member.status} />
                    <ChevronRight className="h-5 w-5 text-[var(--text-subtle)] flex-shrink-0" />
                  </button>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Member detail bottom sheet
interface MemberDetailSheetProps {
  member: MemberWithUser;
  canViewPhone: boolean;
}

const MemberDetailSheet: React.FC<MemberDetailSheetProps> = ({ member, canViewPhone }) => {
  const { t } = useTranslation();
  const { closeBottomSheet } = useUIStore();

  return (
    <div className="pt-2">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={member.user.full_name} src={member.user.photo_url} size="xl" />
        <div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">
            {member.user.full_name}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {member.voice_part ? t(`voice_parts.${member.voice_part}`) : t('common.not_found')} • {t(`roles.${member.role}`)}
          </p>
          <div className="mt-2">
            <StatusBadge status={member.status} />
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-3 mb-6">
        {canViewPhone && (
          <a
            href={`tel:${member.user.phone}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--border-light)] transition-colors"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--primary-container)]">
              <Phone className="h-5 w-5 text-[var(--on-primary-container)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t('members.contact')}</p>
              <p className="font-medium text-[var(--text-main)]">
                {member.user.phone}
              </p>
            </div>
          </a>
        )}

        {member.user.email && (
          <a
            href={`mailto:${member.user.email}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--border-light)] transition-colors"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--cta-accent)]/20">
              <Mail className="h-5 w-5 text-[var(--cta-accent)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Email</p>
              <p className="font-medium text-[var(--text-main)]">
                {member.user.email}
              </p>
            </div>
          </a>
        )}
      </div>

      {/* Member since */}
      {member.joined_at && (
        <p className="text-sm text-[var(--text-muted)] text-center">
          {t('members.member_since', {
            date: new Date(member.joined_at).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })
          })}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border-light)]">
        <Button variant="outline" fullWidth onClick={closeBottomSheet}>
          {t('common.cancel')}
        </Button>
        <Button variant="primary" fullWidth onClick={closeBottomSheet}>
          {t('members.profile')}
        </Button>
      </div>
    </div>
  );
};

export default MembersPage;