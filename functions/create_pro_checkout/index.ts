import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, email } = await req.json()
    console.log('Received request:', { user_id, email })
    
    if (!user_id || !email) {
      throw new Error('user_id and email are required')
    }

    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    if (!MP_ACCESS_TOKEN) {
      console.error('MP_ACCESS_TOKEN is not set!')
      throw new Error('MP_ACCESS_TOKEN not set')
    }

    if (MP_ACCESS_TOKEN.startsWith('TEST-')) {
      console.warn('Aviso: Utilizando token TEST-. O Pix exige credenciais de producao para funcionar corretamente e exibir o QR Code.')
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const notificationUrl = `${SUPABASE_URL}/functions/v1/mp_webhook`

    const body = {
      items: [
        {
          title: 'Plano PRO',
          description: 'Acesso Ilimitado ao Speednow',
          quantity: 1,
          unit_price: Number(9.90),
          currency_id: 'BRL'
        }
      ],
      payer: { email },
      external_reference: String(user_id),
      metadata: { user_id: String(user_id), type: 'pro' },
      notification_url: notificationUrl,
      payment_methods: {
        excluded_payment_types: [
          { id: 'ticket' }
        ]
      }
    }

    console.log('Criando preferencia MP:', JSON.stringify(body))

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    console.log('MP API Response Completa:', JSON.stringify(data))
    
    if (!response.ok) {
      console.error('MP API Error:', JSON.stringify(data))
      return new Response(JSON.stringify({ error: 'Erro ao criar preferencia', details: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!data.init_point) {
      console.error('MP Falhou ao retornar init_point', data)
      return new Response(JSON.stringify({ error: 'Falha ao obter URL do checkout (init_point ausente)' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify({ init_point: data.init_point }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
