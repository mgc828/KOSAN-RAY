/** Wilayah administrasi Jakarta untuk filter Lokasi Area -> Kecamatan di halaman Cari Kost. */

export const JAKARTA_REGIONS: Record<string, string[]> = {
  'Jakarta Barat': [
    'Cengkareng', 'Grogol Petamburan', 'Kalideres', 'Kebon Jeruk',
    'Kembangan', 'Palmerah', 'Taman Sari', 'Tambora',
  ],
  'Jakarta Utara': ['Cilincing', 'Kelapa Gading', 'Koja', 'Pademangan', 'Penjaringan', 'Tanjung Priok'],
  'Jakarta Selatan': [
    'Cilandak', 'Jagakarsa', 'Kebayoran Baru', 'Kebayoran Lama', 'Mampang Prapatan',
    'Pancoran', 'Pasar Minggu', 'Pesanggrahan', 'Setiabudi', 'Tebet',
  ],
  'Jakarta Timur': [
    'Cakung', 'Cipayung', 'Ciracas', 'Duren Sawit', 'Jatinegara',
    'Kramat Jati', 'Makasar', 'Matraman', 'Pasar Rebo', 'Pulo Gadung',
  ],
  'Jakarta Pusat': [
    'Cempaka Putih', 'Gambir', 'Johar Baru', 'Kemayoran', 'Menteng',
    'Sawah Besar', 'Senen', 'Tanah Abang',
  ],
};

export const JAKARTA_CITIES = Object.keys(JAKARTA_REGIONS);

/** Nama area/kelurahan populer yang bukan nama kecamatan -> kecamatannya. */
const AREA_ALIAS: Record<string, string> = {
  kuningan: 'Setiabudi',
  benhil: 'Tanah Abang',
  'bendungan hilir': 'Tanah Abang',
  salemba: 'Senen',
  fatmawati: 'Cilandak',
  kemang: 'Mampang Prapatan',
  senopati: 'Kebayoran Baru',
  scbd: 'Kebayoran Baru',
  sudirman: 'Setiabudi',
  setiabudi: 'Setiabudi',
  tebet: 'Tebet',
  'blok m': 'Kebayoran Baru',
  'pondok indah': 'Kebayoran Lama',
  pancoran: 'Pancoran',
  cilandak: 'Cilandak',
  grogol: 'Grogol Petamburan',
  'tanjung duren': 'Grogol Petamburan',
  tomang: 'Grogol Petamburan',
  palmerah: 'Palmerah',
  'kelapa gading': 'Kelapa Gading',
  pluit: 'Penjaringan',
  pik: 'Penjaringan',
  'pantai indah kapuk': 'Penjaringan',
  sunter: 'Tanjung Priok',
  matraman: 'Matraman',
  jatinegara: 'Jatinegara',
  rawamangun: 'Pulo Gadung',
  menteng: 'Menteng',
  harmoni: 'Gambir',
  kemayoran: 'Kemayoran',
};

interface KostLoc {
  alamat?: string;
  area?: string;
  /** Data lokasi terstruktur (diisi dari pin peta di form kost); diprioritaskan di atas tebakan dari teks. */
  kota?: string;
  kecamatan?: string;
}

const lower = (s: string) => s.toLowerCase();
const norm = (s: string) => lower(s).replace(/[^a-z0-9]/g, '');

/** Nama kota administrasi baku ("Jakarta Selatan") dari teks bebas, atau undefined. */
export function canonicalCity(name?: string): string | undefined {
  if (!name) return undefined;
  const n = norm(name);
  return JAKARTA_CITIES.find((c) => norm(c) === n);
}

/** Nama kecamatan baku dari teks bebas (mis. "Kecamatan Setiabudi", "Tamansari"), atau undefined. */
export function canonicalKecamatan(name?: string): string | undefined {
  if (!name) return undefined;
  const n = norm(name.replace(/^\s*(kecamatan|kec\.?)\s+/i, ''));
  return JAKARTA_CITIES.flatMap((c) => JAKARTA_REGIONS[c]).find((k) => norm(k) === n);
}

/** Kota administrasi tempat sebuah kecamatan berada. */
export function cityOfKecamatan(kecamatan?: string): string | undefined {
  const kec = canonicalKecamatan(kecamatan);
  return kec ? JAKARTA_CITIES.find((c) => JAKARTA_REGIONS[c].includes(kec)) : undefined;
}

/** Kecamatan dari nama area populer ("Kuningan" -> "Setiabudi", "Pluit & PIK" -> "Penjaringan"). */
export function areaToKecamatan(areaName?: string): string | undefined {
  if (!areaName) return undefined;
  const direct = canonicalKecamatan(areaName);
  if (direct) return direct;
  const whole = AREA_ALIAS[lower(areaName).trim()];
  if (whole) return whole;
  for (const token of lower(areaName).split(/[&/,]/).map((t) => t.trim()).filter(Boolean)) {
    if (AREA_ALIAS[token]) return AREA_ALIAS[token];
  }
  return undefined;
}

/** Kota administrasi (mis. "Jakarta Selatan") dari sebuah kost, atau undefined bila tidak dikenali. */
export function getKostCity(k: KostLoc): string | undefined {
  // 0. Data terstruktur dari form kost (pin peta) lebih akurat daripada tebakan teks
  const explicit = canonicalCity(k.kota) ?? cityOfKecamatan(k.kecamatan);
  if (explicit) return explicit;

  const alamat = lower(k.alamat ?? '');
  const area = lower(k.area ?? '');

  // 1. Cek langsung jika nama kota administrasi ada di alamat atau area
  const byArea = JAKARTA_CITIES.find((c) => area.includes(lower(c)));
  if (byArea) return byArea;

  const byAlamat = JAKARTA_CITIES.find((c) => alamat.includes(lower(c)));
  if (byAlamat) return byAlamat;

  // 2. Cek lewat kecamatan / alias area
  const kec = getKostKecamatan(k);
  if (kec) {
    const matchedCity = JAKARTA_CITIES.find((c) => JAKARTA_REGIONS[c].includes(kec));
    if (matchedCity) return matchedCity;
  }

  // 3. Cek apakah ada kecocokan parsial dari daftar kecamatan
  for (const city of JAKARTA_CITIES) {
    for (const kName of JAKARTA_REGIONS[city]) {
      if (area.includes(lower(kName)) || alamat.includes(lower(kName))) {
        return city;
      }
    }
  }

  return undefined;
}

/** Dapatkan kota administrasi dari nama area saja */
export function getCityForArea(areaName: string): string {
  const city = getKostCity({ area: areaName });
  if (city) return city;

  // Fallback logis per area populer
  const l = lower(areaName);
  if (l.includes('kuningan') || l.includes('tebet') || l.includes('setiabudi') || l.includes('kemang') || l.includes('senopati') || l.includes('cilandak') || l.includes('mampang') || l.includes('blok m')) {
    return 'Jakarta Selatan';
  }
  if (l.includes('menteng') || l.includes('benhil') || l.includes('tanah abang') || l.includes('senen') || l.includes('salemba') || l.includes('kemayoran')) {
    return 'Jakarta Pusat';
  }
  if (l.includes('grogol') || l.includes('tanjung duren') || l.includes('tomang') || l.includes('palmerah') || l.includes('kebon jeruk')) {
    return 'Jakarta Barat';
  }
  if (l.includes('kelapa gading') || l.includes('pluit') || l.includes('pik') || l.includes('sunter')) {
    return 'Jakarta Utara';
  }
  if (l.includes('matraman') || l.includes('jatinegara') || l.includes('rawamangun') || l.includes('cawang')) {
    return 'Jakarta Timur';
  }

  return 'Jakarta Selatan';
}

/** Format tampilan lokasi kost: "Kuningan, Jakarta Selatan", "Setiabudi, Jakarta Selatan", dsb. */
export function formatKostLocation(k: { area?: string; kota?: string; alamat?: string }): string {
  const rawArea = (k.area || 'Jakarta').trim();

  // Jika rawArea sudah mengandung spesifik Jakarta (misal "Kuningan, Jakarta Selatan")
  for (const city of JAKARTA_CITIES) {
    if (rawArea.toLowerCase().includes(city.toLowerCase())) {
      return rawArea;
    }
  }

  // Cari kota administrasi yang tepat
  const city = getKostCity(k) || getCityForArea(rawArea);
  return `${rawArea}, ${city}`;
}

/** Kecamatan dari sebuah kost (dicocokkan dari alamat, lalu nama area), atau undefined. */
export function getKostKecamatan(k: KostLoc): string | undefined {
  const explicit = canonicalKecamatan(k.kecamatan);
  if (explicit) return explicit;

  const alamat = lower(k.alamat ?? '');
  const area = lower(k.area ?? '');
  const all = JAKARTA_CITIES.flatMap((c) => JAKARTA_REGIONS[c]);
  return (
    all.find((kec) => alamat.includes(lower(kec))) ??
    all.find((kec) => lower(kec) === area) ??
    AREA_ALIAS[area]
  );
}
