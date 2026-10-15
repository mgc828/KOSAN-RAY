import React from 'react';
import { notFound } from 'next/navigation';
import { INITIAL_KOSTS } from '@/lib/mock-data';
import { sanitizeKostForPublic } from '@/lib/security';
import KostDetailClient from './KostDetailClient';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kota: string; area: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kost = INITIAL_KOSTS.find(k => k.slug === slug);

  if (!kost) {
    return {
      title: 'Kost Tidak Ditemukan - KostHunt',
    };
  }

  const thumbMedia = kost.media?.find(m => m.is_preview) || kost.media?.[0];
  const thumbUrl = thumbMedia?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';

  return {
    title: `${kost.nama} di ${kost.area}, ${kost.kota} - Sewa Rp${kost.harga.toLocaleString('id-ID')}/bln`,
    description: `${kost.deskripsi.slice(0, 150)}... Akses foto kamar lengkap, video 360, dan kontak WhatsApp pemilik langsung di KostHunt.`,
    openGraph: {
      title: `${kost.nama} (${kost.area}, ${kost.kota})`,
      description: `Kost ${kost.tipe} ${kost.kota}. Rp${kost.harga.toLocaleString('id-ID')}/bln. Buka nomor WhatsApp pemilik di KostHunt.`,
      images: [{ url: thumbUrl, width: 1200, height: 630, alt: kost.nama }],
    },
    alternates: {
      canonical: `/kost/${kost.kota.toLowerCase()}/${kost.area.toLowerCase()}/${kost.slug}`,
    },
  };
}

export default async function KostDetailPage({
  params,
}: {
  params: Promise<{ kota: string; area: string; slug: string }>;
}) {
  const { slug } = await params;
  const rawKost = INITIAL_KOSTS.find(k => k.slug === slug);

  if (!rawKost) {
    notFound();
  }

  // SANGAT PENTING: Server-side rendering hanya menyajikan data publik/preview aman
  // Tidak ada URL media premium dan tidak ada owner_whatsapp di HTML awal atau initial data
  const initialPublicKost = sanitizeKostForPublic(rawKost);

  // Schema JSON-LD untuk LodgingBusiness & BreadcrumbList dengan isAccessibleForFree: false pada paywalled parts
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Beranda',
            'item': 'https://kosthunt.id',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': `Kost ${rawKost.kota}`,
            'item': `https://kosthunt.id/kost/${rawKost.kota.toLowerCase()}`,
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': rawKost.area,
            'item': `https://kosthunt.id/kost/${rawKost.kota.toLowerCase()}/${rawKost.area.toLowerCase()}`,
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': rawKost.nama,
            'item': `https://kosthunt.id/kost/${rawKost.kota.toLowerCase()}/${rawKost.area.toLowerCase()}/${rawKost.slug}`,
          },
        ],
      },
      {
        '@type': 'LodgingBusiness',
        'name': rawKost.nama,
        'description': rawKost.deskripsi,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': rawKost.alamat,
          'addressLocality': rawKost.area,
          'addressRegion': 'DKI Jakarta',
          'addressCountry': 'ID',
        },
        'priceRange': `IDR ${rawKost.harga}`,
        'amenityFeature': rawKost.fasilitas.map(f => ({
          '@type': 'LocationFeatureSpecification',
          'name': f,
          'value': true,
        })),
        'hasPart': {
          '@type': 'WebPageElement',
          'isAccessibleForFree': false,
          'cssSelector': '.premium-locked-section',
          'description': 'Semua foto kamar resolusi tinggi, 2 video 360 walkthrough, dan nomor WhatsApp pemilik kost',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KostDetailClient initialKost={initialPublicKost} slug={slug} />
    </>
  );
}
