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
};

interface KostLoc {
  alamat?: string;
  area?: string;
}

const lower = (s: string) => s.toLowerCase();

/** Kota administrasi (mis. "Jakarta Selatan") dari sebuah kost, atau undefined bila tidak dikenali. */
export function getKostCity(k: KostLoc): string | undefined {
  const alamat = lower(k.alamat ?? '');
  const byAlamat = JAKARTA_CITIES.find((c) => alamat.includes(lower(c)));
  if (byAlamat) return byAlamat;
  const kec = getKostKecamatan(k);
  return kec ? JAKARTA_CITIES.find((c) => JAKARTA_REGIONS[c].includes(kec)) : undefined;
}

/** Kecamatan dari sebuah kost (dicocokkan dari alamat, lalu nama area), atau undefined. */
export function getKostKecamatan(k: KostLoc): string | undefined {
  const alamat = lower(k.alamat ?? '');
  const area = lower(k.area ?? '');
  const all = JAKARTA_CITIES.flatMap((c) => JAKARTA_REGIONS[c]);
  return (
    all.find((kec) => alamat.includes(lower(kec))) ??
    all.find((kec) => lower(kec) === area) ??
    AREA_ALIAS[area]
  );
}

