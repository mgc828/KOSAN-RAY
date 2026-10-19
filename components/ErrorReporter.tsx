'use client';

import { useEffect } from 'react';

/** Mengirim error JavaScript di browser ke /api/errors supaya kita tahu kalau ada halaman yang rusak. */
export default function ErrorReporter() {
  useEffect(() => {
    let sent = 0;
    const seen = new Set<string>();
    const report = (message: string, stack?: string) => {
      const key = message.slice(0, 120);
      if (sent >= 5 || seen.has(key)) return; // batasi agar tidak membanjiri server
      seen.add(key);
      sent++;
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, stack, url: window.location.href }),
        keepalive: true,
      }).catch(() => undefined);
    };
    const onError = (e: ErrorEvent) => report(e.message || 'Error', e.error?.stack);
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason;
      report(`Unhandled rejection: ${r?.message ?? String(r)}`, r?.stack);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  return null;
}
