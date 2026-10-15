'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Kost, KostMedia } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { 
  MapPin, 
  Lock, 
  Unlock, 
  Eye, 
  Video, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface KostDetailClientProps {
  initialKost: Kost;
  slug: string;
}

export default function KostDetailClient({ initialKost, slug }: KostDetailClientProps) {
  const { user, subscription } = useAuth();
  const isSubscriber = subscription.status === 'active';

  const [subscriberKost, setSubscriberKost] = useState<Kost | null>(null);
  const kostData = (isSubscriber && subscriberKost) ? subscriberKost : initialKost;

  const [activeMedia, setActiveMedia] = useState<KostMedia | null>(
    initialKost.media?.find(m => m.tipe === 'foto_gedung') || initialKost.media?.[0] || null
  );

  // WhatsApp Unlock State
  const [waState, setWaState] = useState<{
    unlocked: boolean;
    whatsappNumber?: string;
    waUrl?: string;
    loading: boolean;
    error?: string;
  }>({
    unlocked: false,
    loading: false,
  });

  // Jika subscriber aktif, fetch full media dari endpoint terotorisasi
  useEffect(() => {
    let isCancelled = false;
    if (isSubscriber) {
      fetch(`/api/kost/${slug}`, {
        headers: {
          'x-subscriber-status': 'active',
          'x-user-id': user?.id || 'subscriber-demo',
        },
      })
        .then(res => res.json())
        .then(data => {
          if (!isCancelled && data && !data.error) {
            setSubscriberKost(data);
          }
        })
        .catch(() => {});
    }
    return () => {
      isCancelled = true;
    };
  }, [isSubscriber, slug, user?.id]);

  // Handler buka WhatsApp untuk pelanggan aktif
  const handleUnlockWhatsApp = async () => {
    if (!isSubscriber) return;

    setWaState(prev => ({ ...prev, loading: true, error: undefined }));
    try {
      const res = await fetch(`/api/kost/${slug}/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'subscriber-demo',
          subscriberStatus: 'active',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setWaState({
          unlocked: true,
          whatsappNumber: data.whatsapp,
          waUrl: data.whatsapp_url,
          loading: false,
        });
      } else {
        setWaState(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Gagal memuat kontak WhatsApp',
        }));
      }
    } catch {
      setWaState(prev => ({
        ...prev,
        loading: false,
        error: 'Terjadi gangguan jaringan saat membuka WhatsApp',
      }));
    }
  };

  const previewPhotos = kostData.media?.filter(m => m.tipe === 'foto_kamar' || m.tipe === 'foto_gedung') || [];
  const previewVideos = kostData.media?.filter(m => m.tipe === 'video') || [];

  const lockedPhotosCount = initialKost.locked_media_summary?.locked_photos_count ?? 5;
  const lockedVideosCount = initialKost.locked_media_summary?.locked_videos_count ?? 2;

  const tipeBadgeColor = {
    putri: 'bg-rose-100 text-rose-800 border-rose-300',
    putra: 'bg-blue-100 text-blue-800 border-blue-300',
    campur: 'bg-purple-100 text-purple-800 border-purple-300',
  }[kostData.tipe];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <Link href="/" className="hover:text-emerald-700">Beranda</Link>
        <span>/</span>
        <Link href={`/kost/${kostData.kota.toLowerCase()}`} className="hover:text-emerald-700 capitalize">
          Kost {kostData.kota}
        </Link>
        <span>/</span>
        <Link href={`/kost/${kostData.kota.toLowerCase()}/${kostData.area.toLowerCase()}`} className="hover:text-emerald-700 capitalize">
          Area {kostData.area}
        </Link>
        <span>/</span>
        <span className="font-semibold text-neutral-900 truncate max-w-xs">{kostData.nama}</span>
      </nav>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${tipeBadgeColor}`}>
              Kost {kostData.tipe}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-900 text-white">
              {kostData.kota} {kostData.area}
            </span>
            {kostData.status === 'tersedia' && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Kamar Tersedia
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            {kostData.nama}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-neutral-500">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{kostData.alamat}</span>
          </p>
        </div>

        {/* Pricing Card Header */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 md:text-right shrink-0">
          <p className="text-xs text-emerald-800 font-medium">Harga Sewa Kamar</p>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900">
            Rp {kostData.harga.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-emerald-700"> / bulan</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-0.5">Listrik & air sesuai ketentuan pengelola</p>
        </div>
      </div>

      {/* GALLERY & MEDIA SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            <span>Galeri Foto & Video Kamar</span>
          </h2>

          <div className="text-xs font-semibold">
            {isSubscriber ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                <Unlock className="w-3.5 h-3.5" /> Full Akses Terbuka
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                <Lock className="w-3.5 h-3.5" /> +{lockedPhotosCount} Foto & +{lockedVideosCount} Video Terkunci
              </span>
            )}
          </div>
        </div>

        {/* Main Stage Display (Photo or Video Player) */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-300 shadow-md">
          {activeMedia?.tipe === 'video' ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black">
              <video
                src={activeMedia.url}
                controls
                autoPlay={false}
                playsInline
                className="w-full h-full object-contain"
              >
                Browser Anda tidak mendukung tag video.
              </video>
            </div>
          ) : (
            <Image
              src={activeMedia?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80'}
              alt={activeMedia?.alt_text || kostData.nama}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Overlay info */}
          <div className="absolute bottom-3 left-3 bg-neutral-900/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
            {activeMedia?.tipe === 'video' ? (
              <Video className="w-4 h-4 text-emerald-400" />
            ) : (
              <Eye className="w-4 h-4 text-emerald-400" />
            )}
            <span>{activeMedia?.alt_text || 'Foto Kost'}</span>
          </div>
        </div>

        {/* Thumbnails Row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {/* Unlocked / Preview Items */}
          {previewPhotos.map((media) => (
            <button
              key={media.id}
              onClick={() => setActiveMedia(media)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                activeMedia?.id === media.id ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <Image
                src={media.url || ''}
                alt={media.alt_text}
                fill
                sizes="150px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white px-1 rounded font-medium">
                {media.tipe === 'foto_gedung' ? 'Gedung' : 'Kamar'}
              </span>
            </button>
          ))}

          {/* Video Preview Button */}
          {previewVideos.map((media) => (
            <button
              key={media.id}
              onClick={() => setActiveMedia(media)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-neutral-900 text-white flex flex-col items-center justify-center p-2 text-center transition-all ${
                activeMedia?.id === media.id ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-neutral-700 hover:border-neutral-500'
              }`}
            >
              <Video className="w-6 h-6 text-emerald-400 mb-1" />
              <span className="text-[10px] font-bold leading-tight">Video Tour</span>
              <span className="text-[9px] text-neutral-400">Preview</span>
            </button>
          ))}

          {/* Locked Placeholders for non-subscribers */}
          {!isSubscriber && (
            <>
              {Array.from({ length: Math.min(lockedPhotosCount, 3) }).map((_, idx) => (
                <Link
                  key={`locked-p-${idx}`}
                  href="/checkout"
                  className="premium-locked-section relative aspect-square rounded-xl overflow-hidden border border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 flex flex-col items-center justify-center p-2 text-center transition-colors group"
                >
                  <Lock className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-amber-900 leading-tight">Foto #{idx + 4}</span>
                  <span className="text-[9px] text-amber-700">Terkunci</span>
                </Link>
              ))}

              <Link
                href="/checkout"
                className="premium-locked-section relative aspect-square rounded-xl overflow-hidden border border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 flex flex-col items-center justify-center p-2 text-center transition-colors group"
              >
                <Video className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-amber-900 leading-tight">Video 360°</span>
                <span className="text-[9px] text-amber-700">Terkunci</span>
              </Link>
            </>
          )}
        </div>

        {/* Banner Locked Warning (Section 7: Server safety) */}
        {!isSubscriber && (
          <div className="premium-locked-section bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Konten Eksklusif Terkunci: +{lockedPhotosCount} Foto Kamar, +{lockedVideosCount} Video 360°, & Nomor WhatsApp</span>
              </div>
              <p className="text-xs text-neutral-600">
                Media premium disimpan di bucket privat Cloudflare R2 dan hanya di-stream lewat URL terverifikasi untuk pelanggan aktif.
              </p>
            </div>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buka Sekarang Rp10.000</span>
            </Link>
          </div>
        )}
      </section>

      {/* TWO COLUMNS: DETAILS & WHATSAPP OWNER CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Deskripsi, Fasilitas, Peraturan */}
        <div className="lg:col-span-2 space-y-8">
          {/* Deskripsi */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3">
            <h3 className="text-base font-bold text-neutral-900">Deskripsi Kost</h3>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
              {kostData.deskripsi}
            </p>
          </div>

          {/* Fasilitas */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Fasilitas yang Didapat</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {kostData.fasilitas.map((fas, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium text-neutral-800 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{fas}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Peraturan */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3">
            <h3 className="text-base font-bold text-neutral-900">Peraturan & Ketertiban</h3>
            <ul className="space-y-2 text-xs text-neutral-700">
              {kostData.peraturan.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: KONTAK PEMILIK (WHATSAPP ACCESS) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-6 shadow-sm space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="font-extrabold text-neutral-900 text-base">Kontak Pemilik Kost</h3>
                <p className="text-xs text-neutral-500">Hubungi langsung via WhatsApp</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
            </div>

            {/* Subscribed View vs Locked View */}
            {isSubscriber ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Langganan Anda Aktif</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Sisa {subscription.daysRemaining} hari akses tak terbatas ke seluruh kontak kost.
                  </p>
                </div>

                {waState.unlocked ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 text-center">
                      <p className="text-[11px] text-neutral-500 font-medium">Nomor WhatsApp Terverifikasi:</p>
                      <p className="text-lg font-black text-neutral-900 tracking-wider">
                        +{waState.whatsappNumber}
                      </p>
                    </div>

                    <a
                      href={waState.waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition-all hover:scale-[1.02]"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Buka Chat WhatsApp Sekarang</span>
                      <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={handleUnlockWhatsApp}
                    disabled={waState.loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-400 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition-all"
                  >
                    {waState.loading ? (
                      <span>Memverifikasi Akses Server...</span>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span>Tampilkan Nomor WhatsApp Pemilik</span>
                      </>
                    )}
                  </button>
                )}

                {waState.error && (
                  <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{waState.error}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Masked display */}
                <div className="p-3.5 bg-neutral-100 rounded-xl border border-neutral-200 text-center space-y-1">
                  <p className="text-[11px] text-neutral-500 font-medium">Nomor WhatsApp Pemilik:</p>
                  <p className="text-base font-mono font-bold text-neutral-400 tracking-widest">
                    +62 8••-••••-••••
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded">
                    <Lock className="w-3 h-3" /> Terkunci untuk Non-Langganan
                  </span>
                </div>

                <div className="space-y-2 text-xs text-neutral-600 leading-relaxed">
                  <p>
                    Hindari penipuan & calo sewa kamar. Buka kontak resmi pemilik kost dan semua media eksklusif hanya dengan <strong>Rp10.000 / 30 hari</strong>.
                  </p>
                </div>

                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Beli Akses Rp10.000 Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[11px] text-neutral-400 text-center">
                  Pembayaran instan via QRIS (BCA, Mandiri, BRI, GoPay, ShopeePay, OVO, DANA)
                </p>
              </div>
            )}

            {/* Transparansi Info */}
            <div className="pt-3 border-t border-neutral-100 flex items-start gap-2 text-[11px] text-neutral-500">
              <Info className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
              <span>
                Akses berlaku 30 hari sejak tanggal pembayaran untuk seluruh kost yang ada di KostHunt tanpa batas klik.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
