import { getPublicKosts } from '@/lib/public-kosts';
import { baseUrl } from '@/lib/config';
import { breadcrumbLd, itemListLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import CariKostClient from './CariKostClient';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cari Kost di Jakarta - kost-kostan',
  description: 'Cari kost putra, putri, dan campur di Jakarta. Filter lokasi, fasilitas, dan harga; lihat foto dan video asli.',
  alternates: { canonical: '/cari-kost' },
};

export default async function Page() {
  const kosts = await getPublicKosts();
  const site = baseUrl();
  return (
    <>
      <JsonLd
        graph={[
          breadcrumbLd(site, [
            { name: 'Beranda', path: '/' },
            { name: 'Cari Kost', path: '/cari-kost' },
          ]),
          itemListLd(site, 'Daftar kost di Jakarta', kosts),
        ]}
      />
      <Suspense fallback={null}>
        <CariKostClient kosts={kosts} />
      </Suspense>
    </>
  );
}
