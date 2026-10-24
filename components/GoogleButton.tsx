'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface GoogleButtonProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  text?: 'continue_with' | 'signin_with' | 'signup_with';
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

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

/**
 * Tombol "Lanjutkan dengan Google" (Google Identity Services).
 * Tampil jika NEXT_PUBLIC_GOOGLE_CLIENT_ID sudah dikonfigurasi.
 */
export default function GoogleButton({ onSuccess, onError, text = 'continue_with' }: GoogleButtonProps) {
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

      const clientWidth = holder.current.clientWidth || 320;
      const validWidth = Math.min(Math.max(Math.floor(clientWidth), 200), 400);

      window.google.accounts.id.renderButton(holder.current, {
        theme: 'outline',
        size: 'large',
        text,
        shape: 'pill',
        width: validWidth,
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
  }, [text]);

  if (!CLIENT_ID) return null;

  return (
    <div className="w-full flex justify-center min-h-[44px]" aria-busy={!ready}>
      <div ref={holder} className="w-full flex justify-center" />
    </div>
  );
}
