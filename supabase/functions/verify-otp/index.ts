/**
 * Edge Function: verify-otp
 * Trigger: HTTP POST
 * Purpose: Validates OTP, marks phone_verified_at, single-use
 * 
 * Request body: { phone: "+255712345678", otp: "123456" }
 * Response: { success: true, verified: true }
 * 
 * TODO: Implement actual OTP verification against stored hash
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req: Request) => {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return new Response(JSON.stringify({ error: 'Phone and OTP required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // TODO: Lookup OTP hash from database
    // TODO: Compare with provided OTP
    // TODO: Mark as used (single-use enforcement)
    // TODO: Update users.phone_verified_at

    console.log(`[EDGE] verify-otp for ${phone}: ${otp}`);

    return new Response(JSON.stringify({ success: true, verified: true }), {
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
