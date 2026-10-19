/** Bagian ulasan yang aman dipakai di browser maupun server (tanpa akses data). */

export interface RatingSummary {
  avg: number; // 0 kalau belum ada
  count: number;
  dist: [number, number, number, number, number]; // jumlah bintang 1..5
}

export const REVIEW_MIN_CHARS = 10;
export const REVIEW_MAX_CHARS = 1000;

/** Rata-rata & sebaran bintang. Fungsi murni (dites di tests/reviews.test.ts). */
export function summarize(reviews: { rating: number }[]): RatingSummary {
  const dist: RatingSummary['dist'] = [0, 0, 0, 0, 0];
  let total = 0;
  for (const r of reviews) {
    const n = Math.round(r.rating);
    if (n >= 1 && n <= 5) {
      dist[n - 1]++;
      total += n;
    }
  }
  const count = dist.reduce((a, b) => a + b, 0);
  return { avg: count ? Math.round((total / count) * 10) / 10 : 0, count, dist };
}

/** "Rani Susanti" -> "Rani S." (nama lengkap tidak ditampilkan ke publik). */
export function maskName(name: string | undefined, email: string): string {
  const base = (name || email.split('@')[0] || 'Pengguna').trim();
  const parts = base.split(/\s+/);
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1, 12);
  return parts.length > 1 ? `${first} ${parts[1].charAt(0).toUpperCase()}.` : first;
}

export function validateReview(input: { rating: unknown; body: unknown }): { ok: true; rating: number; body: string } | { ok: false; error: string } {
  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { ok: false, error: 'Pilih rating 1 sampai 5 bintang.' };
  const body = typeof input.body === 'string' ? input.body.trim() : '';
  if (body.length < REVIEW_MIN_CHARS) return { ok: false, error: `Ulasan minimal ${REVIEW_MIN_CHARS} karakter.` };
  if (body.length > REVIEW_MAX_CHARS) return { ok: false, error: `Ulasan maksimal ${REVIEW_MAX_CHARS} karakter.` };
  return { ok: true, rating, body };
}

