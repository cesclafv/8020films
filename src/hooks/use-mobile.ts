'use client';

import { useEffect, useState } from 'react';

/**
 * Minimal mobile detection hook (client-only).
 */
export function useMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpointPx);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpointPx]);

  return isMobile;
}
