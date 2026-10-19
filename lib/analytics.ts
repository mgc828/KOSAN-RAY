'use client';

/** Pembungkus tipis untuk Google Analytics 4. Tidak melakukan apa-apa kalau belum diizinkan / belum dikonfigurasi. */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export const CONSENT_KEY = 'kk_consent';
export type Consent = 'all' | 'necessary';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'all' || v === 'necessary' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: Consent | null) {
  try {
    if (v) localStorage.setItem(CONSENT_KEY, v);
    else localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* diabaikan */
  }
  window.dispatchEvent(new Event('consent-change'));
}

/** Catat peristiwa penting (mis. begin_checkout, purchase, search). Hanya jalan kalau pengguna menyetujui. */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !GA_ID || getConsent() !== 'all' || !window.gtag) return;
  window.gtag('event', event, params);
}
