import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { items, customer, userId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const total = items.reduce(
      (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
      0
    )

    const { data: order } = await supabase
      .from('orders')
      .insert({
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
      })
      .select('id')
      .single()

    if (order) {
      await supabase.from('order_items').insert(
        items.map((i: { id: string; name: string; price: number; quantity: number }) => ({
          order_id: order.id,
          product_id: i.id,
          product_name: i.name,
          price_each: i.price,
          quantity: i.quantity,
        }))
      )
    }

    const mp = new MercadoPagoConfig({
      accessToken: Deno.env.get('MP_ACCESS_TOKEN')!,
    })

    const preference = await new Preference(mp).create({
      body: {
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
        external_reference: order?.id,
        back_urls: {
          success: `${req.headers.get('origin')}/confirmation?order_id=${order?.id}`,
          failure: `${req.headers.get('origin')}/checkout`,
          pending: `${req.headers.get('origin')}/confirmation?order_id=${order?.id}`,
        },
        auto_return: 'approved',
      },
    })

    if (order) {
      await supabase
        .from('orders')
        .update({ mp_preference_id: preference.id })
        .eq('id', order.id)
    }

    return new Response(
      JSON.stringify({ initPoint: preference.init_point, orderId: order?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
