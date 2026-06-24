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

  const now = new Date();
  return {
    totalContributions,
    totalExpenses,
    balance: totalContributions - totalExpenses,
    currency: 'TZS',
    period: {
      start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
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

export async function addContribution(
  choirId: string,
  payload: {
    memberId: string;
    amount: number;
    category: string;
    contributionDate: string;
    note?: string;
    receiptUrl?: string;
  }
): Promise<Contribution> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check for duplicate via edge function
  try {
    const functionsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
    const res = await fetch(`${functionsUrl}/detect-duplicate-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        choir_id: choirId,
        member_id: payload.memberId,
        amount: payload.amount,
        contribution_date: payload.contributionDate,
      }),
    });
    const dupCheck = await res.json();
    if (dupCheck?.duplicate) {
      throw new Error(`Possible duplicate payment detected (existing record: ${dupCheck.existing_id}). Please verify before proceeding.`);
    }
  } catch (err) {
    // If the duplicate check itself fails, log but allow the contribution
    if (err instanceof Error && err.message.includes('duplicate')) throw err;
    console.warn('[FINANCE] Duplicate check unavailable:', err);
  }

  const { data, error } = await supabase
    .from('contributions')
    .insert({
      choir_id: choirId,
      member_id: payload.memberId,
      amount: payload.amount,
      category: payload.category,
      contribution_date: payload.contributionDate,
      note: payload.note || null,
      receipt_url: payload.receiptUrl || null,
      recorded_by: user.id,
    } as never)
    .select()
    .single();

  if (error) throw error;
  return data as Contribution;
}

export async function addExpense(
  choirId: string,
  payload: {
    description: string;
    amount: number;
    category: string;
    expenseDate: string;
    receiptUrl?: string;
  }
): Promise<Expense> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      choir_id: choirId,
      description: payload.description,
      amount: payload.amount,
      category: payload.category,
      expense_date: payload.expenseDate,
      receipt_url: payload.receiptUrl || null,
      recorded_by: user.id,
    } as never)
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function softDeleteContribution(
  contributionId: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('contributions')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    } as never)
    .eq('id', contributionId);

  if (error) throw error;
}

export async function softDeleteExpense(
  expenseId: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('expenses')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    } as never)
    .eq('id', expenseId);

  if (error) throw error;
}
