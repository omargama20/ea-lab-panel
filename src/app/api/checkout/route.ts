// app/api/checkout/route.ts
import { NextResponse } from 'next/server'
import { stripe } from '../../lib/stripe'
import { supabaseServer } from '../../lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { price_lookup_key, successPath = '/dashboard', cancelPath = '/pricing' } = await req.json();
    if (!price_lookup_key) return NextResponse.json({ error: 'price_lookup_key requerido' }, { status: 400 });

    const supabase = supabaseServer();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'No auth' }, { status: 401 });

    // Obtenemos el price ID mediante lookup_key
    const prices = await stripe.prices.list({ lookup_keys: [price_lookup_key], expand: ['data.product'] });
    const price = prices.data[0];
    if (!price) return NextResponse.json({ error: 'Lookup key inválido' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}${successPath}?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${cancelPath}?checkout=cancel`,
      client_reference_id: user.id, // para mapear en webhook
      customer_email: user.email ?? undefined,
      metadata: { kind: 'credits' },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Checkout error' }, { status: 500 });
  }
}
