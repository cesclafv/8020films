'use client';

import * as React from 'react';
import { logger } from '@/lib/logger';

/**
 * Minimal SW registration. Only registers in production and only if a SW exists.
 * This is intentionally conservative to avoid caching surprises while you're learning.
 */
export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then(() => logger.info('Service worker registered'))
      .catch((e) => logger.warn('Service worker registration failed', e));
  }, []);

  return <>{children}</>;
}
