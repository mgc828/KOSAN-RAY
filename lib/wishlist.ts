'use client';

import { createIdStore } from './id-store';

const store = createIdStore('kostkostan_wishlist');
const compareStore = createIdStore('kostkostan_compare', 3);

/** Daftar kost favorit (disimpan di browser). */
export const useWishlist = store.useIds;

/** Daftar kost yang dibandingkan (maksimal 3). */
export const useCompare = compareStore.useIds;
export const COMPARE_MAX = 3;
