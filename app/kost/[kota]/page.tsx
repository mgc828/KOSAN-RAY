import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INITIAL_KOSTS } from '@/lib/mock-data';
import KostCard from '@/components/KostCard';
import { MapPin, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kota: string }>;
}): Promise<Metadata> {
  const { kota } = await params;
  const cityName = kota.charAt(0).toUpperCase() + kota.slice(1);

  return {
    title: `Daftar Kost di ${cityName} - Info & Kontak Pemilik Rp10.000 / 30 Hari`,
    description: `Temukan pilihan kost putri, putra, dan campur di ${cityName}. Preview foto gratis dan akses nomor WhatsApp pemilik langsung.`,
  };
}

export default async function KotaKostPage({
  params,
}: {
  params: Promise<{ kota: string }>;
}) {
  const { kota } = await params;
  if (kota.toLowerCase() !== 'jakarta') {
    notFound();
  }

  const kostList = INITIAL_KOSTS.filter(k => k.kota.toLowerCase() === kota.toLowerCase());
  const areas = Array.from(new Set(kostList.map(k => k.area)));

  return (
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
              <MapPin className="w-3 h-3 text-neutral-400" />
              <span>Kost {area}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kostList.map(kost => (
          <KostCard key={kost.id} kost={kost} />
        ))}
      </div>
    </div>
  );
}
