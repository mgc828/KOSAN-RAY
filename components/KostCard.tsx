'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Kost } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { MapPin, Lock, Unlock, Eye, Sparkles, ShieldCheck, Heart, Scale, Navigation } from 'lucide-react';
import { useWishlist, useCompare, COMPARE_MAX } from '@/lib/wishlist';
import { toast } from '@/lib/toast';
import { RatingBadge } from '@/components/StarRating';

interface KostCardProps {
  kost: Kost;
  /** Muat gambar lebih dulu (untuk kartu yang langsung terlihat di layar). */
  priority?: boolean;
  /** Keterangan jarak, mis. "650 m dari Stasiun Tebet". */
  distanceLabel?: string;
  /** Tampilan grid (default) atau list horizontal */
  layout?: 'grid' | 'list';
}

export default function KostCard({ kost, priority = false, distanceLabel, layout = 'grid' }: KostCardProps) {
  const { subscription } = useAuth();
  const isSubscriber = subscription.status === 'active';
  const wishlist = useWishlist();
  const compare = useCompare();
  const liked = wishlist.has(kost.slug);
  const comparing = compare.has(kost.slug);

  // Thumbnail logic: prefer gedung photo, then first preview photo, then fallback
  const thumbMedia = 
    kost.media?.find(m => m.tipe === 'foto_gedung') ||
    kost.media?.find(m => m.is_preview) ||
    kost.media?.[0];

  const thumbUrl = thumbMedia?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

  // Sekitar Style Badges for Gender/Type
  const tipeBadge = {
    putri: { label: 'Kost Putri', bg: 'bg-[#FFF0F5] text-[#D81B60] border-[#FCE4EC]' },
    putra: { label: 'Kost Putra', bg: 'bg-[#EBF5FB] text-[#0F2A43] border-[#D4E6F1]' },
    campur: { label: 'Kost Campur', bg: 'bg-[#F4ECF7] text-[#6C3483] border-[#E8DAEF]' },
  }[kost.tipe];

  const lockedPhotos = kost.locked_media_summary?.locked_photos_count ?? 5;
  const detailUrl = `/kost/${(kost.kota || 'jakarta').toLowerCase()}/${kost.area.toLowerCase()}/${kost.slug}`;

  if (layout === 'list') {
    return (
      <div className="group relative block w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F97316] hover:shadow-[0_12px_28px_rgba(249,115,22,0.18)] focus-within:border-[#F97316] focus-within:shadow-[0_12px_28px_rgba(249,115,22,0.18)]">
        <Link href={detailUrl} className="block relative sm:flex sm:flex-row sm:items-stretch">
          {/* Main Image Container */}
          <div className="relative aspect-[16/10] sm:aspect-auto sm:w-72 md:w-80 lg:w-96 overflow-hidden bg-slate-100 shrink-0 min-h-[190px]">
            <Image
              src={thumbUrl}
              alt={thumbMedia?.alt_text || kost.nama}
              fill
              sizes="(max-width: 640px) 100vw, 384px"
              className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
              referrerPolicy="no-referrer"
              priority={priority}
              loading={priority ? undefined : 'lazy'}
            />

            {/* Gradient Overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

            {/* Top Badges */}
            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
              <div className={`px-3 py-1 rounded-full text-xs font-bold border shadow-xs backdrop-blur-md ${tipeBadge.bg}`}>
                {tipeBadge.label}
              </div>

              <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-xs flex items-center gap-1 border border-white/60">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F2A43]" />
                <span>Terverifikasi</span>
              </div>
            </div>

            {/* Preview Tag */}
            <div className="absolute top-12 left-3.5 pointer-events-none">
              <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-medium border border-white/20">
                <Eye className="w-3 h-3 text-[#F97316]" />
                <span>3 Foto + 1 Video Free</span>
              </span>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 sm:pr-24">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-black transition-colors line-clamp-1">
                    {kost.nama}
                  </h3>
                  <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{kost.area}, Jakarta</span>
                  </p>
                </div>
                <RatingBadge rating={kost.rating} />
              </div>

              {distanceLabel && (
                <p className="flex items-center gap-1 text-[11px] font-semibold text-[#C2410C] mt-1.5 truncate">
                  <Navigation className="w-3 h-3 shrink-0" />
                  <span className="truncate">{distanceLabel}</span>
                </p>
              )}

              {/* Facilities Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 overflow-hidden">
                {kost.fasilitas.slice(0, 5).map((fasilitas, i) => (
                  <span
                    key={i}
                    className="text-[10px] sm:text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md truncate max-w-[140px]"
                  >
                    {fasilitas}
                  </span>
                ))}
                {kost.fasilitas.length > 5 && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    +{kost.fasilitas.length - 5} lainnya
                  </span>
                )}
              </div>
            </div>

            {/* Price & Access Status */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-base sm:text-lg font-extrabold text-slate-950 font-sans" suppressHydrationWarning>
                  Rp {kost.harga.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-500 font-medium"> / bln</span>
              </div>

              {/* Status */}
              <div suppressHydrationWarning>
                {isSubscriber ? (
                  <span className="inline-flex items-center gap-1 bg-green-50 border border-[#16A34A]/40 text-[#16A34A] px-2.5 py-1 rounded-lg text-xs font-bold">
                    <Unlock className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>WA Terbuka</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-bold">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>+{lockedPhotos} Foto</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Aksi cepat: favorit & bandingkan */}
        <div className="absolute right-3 top-3.5 z-10 flex sm:flex-row flex-col gap-2">
          <button
            type="button"
            aria-label={comparing ? 'Hapus dari perbandingan' : 'Tambah ke perbandingan'}
            aria-pressed={comparing}
            title={comparing ? 'Hapus dari perbandingan' : 'Bandingkan'}
            onClick={() => {
              if (!compare.toggle(kost.slug)) toast(`Maksimal ${COMPARE_MAX} kost untuk dibandingkan. Hapus salah satu dulu.`, 'error');
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md border transition-all ${
              comparing ? 'bg-[#0F2A43] border-[#0F2A43] text-white' : 'bg-white/95 border-white text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={liked ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
            aria-pressed={liked}
            title={liked ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
            onClick={() => {
              wishlist.toggle(kost.slug);
              toast(liked ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist', liked ? 'info' : 'success');
            }}
            className="w-9 h-9 rounded-full bg-white/95 border border-white flex items-center justify-center shadow-md transition-all hover:scale-110"
          >
            <Heart className="w-[18px] h-[18px]" fill={liked ? '#e74c3c' : 'none'} color={liked ? '#e74c3c' : '#64748B'} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative block w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#F97316] hover:shadow-[0_12px_28px_rgba(249,115,22,0.18)] focus-within:border-[#F97316] focus-within:shadow-[0_12px_28px_rgba(249,115,22,0.18)]">
      <Link href={detailUrl} className="block relative">
        {/* Main Image Container - Sekitar Vertical Card Style */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <Image
            src={thumbUrl}
            alt={thumbMedia?.alt_text || kost.nama}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            referrerPolicy="no-referrer"
            priority={priority}
            loading={priority ? undefined : 'lazy'}
          />

          {/* Gradient Overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
            {/* Gender Type Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-bold border shadow-xs backdrop-blur-md ${tipeBadge.bg}`}>
              {tipeBadge.label}
            </div>

            {/* Verified Badge */}
            <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-xs flex items-center gap-1 border border-white/60">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F2A43]" />
              <span>Terverifikasi</span>
            </div>
          </div>

          {/* Preview Tag */}
          <div className="absolute top-12 left-3.5 pointer-events-none">
            <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-medium border border-white/20">
              <Eye className="w-3 h-3 text-[#F97316]" />
              <span>3 Foto + 1 Video Free</span>
            </span>
          </div>

        </div>
          {/* Signature Floating Glass Info Card (Sekitar Style) */}
          <div className="bg-white p-4">
            {/* Title */}
            <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate group-hover:text-black transition-colors">
              {kost.nama}
            </h3>

            {/* Location */}
            <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{kost.area}, Jakarta</span>
            </p>
            <RatingBadge rating={kost.rating} />
            {distanceLabel && (
              <p className="flex items-center gap-1 text-[11px] font-semibold text-[#C2410C] mt-0.5 truncate">
                <Navigation className="w-3 h-3 shrink-0" />
                <span className="truncate">{distanceLabel}</span>
              </p>
            )}

            {/* Facilities Chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
              {kost.fasilitas.slice(0, 2).map((fasilitas, i) => (
                <span
                  key={i}
                  className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md truncate max-w-[120px]"
                >
                  {fasilitas}
                </span>
              ))}
              {kost.fasilitas.length > 2 && (
                <span className="text-[10px] text-slate-500 font-medium">
                  +{kost.fasilitas.length - 2}
                </span>
              )}
            </div>

            {/* Price & Access Status */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm sm:text-base font-extrabold text-slate-950 font-sans" suppressHydrationWarning>
                  Rp {kost.harga.toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-slate-500 font-medium"> / bln</span>
              </div>

              {/* Status */}
              <div suppressHydrationWarning>
                {isSubscriber ? (
                  <span className="inline-flex items-center gap-1 bg-green-50 border border-[#16A34A]/40 text-[#16A34A] px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    <Unlock className="w-3 h-3 text-[#16A34A]" />
                    <span>WA Terbuka</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>+{lockedPhotos} Foto</span>
                  </span>
                )}
              </div>
            </div>
          </div>
      </Link>

      {/* Aksi cepat: favorit & bandingkan (di luar Link agar tidak ikut membuka halaman detail) */}
      <div className="absolute right-3 top-[3.4rem] z-10 flex flex-col gap-2">
        <button
          type="button"
          aria-label={comparing ? 'Hapus dari perbandingan' : 'Tambah ke perbandingan'}
          aria-pressed={comparing}
          title={comparing ? 'Hapus dari perbandingan' : 'Bandingkan'}
          onClick={() => {
            if (!compare.toggle(kost.slug)) toast(`Maksimal ${COMPARE_MAX} kost untuk dibandingkan. Hapus salah satu dulu.`, 'error');
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md border transition-all ${
            comparing ? 'bg-[#0F2A43] border-[#0F2A43] text-white' : 'bg-white/95 border-white text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label={liked ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
          aria-pressed={liked}
          title={liked ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
          onClick={() => {
            wishlist.toggle(kost.slug);
            toast(liked ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist', liked ? 'info' : 'success');
          }}
          className="w-9 h-9 rounded-full bg-white/95 border border-white flex items-center justify-center shadow-md transition-all hover:scale-110"
        >
          <Heart className="w-[18px] h-[18px]" fill={liked ? '#e74c3c' : 'none'} color={liked ? '#e74c3c' : '#64748B'} />
        </button>
      </div>
    </div>
  );
}
