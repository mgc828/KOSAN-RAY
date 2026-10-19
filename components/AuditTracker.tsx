'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function AuditTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastLoggedUrl = useRef<string>('');

  useEffect(() => {
    // Abaikan jika tidak di browser
    if (typeof window === 'undefined') return;

    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Cegah duplikasi panggilan berulang untuk URL yang sama dalam hitungan detik
    if (lastLoggedUrl.current === fullUrl) return;
    lastLoggedUrl.current = fullUrl;

    const payload = {
      path: pathname,
      search: searchParams?.toString() ? `?${searchParams.toString()}` : '',
      screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      isTouch: (navigator.maxTouchPoints || 0) > 0,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent || '',
    };

    try {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/audit', blob);
      } else {
        fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Background tracking silently fails if offline
    }
  }, [pathname, searchParams]);

  return null;
}

