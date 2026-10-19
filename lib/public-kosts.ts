import { Kost } from './types';
import { getAllKosts } from './data-store';
import { sanitizeKostForPublic } from './security';
import { getRatingMap } from './reviews';

/** Daftar kost aman untuk publik (tanpa nomor WhatsApp & media premium) + ringkasan rating. */
export async function getPublicKosts(): Promise<Kost[]> {
  const [kosts, ratings] = await Promise.all([getAllKosts(), getRatingMap()]);
  return kosts.map((k) => {
    const safe = sanitizeKostForPublic(k);
    const r = ratings[k.slug];
    return r ? { ...safe, rating: r } : safe;
  });
}
