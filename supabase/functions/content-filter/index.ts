/**
 * Edge Function: content-filter
 * Trigger: Called before send-message
 * Purpose: Rejects messages containing phone numbers, amounts, OTP patterns
 * 
 * Request body: { body: "message text" }
 * Response: { allowed: true } or { allowed: false, reason: "..." }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SENSITIVE_PATTERNS = [
  /\+?255\d{9}/g,            // Tanzanian phone numbers
  /\b\d{4,6}\b/g,             // OTP-like codes
  /TZS\s?\d+/gi,              // Currency amounts
  /\d{1,3}(,\d{3})+/g,        // Formatted large numbers
  /m-pesa|mpesa|tigo\s*pesa|airtel\s*money/gi, // Mobile money references
];

serve(async (req: Request) => {
  try {
    const { body } = await req.json();

    if (!body) {
      return new Response(JSON.stringify({ allowed: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(body)) {
        return new Response(
          JSON.stringify({
            allowed: false,
            reason: 'Message contains sensitive content (phone numbers, financial amounts, or OTP codes)',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(JSON.stringify({ allowed: true }), {
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
