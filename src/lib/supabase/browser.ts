import { createBrowserClient } from '@supabase/ssr';
import { requireEnv } from '@/lib/env';

/**
 * Browser-side Supabase client (safe for Client Components).
 * Throws a clear error only when you actually call it without env set.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  );
}
