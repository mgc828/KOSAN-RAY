import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getPublicKosts } from '@/lib/public-kosts';
import { getAllKosts } from '@/lib/data-store';
import KostCard from '@/components/KostCard';
import { MapPin, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { baseUrl } from '@/lib/config';
import { breadcrumbLd, faqLd, itemListLd, listingFaqs } from '@/lib/seo';
import JsonLd, { FaqSection } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kota: string }>;
}): Promise<Metadata> {
  const { kota } = await params;
  if (kota.toLowerCase() !== 'jakarta') {
    const all = await getAllKosts();
    const hit = all.find((k) => !k.is_draft && k.slug.toLowerCase() === kota.toLowerCase());
    if (hit) {
      return {
        title: `${hit.nama} - Info Kost & Kontak Pemilik`,
        description: `Lihat fasilitas, foto, dan detail ${hit.nama}.`,
      };
    }
  }
  const cityName = kota.charAt(0).toUpperCase() + kota.slice(1);

  return {
    title: `Daftar Kost di ${cityName} - Info & Kontak Pemilik Rp15.000 / 30 Hari`,
    description: `Temukan pilihan kost putri, putra, dan campur di ${cityName}. Preview foto gratis dan akses nomor WhatsApp pemilik langsung.`,
    alternates: { canonical: `/kost/${kota.toLowerCase()}` },
  };
}

export default async function KotaKostPage({
  params,
}: {
  params: Promise<{ kota: string }>;
}) {
  const { kota } = await params;
  if (kota.toLowerCase() !== 'jakarta') {
    // Toleransi jika URL yang diakses adalah slug langsung (/kost/[slug])
    const all = await getAllKosts();
    const hit = all.find((k) => k.slug.toLowerCase() === kota.toLowerCase());
    if (hit) {
      const citySlug = (hit.kota || 'jakarta').toLowerCase();
      const areaSlug = (hit.area || 'jakarta').toLowerCase().replace(/\s+/g, '-');
      redirect(`/kost/${citySlug}/${areaSlug}/${hit.slug}`);
    }
    notFound();
  }

  const kostList = (await getPublicKosts()).filter(k => k.kota.toLowerCase() === kota.toLowerCase());
  const areas = Array.from(new Set(kostList.map(k => k.area)));

  const cityLabel = kota.charAt(0).toUpperCase() + kota.slice(1);
  const site = baseUrl();
  const faqs = listingFaqs(cityLabel, kostList);

  return (
    <>
      <JsonLd graph={[
          breadcrumbLd(site, [
            { name: 'Beranda', path: '/' },
            { name: `Kost ${cityLabel}`, path: `/kost/${kota.toLowerCase()}` },
          ]),
          itemListLd(site, `Kost di ${cityLabel}`, kostList),
          faqLd(faqs),
        ]} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500">
        <Link href="/" className="hover:text-emerald-700">Beranda</Link>
        <span>/</span>
        <span className="font-semibold text-neutral-800 capitalize">Kost {kota}</span>
      </nav>

      {/* Header */}
      <div className="space-y-2 border-b border-neutral-200 pb-6">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight capitalize">
          Pilihan Kost di Kota {kota}
        </h1>
        <p className="text-sm text-neutral-600">
          Tersedia {kostList.length} kost terverifikasi dengan foto preview asli dan kontak pemilik langsung.
        </p>

        {/* Area Links */}
        <div className="flex flex-wrap gap-2 pt-3">
          {areas.map(area => (
            <Link
              key={area}
              href={`/kost/${kota}/${area.toLowerCase()}`}
              className="inline-flex items-center gap-1 bg-white border border-neutral-200 hover:border-emerald-600 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 hover:text-emerald-700 transition-colors shadow-2xs"
            >
              <MapPin className="w-3 h-3 text-neutral-500" />
              <span>Kost {area}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-3 pt-3 pb-8 overflow-visible" style={{ overflow: 'visible' }}>
        {kostList.map(kost => (
          <KostCard key={kost.id} kost={kost} />
        ))}
      </div>
    </div>
      <FaqSection title={`Pertanyaan seputar kost di ${cityLabel}`} faqs={faqs} />
    </>
  );
}
