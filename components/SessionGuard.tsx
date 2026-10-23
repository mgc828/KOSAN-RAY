'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

/**
 * Menjaga sesi pengguna:
 * - Tidak ada aktivitas selama 15 menit (di tab mana pun) -> keluar otomatis.
 * - 1 menit sebelumnya muncul peringatan dengan tombol "Tetap masuk".
 * - Selama aktif, sesi diperpanjang berkala ke server (batas mutlak 12 jam tetap berlaku di server).
 * - Keluar di satu tab membuat tab lain ikut keluar.
 * Batas ini juga ditegakkan server (token berumur 15 menit), jadi menutup tab/browser tidak meninggalkan sesi terbuka lama.
 */
const IDLE_MS = 15 * 60 * 1000;
const WARN_MS = 60 * 1000;
const HEARTBEAT_MS = 2 * 60 * 1000;
const ACTIVITY_KEY = 'kk_last_activity';
const EVENTS: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

function readShared(): number {
  try {
    return Number(localStorage.getItem(ACTIVITY_KEY)) || 0;
  } catch {
    return 0;
  }
}

export default function SessionGuard() {
  const { user, refresh, logout } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastActive = useRef<number>(0);
  const lastBeat = useRef<number>(0);
  const lastWrite = useRef<number>(0);
  const warning = useRef(false);
  const loggingOut = useRef(false);
  const hasUser = Boolean(user);

  const mark = useCallback(() => {
    // Saat peringatan tampil, hanya tombol "Tetap masuk" yang dianggap aktivitas
    if (warning.current) return;
    const now = Date.now();
    lastActive.current = now;
    if (now - lastWrite.current > 1000) {
      lastWrite.current = now;
      try {
        localStorage.setItem(ACTIVITY_KEY, String(now));
      } catch {
        /* diabaikan */
      }
    }
  }, []);

  const stayLoggedIn = useCallback(() => {
    warning.current = false;
    setSecondsLeft(null);
    mark();
    lastBeat.current = Date.now();
    void refresh();
  }, [mark, refresh]);

  useEffect(() => {
    if (!hasUser) return;
    lastActive.current = Date.now();
    lastBeat.current = Date.now();
    loggingOut.current = false;
    warning.current = false;
    mark();

    EVENTS.forEach((e) => window.addEventListener(e, mark, { passive: true }));

    const tick = setInterval(() => {
      const idle = Date.now() - Math.max(lastActive.current, readShared());
      if (idle >= IDLE_MS) {
        if (!loggingOut.current) {
          loggingOut.current = true;
          void logout('idle');
        }
        return;
      }
      if (idle >= IDLE_MS - WARN_MS) {
        warning.current = true;
        setSecondsLeft(Math.max(0, Math.ceil((IDLE_MS - idle) / 1000)));
        return;
      }
      if (warning.current) {
        // Aktivitas terdeteksi di tab lain
        warning.current = false;
        setSecondsLeft(null);
      }
      // Perpanjang sesi di server selama pengguna aktif
      if (Date.now() - lastBeat.current >= HEARTBEAT_MS && idle < HEARTBEAT_MS) {
        lastBeat.current = Date.now();
        void refresh();
      }
    }, 1000);

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'kk_logout_at') void refresh();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, mark));
      window.removeEventListener('storage', onStorage);
      clearInterval(tick);
    };
  }, [hasUser, mark, refresh, logout]);

  if (!hasUser || secondsLeft === null) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-label="Sesi akan berakhir">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900">Masih di sini?</h2>
          <p className="text-sm text-slate-600">
            Demi keamanan akunmu, kamu akan keluar otomatis dalam <b className="text-[#C2410C]" aria-live="polite">{secondsLeft} detik</b> karena tidak ada aktivitas.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void logout()} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer">
            Keluar
          </button>
          <button type="button" onClick={stayLoggedIn} autoFocus className="flex-1 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold transition-colors cursor-pointer">
            Tetap masuk
          </button>
        </div>
      </div>
    </div>
  );
}
