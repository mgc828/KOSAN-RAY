'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { GA_ID, getConsent } from '@/lib/analytics';

/** Memuat Google Analytics 4 hanya jika NEXT_PUBLIC_GA_ID diisi DAN pengguna menyetujui. */
export default function Analytics() {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(getConsent() === 'all');
    sync();
    window.addEventListener('consent-change', sync);
    return () => window.removeEventListener('consent-change', sync);
  }, []);

  useEffect(() => {
    if (allowed && GA_ID && window.gtag) window.gtag('event', 'page_view', { page_path: pathname });
  }, [allowed, pathname]);

  if (!GA_ID || !allowed) return null;

  const init =
    "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;" +
    `gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true,send_page_view:false});`;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {init}
      </Script>
    </>
  );
}
