import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { mockDashboardStats, mockMembersWithUsers } from '@/lib/mock-data';

const AnalyticsDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const stats = mockDashboardStats;

  const voicePartData = [
    { label: t('voice_parts.soprano'), count: mockMembersWithUsers.filter(m => m.voice_part === 'soprano').length },
    { label: t('voice_parts.alto'), count: mockMembersWithUsers.filter(m => m.voice_part === 'alto').length },
    { label: t('voice_parts.tenor'), count: mockMembersWithUsers.filter(m => m.voice_part === 'tenor').length },
    { label: t('voice_parts.bass'), count: mockMembersWithUsers.filter(m => m.voice_part === 'bass').length },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-[var(--action-primary)] flex items-center justify-center text-[var(--on-primary)]">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-main)]">{t('nav.reports')}</h1>
          <p className="text-sm text-[var(--text-muted)]">{t('dashboard.recent_activity')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <Card>
          <CardHeader title={t('dashboard.attendance_rate')} action={<TrendingUp className="h-4 w-4 text-[var(--action-primary)]" />} />
          <div className="text-center py-6">
            <p className="text-5xl font-bold text-[var(--action-primary)] animate-number">{stats.attendanceRate}%</p>
            <p className="text-xs text-[var(--text-muted)] mt-2">{t('dashboard.this_week')}</p>
          </div>
          <div className="flex justify-between border-t border-[var(--border-light)] pt-4 mt-2">
            <div className="text-center flex-1">
              <p className="text-sm font-bold text-[var(--text-main)]">8.2</p>
              <p className="text-[10px] text-[var(--text-muted)]">{t('events.title')}</p>
            </div>
            <div className="text-center flex-1 border-x border-[var(--border-light)]">
              <p className="text-sm font-bold text-[var(--text-main)]">12</p>
              <p className="text-[10px] text-[var(--text-muted)]">{t('attendance.late')}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-sm font-bold text-[var(--text-main)]">3</p>
              <p className="text-[10px] text-[var(--text-muted)]">{t('attendance.excused')}</p>
            </div>
          </div>
        </Card>

        {/* Voice Distribution */}
        <Card>
          <CardHeader title={t('members.voice_parts')} action={<PieChart className="h-4 w-4 text-[var(--action-primary)]" />} />
          <div className="space-y-4 py-2">
            {voicePartData.map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[var(--text-main)]">
                  <span>{item.label}</span>
                  <span>{item.count} {t('members.title').toLowerCase()}</span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-hover)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--action-primary)] rounded-full" 
                    style={{ width: `${(item.count / mockMembersWithUsers.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Financial Stability */}
        <Card>
          <CardHeader title={t('finance.balance')} action={<DollarSign className="h-4 w-4 text-[var(--action-primary)]" />} />
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-hover)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--action-primary)" strokeWidth="8" strokeDasharray="212" strokeDashoffset="42" strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-[var(--text-main)]">80%</span>
                <span className="text-[10px] text-[var(--text-muted)] uppercase">✓</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-4 text-center px-4">
              {t('finance.monthly_dues')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
