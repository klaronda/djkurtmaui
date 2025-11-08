// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts"

type ContactRecord = {
  id?: string
  name?: string
  email?: string
  phone?: string | null
  event_type?: string | null
  event_date?: string | null
  message?: string | null
  created_at?: string | null
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Not provided'
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return value
  }
}

const formatDateTime = (value?: string | null) => {
  if (!value) return new Date().toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' }) + ' HST'
  try {
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'Pacific/Honolulu'
    }) + ' HST'
  } catch {
    return value
  }
}

const renderEmailHtml = (record: ContactRecord) => {
  const message = record.message ? record.message.replace(/\n/g, '<br />') : 'No message provided.'

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>New Contact Inquiry</title>
      <meta name="color-scheme" content="only light">
    </head>
    <body style="margin:0;padding:24px;background:#f7fafc;font-family:'Helvetica Neue',Arial,sans-serif;color:#0f172a;">
      <table role="presentation" style="width:100%;max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 12px 40px rgba(15,23,42,0.08);overflow:hidden;">
        <tbody>
          <tr>
            <td style="padding:32px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#0f172a;">
              <h1 style="margin:0;font-size:26px;font-weight:700;">New Contact Inquiry</h1>
              <p style="margin:10px 0 0;font-size:16px;">${record.name ?? 'A website visitor'} just reached out via djkurtmaui.com.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <table role="presentation" style="width:100%;margin-bottom:24px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
                <tbody>
                  <tr>
                    <td style="padding:24px;">
                      <h2 style="margin:0 0 20px;font-size:18px;font-weight:600;color:#0f172a;">Event Details</h2>
                      <table role="presentation" style="width:100%;font-size:15px;color:#1e293b;">
                        <tbody>
                          <tr>
                            <td style="padding:6px 0;color:#64748b;text-transform:uppercase;font-size:12px;font-weight:600;">Name</td>
                            <td style="padding:6px 0;font-weight:500;">${record.name ?? 'Not provided'}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#64748b;text-transform:uppercase;font-size:12px;font-weight:600;">Email</td>
                            <td style="padding:6px 0;font-weight:500;"><a href="mailto:${record.email ?? ''}" style="color:#0f172a;text-decoration:none;border-bottom:1px solid #0f172a;">${record.email ?? 'Not provided'}</a></td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#64748b;text-transform:uppercase;font-size:12px;font-weight:600;">Phone</td>
                            <td style="padding:6px 0;font-weight:500;">${record.phone ?? 'Not provided'}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#64748b;text-transform:uppercase;font-size:12px;font-weight:600;">Event Type</td>
                            <td style="padding:6px 0;font-weight:500;">${record.event_type ?? 'Not specified'}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#64748b;text-transform:uppercase;font-size:12px;font-weight:600;">Event Date</td>
                            <td style="padding:6px 0;font-weight:500;">${formatDate(record.event_date)}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#64748b;text-transform:uppercase;font-size:12px;font-weight:600;">Submitted</td>
                            <td style="padding:6px 0;font-weight:500;">${formatDateTime(record.created_at)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style="border-radius:12px;border:1px solid #facc15;background:#fefce8;padding:24px;">
                <h3 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#854d0e;">Message</h3>
                <div style="color:#78350f;font-size:15px;line-height:1.7;">${message}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:24px;text-align:center;color:#64748b;font-size:12px;">
              Sent automatically from DJ Kurt Maui • Reply directly to keep the conversation going.
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log('[notify-contact] Incoming payload', payload)

    const record: ContactRecord | undefined = payload?.record ?? payload?.contactData

    if (!record) {
      console.error('[notify-contact] Missing record in payload')
      return new Response(JSON.stringify({ success: false, error: 'Missing record in payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const toEmail = Deno.env.get('RESEND_TO_EMAIL') ?? 'djkurtmaui@gmail.com'
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'DJ Kurt Maui <notifications@djkurtmaui.com>'
    const subject = `New inquiry from ${record.name ?? 'DJ Kurt Maui website visitor'}`
    const html = renderEmailHtml(record)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html,
        reply_to: record.email ?? undefined
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('[notify-contact] Resend API error', response.status, errorBody)
      throw new Error(`Resend API error: ${response.status} ${errorBody}`)
    }

    const result = await response.json()
    console.log('[notify-contact] Email sent', result)

    return new Response(JSON.stringify({ success: true, messageId: result?.id ?? null }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[notify-contact] Error', error)
    return new Response(JSON.stringify({ success: false, error: error.message ?? 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

