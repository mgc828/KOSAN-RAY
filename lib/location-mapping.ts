import { INDONESIA_REGIONS, MatchedRegionResult } from './indonesia-regions';
import { areaToKecamatan, canonicalCity, canonicalKecamatan, cityOfKecamatan } from './jakarta-regions';
import { haversine } from './geo';

/**
 * Pemetaan hasil pin peta (geocode) ke field form kost: Area/Kawasan, Kota, Kecamatan, Kelurahan, Kode Pos, dan alamat.
 * Nama kota & kecamatan dibakukan ke daftar yang sama dengan filter Cari Kost / Maps (lib/jakarta-regions.ts),
 * sehingga kost yang dibuat lewat peta pasti muncul saat filter Lokasi Area & Kecamatan dipakai.
 */

export interface AreaOption {
  nama: string;
  kota: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Bakukan kota/kecamatan hasil geocode; isi kota dari kecamatan bila kosong, dan kecamatan dari titik terdekat bila tidak cocok. */
export function normalizeRegion(region: MatchedRegionResult, lat?: number, lng?: number): MatchedRegionResult {
  let kecamatan = canonicalKecamatan(region.kecamatan);
  let kota = canonicalCity(region.kota) ?? cityOfKecamatan(kecamatan);

  if (!kecamatan && lat !== undefined && lng !== undefined) {
    const near = nearestDistrict(lat, lng);
    if (near && (!kota || near.kota === kota)) {
      kecamatan = canonicalKecamatan(near.kecamatan);
      kota = kota ?? canonicalCity(near.kota);
    }
  }
  return { ...region, kota: kota ?? region.kota, kecamatan: kecamatan ?? region.kecamatan };
}

/** Kecamatan terdekat dari daftar wilayah berkoordinat (maks 6 km). */
export function nearestDistrict(lat: number, lng: number): { kecamatan: string; kota: string } | undefined {
  let best: { kecamatan: string; kota: string; d: number } | undefined;
  for (const p of INDONESIA_REGIONS) {
    for (const c of p.kota) {
      for (const k of c.kecamatan) {
        if (k.lat === undefined || k.lng === undefined) continue;
        const d = haversine(lat, lng, k.lat, k.lng);
        if (!best || d < best.d) best = { kecamatan: k.nama, kota: c.nama, d };
      }
    }
  }
  return best && best.d <= 6000 ? { kecamatan: best.kecamatan, kota: best.kota } : undefined;
}

export interface AreaPick {
  nama: string;
  kota?: string;
  /** true bila area ini ada di daftar Area admin; false bila dibuat dari nama kecamatan/kelurahan peta. */
  existing: boolean;
}

/** Pilih Area / Kawasan terbaik dari daftar Area admin untuk sebuah wilayah; bila tidak ada, pakai nama kecamatan/kelurahan. */
export function pickAreaForRegion(areas: AreaOption[], region: MatchedRegionResult): AreaPick | null {
  const kel = norm(region.kelurahan ?? '');
  const kec = norm(region.kecamatan ?? '');

  let best: { a: AreaOption; score: number } | undefined;
  for (const a of areas) {
    const n = norm(a.nama);
    if (!n) continue;
    let score = 0;
    if (kel && n === kel) score = 100;
    else if (kec && n === kec) score = 90;
    else if (kel && kel.includes(n)) score = 80;
    else if (region.kecamatan && canonicalKecamatan(areaToKecamatan(a.nama)) === region.kecamatan) score = 60;
    if (!score) continue;
    score += !region.kota || a.kota === region.kota ? 5 : -30;
    if (!best || score > best.score) best = { a, score };
  }
  if (best && best.score >= 60) return { nama: best.a.nama, kota: best.a.kota, existing: true };

  const fallback = region.kecamatan || region.kelurahan;
  return fallback ? { nama: fallback, kota: region.kota, existing: false } : null;
}

/** Alamat lengkap: "Jalan X No. 5, Kelurahan, Kecamatan, Kota 12910". */
export function composeAddress(road: string, region: MatchedRegionResult): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  // Pecah per koma lalu buang bagian yang sama (mis. "Setiabudi" yang muncul di jalan dan kecamatan)
  for (const p of [...road.split(','), region.kelurahan, region.kecamatan, region.kota]) {
    const t = p?.trim();
    if (t && !seen.has(norm(t))) {
      parts.push(t);
      seen.add(norm(t));
    }
  }
  const text = parts.join(', ');
  return region.kodepos ? `${text} ${region.kodepos}` : text;
}
