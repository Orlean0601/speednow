import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.js'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const topic = url.searchParams.get('topic') || url.searchParams.get('type')
    const id = url.searchParams.get('data.id') || url.searchParams.get('id')

    let body = {}
    try {
      body = await req.json()
    } catch (e) {
      // Body may be empty
    }

    const eventType = body?.type || topic
    const eventId = body?.data?.id || id

    if (eventType !== 'payment') {
      return new Response('Not a payment event, ignoring', { status: 200 })
    }

    if (!eventId) {
      return new Response('No payment ID found', { status: 400 })
    }

    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    if (!MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN not set')
    }

    // Fetch payment details from MP
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      }
    })

    const payment = await response.json()

    if (!response.ok) {
      console.error('Failed to fetch payment:', payment)
      throw new Error('Failed to fetch payment details')
    }

    if (payment.status !== 'approved') {
      return new Response('Payment not approved', { status: 200 })
    }

    const metadata = payment.metadata || {}
    const userId = metadata.user_id
    const type = metadata.type
    const creditsAdded = metadata.credits || 0
    const amount = payment.transaction_amount

    if (!userId) {
      console.error('No user_id in metadata', payment)
      return new Response('Missing user_id in payment metadata', { status: 200 })
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if payment already processed
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('id', eventId)
      .single()

    if (existingPayment) {
      return new Response('Payment already processed', { status: 200 })
    }

    // Insert payment record
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        id: eventId,
        user_id: userId,
        type: type,
        credits_added: creditsAdded,
        amount: amount,
        status: 'approved'
      })

    if (insertError) {
      console.error('Error inserting payment:', insertError)
      throw insertError
    }

    // Process benefits
    if (type === 'pro') {
      // Calculate new expiration date (+30 days)
      const { data: profile } = await supabase
        .from('profiles')
        .select('pro_expires_at, plan')
        .eq('id', userId)
        .single()

      let baseDate = new Date()
      if (profile && profile.plan === 'pro' && profile.pro_expires_at) {
        const expiresAt = new Date(profile.pro_expires_at)
        if (expiresAt > baseDate) {
          baseDate = expiresAt
        }
      }

      const newExpiresAt = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          plan: 'pro',
          pro_expires_at: newExpiresAt.toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating profile to pro:', updateError)
        throw updateError
      }
    } else if (type === 'credits') {
      const { error: rpcError } = await supabase.rpc('add_credits', {
        uid: userId,
        amount: creditsAdded
      })

      if (rpcError) {
        console.error('Error adding credits:', rpcError)
        throw rpcError
      }
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
