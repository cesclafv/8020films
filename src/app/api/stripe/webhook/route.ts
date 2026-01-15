import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/stripeServer';
import { requireEnv } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook skeleton.
 * You will need:
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 */
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('Missing stripe-signature header', { status: 400 });

  const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET');

  // Stripe expects the raw body
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  // TODO: handle events here
  // e.g. event.type === 'checkout.session.completed'
  return Response.json({ received: true, type: event.type });
}
