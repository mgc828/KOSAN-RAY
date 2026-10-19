import React from 'react';
import { notFound } from 'next/navigation';
import { getKostBySlug } from '@/lib/data-store';
import { getPublicKosts } from '@/lib/public-kosts';
import { getReviews, summarize } from '@/lib/reviews';
import { sanitizeKostForPublic } from '@/lib/security';
import KostDetailClient from './KostDetailClient';
import type { Metadata } from 'next';
import { baseUrl } from '@/lib/config';
import { breadcrumbLd, faqLd, kostFaqs, kostPath, lodgingLd } from '@/lib/seo';
import JsonLd, { FaqSection } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kota: string; area: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kost = await getKostBySlug(slug);

  if (!kost) {
    return {
      title: 'Kost Tidak Ditemukan - kost-kostan',
    };
  }

  const thumbMedia = kost.media?.find(m => m.is_preview) || kost.media?.[0];
  const thumbUrl = thumbMedia?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80';

  return {
    title: `${kost.nama} di ${kost.area}, ${kost.kota} - Sewa Rp${kost.harga.toLocaleString('id-ID')}/bln`,
    description: `${kost.deskripsi.slice(0, 150)}... Akses foto kamar lengkap, video 360, dan kontak WhatsApp pemilik langsung di kost-kostan.`,
    openGraph: {
      title: `${kost.nama} (${kost.area}, ${kost.kota})`,
      description: `Kost ${kost.tipe} ${kost.kota}. Rp${kost.harga.toLocaleString('id-ID')}/bln. Buka nomor WhatsApp pemilik di kost-kostan.`,
      images: [{ url: thumbUrl, width: 1200, height: 630, alt: kost.nama }],
    },
    alternates: {
      canonical: `/kost/${(kost.kota || 'jakarta').toLowerCase()}/${kost.area.toLowerCase()}/${kost.slug}`,
    },
  };
}

export default async function KostDetailPage({
  params,
}: {
  params: Promise<{ kota: string; area: string; slug: string }>;
}) {
  const { slug } = await params;
  const rawKost = await getKostBySlug(slug);

  if (!rawKost) {
    notFound();
  }

  // SANGAT PENTING: Server-side rendering hanya menyajikan data publik/preview aman
  // Tidak ada URL media premium dan tidak ada owner_whatsapp di HTML awal atau initial data
  const initialPublicKost = sanitizeKostForPublic(rawKost);

  // Kost serupa: area yang sama lebih dulu, lalu yang harganya paling dekat. Hanya data publik.
  const similar = (await getPublicKosts())
    .filter((k) => k.slug !== rawKost.slug)
    .sort((a, b) => {
      const areaA = a.area === rawKost.area ? 0 : 1;
      const areaB = b.area === rawKost.area ? 0 : 1;
      if (areaA !== areaB) return areaA - areaB;
      return Math.abs(a.harga - rawKost.harga) - Math.abs(b.harga - rawKost.harga);
    })
    .slice(0, 4);

  const ratingSummary = summarize(await getReviews(slug));

  const site = baseUrl();
  const kotaSlug = rawKost.kota.toLowerCase();
  const faqs = kostFaqs(initialPublicKost);
  const jsonLd = [
    breadcrumbLd(site, [
      { name: 'Beranda', path: '/' },
      { name: `Kost ${rawKost.kota}`, path: `/kost/${kotaSlug}` },
      { name: rawKost.area, path: `/kost/${kotaSlug}/${rawKost.area.toLowerCase()}` },
      { name: rawKost.nama, path: kostPath(rawKost) },
    ]),
    lodgingLd(site, initialPublicKost, ratingSummary.count > 0 ? { avg: ratingSummary.avg, count: ratingSummary.count } : undefined),
    faqLd(faqs),
  ];

  return (
    <>
      <JsonLd graph={jsonLd} />
      <KostDetailClient
        initialKost={{ ...initialPublicKost, rating: ratingSummary.count > 0 ? { avg: ratingSummary.avg, count: ratingSummary.count } : undefined }}
        slug={slug}
        similar={similar}
      />
      <FaqSection title={`Pertanyaan tentang ${rawKost.nama}`} faqs={faqs} />
    </>
  );
}
