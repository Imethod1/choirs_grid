import { mockContributions, mockExpenses, mockFinanceSummary, delay } from '@/lib/mock-data';
import type { Contribution, Expense } from '@/types/database.types';
import type { FinanceSummary } from '@/types/app.types';

export async function getFinanceSummary(_choirId: string): Promise<FinanceSummary> {
  await delay(500);
  return mockFinanceSummary;
}

export async function getContributions(_choirId: string): Promise<Contribution[]> {
  await delay(400);
  return mockContributions;
}

export async function getExpenses(_choirId: string): Promise<Expense[]> {
  await delay(400);
  return mockExpenses;
}

export async function addContribution(
  _choirId: string,
  payload: {
    memberId: string;
    amount: number;
    category: string;
    contributionDate: string;
    note?: string;
    receiptUrl?: string;
  }
): Promise<Contribution> {
  await delay(800);
  console.log('[MOCK] addContribution:', payload);
  return {
    id: 'con_' + Date.now(),
    choir_id: 'chr_001',
    member_id: payload.memberId,
    amount: payload.amount,
    currency: 'TZS',
    category: payload.category,
    contribution_date: payload.contributionDate,
    note: payload.note || null,
    receipt_url: payload.receiptUrl || null,
    recorded_by: 'usr_001',
    deleted_at: null,
    deleted_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function addExpense(
  _choirId: string,
  payload: {
    description: string;
    amount: number;
    category: string;
    expenseDate: string;
    receiptUrl?: string;
  }
): Promise<Expense> {
  await delay(800);
  console.log('[MOCK] addExpense:', payload);
  return {
    id: 'exp_' + Date.now(),
    choir_id: 'chr_001',
    description: payload.description,
    amount: payload.amount,
    currency: 'TZS',
    category: payload.category,
    expense_date: payload.expenseDate,
    receipt_url: payload.receiptUrl || null,
    recorded_by: 'usr_001',
    deleted_at: null,
    deleted_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function softDeleteContribution(_contributionId: string): Promise<void> {
  await delay(500);
  console.log('[MOCK] softDeleteContribution');
}

export async function softDeleteExpense(_expenseId: string): Promise<void> {
  await delay(500);
  console.log('[MOCK] softDeleteExpense');
}
