import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Clock,
  Lock,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useUIStore } from '@/store/ui.store';
import { AddContributionForm } from '@/components/forms/AddContributionForm';
import { AddExpenseForm } from '@/components/forms/AddExpenseForm';
import { mockFinanceSummary, mockContributions, mockExpenses, mockMembersWithUsers } from '@/lib/mock-data';
import { format } from 'date-fns';

const FinancePage: React.FC = () => {
  const { t } = useTranslation();
  const { openBottomSheet } = useUIStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'contributions' | 'expenses'>('overview');
  const [sessionTime, setSessionTime] = useState(5 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const summary = mockFinanceSummary;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      {/* Session timeout warning */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--finance-header)]/10">
        <div className="flex items-center gap-2 text-sm">
          <Lock className="h-4 w-4 text-[var(--finance-accent)]" />
          <span className="text-[var(--text-main)] font-medium">
            {t('finance.title')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-[var(--finance-accent)]" />
          <span className={`font-mono ${sessionTime < 60 ? 'text-[var(--color-error)]' : 'text-[var(--finance-accent)]'}`}>
            {t('finance.session_timeout', { time: formatTime(sessionTime) })}
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[var(--color-success-bg)] border border-[var(--color-success)]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-success)]">{t('finance.total_income')}</p>
              <p className="text-2xl font-bold font-mono text-[var(--color-success)] mt-1 animate-number">
                {formatCurrency(summary.totalContributions)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-[var(--color-success)]/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[var(--color-success)]" />
            </div>
          </div>
        </Card>

        <Card className="bg-[var(--color-error-bg)] border border-[var(--color-error)]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-error)]">{t('finance.total_expenses')}</p>
              <p className="text-2xl font-bold font-mono text-[var(--color-error)] mt-1 animate-number">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-[var(--color-error)]/20 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-[var(--color-error)]" />
            </div>
          </div>
        </Card>

        <Card className="bg-[var(--finance-header)]/10 border border-[var(--finance-accent)]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--finance-accent)]">{t('finance.balance')}</p>
              <p className="text-2xl font-bold font-mono text-[var(--text-main)] mt-1 animate-number">
                {formatCurrency(summary.balance)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-[var(--finance-accent)] flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[var(--bg-hover)] rounded-lg">
        {(['overview', 'contributions', 'expenses'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm'
                : 'text-[var(--text-muted)]'
            }`}
          >
            {tab === 'overview' ? t('finance.dashboard') : t(`finance.${tab}`)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader 
              title={t('finance.contributions')}
              action={
                <Button size="sm" variant="ghost" icon={<Plus className="h-4 w-4" />}>
                  {t('common.add')}
                </Button>
              }
            />
            <div className="space-y-3">
              {mockContributions.slice(0, 4).map((contribution) => {
                const member = mockMembersWithUsers.find(m => m.id === contribution.member_id);
                return (
                  <div key={contribution.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-hover)]">
                    <div>
                      <p className="font-medium text-sm text-[var(--text-main)]">
                        {member?.user.full_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {t(`finance.${contribution.category}`)} • {format(new Date(contribution.contribution_date), 'MMM d')}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-[var(--color-success)]">
                      +{formatCurrency(contribution.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader 
              title={t('finance.expenses')}
              action={
                <Button size="sm" variant="ghost" icon={<Plus className="h-4 w-4" />}>
                  {t('common.add')}
                </Button>
              }
            />
            <div className="space-y-3">
              {mockExpenses.slice(0, 4).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-hover)]">
                  <div>
                    <p className="font-medium text-sm text-[var(--text-main)]">
                      {expense.description}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {t(`finance.${expense.category}`)} • {format(new Date(expense.expense_date), 'MMM d')}
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-[var(--color-error)]">
                    -{formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'contributions' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => openBottomSheet(<AddContributionForm />)}>
              {t('finance.add_contribution')}
            </Button>
          </div>
          {mockContributions.length > 0 ? (
            mockContributions.map((contribution) => {
              const member = mockMembersWithUsers.find(m => m.id === contribution.member_id);
              return (
                <Card key={contribution.id} hoverable padding="sm">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-[var(--color-success-bg)] flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-[var(--color-success)]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-main)]">
                        {member?.user.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {t(`finance.${contribution.category}`)} • {format(new Date(contribution.contribution_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-[var(--color-success)]">
                        {formatCurrency(contribution.amount)}
                      </p>
                      {contribution.receipt_url && (
                        <Badge size="sm" variant="info">
                          <Receipt className="h-3 w-3 mr-1" /> Receipt
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-[var(--text-subtle)]" />
                  </div>
                </Card>
              );
            })
          ) : (
            <EmptyState icon="finance" title={t('common.no_results')} description={t('empty.contributions')} />
          )}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => openBottomSheet(<AddExpenseForm />)}>
              {t('finance.add_expense')}
            </Button>
          </div>
          {mockExpenses.length > 0 ? (
            mockExpenses.map((expense) => (
              <Card key={expense.id} hoverable padding="sm">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[var(--color-error-bg)] flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-[var(--color-error)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text-main)]">
                      {expense.description}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {t(`finance.${expense.category}`)} • {format(new Date(expense.expense_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-[var(--color-error)]">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[var(--text-subtle)]" />
                </div>
              </Card>
            ))
          ) : (
            <EmptyState icon="finance" title={t('common.no_results')} description={t('empty.expenses')} />
          )}
        </div>
      )}
    </div>
  );
};

export default FinancePage;
