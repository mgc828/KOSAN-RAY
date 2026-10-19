'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface GoogleButtonProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

interface GoogleId {
  initialize: (cfg: { client_id: string; callback: (r: { credential: string }) => void }) => void;
  renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * Tombol "Lanjutkan dengan Google" (Google Identity Services).
 * Hanya tampil kalau NEXT_PUBLIC_GOOGLE_CLIENT_ID sudah diisi di .env.local.
 */
export default function GoogleButton({ onSuccess, onError }: GoogleButtonProps) {
  const { loginWithGoogle } = useAuth();
  const holder = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    const init = () => {
      if (!window.google || !holder.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async ({ credential }) => {
          const res = await loginWithGoogle(credential);
          if (res.success) onSuccess();
          else onError(res.error || 'Login Google gagal');
        },
      });
      window.google.accounts.id.renderButton(holder.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: holder.current.clientWidth || 320,
      });
      setReady(true);
    };

    if (window.google) {
      init();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-gsi]');
    if (existing) {
      existing.addEventListener('load', init);
      return () => existing.removeEventListener('load', init);
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.dataset.gsi = '1';
    script.onload = init;
    script.onerror = () => onError('Gagal memuat Google. Periksa koneksi internet Anda.');
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
        <span className="h-px flex-1 bg-slate-200" />
        <span>atau</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div ref={holder} className="flex justify-center min-h-[44px]" aria-busy={!ready} />
    </div>
  );
}
