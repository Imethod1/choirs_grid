// supabase/functions/send-otp/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const AT_USERNAME  = Deno.env.get('AT_USERNAME')  ?? ''
const AT_API_KEY   = Deno.env.get('AT_API_KEY')   ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const IS_SANDBOX   = AT_USERNAME === 'sandbox'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
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

    const { phone } = body

    if (!phone || typeof phone !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const cleanPhone = phone.trim()
    if (!/^\+255\d{9}$/.test(cleanPhone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone. Use format: +255712345678' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('otp_codes')
      .select('*', { count: 'exact', head: true })
      .eq('phone', cleanPhone)
      .gte('created_at', tenMinutesAgo)

    if ((count ?? 0) >= 3) {
      return new Response(
        JSON.stringify({ error: 'Too many OTP requests. Please wait 10 minutes.' }),
        { status: 429, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const otp       = generateOtp()
    const otpHash   = await hashOtp(otp)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone:      cleanPhone,
        otp_hash:   otpHash,
        expires_at: expiresAt,
        used:       false,
        attempts:   0,
      })

    if (insertError) {
      console.error('[send-otp] DB insert error:', JSON.stringify(insertError))
      throw new Error('Failed to store OTP')
    }

    const message = `CHOIRGRID: Msimbo wako ni ${otp}. Halali dakika 10. Usimpe mtu yeyote.`

    const atParams: Record<string, string> = {
      username: AT_USERNAME,
      to:       cleanPhone,
      message,
    }

    if (!IS_SANDBOX) {
      atParams.from = Deno.env.get('AT_SENDER_ID') ?? 'CHOIRGRID'
    }

    const atEndpoint = IS_SANDBOX
      ? 'https://api.sandbox.africastalking.com/version1/messaging'
      : 'https://api.africastalking.com/version1/messaging'

    console.log('[send-otp] IS_SANDBOX:', IS_SANDBOX)

    const atRes = await fetch(atEndpoint, {
      method:  'POST',
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey':       AT_API_KEY,
      },
      body: new URLSearchParams(atParams).toString(),
    })

    const atData = await atRes.json()
    console.log('[send-otp] AT response:', JSON.stringify(atData))

    const recipient = atData?.SMSMessageData?.Recipients?.[0]

    if (!atRes.ok) {
      throw new Error(`AT API error ${atRes.status}: ${JSON.stringify(atData)}`)
    }

    if (!recipient) {
      throw new Error(`AT returned no recipients: ${JSON.stringify(atData)}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP sent successfully',
        debug:   { sandbox: IS_SANDBOX, at_status: recipient.status },
      }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    console.error('[send-otp] error:', err?.message ?? err)
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Internal server error' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
