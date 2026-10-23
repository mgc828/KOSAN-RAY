import { describe, it, expect } from 'vitest';
import { matchRegionFromGeocode } from '@/lib/indonesia-regions';
import { composeAddress, normalizeRegion, pickAreaForRegion } from '@/lib/location-mapping';
import { canonicalCity, canonicalKecamatan, getKostCity, getKostKecamatan } from '@/lib/jakarta-regions';
import { sanitizeKostForPublic } from '@/lib/security';
import { INITIAL_KOSTS } from '@/lib/mock-data';

const AREAS = [
  { nama: 'Kuningan', kota: 'Jakarta Selatan' },
  { nama: 'Tebet', kota: 'Jakarta Selatan' },
  { nama: 'Setiabudi', kota: 'Jakarta Selatan' },
  { nama: 'Benhil', kota: 'Jakarta Pusat' },
  { nama: 'Pluit & PIK', kota: 'Jakarta Utara' },
];

// Respons Nominatim sungguhan untuk titik di Setiabudi, Jakarta Selatan
const NOMINATIM_SETIABUDI = {
  road: 'Jalan Taman Setiabudi Timur',
  city_block: 'RW 02',
  neighbourhood: 'Setiabudi',
  village: 'Setiabudi',
  city_district: 'Jakarta Selatan',
  city: 'Daerah Khusus Ibukota Jakarta',
  postcode: '12910',
};

describe('pemetaan lokasi pin peta -> form kost', () => {
  it('membakukan nama kota & kecamatan', () => {
    expect(canonicalCity('jakarta selatan')).toBe('Jakarta Selatan');
    expect(canonicalCity('Jakarta')).toBeUndefined();
    expect(canonicalKecamatan('Kecamatan Setiabudi')).toBe('Setiabudi');
    expect(canonicalKecamatan('tamansari')).toBe('Taman Sari');
  });

  it('hasil Nominatim -> kota, kecamatan, kelurahan, kode pos', () => {
    const r = normalizeRegion(matchRegionFromGeocode(NOMINATIM_SETIABUDI), -6.211, 106.828);
    expect(r.kota).toBe('Jakarta Selatan');
    expect(r.kecamatan).toBe('Setiabudi');
    expect(r.kodepos).toBe('12910');
  });

  it('memilih Area / Kawasan dari daftar admin', () => {
    const r = normalizeRegion(matchRegionFromGeocode(NOMINATIM_SETIABUDI), -6.211, 106.828);
    expect(pickAreaForRegion(AREAS, r)).toEqual({ nama: 'Setiabudi', kota: 'Jakarta Selatan', existing: true });
    // Kelurahan Karet Kuningan (kec. Setiabudi) tanpa area "Setiabudi" -> "Kuningan"
    const kuningan = { kota: 'Jakarta Selatan', kecamatan: 'Setiabudi', kelurahan: 'Karet Kuningan' };
    expect(pickAreaForRegion(AREAS.filter((a) => a.nama !== 'Setiabudi'), kuningan)?.nama).toBe('Kuningan');
  });

  it('memakai nama kecamatan bila tidak ada area admin yang cocok', () => {
    const pick = pickAreaForRegion(AREAS, { kota: 'Jakarta Barat', kecamatan: 'Kembangan' });
    expect(pick).toEqual({ nama: 'Kembangan', kota: 'Jakarta Barat', existing: false });
  });

  it('menghapus nama wilayah ganda saat menyusun alamat', () => {
    const text = composeAddress('Jalan Taman Setiabudi Timur, Setiabudi', { kecamatan: 'Setiabudi', kota: 'Jakarta Selatan', kodepos: '12910' });
    expect(text).toBe('Jalan Taman Setiabudi Timur, Setiabudi, Jakarta Selatan 12910');
  });

  it('menyusun alamat lengkap tanpa duplikasi nama', () => {
    const text = composeAddress('Jalan Taman Setiabudi Timur', { kelurahan: 'Setiabudi', kecamatan: 'Setiabudi', kota: 'Jakarta Selatan', kodepos: '12910' });
    expect(text).toBe('Jalan Taman Setiabudi Timur, Setiabudi, Jakarta Selatan 12910');
  });
});

describe('filter Cari Kost & Maps memakai data lokasi terstruktur', () => {
  it('kota & kecamatan eksplisit diprioritaskan di atas tebakan teks', () => {
    const k = { alamat: 'Jl. Anonim No. 1', area: 'Kembangan', kota: 'Jakarta Barat', kecamatan: 'Kembangan' };
    expect(getKostCity(k)).toBe('Jakarta Barat');
    expect(getKostKecamatan(k)).toBe('Kembangan');
  });

  it('kost lama tanpa data terstruktur tetap terdeteksi dari teks', () => {
    expect(getKostCity({ alamat: 'Jl. Karet Pedurenan, Setiabudi, Jakarta Selatan', area: 'Kuningan', kota: 'Jakarta' })).toBe('Jakarta Selatan');
    expect(getKostKecamatan({ alamat: 'x', area: 'Kuningan' })).toBe('Setiabudi');
  });

  it('data kecamatan ikut dikirim ke halaman publik', () => {
    const base = INITIAL_KOSTS[0];
    const pub = sanitizeKostForPublic({ ...base, kecamatan: 'Setiabudi', kelurahan: 'Karet Kuningan', kodepos: '12940', provinsi: 'DKI Jakarta' });
    expect(pub.kecamatan).toBe('Setiabudi');
    expect(pub.kelurahan).toBe('Karet Kuningan');
    expect(pub.kodepos).toBe('12940');
    expect(pub.provinsi).toBe('DKI Jakarta');
    expect(pub.owner_whatsapp).toBeUndefined();
  });
});

describe('kost draft tidak tampil ke publik', () => {
  it('filterPublished membuang draft dan mempertahankan kost lain', async () => {
    const { filterPublished } = await import('@/lib/public-kosts');
    const list = [
      { slug: 'a', is_draft: false },
      { slug: 'b', is_draft: true },
      { slug: 'c' },
    ];
    expect(filterPublished(list).map((k) => k.slug)).toEqual(['a', 'c']);
  });
});
