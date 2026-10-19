/** Hitungan jarak & daftar tempat acuan (kampus, stasiun, MRT) untuk pencarian "dekat ...". */

export type LandmarkType = 'kampus' | 'stasiun';

export interface Landmark {
  id: string;
  name: string;
  type: LandmarkType;
  lat: number;
  lng: number;
}

/**
 * Titik koordinat berikut perkiraan (akurat sekitar beberapa ratus meter), cukup untuk
 * jarak garis lurus. Bukan jarak jalan kaki/berkendara.
 */
export const LANDMARKS: Landmark[] = [
  { id: 'ui-salemba', name: 'Universitas Indonesia (Salemba)', type: 'kampus', lat: -6.1966, lng: 106.8484 },
  { id: 'binus-kemanggisan', name: 'BINUS (Kemanggisan)', type: 'kampus', lat: -6.2024, lng: 106.7821 },
  { id: 'trisakti', name: 'Universitas Trisakti (Grogol)', type: 'kampus', lat: -6.1672, lng: 106.7915 },
  { id: 'untar', name: 'Universitas Tarumanagara (Grogol)', type: 'kampus', lat: -6.1689, lng: 106.7894 },
  { id: 'atma-jaya', name: 'Universitas Atma Jaya (Semanggi)', type: 'kampus', lat: -6.2181, lng: 106.8178 },
  { id: 'upnvj', name: 'UPN Veteran Jakarta (Pondok Labu)', type: 'kampus', lat: -6.3153, lng: 106.7936 },
  { id: 'stasiun-tebet', name: 'Stasiun Tebet', type: 'stasiun', lat: -6.2264, lng: 106.8584 },
  { id: 'stasiun-palmerah', name: 'Stasiun Palmerah', type: 'stasiun', lat: -6.2072, lng: 106.7975 },
  { id: 'stasiun-sudirman', name: 'Stasiun Sudirman', type: 'stasiun', lat: -6.202, lng: 106.823 },
  { id: 'stasiun-gambir', name: 'Stasiun Gambir', type: 'stasiun', lat: -6.1767, lng: 106.8306 },
  { id: 'mrt-dukuh-atas', name: 'MRT Dukuh Atas', type: 'stasiun', lat: -6.2001, lng: 106.8227 },
  { id: 'mrt-benhil', name: 'MRT Bendungan Hilir', type: 'stasiun', lat: -6.2177, lng: 106.8174 },
  { id: 'mrt-setiabudi', name: 'MRT Setiabudi Astra', type: 'stasiun', lat: -6.209, lng: 106.82 },
  { id: 'mrt-istora', name: 'MRT Istora Mandiri', type: 'stasiun', lat: -6.2236, lng: 106.8081 },
  { id: 'mrt-blok-m', name: 'MRT Blok M BCA', type: 'stasiun', lat: -6.2442, lng: 106.7985 },
  { id: 'mrt-fatmawati', name: 'MRT Fatmawati', type: 'stasiun', lat: -6.2926, lng: 106.7933 },
];

export function getLandmark(id: string | null | undefined): Landmark | undefined {
  return id ? LANDMARKS.find((l) => l.id === id) : undefined;
}

const R = 6371000; // jari-jari bumi (meter)
const rad = (d: number) => (d * Math.PI) / 180;

/** Jarak garis lurus antara dua titik (meter), rumus haversine. */
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** 640 -> "640 m", 1250 -> "1,3 km", 12400 -> "12 km" */
export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  const km = m / 1000;
  return km < 10 ? `${km.toFixed(1).replace('.', ',')} km` : `${Math.round(km)} km`;
}

/** Tempat acuan terdekat dari sebuah titik (opsional dibatasi jenisnya). */
export function nearestLandmarks(
  lat: number,
  lng: number,
  opts: { type?: LandmarkType; limit?: number } = {}
): { landmark: Landmark; distance: number }[] {
  return LANDMARKS.filter((l) => !opts.type || l.type === opts.type)
    .map((landmark) => ({ landmark, distance: haversine(lat, lng, landmark.lat, landmark.lng) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, opts.limit ?? 1);
}
