'use client';

import * as React from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { logger } from '@/lib/logger';

/**
 * Beginner-friendly placeholder for "auth init".
 * You can later:
 * - subscribe to auth changes
 * - hydrate a Zustand auth store
 * - or integrate server session patterns
 */
export function AuthInitProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    try {
      // Just ensure the client can be created (will throw a friendly error if env missing).
      // We don't do anything with it yet.
      createSupabaseBrowserClient();
    } catch (e) {
      logger.debug('Supabase not configured yet (this is OK for a blank template).', e);
    }
  }, []);

  return <>{children}</>;
}
