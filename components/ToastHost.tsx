'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import type { ToastDetail } from '@/lib/toast';

interface Item extends ToastDetail {
  id: number;
}

export default function ToastHost() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let n = 0;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      const id = ++n;
      setItems((cur) => [...cur.slice(-2), { ...detail, id }]);
      window.setTimeout(() => setItems((cur) => cur.filter((i) => i.id !== id)), 4200);
    };
    window.addEventListener('app-toast', onToast);
    return () => window.removeEventListener('app-toast', onToast);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 w-full max-w-md pointer-events-none" role="status" aria-live="polite">
      {items.map((t) => {
        const Icon = t.kind === 'success' ? CheckCircle2 : t.kind === 'error' ? AlertCircle : Info;
        const color =
          t.kind === 'success'
            ? 'border-[#16A34A]/40 text-[#166534] bg-green-50'
            : t.kind === 'error'
              ? 'border-red-300 text-red-800 bg-red-50'
              : 'border-slate-200 text-[#0F2A43] bg-white';
        return (
          <div key={t.id} className={`pointer-events-auto w-full flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg ${color}`}>
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="flex-1">{t.message}</span>
            <button type="button" aria-label="Tutup" onClick={() => setItems((cur) => cur.filter((i) => i.id !== t.id))} className="opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
