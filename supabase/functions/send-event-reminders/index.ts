/**
 * Edge Function: send-event-reminders
 * Trigger: Cron (every 30 minutes via pg_cron or external scheduler)
 * Purpose: Queries events in next 24h/2h, sends SMS via Africa's Talking
 *
 * Wire to Supabase pg_cron:
 *   SELECT cron.schedule('send-event-reminders', '*/30 * * * *',
 *     $$SELECT net.http_post(
 *       url := current_setting('app.supabase_url') || '/functions/v1/send-event-reminders',
 *       headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key')),
 *       body := '{}'::jsonb
 *     )$$
 *   );
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
}

const AT_USERNAME  = Deno.env.get('AT_USERNAME')  ?? ''
const AT_API_KEY   = Deno.env.get('AT_API_KEY')   ?? ''
const AT_SENDER_ID = Deno.env.get('AT_SENDER_ID') ?? 'CHOIRGRID'
const IS_SANDBOX   = AT_USERNAME === 'sandbox'

interface EventRow {
  id: string
  title: string
  starts_at: string
  choir_id: string
  location: string | null
  reminder_sent_24h: boolean
  reminder_sent_2h: boolean
}

interface MemberRow {
  id: string
  user_id: string
  users: { phone: string; full_name: string; preferred_language: string }
}

async function sendSms(to: string, message: string): Promise<boolean> {
  const atEndpoint = IS_SANDBOX
    ? 'https://api.sandbox.africastalking.com/version1/messaging'
    : 'https://api.africastalking.com/version1/messaging'

  const params: Record<string, string> = {
    username: AT_USERNAME,
    to,
    message,
  }

  if (!IS_SANDBOX) {
    params.from = AT_SENDER_ID
  }

  try {
    const res = await fetch(atEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': AT_API_KEY,
      },
      body: new URLSearchParams(params).toString(),
    })

    const data = await res.json()
    const recipient = data?.SMSMessageData?.Recipients?.[0]

    if (!res.ok || !recipient) {
      console.error(`[reminders] SMS failed to ${to}:`, JSON.stringify(data))
      return false
    }

    console.log(`[reminders] SMS sent to ${to}: ${recipient.status}`)
    return true
  } catch (err) {
    console.error(`[reminders] SMS error to ${to}:`, err)
    return false
  }
}

function formatReminderMessage(
  event: EventRow,
  lang: string,
  type: '24h' | '2h'
): string {
  const startsAt = new Date(event.starts_at)
  const timeStr = startsAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const dateStr = startsAt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const loc = event.location ? ` @ ${event.location}` : ''

  if (lang === 'sw') {
    const prefix = type === '24h' ? 'KESHO' : 'SAA 2 ZIJAZO'
    return `CHOIRGRID: ${prefix} - ${event.title} ${dateStr} ${timeStr}${loc}. Tafadhali hudhuria!`
  }

  const prefix = type === '24h' ? 'TOMORROW' : 'IN 2 HOURS'
  return `CHOIRGRID: ${prefix} - ${event.title} ${dateStr} ${timeStr}${loc}. Please attend!`
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    if (!AT_USERNAME || !AT_API_KEY) {
      console.warn('[reminders] AT credentials not configured — skipping')
      return new Response(
        JSON.stringify({ success: true, reminders_sent: 0, reason: 'AT credentials not set' }),
        { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    let totalSent = 0

    // ── 24-hour reminders ──────────────────────────────────────────────────
    const { data: events24h } = await supabase
      .from('events')
      .select('id, title, starts_at, choir_id, location, reminder_sent_24h, reminder_sent_2h')
      .is('deleted_at', null)
      .eq('reminder_sent_24h', false)
      .gte('starts_at', now.toISOString())
      .lte('starts_at', in24h.toISOString())

    if (events24h && events24h.length > 0) {
      for (const event of events24h as EventRow[]) {
        // Get active members with their phone numbers
        const { data: members } = await supabase
          .from('choir_members')
          .select('id, user_id, users(phone, full_name, preferred_language)')
          .eq('choir_id', event.choir_id)
          .in('status', ['active', 'probation'])

        if (members && members.length > 0) {
          for (const member of members as unknown as MemberRow[]) {
            const lang = member.users?.preferred_language ?? 'sw'
            const msg = formatReminderMessage(event, lang, '24h')
            const sent = await sendSms(member.users.phone, msg)
            if (sent) totalSent++
          }
        }

        // Mark as sent
        await supabase
          .from('events')
          .update({ reminder_sent_24h: true })
          .eq('id', event.id)
      }
    }

    // ── 2-hour reminders ───────────────────────────────────────────────────
    const { data: events2h } = await supabase
      .from('events')
      .select('id, title, starts_at, choir_id, location, reminder_sent_24h, reminder_sent_2h')
      .is('deleted_at', null)
      .eq('reminder_sent_2h', false)
      .gte('starts_at', now.toISOString())
      .lte('starts_at', in2h.toISOString())

    if (events2h && events2h.length > 0) {
      for (const event of events2h as EventRow[]) {
        const { data: members } = await supabase
          .from('choir_members')
          .select('id, user_id, users(phone, full_name, preferred_language)')
          .eq('choir_id', event.choir_id)
          .in('status', ['active', 'probation'])

        if (members && members.length > 0) {
          for (const member of members as unknown as MemberRow[]) {
            const lang = member.users?.preferred_language ?? 'sw'
            const msg = formatReminderMessage(event, lang, '2h')
            const sent = await sendSms(member.users.phone, msg)
            if (sent) totalSent++
          }
        }

        await supabase
          .from('events')
          .update({ reminder_sent_2h: true })
          .eq('id', event.id)
      }
    }

    console.log(`[reminders] Total SMS sent: ${totalSent}`)

    return new Response(
      JSON.stringify({ success: true, reminders_sent: totalSent }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[reminders] error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
