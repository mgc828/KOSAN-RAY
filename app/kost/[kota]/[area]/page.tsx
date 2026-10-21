import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicKosts } from '@/lib/public-kosts';
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
  params: Promise<{ kota: string; area: string }>;
}): Promise<Metadata> {
  const { kota, area } = await params;
  const areaName = area.charAt(0).toUpperCase() + area.slice(1);
  const cityName = kota.charAt(0).toUpperCase() + kota.slice(1);

  return {
    title: `Daftar Kost di ${areaName}, ${cityName} - Info & Kontak Pemilik`,
    description: `Temukan pilihan kost terdekat di ${areaName}, ${cityName}. Fasilitas lengkap, preview foto gratis, dan WhatsApp pemilik langsung.`,
    alternates: { canonical: `/kost/${kota.toLowerCase()}/${area.toLowerCase()}` },
  };
}

export default async function AreaKostPage({
  params,
}: {
  params: Promise<{ kota: string; area: string }>;
}) {
  const { kota, area } = await params;
  const filtered = (await getPublicKosts()).filter(
    k => k.kota.toLowerCase() === kota.toLowerCase() && k.area.toLowerCase() === area.toLowerCase()
  );

  if (filtered.length === 0) {
    // Jika area tidak ditemukan, redirect atau tampilkan pesan informatif
  }

  const cityName = kota.charAt(0).toUpperCase() + kota.slice(1);
  const areaTitle = area.charAt(0).toUpperCase() + area.slice(1);

  const site = baseUrl();
  const placeLabel = `${areaTitle}, ${cityName}`;
  const faqs = listingFaqs(placeLabel, filtered);

  return (
    <>
      <JsonLd graph={[
          breadcrumbLd(site, [
            { name: 'Beranda', path: '/' },
            { name: `Kost ${cityName}`, path: `/kost/${kota.toLowerCase()}` },
            { name: areaTitle, path: `/kost/${kota.toLowerCase()}/${area.toLowerCase()}` },
          ]),
          itemListLd(site, `Kost di ${placeLabel}`, filtered),
          faqLd(faqs),
        ]} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500">
        <Link href="/" className="hover:text-emerald-700">Beranda</Link>
        <span>/</span>
        <Link href={`/kost/${kota}`} className="hover:text-emerald-700 capitalize">Kost {kota}</Link>
        <span>/</span>
        <span className="font-semibold text-neutral-800 capitalize">Area {area}</span>
      </nav>

      {/* Header */}
      <div className="space-y-2 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <MapPin className="w-4 h-4" />
          <span>{cityName} {areaTitle}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          Kost Terdekat di Area {areaTitle}, {cityName}
        </h1>
        <p className="text-sm text-neutral-600">
          Menampilkan {filtered.length} pilihan kost di sekitar {areaTitle}. Buka WhatsApp pemilik & foto lengkap dengan langganan Rp15.000 / 30 hari.
        </p>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-3 pt-3 pb-8 overflow-visible" style={{ overflow: 'visible' }}>
          {filtered.map(kost => (
            <KostCard key={kost.id} kost={kost} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8 space-y-4">
          <p className="text-sm font-semibold text-neutral-700">Belum ada kost terdaftar di area {areaTitle}.</p>
          <Link
            href={`/kost/${kota}`}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lihat Semua Kost {cityName}</span>
          </Link>
        </div>
      )}
    </div>
      <FaqSection title={`Pertanyaan seputar kost di ${placeLabel}`} faqs={faqs} />
    </>
  );
}
