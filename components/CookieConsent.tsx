'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { getConsent, setConsent, GA_ID } from '@/lib/analytics';

/**
 * Banner persetujuan cookie. Hanya muncul kalau analitik dikonfigurasi (NEXT_PUBLIC_GA_ID),
 * karena tanpa itu situs hanya memakai penyimpanan yang dibutuhkan (login, wishlist).
 */
export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sync = () => setShow(Boolean(GA_ID) && getConsent() === null);
    sync();
    window.addEventListener('consent-change', sync);
    return () => window.removeEventListener('consent-change', sync);
  }, []);

  if (!show) return null;

  return (
    <div role="dialog" aria-label="Persetujuan cookie" className="fixed inset-x-3 bottom-3 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-md z-[95] bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Cookie className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700 leading-relaxed">
          Kami memakai cookie analitik untuk memahami fitur mana yang paling berguna. Cookie yang dibutuhkan untuk login dan wishlist selalu aktif.{' '}
          <Link href="/kebijakan-privasi" className="font-bold text-[#C2410C] hover:underline">Kebijakan privasi</Link>
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setConsent('necessary')} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
          Hanya yang perlu
        </button>
        <button type="button" onClick={() => setConsent('all')} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#F97316] hover:bg-[#EA580C] transition-colors">
          Terima semua
        </button>
      </div>
    </div>
  );
}

/** Tautan kecil untuk membuka lagi pilihan cookie (dipakai di footer). */
export function CookieSettingsLink() {
  if (!GA_ID) return null;
  return (
    <button type="button" onClick={() => setConsent(null)} className="underline underline-offset-2 hover:opacity-80">
      Pengaturan cookie
    </button>
  );
}
