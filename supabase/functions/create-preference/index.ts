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
    const { items, customer, userId } = await req.json()

    const total = items.reduce(
      (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
      0
    )

    const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id: userId || null,
        status: 'pending',
        total,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_address: {
          address: customer.address,
          city: customer.city,
          zip: customer.zip,
        },
      }),
    })

    const orders = await orderRes.json()
    const order = orders?.[0]

    if (!order) {
      throw new Error('Failed to create order: ' + JSON.stringify(orders))
    }

    await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
      method: 'POST',
      headers,
      body: JSON.stringify(
        items.map((i: { id: string; name: string; price: number; quantity: number }) => ({
          order_id: order.id,
          product_id: i.id,
          product_name: i.name,
          price_each: i.price,
          quantity: i.quantity,
        }))
      ),
    })

    const mpToken = Deno.env.get('MP_ACCESS_TOKEN')
    if (!mpToken) throw new Error('MP_ACCESS_TOKEN not configured')

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpToken}`,
      },
      body: JSON.stringify({
        items: items.map((i: { name: string; price: number; quantity: number }) => ({
          title: i.name,
          unit_price: i.price,
          quantity: i.quantity,
          currency_id: 'BRL',
        })),
        payer: {
          name: customer.name,
          email: customer.email,
        },
        external_reference: order.id,
        back_urls: {
          success: `${req.headers.get('origin')}/confirmation?order_id=${order.id}`,
          failure: `${req.headers.get('origin')}/checkout`,
          pending: `${req.headers.get('origin')}/confirmation?order_id=${order.id}`,
        },
        auto_return: 'approved',
      }),
    })

    const preference = await mpRes.json()

    if (!preference.init_point) {
      throw new Error('MP error: ' + JSON.stringify(preference))
    }

    await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ mp_preference_id: preference.id }),
    })

    return new Response(
      JSON.stringify({ initPoint: preference.init_point, orderId: order.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
