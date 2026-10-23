'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Lembar bawah di HP (naik dari bawah), jendela tengah di layar lebar. Esc / klik latar / tombol tutup menutupnya. */
export default function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9995] flex items-end md:items-center justify-center" role="presentation">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full md:max-w-md max-h-[88vh] flex flex-col bg-white rounded-t-3xl md:rounded-2xl shadow-2xl outline-none animate-[sheet-up_0.22s_ease-out]"
      >
        <div className="md:hidden pt-2.5 pb-1 flex justify-center" aria-hidden><span className="w-10 h-1.5 rounded-full bg-slate-300" /></div>
        <div className="flex items-center justify-between gap-3 px-5 pt-2 pb-3 md:pt-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#0F2A43]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="w-9 h-9 -mr-2 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-slate-100 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
      <style>{`@keyframes sheet-up{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  );
}
