import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vjogwowkdmniomhyvfoq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqb2d3b3drZG1uaW9taHl2Zm9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzE4NzAsImV4cCI6MjA5NjQwNzg3MH0.WhzNiVEmYflsZ1wKJnWmX0pZSC4aO912HhcFwUxskqk';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
