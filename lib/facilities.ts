/** Kategori fasilitas yang dipakai di filter Cari Kost dan tabel Bandingkan. */
export interface FacilityCategory {
  label: string;
  test: (fasilitas: string) => boolean;
}

export const FACILITY_CATEGORIES: FacilityCategory[] = [
  { label: 'AC', test: (f) => /^ac\b/i.test(f) },
  { label: 'WiFi', test: (f) => /wifi/i.test(f) },
  { label: 'KM Dalam', test: (f) => /kamar mandi dalam/i.test(f) },
  { label: 'Water Heater', test: (f) => /water heater/i.test(f) },
  { label: 'Kasur', test: (f) => /kasur/i.test(f) },
  { label: 'Smart TV', test: (f) => /tv/i.test(f) },
  { label: 'Parkir', test: (f) => /parkir/i.test(f) },
  { label: 'Dapur', test: (f) => /dapur/i.test(f) },
  { label: 'Kulkas', test: (f) => /kulkas/i.test(f) },
  { label: 'Meja & Kursi', test: (f) => /meja|kursi/i.test(f) },
];

/** Fasilitas yang tidak masuk kategori mana pun (ditampilkan sebagai "fasilitas lain"). */
export function otherFacilities(fasilitas: string[]): string[] {
  return fasilitas.filter((f) => !FACILITY_CATEGORIES.some((c) => c.test(f)));
}
