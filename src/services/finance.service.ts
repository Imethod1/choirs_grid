import { supabase } from '@/lib/supabase';
import type { Contribution, Expense } from '@/types/database.types';
import type { FinanceSummary } from '@/types/app.types';

export async function getFinanceSummary(choirId: string): Promise<FinanceSummary> {
  const [contribs, exps] = await Promise.all([
    getContributions(choirId),
    getExpenses(choirId),
  ]);

  const totalContributions = contribs.reduce((sum, c) => sum + c.amount, 0);
  const totalExpenses = exps.reduce((sum, e) => sum + e.amount, 0);

  const contributionsByCategory: Record<string, number> = {};
  contribs.forEach((c) => {
    contributionsByCategory[c.category] = (contributionsByCategory[c.category] || 0) + c.amount;
  });

  const expensesByCategory: Record<string, number> = {};
  exps.forEach((e) => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
  });

  return {
    totalContributions,
    totalExpenses,
    balance: totalContributions - totalExpenses,
    currency: 'TZS',
    period: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    contributionsByCategory,
    expensesByCategory,
  };
}

export async function getContributions(choirId: string): Promise<Contribution[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('choir_id', choirId)
    .is('deleted_at', null)
    .order('contribution_date', { ascending: false });

  if (error) throw error;
  return (data || []) as Contribution[];
}

export async function getExpenses(choirId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('choir_id', choirId)
    .is('deleted_at', null)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return (data || []) as Expense[];
}
