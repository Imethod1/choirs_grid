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
