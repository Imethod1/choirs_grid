// supabase/functions/verify-otp/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Environment ────────────────────────────────────────────────────────────
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// ── CORS ───────────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
}

// ── Hash helper ────────────────────────────────────────────────────────────
async function hashOtp(otp: string): Promise<string> {
  const data   = new TextEncoder().encode(otp)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// ── Main ───────────────────────────────────────────────────────────────────
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
    // ── Parse body ─────────────────────────────────────────────────────
    let body: any
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const { phone, otp } = body

    // ── Validate inputs ────────────────────────────────────────────────
    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone and OTP are required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const cleanPhone = phone.trim()
    const cleanOtp   = otp.toString().trim()

    if (!/^\+255\d{9}$/.test(cleanPhone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone format' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      return new Response(
        JSON.stringify({ error: 'OTP must be 6 digits' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
    const otpHash  = await hashOtp(cleanOtp)

    // ── Look up valid unused OTP ───────────────────────────────────────
    const { data: record, error: lookupError } = await supabase
      .from('otp_codes')
      .select('id, attempts')
      .eq('phone', cleanPhone)
      .eq('otp_hash', otpHash)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lookupError) {
      console.error('[verify-otp] lookup error:', JSON.stringify(lookupError))
      throw new Error('Database error during OTP lookup')
    }

    // ── OTP not found ──────────────────────────────────────────────────
    if (!record) {
      // Increment attempts on most recent unused OTP for this phone
      const { data: latest } = await supabase
        .from('otp_codes')
        .select('id, attempts')
        .eq('phone', cleanPhone)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latest) {
        await supabase
          .from('otp_codes')
          .update({ attempts: (latest.attempts ?? 0) + 1 })
          .eq('id', latest.id)

        // Lock out after 5 wrong attempts
        if ((latest.attempts ?? 0) >= 4) {
          await supabase
            .from('otp_codes')
            .update({ used: true })          // invalidate OTP
            .eq('id', latest.id)

          return new Response(
            JSON.stringify({
              error: 'Too many wrong attempts. Please request a new OTP.',
            }),
            { status: 429, headers: { ...CORS, 'Content-Type': 'application/json' } }
          )
        }
      }

      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    // ── Mark OTP as used (single-use enforcement) ──────────────────────
    await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', record.id)

    // ── Update phone_verified_at in public.users ───────────────────────
    const { error: updateError } = await supabase
      .from('users')
      .update({ phone_verified_at: new Date().toISOString() })
      .eq('phone', cleanPhone)

    if (updateError) {
      console.warn('[verify-otp] phone_verified_at update failed:', updateError)
      // Non-fatal — user is still verified
    }

    // ── Generate Supabase session for this user ────────────────────────
    // Use admin generateLink to create a magic link session
    const { data: userRecord } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle()

    let session = null

    if (userRecord?.id) {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.admin.generateLink({
          type:  'magiclink',
          email: `${userRecord.id}@choirgrid.internal`,  // placeholder
        })

      if (sessionError) {
        console.warn('[verify-otp] session generation failed:', sessionError)
      } else {
        session = sessionData
      }
    }

    console.log(`[verify-otp] ${cleanPhone} verified successfully`)

    return new Response(
      JSON.stringify({
        success:  true,
        verified: true,
        session,                              // may be null — client handles
      }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    console.error('[verify-otp] unhandled error:', err?.message ?? err)
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Internal server error' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})