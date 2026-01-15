import Stripe from 'stripe';
import { requireEnv } from '@/lib/env';

let cached: Stripe | null = null;

/**
 * Server-only Stripe SDK. Lazily initialized so dev server doesn't crash if env isn't set yet.
 */
export function stripe() {
  if (cached) return cached;
  cached = new Stripe(requireEnv('STRIPE_SECRET_KEY'));
  return cached;
}
