/**
 * Edge Function: purge-guests
 * Trigger: Cron (daily)
 * Purpose: Deletes guest/visitor records older than 90 days
 * 
 * TODO: Wire to Supabase pg_cron
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (_req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // TODO: DELETE FROM choir_members WHERE status = 'guest' AND created_at < cutoff
    console.log(`[EDGE] purge-guests: cutoff ${cutoff}`);

    return new Response(JSON.stringify({ success: true, purged: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
