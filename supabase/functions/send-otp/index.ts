/**
 * Edge Function: send-otp
 * Trigger: HTTP POST
 * Purpose: Calls Africa's Talking API to send SMS OTP
 * Rate limit: 3 per 10 minutes per phone number
 * 
 * Request body: { phone: "+255712345678" }
 * Response: { success: true, message: "OTP sent" }
 * 
 * TODO: Replace with real Africa's Talking credentials from Supabase Vault
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const { phone } = await req.json();

    if (!phone || !/^\+255\d{9}$/.test(phone)) {
      return new Response(JSON.stringify({ error: 'Invalid Tanzanian phone number' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // TODO: Check rate limit (3 per 10 min per phone)
    // TODO: Generate 6-digit OTP
    // TODO: Store OTP hash in database with expiry
    // TODO: Call Africa's Talking SMS API
    
    console.log(`[EDGE] send-otp to ${phone}`);

    return new Response(JSON.stringify({ success: true, message: 'OTP sent' }), {
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
