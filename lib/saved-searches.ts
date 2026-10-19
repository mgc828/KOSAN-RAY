'use client';

import { useSyncExternalStore } from 'react';

/** Kondisi filter di halaman Cari Kost yang bisa disimpan. */
export interface SearchState {
  q: string;
  locations: string[];
  kecamatan?: string[];
  tipe: string;
  facilities: string[];
  priceMin: number;
  priceMax: number;
  landmark: string | null;
  radius: number;
  sortBy: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  state: SearchState;
  savedAt: string;
}

const KEY = 'kostkostan_saved_searches';
const MAX = 10;
const EMPTY: SavedSearch[] = [];
const listeners = new Set<() => void>();
let cache: SavedSearch[] = EMPTY;
let loaded = false;

function read(): SavedSearch[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((s) => s && typeof s.id === 'string' && s.state) : [];
  } catch {
    return [];
  }
}

function ensure() {
  if (!loaded && typeof window !== 'undefined') {
    cache = read();
    loaded = true;
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) {
        cache = read();
        listeners.forEach((l) => l());
      }
    });
  }
}

function write(next: SavedSearch[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* penyimpanan penuh/diblokir: tetap di memori */
  }
  listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => {
  ensure();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const snapshot = () => {
  ensure();
  return cache;
};

export function useSavedSearches() {
  const list = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  return {
    list,
    /** false kalau sudah mencapai batas. */
    save(name: string, state: SearchState): boolean {
      const cur = snapshot();
      if (cur.length >= MAX) return false;
      write([{ id: `s-${Date.now()}`, name: name.trim().slice(0, 40) || 'Pencarian saya', state, savedAt: new Date().toISOString() }, ...cur]);
      return true;
    },
    remove(id: string) {
      write(snapshot().filter((s) => s.id !== id));
    },
  };
}

export const MAX_SAVED_SEARCHES = MAX;
