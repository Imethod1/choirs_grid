import { supabase } from '@/lib/supabase';
import type { Choir } from '@/types/database.types';

export interface UpdateChoirInput {
  name: string;
  parish: string;
  diocese?: string | null;
  region?: string | null;
  country?: string;
  description?: string | null;
  foundedYear?: number | null;
  monthlyDuesAmount?: number | null;
  duesCurrency?: string;
}

export async function updateChoir(choirId: string, input: UpdateChoirInput): Promise<Choir> {
  const { data, error } = await supabase
    .from('choirs')
    .update({
      name: input.name.trim(),
      parish: input.parish.trim(),
      diocese: input.diocese?.trim() || null,
      region: input.region?.trim() || null,
      country: input.country?.trim() || 'TZ',
      description: input.description?.trim() || null,
      founded_year: input.foundedYear ?? null,
      monthly_dues_amount: input.monthlyDuesAmount ?? null,
      dues_currency: input.duesCurrency?.trim().toUpperCase() || 'TZS',
    })
    .eq('id', choirId)
    .select('*')
    .single();

  if (error) throw error;
  return data as Choir;
}