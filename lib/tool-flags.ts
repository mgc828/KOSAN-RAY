'use client';

import { useEffect, useSyncExternalStore } from 'react';

/**
 * Saklar alat bantu (tombol UI / Inspect) bersifat GLOBAL: server yang menentukan, bukan localStorage tiap browser.
 * Semua komponen berbagi satu pengecekan berkala, sehingga saat admin mematikan saklar, tombolnya hilang
 * di semua pengunjung dalam hitungan detik (atau seketika saat tab kembali aktif).
 */

type Flags = { enableUiCustomizer: boolean; enableElementInspector: boolean };
export type ToolFlag = keyof Flags;

const POLL_MS = 10_000;
const SETTINGS_URL = '/api/admin/data?type=settings';

let flags: Flags = { enableUiCustomizer: false, enableElementInspector: false };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let inflight = false;

async function refresh() {
  if (inflight) return;
  inflight = true;
  try {
    const res = await fetch(SETTINGS_URL, { cache: 'no-store' });
    if (!res.ok) return;
    const tools = (await res.json())?.settings?.tools;
    if (!tools) return;
    const next: Flags = {
      enableUiCustomizer: Boolean(tools.enableUiCustomizer),
      enableElementInspector: Boolean(tools.enableElementInspector),
    };
    if (next.enableUiCustomizer !== flags.enableUiCustomizer || next.enableElementInspector !== flags.enableElementInspector) {
      flags = next;
      listeners.forEach((l) => l());
    }
  } catch {
    // jaringan bermasalah: pertahankan nilai terakhir
  } finally {
    inflight = false;
  }
}

const onWake = () => {
  if (document.visibilityState === 'visible') void refresh();
};

function start() {
  // Buang sisa cache lama per-browser yang dulu menahan tombol tetap tampil
  try {
    localStorage.removeItem('kk_show_ui_customizer');
    localStorage.removeItem('kk_show_element_inspector');
  } catch {
    // abaikan
  }
  void refresh();
  timer = setInterval(onWake, POLL_MS);
  document.addEventListener('visibilitychange', onWake);
  window.addEventListener('focus', onWake);
  window.addEventListener('kk-tools-settings-changed', onWake);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
  document.removeEventListener('visibilitychange', onWake);
  window.removeEventListener('focus', onWake);
  window.removeEventListener('kk-tools-settings-changed', onWake);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) stop();
  };
}

/** true bila saklar `key` sedang menyala di pengaturan admin (nilai global dari server). */
export function useToolFlag(key: ToolFlag): boolean {
  const value = useSyncExternalStore(subscribe, () => flags[key], () => false);
  // Pastikan pengecekan berjalan walau komponen dimuat setelah pengambilan pertama
  useEffect(() => {
    void refresh();
  }, []);
  return value;
}
