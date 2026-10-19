import { Kost } from './types';
import { LANDMARKS } from './geo';
import { FACILITY_CATEGORIES } from './facilities';

export type SuggestionKind = 'kost' | 'area' | 'kampus' | 'stasiun' | 'fasilitas';

export interface Suggestion {
  kind: SuggestionKind;
  /** Teks utama yang ditampilkan. */
  label: string;
  /** Keterangan kecil di bawahnya. */
  sub?: string;
  /** Nilai yang dipakai saat dipilih (slug kost, nama area, id acuan, nama fasilitas). */
  value: string;
  /** Tujuan halaman, khusus kost. */
  href?: string;
}

export const KIND_LABEL: Record<SuggestionKind, string> = {
  kost: 'Kost',
  area: 'Area',
  kampus: 'Kampus',
  stasiun: 'Stasiun / MRT',
  fasilitas: 'Fasilitas',
};

/** Skor kecocokan sederhana: awal kata > awal teks > mengandung. 0 = tidak cocok. */
function score(text: string, q: string): number {
  const t = text.toLowerCase();
  if (t === q) return 4;
  if (t.startsWith(q)) return 3;
  if (t.split(/[\s,()/-]+/).some((w) => w.startsWith(q))) return 2;
  return t.includes(q) ? 1 : 0;
}

/**
 * Saran pencarian dari nama kost, area, kampus/stasiun, dan kategori fasilitas.
 * Fungsi murni (dites di tests/suggestions.test.ts).
 */
export function buildSuggestions(query: string, kosts: Kost[], limit = 8): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const out: (Suggestion & { s: number; order: number })[] = [];
  const push = (s: Suggestion, sc: number, order: number) => sc > 0 && out.push({ ...s, s: sc, order });

  for (const k of kosts) {
    push(
      {
        kind: 'kost',
        label: k.nama,
        sub: `${k.area}, Jakarta`,
        value: k.slug,
        href: `/kost/${(k.kota || 'jakarta').toLowerCase()}/${k.area.toLowerCase()}/${k.slug}`,
      },
      Math.max(score(k.nama, q), score(k.alamat, q) > 0 ? 1 : 0),
      1
    );
  }

  for (const area of Array.from(new Set(kosts.map((k) => k.area)))) {
    const n = kosts.filter((k) => k.area === area).length;
    push({ kind: 'area', label: `Kost di ${area}`, sub: `${n} kost`, value: area }, score(area, q), 0);
  }

  for (const l of LANDMARKS) {
    push({ kind: l.type, label: `Dekat ${l.name}`, sub: 'Urutkan menurut jarak', value: l.id }, score(l.name, q), 2);
  }

  for (const f of FACILITY_CATEGORIES) {
    push({ kind: 'fasilitas', label: f.label, sub: 'Filter fasilitas', value: f.label }, score(f.label, q), 3);
  }

  return out
    .sort((a, b) => b.s - a.s || a.order - b.order || a.label.localeCompare(b.label))
    .slice(0, limit)
    .map(({ s: _s, order: _o, ...rest }) => rest);
}
