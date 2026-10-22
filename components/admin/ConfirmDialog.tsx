'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  /** Dipanggil saat menekan tombol close, Escape, atau klik di luar popup. */
  onCancel: () => void;
  /** Dipanggil saat memilih "Tidak" (default: sama dengan onCancel). */
  onDecline?: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Ya',
  cancelLabel = 'Tidak',
  loading = false,
  onConfirm,
  onCancel,
  onDecline,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          aria-label="Tutup"
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-slate-900 pr-8">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{description}</p>}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onDecline ?? onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-sm shadow-orange-500/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
