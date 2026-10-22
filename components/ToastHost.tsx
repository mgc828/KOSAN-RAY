'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastDetail } from '@/lib/toast';

interface Item extends ToastDetail {
  id: number;
  isExiting: boolean;
}

const DISPLAY_DURATION = 3200;
const EXIT_DURATION = 200;

export default function ToastHost() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let n = 0;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      const id = ++n;
      setItems((cur) => [...cur.slice(-2), { ...detail, id, isExiting: false }]);

      window.setTimeout(() => {
        setItems((cur) => cur.map((i) => (i.id === id ? { ...i, isExiting: true } : i)));
        window.setTimeout(() => {
          setItems((cur) => cur.filter((i) => i.id !== id));
        }, EXIT_DURATION);
      }, DISPLAY_DURATION);
    };

    window.addEventListener('app-toast', onToast);
    return () => window.removeEventListener('app-toast', onToast);
  }, []);

  const handleDismiss = (id: number) => {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, isExiting: true } : i)));
    window.setTimeout(() => {
      setItems((cur) => cur.filter((i) => i.id !== id));
    }, EXIT_DURATION);
  };

  if (items.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideInTop {
          0% {
            opacity: 0;
            transform: translateY(-120%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes toastSlideOutTop {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-120%);
          }
        }
        .toast-animate-enter {
          animation: toastSlideInTop 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .toast-animate-exit {
          animation: toastSlideOutTop 200ms cubic-bezier(0.4, 0, 1, 1) forwards;
        }
      `}</style>
      <div
        className="fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-[99999] flex flex-col items-center gap-2.5 px-4 w-full max-w-md pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {items.map((t) => {
          const Icon =
            t.kind === 'success'
              ? CheckCircle2
              : t.kind === 'error'
                ? AlertCircle
                : t.kind === 'warning'
                  ? AlertTriangle
                  : Info;

          const color =
            t.kind === 'success'
              ? 'border-emerald-200 text-emerald-950 bg-white/95 shadow-emerald-500/10'
              : t.kind === 'error'
                ? 'border-rose-200 text-rose-950 bg-white/95 shadow-rose-500/10'
                : t.kind === 'warning'
                  ? 'border-amber-200 text-amber-950 bg-white/95 shadow-amber-500/10'
                  : 'border-slate-200 text-[#0F2A43] bg-white/95 shadow-slate-900/10';

          const iconColor =
            t.kind === 'success'
              ? 'text-emerald-600'
              : t.kind === 'error'
                ? 'text-rose-600'
                : t.kind === 'warning'
                  ? 'text-amber-500'
                  : 'text-[#F97316]';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md ${color} ${
                t.isExiting ? 'toast-animate-exit' : 'toast-animate-enter'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
              <span className="flex-1">{t.message}</span>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => handleDismiss(t.id)}
                className="opacity-50 hover:opacity-100 p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
