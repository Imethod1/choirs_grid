// Edge Function: purge-guests
// Trigger: Cron (daily via pg_cron or external scheduler)
// Purpose: Soft-deletes guest/visitor choir_member records older than 90 days
//
// Wire to Supabase pg_cron:
//   SELECT cron.schedule('purge-guests', '0 2 * * *',
//     $$SELECT net.http_post(
//       url := current_setting('app.supabase_url') || '/functions/v1/purge-guests',
//       headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key')),
//       body := '{}'::jsonb
//     )$$
//   );

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

    // Find guest members older than 90 days
    const { data: guestMembers, error: fetchError } = await supabase
      .from('choir_members')
      .select('id, user_id, choir_id')
      .eq('status', 'guest')
      .lt('created_at', cutoffDate)

    if (fetchError) {
      console.error('[purge-guests] Fetch error:', JSON.stringify(fetchError))
      throw new Error('Failed to query guest members')
    }

    if (!guestMembers || guestMembers.length === 0) {
      console.log('[purge-guests] No stale guests found')
      return new Response(
        JSON.stringify({ success: true, purged: 0 }),
        { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const guestIds = guestMembers.map((g: { id: string }) => g.id)

    // Delete related attendance records first (CASCADE should handle this, but be explicit)
    const { error: attError } = await supabase
      .from('attendance_records')
      .delete()
      .in('member_id', guestIds)

    if (attError) {
      console.error('[purge-guests] Attendance cleanup error:', JSON.stringify(attError))
    }

    // Delete the guest choir_member records
    const { error: deleteError } = await supabase
      .from('choir_members')
      .delete()
      .in('id', guestIds)

    if (deleteError) {
      console.error('[purge-guests] Delete error:', JSON.stringify(deleteError))
      throw new Error('Failed to delete guest members')
    }

    // Log to audit
    for (const guest of guestMembers) {
      await supabase.from('audit_log').insert({
        choir_id: guest.choir_id,
        action: 'delete',
        entity_type: 'choir_member',
        entity_id: guest.id,
        metadata: { reason: 'auto_purge_guest_90_days', user_id: guest.user_id },
      })
    }

    console.log(`[purge-guests] Purged ${guestIds.length} stale guest records`)

    return new Response(
      JSON.stringify({ success: true, purged: guestIds.length }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[purge-guests] error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
