'use client';

import { useSyncExternalStore } from 'react';

/**
 * Penyimpanan daftar id (slug kost) di localStorage yang bisa dipakai bersama oleh banyak komponen.
 * Dipakai untuk wishlist dan daftar perbandingan.
 */
export function createIdStore(storageKey: string, max?: number) {
  const listeners = new Set<() => void>();
  const EMPTY: string[] = [];
  let cache: string[] = EMPTY;
  let loaded = false;

  const read = (): string[] => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  };

  const emit = () => listeners.forEach((l) => l());

  const ensureLoaded = () => {
    if (!loaded && typeof window !== 'undefined') {
      cache = read();
      loaded = true;
      window.addEventListener('storage', (e) => {
        if (e.key === storageKey) {
          cache = read();
          emit();
        }
      });
    }
  };

  const write = (next: string[]) => {
    cache = next;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* penyimpanan penuh / diblokir: tetap simpan di memori */
    }
    emit();
  };

  const subscribe = (cb: () => void) => {
    ensureLoaded();
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  };
  const getSnapshot = () => {
    ensureLoaded();
    return cache;
  };
  const getServerSnapshot = () => EMPTY;

  function useIds() {
    const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return {
      ids,
      count: ids.length,
      has: (id: string) => ids.includes(id),
      /** Mengembalikan false kalau gagal menambah karena batas maksimum tercapai. */
      toggle: (id: string): boolean => {
        const cur = getSnapshot();
        if (cur.includes(id)) {
          write(cur.filter((x) => x !== id));
          return true;
        }
        if (max !== undefined && cur.length >= max) return false;
        write([...cur, id]);
        return true;
      },
      remove: (id: string) => write(getSnapshot().filter((x) => x !== id)),
      clear: () => write([]),
    };
  }

  return { useIds };
}
