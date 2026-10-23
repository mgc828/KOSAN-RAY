import { getPublicKosts } from './public-kosts';
import { getKostKecamatan } from './jakarta-regions';

export interface ShowcasePhoto {
  url: string;
  title: string;
  place: string;
  price: number;
}

export interface AuthShowcase {
  kostCount: number;
  areaCount: number;
  minPrice: number | null;
  photos: ShowcasePhoto[];
}

/** Angka & foto nyata dari database untuk panel samping halaman masuk/daftar (hanya data publik). */
export async function getAuthShowcase(): Promise<AuthShowcase> {
  try {
    const kosts = await getPublicKosts();
    const kecamatan = new Set<string>();
    kosts.forEach((k) => {
      const kec = getKostKecamatan(k);
      if (kec) kecamatan.add(kec);
    });

    const photos: ShowcasePhoto[] = [];
    for (const k of kosts) {
      const m = k.media?.find((x) => x.tipe !== 'video' && x.is_preview && x.url);
      if (m?.url && /^https:\/\//.test(m.url)) {
        photos.push({ url: m.url, title: k.nama, place: `${k.area}, ${k.kota}`, price: k.harga });
      }
      if (photos.length >= 3) break;
    }

    return {
      kostCount: kosts.length,
      areaCount: kecamatan.size,
      minPrice: kosts.length ? Math.min(...kosts.map((k) => k.harga)) : null,
      photos,
    };
  } catch {
    return { kostCount: 0, areaCount: 0, minPrice: null, photos: [] };
  }
}
