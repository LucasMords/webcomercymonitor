import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ALLOWED_ORIGINS = [
  'https://webcomercymonitor.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
]

function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get('origin') || ''
  if (ALLOWED_ORIGINS.includes(origin)) return origin
  return ALLOWED_ORIGINS[0]
}

function errorResponse(message: string, status: number, origin: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  })
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const SITE_ORIGIN = Deno.env.get('SITE_ORIGIN') || 'https://webcomercymonitor.vercel.app'

serve(async (req) => {
  const origin = getAllowedOrigin(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405, origin)
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return errorResponse('Server configuration error', 500, origin)
  }

  const supabaseHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid request body', 400, origin)
  }

  const { items, customer, userId } = body as {
    items?: { id: string; name: string; price: number; quantity: number }[]
    customer?: { email?: string; name?: string; street?: string; number?: string; complement?: string; neighborhood?: string; city?: string; state?: string; zip?: string }
    userId?: string | null
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return errorResponse('Missing or invalid items', 400, origin)
  }
  if (!customer?.email || !customer?.name) {
    return errorResponse('Missing customer information', 400, origin)
  }

  const productIds = items.map((i) => i.id)

  const productsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=in.(${productIds.join(',')})&select=id,price`,
    { headers: supabaseHeaders }
  )
  const products = await productsRes.json() as { id: string; price: number }[]

  if (!Array.isArray(products) || products.length !== productIds.length) {
    return errorResponse('Some products not found', 400, origin)
  }

  const priceMap = new Map(products.map((p) => [p.id, p.price]))

  const validatedItems = items.map((item) => {
    const dbPrice = priceMap.get(item.id)
    if (dbPrice === undefined) {
      throw new Error(`Product ${item.id} not found in catalog`)
    }
    if (typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 99) {
      throw new Error(`Invalid quantity for product ${item.id}`)
    }
    return {
      id: item.id,
      name: item.name,
      price: dbPrice,
      quantity: Math.floor(item.quantity),
    }
  })

  const total = validatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: 'POST',
    headers: { ...supabaseHeaders, Prefer: 'return=representation' },
    body: JSON.stringify({
      user_id: userId || null,
      status: 'pending',
      total,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_address: {
        street: customer.street || '',
        number: customer.number || '',
        complement: customer.complement || '',
        neighborhood: customer.neighborhood || '',
        city: customer.city || '',
        state: customer.state || '',
        zip: customer.zip || '',
      },
    }),
  })

  const orders = await orderRes.json()
  const order = orders?.[0]

  if (!order) {
    return errorResponse('Failed to create order', 500, origin)
  }

  await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
    method: 'POST',
    headers: supabaseHeaders,
    body: JSON.stringify(
      validatedItems.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        product_name: i.name,
        price_each: i.price,
        quantity: i.quantity,
      }))
    ),
  })

  if (!MP_ACCESS_TOKEN) {
    return errorResponse('Payment service not configured', 500, origin)
  }

  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: validatedItems.map((i) => ({
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
        success: `${SITE_ORIGIN}/confirmation?order_id=${order.id}`,
        failure: `${SITE_ORIGIN}/checkout`,
        pending: `${SITE_ORIGIN}/confirmation?order_id=${order.id}`,
      },
      auto_return: 'approved',
    }),
  })

  const preference = await mpRes.json()

  if (!preference.init_point) {
    return errorResponse('Failed to create payment preference', 500, origin)
  }

  await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
    method: 'PATCH',
    headers: supabaseHeaders,
    body: JSON.stringify({ mp_preference_id: preference.id }),
  })

  return new Response(
    JSON.stringify({ initPoint: preference.init_point, orderId: order.id }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
      },
    }
  )
})
