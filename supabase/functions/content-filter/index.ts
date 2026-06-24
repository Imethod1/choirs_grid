/**
 * Edge Function: content-filter
 * Trigger: Called before send-message
 * Purpose: Rejects messages containing phone numbers, amounts, OTP patterns
 *
 * Request body: { body: "message text" }
 * Response: { allowed: true } or { allowed: false, reason: "..." }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
}

// NOTE: regex patterns are recreated on each call to avoid the global flag
// stale lastIndex bug (RegExp with /g flag retains state across calls).
function getSensitivePatterns(): RegExp[] {
  return [
    /\+?255\d{9}/,                    // Tanzanian phone numbers
    /\b\d{4,6}\b/,                     // OTP-like codes (4-6 digits standalone)
    /TZS\s?\d+/i,                      // Currency amounts
    /\d{1,3}(,\d{3})+/,               // Formatted large numbers like 1,000,000
    /m-pesa|mpesa|tigo\s*pesa|airtel\s*money/i, // Mobile money references
  ]
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
    let requestBody: Record<string, unknown>
    try {
      requestBody = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const { body } = requestBody

    if (!body || typeof body !== 'string') {
      return new Response(
        JSON.stringify({ allowed: true }),
        { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const patterns = getSensitivePatterns()

    for (const pattern of patterns) {
      if (pattern.test(body)) {
        return new Response(
          JSON.stringify({
            allowed: false,
            reason: 'Message contains sensitive content (phone numbers, financial amounts, or OTP codes)',
          }),
          { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ allowed: true }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[content-filter] error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
