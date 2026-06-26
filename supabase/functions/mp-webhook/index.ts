import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const MP_WEBHOOK_SECRET = Deno.env.get('MP_WEBHOOK_SECRET')

function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function verifyWebhookSignature(body: string, signatureHeader: string): Promise<boolean> {
  if (!MP_WEBHOOK_SECRET) return false

  const parts = signatureHeader.split(',').map((p) => p.trim())
  const tsPart = parts.find((p) => p.startsWith('ts='))
  const v1Part = parts.find((p) => p.startsWith('v1='))

  if (!tsPart || !v1Part) return false

  const ts = tsPart.slice(3)
  const v1 = v1Part.slice(3)

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(MP_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const data = encoder.encode(`id:${body}\nts:${ts}`)
  const signature = await crypto.subtle.sign('HMAC', key, data)
  const expectedHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return v1 === expectedHex
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return errorResponse('Server configuration error', 500)
  }

  const supabaseHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  }

  try {
    const rawBody = await req.text()

    if (MP_WEBHOOK_SECRET) {
      const signature = req.headers.get('x-signature')
      if (!signature || !(await verifyWebhookSignature(rawBody, signature))) {
        return errorResponse('Invalid signature', 403)
      }
    }

    let body: Record<string, unknown>
    try {
      body = JSON.parse(rawBody)
    } catch {
      return errorResponse('Invalid JSON body', 400)
    }

    if (body.type !== 'payment') {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = body.data as Record<string, unknown> | undefined
    const paymentId = data?.id
    if (!paymentId) {
      return errorResponse('Missing payment ID', 400)
    }

    if (!MP_ACCESS_TOKEN) {
      return errorResponse('Payment service not configured', 500)
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
    })
    const payment = await mpRes.json()

    if (!payment.status) {
      return errorResponse('Failed to fetch payment details', 502)
    }

    if (payment.status === 'approved' && payment.external_reference) {
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${payment.external_reference}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify({
          status: 'paid',
          mp_payment_id: String(paymentId),
        }),
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return errorResponse('Internal server error', 500)
  }
})
