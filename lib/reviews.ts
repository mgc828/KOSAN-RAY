import { dbList, dbPut, dbRemove } from './db';
import { getAllTransactions } from './payment-store';
import { REVIEW_MIN_CHARS, REVIEW_MAX_CHARS, summarize, maskName, validateReview, type RatingSummary } from './reviews-shared';

export interface Review {
  /** `${kost_slug}:${user_id}` -> satu ulasan per pengguna per kost. */
  id: string;
  kost_slug: string;
  user_id: string;
  user_name: string;
  rating: number;
  body: string;
  created_at: string;
  updated_at: string;
}

const C = 'reviews';

export { REVIEW_MIN_CHARS, REVIEW_MAX_CHARS, summarize, maskName, validateReview };
export type { RatingSummary };

export async function getReviews(slug: string): Promise<Review[]> {
  return (await dbList<Review>(C)).filter((r) => r.kost_slug === slug);
}

/** Peta slug -> ringkasan rating untuk semua kost (dipakai kartu di daftar). */
export async function getRatingMap(): Promise<Record<string, { avg: number; count: number }>> {
  const bySlug: Record<string, Review[]> = {};
  for (const r of await dbList<Review>(C)) (bySlug[r.kost_slug] ||= []).push(r);
  const out: Record<string, { avg: number; count: number }> = {};
  for (const [slug, list] of Object.entries(bySlug)) {
    const s = summarize(list);
    out[slug] = { avg: s.avg, count: s.count };
  }
  return out;
}

/** Hanya pengguna yang pernah membayar yang boleh menulis ulasan (supaya ulasan dari pengguna sungguhan). */
export async function hasPaid(userId: string): Promise<boolean> {
  return (await getAllTransactions()).some((t) => t.user_id === userId && t.transaction_status === 'settlement');
}

export async function upsertReview(p: {
  slug: string;
  userId: string;
  userName: string;
  rating: number;
  body: string;
}): Promise<Review> {
  const id = `${p.slug}:${p.userId}`;
  const existing = (await getReviews(p.slug)).find((r) => r.id === id);
  const now = new Date().toISOString();
  return dbPut<Review>(C, {
    id,
    kost_slug: p.slug,
    user_id: p.userId,
    user_name: p.userName,
    rating: p.rating,
    body: p.body,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  });
}

export async function deleteReview(slug: string, userId: string): Promise<boolean> {
  return dbRemove(C, `${slug}:${userId}`);
}
