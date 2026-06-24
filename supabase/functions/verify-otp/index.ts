// supabase/functions/verify-otp/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
}

async function hashOtp(otp: string): Promise<string> {
  const data   = new TextEncoder().encode(otp)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
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

    if (!record) {
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

        if ((latest.attempts ?? 0) >= 4) {
          await supabase
            .from('otp_codes')
            .update({ used: true })
            .eq('id', latest.id)

          return new Response(
            JSON.stringify({ error: 'Too many wrong attempts. Request a new OTP.' }),
            { status: 429, headers: { ...CORS, 'Content-Type': 'application/json' } }
          )
        }
      }

      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', record.id)

    await supabase
      .from('users')
      .update({ phone_verified_at: new Date().toISOString() })
      .eq('phone', cleanPhone)

    console.log(`[verify-otp] ${cleanPhone} verified successfully`)

    return new Response(
      JSON.stringify({ success: true, verified: true }),
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
