type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function shouldDebug() {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Tiny logger wrapper so you can later swap to Sentry/OTel without refactoring.
 */
export const logger = {
  debug: (...args: unknown[]) => shouldDebug() && console.debug('[debug]', ...args),
  info: (...args: unknown[]) => console.info('[info]', ...args),
  warn: (...args: unknown[]) => console.warn('[warn]', ...args),
  error: (...args: unknown[]) => console.error('[error]', ...args),
} satisfies Record<LogLevel, (...args: unknown[]) => void>;
