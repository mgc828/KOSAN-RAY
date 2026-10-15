'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Kost } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { MapPin, Lock, Unlock, Eye, Video, CheckCircle2 } from 'lucide-react';

interface KostCardProps {
  kost: Kost;
}

export default function KostCard({ kost }: KostCardProps) {
  const { subscription } = useAuth();
  const isSubscriber = subscription.status === 'active';

  // Ambil foto thumbnail (foto gedung atau foto kamar preview pertama)
  const thumbMedia = 
    kost.media?.find(m => m.tipe === 'foto_gedung') ||
    kost.media?.find(m => m.is_preview) ||
    kost.media?.[0];

  const thumbUrl = thumbMedia?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

  // Warna badge tipe
  const tipeColor = {
    putri: 'bg-rose-100 text-rose-800 border-rose-200',
    putra: 'bg-blue-100 text-blue-800 border-blue-200',
    campur: 'bg-purple-100 text-purple-800 border-purple-200',
  }[kost.tipe];

  const lockedPhotos = kost.locked_media_summary?.locked_photos_count ?? 5;
  const lockedVideos = kost.locked_media_summary?.locked_videos_count ?? 2;

  const detailUrl = `/kost/surabaya/${kost.area.toLowerCase()}/${kost.slug}`;

  return (
    <div className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <Image
          src={thumbUrl}
          alt={thumbMedia?.alt_text || kost.nama}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Status & Tipe Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize shadow-xs backdrop-blur-xs ${tipeColor}`}>
            Kost {kost.tipe}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-900/80 text-white backdrop-blur-xs">
            {kost.area}
          </span>
        </div>

        {/* Media Preview Tag on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-medium text-white">
          <span className="inline-flex items-center gap-1 bg-neutral-900/80 px-2 py-1 rounded-md backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>3 Foto + 1 Video Preview</span>
          </span>

          {isSubscriber ? (
            <span className="inline-flex items-center gap-1 bg-emerald-600/90 px-2 py-1 rounded-md backdrop-blur-xs font-semibold">
              <Unlock className="w-3.5 h-3.5 text-white" />
              <span>Full Akses</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-amber-600/90 px-2 py-1 rounded-md backdrop-blur-xs font-semibold">
              <Lock className="w-3 h-3 text-white" />
              <span>+{lockedPhotos} Foto & WA Terkunci</span>
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between mb-1.5">
            <div>
              <span className="text-xl font-extrabold text-neutral-900">
                Rp {kost.harga.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-neutral-500 font-medium"> / bulan</span>
            </div>
            {kost.status === 'tersedia' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Kamar Ada
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={detailUrl} className="block group-hover:text-emerald-700 transition-colors">
            <h3 className="font-bold text-neutral-900 text-base line-clamp-1">
              {kost.nama}
            </h3>
          </Link>

          {/* Location */}
          <p className="flex items-center gap-1 text-xs text-neutral-500 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>{kost.alamat}</span>
          </p>

          {/* Facilities Preview */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {kost.fasilitas.slice(0, 3).map((f, i) => (
              <span
                key={i}
                className="text-[11px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md font-medium"
              >
                {f}
              </span>
            ))}
            {kost.fasilitas.length > 3 && (
              <span className="text-[11px] text-neutral-400 px-1 py-0.5 font-medium">
                +{kost.fasilitas.length - 3} lainnya
              </span>
            )}
          </div>
        </div>

        {/* Bottom CTA / Lock Notice */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
          {!isSubscriber ? (
            <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg w-full flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>WA Pemilik & Video 360° terkunci</span>
              </span>
              <Link href={detailUrl} className="font-bold underline text-amber-900 hover:text-amber-950">
                Lihat Detail
              </Link>
            </div>
          ) : (
            <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg w-full flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nomor WA Siap Dihubungi</span>
              </span>
              <Link href={detailUrl} className="font-bold text-emerald-900 hover:underline">
                Buka Kontak
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
