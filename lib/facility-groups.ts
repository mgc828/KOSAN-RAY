/** Pengelompokan daftar fasilitas (teks bebas) ke kategori untuk halaman detail kost. */

export type FacilityGroupKey = 'kamar' | 'mandi' | 'bersama' | 'parkir' | 'keamanan' | 'sekitar' | 'lainnya';

export const FACILITY_GROUP_TITLES: Record<FacilityGroupKey, string> = {
  kamar: 'Fasilitas Dalam Kamar',
  mandi: 'Fasilitas Kamar Mandi',
  bersama: 'Fasilitas Bersama',
  parkir: 'Parkir',
  keamanan: 'Keamanan & Akses',
  sekitar: 'Di Sekitar Kost',
  lainnya: 'Fasilitas Lainnya',
};

const GROUP_ORDER: FacilityGroupKey[] = ['kamar', 'mandi', 'bersama', 'keamanan', 'parkir', 'sekitar', 'lainnya'];

const has = (t: string, words: string[]) => words.some((w) => t.includes(w));
/** "AC", "AC Inverter", "AC Daikin" (kata utuh, supaya tidak cocok dengan kata lain yang memuat "ac"). */
const AC_RE = /(^|\s)ac(\s|$)/;

export function facilityGroupOf(name: string): FacilityGroupKey {
  const t = name.toLowerCase();
  if (has(t, ['parkir'])) return 'parkir';
  if (has(t, ['kamar mandi', 'water heater', 'shower', 'toilet', 'air panas'])) return 'mandi';
  if (has(t, ['cctv', 'penjaga', 'security', 'akses card', 'access', 'jam malam', 'bebas banjir'])) return 'keamanan';
  if (has(t, ['dekat', 'kuliner', 'halte', 'stasiun', 'mrt', 'laundry kiloan'])) return 'sekitar';
  if (has(t, ['dapur', 'ruang tamu', 'rooftop', 'lounge', 'gym', 'laundry', 'housekeeping', 'kulkas bersama'])) return 'bersama';
  if (AC_RE.test(t) || has(t, ['wifi', 'kasur', 'springbed', 'king koil', 'meja', 'kursi', 'lemari', 'rias', 'tv', 'kulkas', 'balkon', 'komputer'])) return 'kamar';
  return 'lainnya';
}

export interface FacilityGroup {
  key: FacilityGroupKey;
  title: string;
  items: string[];
}

export function groupFacilities(list: string[]): FacilityGroup[] {
  const map = new Map<FacilityGroupKey, string[]>();
  for (const f of list) {
    const k = facilityGroupOf(f);
    map.set(k, [...(map.get(k) ?? []), f]);
  }
  return GROUP_ORDER.filter((k) => map.has(k)).map((k) => ({ key: k, title: FACILITY_GROUP_TITLES[k], items: map.get(k)! }));
}

/** Nama ikon (lucide) yang cocok untuk satu fasilitas; dipetakan ke komponen di halaman detail. */
export type FacilityIconName =
  | 'snowflake' | 'wifi' | 'bed' | 'desk' | 'tv' | 'fridge' | 'shower' | 'flame' | 'utensils' | 'sofa' | 'gym'
  | 'washer' | 'car' | 'bike' | 'shield' | 'camera' | 'key' | 'pin' | 'sparkles' | 'check' | 'trees' | 'droplets';

export function facilityIconOf(name: string): FacilityIconName {
  const t = name.toLowerCase();
  if (AC_RE.test(t)) return 'snowflake';
  if (has(t, ['wifi', 'internet'])) return 'wifi';
  if (has(t, ['kasur', 'springbed', 'king koil'])) return 'bed';
  if (has(t, ['meja', 'kursi', 'komputer', 'lemari', 'rias'])) return 'desk';
  if (has(t, ['tv'])) return 'tv';
  if (has(t, ['kulkas'])) return 'fridge';
  if (has(t, ['water heater', 'air panas'])) return 'flame';
  if (has(t, ['kamar mandi', 'shower', 'toilet'])) return 'shower';
  if (has(t, ['dapur'])) return 'utensils';
  if (has(t, ['ruang tamu', 'lounge', 'rooftop'])) return 'sofa';
  if (has(t, ['gym'])) return 'gym';
  if (has(t, ['laundry'])) return 'washer';
  if (has(t, ['mobil'])) return 'car';
  if (has(t, ['motor', 'sepeda'])) return 'bike';
  if (has(t, ['cctv'])) return 'camera';
  if (has(t, ['akses', 'card', 'kunci'])) return 'key';
  if (has(t, ['penjaga', 'security', 'jam malam', 'banjir'])) return 'shield';
  if (has(t, ['dekat', 'halte', 'stasiun', 'mrt'])) return 'pin';
  if (has(t, ['housekeeping'])) return 'sparkles';
  if (has(t, ['balkon', 'taman'])) return 'trees';
  return 'check';
}
