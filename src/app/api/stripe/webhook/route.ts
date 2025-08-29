import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '../../../lib/stripe'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export const dynamic = 'force-dynamic';

const CREDIT_MAP: Record<string, number> = {
  credits_100: 100,
  credits_500: 500,
  // agrega más si quieres
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  // Solo procesa si el evento es checkout.session.completed
  if (event?.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    // Expandir line items para ver lookup_key del price
    const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items.data.price'] });
    const items = full.line_items?.data ?? [];
    const lookupKey = items[0]?.price?.lookup_key as string | undefined;
    const userId = session.client_reference_id as string | undefined;

    if (lookupKey && userId) {
      const credits = CREDIT_MAP[lookupKey] ?? 0;
      if (credits > 0) {
        // Intenta usar la función RPC, si no existe, fallback a update directo
        const { error } = await supabaseAdmin.rpc('increment_credits_safe', { p_user_id: userId, p_amount: credits });
        if (error) {
          await supabaseAdmin
            .from('usage_credits')
            .update({ updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        }
        await supabaseAdmin.rpc('noop'); // opcional
      }
    }
  }

  return NextResponse.json({ received: true });
}