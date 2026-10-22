'use client';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';
export interface ToastDetail {
  message: string;
  kind: ToastKind;
}

/** Tampilkan pesan singkat di pojok layar (dirender oleh <ToastHost /> di layout). */
export function toast(message: string, kind: ToastKind = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ToastDetail>('app-toast', { detail: { message, kind } }));
}
