import { Kost } from './types';
import { getAllKosts } from './data-store';
import { sanitizeKostForPublic } from './security';
import { getRatingMap } from './reviews';

/** Kost yang sudah dipublikasikan (draft tidak tampil ke publik). */
export function filterPublished<T extends { is_draft?: boolean }>(kosts: T[]): T[] {
  return kosts.filter((k) => !k.is_draft);
}

/** Daftar kost aman untuk publik (tanpa nomor WhatsApp & media premium, tanpa draft) + ringkasan rating. */
export async function getPublicKosts(): Promise<Kost[]> {
  const [kosts, ratings] = await Promise.all([getAllKosts(), getRatingMap()]);
  return filterPublished(kosts).map((k) => {
    const safe = sanitizeKostForPublic(k);
    const r = ratings[k.slug];
    return r ? { ...safe, rating: r } : safe;
  });
}
