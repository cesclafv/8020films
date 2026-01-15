import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
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
          // In some server contexts this may throw; keep usage in handlers/actions when setting cookies.
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    },
  );
}
