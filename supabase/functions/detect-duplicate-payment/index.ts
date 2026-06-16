/**
 * Edge Function: detect-duplicate-payment
 * Trigger: Called before save-contribution
 * Purpose: Checks same member + amount + date (±1 day); returns warning if found
 * 
 * Request body: { choir_id, member_id, amount, contribution_date }
 * Response: { duplicate: false } or { duplicate: true, existing_id: "..." }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { choir_id, member_id, amount, contribution_date } = await req.json();

    const dateObj = new Date(contribution_date);
    const dayBefore = new Date(dateObj.getTime() - 86400000).toISOString().split('T')[0];
    const dayAfter = new Date(dateObj.getTime() + 86400000).toISOString().split('T')[0];

    // TODO: Query contributions table for matching records
    // WHERE choir_id = $1 AND member_id = $2 AND amount = $3
    //   AND contribution_date BETWEEN dayBefore AND dayAfter
    //   AND deleted_at IS NULL

    console.log(`[EDGE] detect-duplicate: ${member_id} ${amount} TZS on ${contribution_date}`);

    return new Response(JSON.stringify({ duplicate: false }), {
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
