import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { CookieOptions } from '@supabase/ssr';
import { requireEnv } from '@/lib/env';

/**
 * Server-side Supabase client (Server Components / Route Handlers).
 * Uses Next cookies() for SSR auth.
 *
 * NOTE: Cookie mutation is only allowed in certain contexts (Route Handlers, Server Actions).
 * This wrapper is still useful for reads anywhere; write/auth flows typically happen in handlers/actions.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Cookie mutation is only allowed in Server Actions or Route Handlers.
          // Silently ignore in other contexts (e.g., Server Components).
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Expected in Server Components - ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          } catch {
            // Expected in Server Components - ignore
          }
        },
      },
    },
  );
}

/**
 * Simple Supabase client for build-time operations (generateStaticParams, etc.)
 * Does not use cookies - only for public data access.
 */
export function createSupabaseBuildClient() {
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  );
}
