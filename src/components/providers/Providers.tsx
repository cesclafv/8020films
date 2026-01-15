'use client';

import * as React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { AuthInitProvider } from './AuthInitProvider';
import { ServiceWorkerProvider } from './ServiceWorkerProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthInitProvider>
          <ServiceWorkerProvider>{children}</ServiceWorkerProvider>
        </AuthInitProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
