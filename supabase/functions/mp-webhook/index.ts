import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1b3Bwa2ZqYWx0ZWN5bXFnaGN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMwODYwNCwiZXhwIjoyMDk3ODg0NjA0fQ.6og-th1LAuw6WfY5ly4xtXC0hRzga3HiOse-D5t895k'

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    if (body.type === 'payment') {
      const paymentId = body.data.id

      const mpToken = Deno.env.get('MP_ACCESS_TOKEN')
      if (!mpToken) throw new Error('MP_ACCESS_TOKEN not configured')

      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${mpToken}` },
      })
      const payment = await mpRes.json()

      if (payment.status === 'approved') {
        await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${payment.external_reference}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: 'paid',
            mp_payment_id: paymentId.toString(),
          }),
        })
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
