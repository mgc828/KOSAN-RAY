import { getPublicKosts } from '@/lib/public-kosts';
import MapsClient from './MapsClient';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Peta Kost di Jakarta - kost-kostan',
  description: 'Jelajahi kost di Jakarta langsung dari peta interaktif.',
};

export default async function Page() {
  const kosts = await getPublicKosts();

  // Optimasi payload RSC: pangkas field teks panjang yang tidak digunakan di peta
  // (deskripsi panjang, aturan kamar lengkap) agar muat cepat dan stabil di koneksi 3G
  const optimizedKosts = kosts.map((k) => ({
    ...k,
    deskripsi: '',
    peraturan: [],
    media: (k.media || []).slice(0, 3),
  }));

  return <MapsClient kosts={optimizedKosts} />;
}
