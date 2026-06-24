/**
 * Edge Function: detect-duplicate-payment
 * Trigger: Called before save-contribution
 * Purpose: Checks same member + amount + date (±1 day); returns warning if found
 *
 * Request body: { choir_id, member_id, amount, contribution_date }
 * Response: { duplicate: false } or { duplicate: true, existing_id: "..." }
 */

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

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const { choir_id, member_id, amount, contribution_date } = body

    if (!choir_id || !member_id || !amount || !contribution_date) {
      return new Response(
        JSON.stringify({ error: 'choir_id, member_id, amount, and contribution_date are required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const dateObj = new Date(contribution_date as string)
    if (isNaN(dateObj.getTime())) {
      return new Response(
        JSON.stringify({ error: 'Invalid contribution_date' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const dayBefore = new Date(dateObj.getTime() - 86400000).toISOString().split('T')[0]
    const dayAfter = new Date(dateObj.getTime() + 86400000).toISOString().split('T')[0]

    const { data: existing, error } = await supabase
      .from('contributions')
      .select('id, amount, contribution_date')
      .eq('choir_id', choir_id)
      .eq('member_id', member_id)
      .eq('amount', amount)
      .gte('contribution_date', dayBefore)
      .lte('contribution_date', dayAfter)
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[detect-duplicate] Query error:', JSON.stringify(error))
      throw new Error('Database query failed')
    }

    if (existing) {
      console.log(`[detect-duplicate] DUPLICATE found: ${existing.id} for member ${member_id}`)
      return new Response(
        JSON.stringify({ duplicate: true, existing_id: existing.id }),
        { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ duplicate: false }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[detect-duplicate] error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
