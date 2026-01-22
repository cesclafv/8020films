'use client';

import * as React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { AuthInitProvider } from './AuthInitProvider';
import { ServiceWorkerProvider } from './ServiceWorkerProvider';
import { ReCaptchaProvider } from './ReCaptchaProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthInitProvider>
          <ServiceWorkerProvider>
            <ReCaptchaProvider>{children}</ReCaptchaProvider>
          </ServiceWorkerProvider>
        </AuthInitProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
