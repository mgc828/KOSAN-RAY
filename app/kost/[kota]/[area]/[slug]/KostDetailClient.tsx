'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Kost, KostMedia } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import KostCard from '@/components/KostCard';
import ReportDialog from '@/components/ReportDialog';
import PhotoLightbox from '@/components/PhotoLightbox';
import ReviewsSection from '@/components/ReviewsSection';
import { Stars } from '@/components/StarRating';
import { useWishlist, useCompare, COMPARE_MAX } from '@/lib/wishlist';
import { toast } from '@/lib/toast';
import { groupFacilities, facilityIconOf, type FacilityIconName } from '@/lib/facility-groups';
import {
  MapPin,
  Lock,
  Unlock,
  Video,
  Phone,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Info,
  Share2,
  Heart,
  Scale,
  Flag,
  Navigation,
  Route,
  Camera,
  Play,
  X,
  Check,
  Snowflake,
  Wifi,
  BedDouble,
  Armchair,
  Tv,
  Refrigerator,
  ShowerHead,
  Flame,
  Utensils,
  Sofa,
  Dumbbell,
  WashingMachine,
  Car,
  Bike,
  Cctv,
  KeyRound,
  Trees,
  Droplets,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';

interface KostDetailClientProps {
  initialKost: Kost;
  slug: string;
  similar?: Kost[];
}

const ICONS: Record<FacilityIconName, LucideIcon> = {
  snowflake: Snowflake,
  wifi: Wifi,
  bed: BedDouble,
  desk: Armchair,
  tv: Tv,
  fridge: Refrigerator,
  shower: ShowerHead,
  flame: Flame,
  utensils: Utensils,
  sofa: Sofa,
  gym: Dumbbell,
  washer: WashingMachine,
  car: Car,
  bike: Bike,
  shield: ShieldCheck,
  camera: Cctv,
  key: KeyRound,
  pin: MapPin,
  sparkles: Sparkles,
  check: Check,
  trees: Trees,
  droplets: Droplets,
};

const TABS = [
  { id: 'deskripsi', label: 'Deskripsi' },
  { id: 'fasilitas', label: 'Fasilitas' },
  { id: 'lokasi', label: 'Lokasi' },
  { id: 'tata-tertib', label: 'Tata Tertib' },
] as const;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80';

export default function KostDetailClient({ initialKost, slug, similar = [] }: KostDetailClientProps) {
  const { user, subscription, ready } = useAuth();
  const wishlist = useWishlist();
  const compare = useCompare();
  const [reportOpen, setReportOpen] = useState(false);
  const isSubscriber = subscription.status === 'active';
  // Selama status login dari server belum dimuat, jangan tampilkan "terkunci" (supaya pelanggan tidak sempat melihat gembok).
  const lockedUI = ready && !isSubscriber;
  const detailPath = `/kost/${initialKost.kota.toLowerCase()}/${initialKost.area.toLowerCase()}/${slug}`;

  const [subscriberKost, setSubscriberKost] = useState<Kost | null>(null);
  const kostData = (isSubscriber && subscriberKost) ? subscriberKost : initialKost;

  const [activeVideo, setActiveVideo] = useState<KostMedia | null>(null);
  const [activeTab, setActiveTab] = useState<string>('deskripsi');

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
      fetch(`/api/kost/${slug}`, { credentials: 'same-origin', cache: 'no-store' })
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
        credentials: 'same-origin',
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

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${initialKost.nama} - kost-kostan`;
    const text = `Lihat kost ini: ${initialKost.nama} di ${initialKost.area}, Rp${initialKost.harga.toLocaleString('id-ID')}/bulan`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return; // pengguna menutup menu bagikan
    }
    try {
      await navigator.clipboard.writeText(url);
      toast('Tautan disalin. Tinggal tempel untuk dibagikan.', 'success');
    } catch {
      toast('Tidak bisa menyalin tautan. Salin dari bilah alamat browser.', 'error');
    }
  };

  // Belum masuk -> daftar/masuk dulu, lalu otomatis lanjut ke pembayaran. Sudah masuk -> langsung ke pembayaran.
  const buyHref = user ? '/checkout' : '/register?next=/checkout';
  const liked = wishlist.has(slug);
  const comparing = compare.has(slug);

  // Pelanggan aktif tidak perlu menekan tombol lagi: nomor langsung dimuat dari server.
  useEffect(() => {
    if (isSubscriber && !waState.unlocked && !waState.loading && !waState.error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleUnlockWhatsApp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubscriber]);

  const photos = useMemo(
    () =>
      (kostData.media?.filter((m) => (m.tipe === 'foto_kamar' || m.tipe === 'foto_gedung') && m.url) || []).map((m) => ({
        id: m.id,
        url: m.url as string,
        alt: m.alt_text || kostData.nama,
        tipe: m.tipe,
      })),
    [kostData]
  );
  const videos = kostData.media?.filter((m) => m.tipe === 'video') || [];

  const lockedPhotosCount = initialKost.locked_media_summary?.locked_photos_count ?? 5;
  const lockedVideosCount = initialKost.locked_media_summary?.locked_videos_count ?? 2;

  // Pop-up foto (hanya foto yang boleh dilihat pengguna ini: pratinjau, atau semua untuk pelanggan)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const openLightbox = (i: number) => {
    if (photos.length) setLightboxIndex(Math.max(0, Math.min(i, photos.length - 1)));
  };

  // Hero HP: geser kiri/kanan, penghitung mengikuti posisi
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setHeroIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Tab di HP menandai bagian yang sedang dibaca
  useEffect(() => {
    const els = TABS.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActiveTab(vis[0].target.id);
      },
      { rootMargin: '-140px 0px -60% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const goToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveTab(id);
    const y = el.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  const tipeBadge = {
    putri: 'bg-rose-50 text-rose-700',
    putra: 'bg-blue-50 text-blue-700',
    campur: 'bg-green-50 text-green-700',
  }[kostData.tipe];
  const tersedia = kostData.status === 'tersedia';
  const hasGeo = typeof kostData.latitude === 'number' && typeof kostData.longitude === 'number';
  const groups = groupFacilities(kostData.fasilitas);

  const ownerChatHref = waState.waUrl || (waState.whatsappNumber ? `https://wa.me/${waState.whatsappNumber.replace(/\D/g, '')}` : '');

  /** Kartu kontak pemilik (dipakai di sisi kanan desktop dan setelah judul di HP). */
  const contactCard = (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-[#0F2A43] text-base">Kontak Pemilik Kost</h2>
          <p className="text-xs text-slate-500">Hubungi langsung via WhatsApp</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <Phone className="w-5 h-5" />
        </div>
      </div>

      {isSubscriber ? (
        <div className="space-y-3">
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Langganan Anda Aktif</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Sisa {subscription.daysRemaining} hari akses tak terbatas ke seluruh kontak kost.
            </p>
          </div>

          {waState.unlocked ? (
            <div className="space-y-2.5">
              <a
                href={ownerChatHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-3.5 bg-emerald-50 hover:bg-emerald-100/90 rounded-2xl border-2 border-emerald-400 hover:border-emerald-500 transition-all text-center"
              >
                <p className="text-[11px] text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Nomor WhatsApp Terverifikasi</span>
                </p>
                <p className="text-xl font-black text-emerald-950 tracking-wider mt-1 flex items-center justify-center gap-2">
                  <span>+{waState.whatsappNumber}</span>
                  <ExternalLink className="w-4 h-4 text-emerald-700" />
                </p>
              </a>
              <a
                href={ownerChatHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-md transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat WhatsApp Sekarang</span>
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
            <div className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{waState.error}</span>
            </div>
          )}
        </div>
      ) : !ready ? (
        <div className="space-y-3" aria-busy="true" aria-label="Memeriksa status akses">
          <div className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-center space-y-1">
            <p className="text-[11px] text-slate-500 font-medium">Nomor WhatsApp Pemilik:</p>
            <p className="text-base font-mono font-bold text-slate-500 tracking-widest">+62 8••-••••-••••</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-orange-800 font-semibold bg-orange-100 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3" /> Terkunci untuk Non-Langganan
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hindari penipuan & calo sewa kamar. Buka kontak resmi pemilik kost dan semua media eksklusif hanya dengan <strong>Rp15.000 / 30 hari</strong>.
          </p>
          <Link
            href={buyHref}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-md transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Beli Akses Rp15.000 Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[11px] text-slate-500 text-center">
            Pembayaran instan via QRIS (BCA, Mandiri, BRI, GoPay, ShopeePay, OVO, DANA)
          </p>
          {user ? (
            <p className="text-[11px] text-orange-800 font-medium text-center">
              Masuk sebagai <b>{user.email}</b>, akun ini belum punya akses aktif.{' '}
              <Link href={`/login?next=${encodeURIComponent(detailPath)}`} className="underline font-bold">Ganti akun</Link>
            </p>
          ) : (
            <p className="text-[11px] text-orange-800 font-medium text-center">
              Sudah bayar? <Link href={`/login?next=${encodeURIComponent(detailPath)}`} className="underline font-bold">Masuk</Link> dengan akun yang dipakai saat membayar.
            </p>
          )}
        </div>
      )}

      <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>Akses berlaku 30 hari sejak tanggal pembayaran untuk seluruh kost di kost-kostan tanpa batas klik.</span>
      </div>
    </div>
  );

  /** Satu kotak foto pada mosaik desktop. */
  const mosaicCell = (i: number, cls: string, sizes: string) => {
    const p = photos[i];
    const isLastSlot = i === 4;
    const extraUnlocked = Math.max(0, photos.length - 5);
    if (p) {
      const extra = isLastSlot ? extraUnlocked + (lockedUI ? lockedPhotosCount : 0) : 0;
      return (
        <button
          key={p.id}
          type="button"
          onClick={() => openLightbox(i)}
          aria-label={`Perbesar foto: ${p.alt}`}
          className={`relative overflow-hidden group cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F97316] ${cls}`}
        >
          <Image
            src={p.url}
            alt={p.alt}
            fill
            priority={i === 0}
            sizes={sizes}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          {isLastSlot && extra > 0 && (
            <span className="absolute inset-0 bg-black/55 text-white flex flex-col items-center justify-center gap-1 text-sm font-bold">
              <Camera className="w-6 h-6" />
              +{extra} foto
            </span>
          )}
        </button>
      );
    }
    if (lockedUI) {
      return (
        <Link
          key={`locked-${i}`}
          href={buyHref}
          className={`premium-locked-section relative overflow-hidden flex flex-col items-center justify-center gap-1 text-center bg-orange-50 hover:bg-orange-100 border border-dashed border-orange-300 text-orange-900 transition-colors ${cls}`}
        >
          <Lock className="w-6 h-6 text-orange-600" />
          <span className="text-sm font-bold">+{lockedPhotosCount} foto</span>
          <span className="text-[11px]">& {lockedVideosCount} video terkunci</span>
        </Link>
      );
    }
    return <div key={`empty-${i}`} className={`bg-slate-100 ${cls}`} />;
  };

  return (
    <div className="pb-28 lg:pb-12">
      {/* Kembali + galeri mosaik (desktop) */}
      <div className="hidden lg:block max-w-7xl mx-auto px-8 pt-6 space-y-4">
        <Link href="/cari-kost" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#0F2A43]">
          <ArrowLeft className="w-4 h-4" /> Kembali ke hasil pencarian
        </Link>
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[440px] rounded-2xl overflow-hidden" role="group" aria-label="Galeri foto">
          {photos.length === 0 ? (
            <div className="col-span-4 row-span-2 relative bg-slate-100">
              <Image src={FALLBACK_IMG} alt={kostData.nama} fill sizes="1200px" className="object-cover" referrerPolicy="no-referrer" priority />
            </div>
          ) : (
            <>
              {mosaicCell(0, 'col-span-2 row-span-2', '50vw')}
              {mosaicCell(1, '', '25vw')}
              {mosaicCell(2, '', '25vw')}
              {mosaicCell(3, '', '25vw')}
              {mosaicCell(4, '', '25vw')}
            </>
          )}
        </div>
      </div>

      {/* Hero (HP & tablet): geser kiri/kanan, ketuk untuk memperbesar */}
      <div className="lg:hidden relative">
        <div
          ref={heroRef}
          className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden aspect-[4/3] sm:aspect-[16/9] bg-slate-200"
          role="group"
          aria-roledescription="carousel"
          aria-label="Foto kost, geser kiri atau kanan"
        >
          {(photos.length ? photos : [{ id: 'fallback', url: FALLBACK_IMG, alt: kostData.nama }]).map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => photos.length && openLightbox(i)}
              aria-label={`Perbesar foto ${i + 1}: ${p.alt}`}
              className="relative flex-none w-full h-full snap-center snap-always"
            >
              <Image src={p.url} alt={p.alt} fill priority={i === 0} sizes="100vw" className="object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
        <Link
          href="/cari-kost"
          aria-label="Kembali ke hasil pencarian"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        {photos.length > 0 && (
          <span className="absolute bottom-10 left-4 text-xs font-bold text-white bg-black/55 px-2.5 py-1 rounded-full tabular-nums">
            {Math.min(heroIndex + 1, photos.length)}/{photos.length}
          </span>
        )}
        {lockedUI && (
          <Link
            href={buyHref}
            className="premium-locked-section absolute bottom-10 right-4 inline-flex items-center gap-1 text-[11px] font-bold text-orange-900 bg-orange-100/95 px-2.5 py-1 rounded-full"
          >
            <Lock className="w-3 h-3" /> +{lockedPhotosCount} foto & {lockedVideosCount} video
          </Link>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-6 space-y-10">
        {/* Banner konten terkunci (desktop) */}
        {lockedUI && (
          <div className="premium-locked-section hidden lg:flex bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-emerald-500/10 border border-orange-300 rounded-2xl p-4 items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-orange-900 font-bold text-sm">
              <Lock className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Terkunci: +{lockedPhotosCount} foto kamar, +{lockedVideosCount} video 360°, dan nomor WhatsApp pemilik</span>
            </div>
            <Link
              href={buyHref}
              className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buka Sekarang Rp15.000</span>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-5 lg:gap-6 items-start">
          {/* 1. Judul & lokasi */}
          <section className="-mt-7 lg:mt-0 relative lg:col-start-1 lg:row-start-1 bg-white rounded-t-3xl lg:rounded-2xl border border-slate-200 lg:shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 sm:p-7 space-y-3" aria-labelledby="kost-title">
            <div className="flex items-start justify-between gap-3">
              <h1 id="kost-title" className="text-xl sm:text-3xl font-extrabold text-[#0F2A43] tracking-tight leading-tight">
                {kostData.nama}
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Bagikan kost ini"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-pressed={liked}
                  aria-label={liked ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
                  onClick={() => {
                    wishlist.toggle(slug);
                    toast(liked ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist', liked ? 'info' : 'success');
                  }}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center transition-colors ${liked ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                >
                  <Heart className="w-4 h-4" fill={liked ? '#e74c3c' : 'none'} color={liked ? '#e74c3c' : '#334155'} />
                </button>
              </div>
            </div>

            <p className="flex items-start gap-1.5 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{kostData.alamat}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">Kost</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${tipeBadge}`}>{kostData.tipe}</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {kostData.area}, {kostData.kota}
              </span>
              {initialKost.rating && initialKost.rating.count > 0 && (
                <a href="#reviews-title" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#C2410C]">
                  <Stars value={initialKost.rating.avg} size={14} />
                  <span className="font-bold text-[#0F2A43]">{initialKost.rating.avg.toFixed(1).replace('.', ',')}</span>
                  <span>({initialKost.rating.count} ulasan)</span>
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                aria-pressed={comparing}
                onClick={() => {
                  if (!compare.toggle(slug)) toast(`Maksimal ${COMPARE_MAX} kost untuk dibandingkan. Hapus salah satu dulu.`, 'error');
                  else toast(comparing ? 'Dihapus dari perbandingan' : 'Ditambahkan ke perbandingan', comparing ? 'info' : 'success');
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${comparing ? 'bg-[#0F2A43] border-[#0F2A43] text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'}`}
              >
                <Scale className="w-3.5 h-3.5" /> {comparing ? 'Dibandingkan' : 'Bandingkan'}
              </button>
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-500 hover:text-red-700 hover:border-red-200 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" /> Laporkan
              </button>
            </div>
          </section>

          {/* 2. Harga + kontak (kolom kanan di desktop, tepat di bawah judul di HP) */}
          <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-[97px] space-y-4" aria-label="Harga dan kontak pemilik">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-3">
              <p className="text-2xl font-extrabold text-[#0F2A43]">
                Rp {kostData.harga.toLocaleString('id-ID')}
                <span className="text-sm font-medium text-slate-500"> /bulan</span>
              </p>
              <p className="text-[11px] text-slate-500 -mt-1">Listrik & air sesuai ketentuan pengelola</p>
              {tersedia ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                  <Check className="w-4 h-4" /> Kamar tersedia
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <X className="w-4 h-4" /> Kamar penuh
                </div>
              )}
            </div>
            {contactCard}
          </aside>

          {/* 3. Konten: tab, deskripsi, fasilitas, video, lokasi, tata tertib */}
          <div className="lg:col-start-1 lg:row-start-2 bg-white rounded-2xl border border-slate-200 lg:shadow-[0_2px_12px_rgba(0,0,0,0.06)] min-w-0">
            {/* Tab (HP & tablet): menempel di bawah header */}
            <nav className="lg:hidden sticky top-[81px] z-20 bg-white border-b border-slate-200 rounded-t-2xl overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Bagian halaman">
              <ul className="flex min-w-max px-2">
                {TABS.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => goToSection(t.id)}
                      aria-current={activeTab === t.id ? 'true' : undefined}
                      className={`px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === t.id ? 'border-[#F97316] text-[#C2410C]' : 'border-transparent text-slate-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-5 sm:p-7 space-y-10">
              <section id="deskripsi" aria-labelledby="h-deskripsi" className="space-y-3">
                <h2 id="h-deskripsi" className="text-xl font-extrabold text-[#0F2A43]">Deskripsi</h2>
                <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed whitespace-pre-line">{kostData.deskripsi}</p>
              </section>

              <section id="fasilitas" aria-labelledby="h-fasilitas" className="space-y-5">
                <h2 id="h-fasilitas" className="text-xl font-extrabold text-[#0F2A43]">Fasilitas</h2>
                {groups.map((g) => (
                  <div key={g.key} className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800">{g.title}</h3>
                    <ul className="grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-3 gap-2.5">
                      {g.items.map((f) => {
                        const Icon = ICONS[facilityIconOf(f)];
                        return (
                          <li key={f} className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-700">
                            <Icon className="w-4 h-4 text-[#1B75BB] shrink-0" aria-hidden="true" />
                            <span>{f}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </section>

              {(videos.length > 0 || lockedUI) && (
                <section id="video" aria-labelledby="h-video" className="space-y-3">
                  <h2 id="h-video" className="text-xl font-extrabold text-[#0F2A43]">Video</h2>
                  {activeVideo && (
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                      <video src={activeVideo.url} controls autoPlay playsInline preload="none" className="w-full h-full object-contain">
                        Browser Anda tidak mendukung tag video.
                      </video>
                      <button
                        type="button"
                        onClick={() => setActiveVideo(null)}
                        aria-label="Tutup video"
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {videos.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setActiveVideo(v)}
                        className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-left border transition-colors ${
                          activeVideo?.id === v.id ? 'border-[#F97316] bg-orange-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <span className="w-9 h-9 rounded-full bg-[#0F2A43] text-white flex items-center justify-center shrink-0">
                          <Play className="w-4 h-4" />
                        </span>
                        <span className="text-sm font-semibold text-slate-800 leading-tight">
                          {v.is_preview ? 'Video Tour' : 'Video 360°'}
                          <span className="block text-[11px] font-normal text-slate-500 line-clamp-1">{v.alt_text}</span>
                        </span>
                      </button>
                    ))}
                    {lockedUI && (
                      <Link
                        href={buyHref}
                        className="premium-locked-section flex items-center gap-2.5 rounded-xl px-3.5 py-3 border border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 transition-colors"
                      >
                        <span className="w-9 h-9 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center shrink-0">
                          <Video className="w-4 h-4" />
                        </span>
                        <span className="text-sm font-semibold text-orange-900 leading-tight">
                          +{lockedVideosCount} Video 360°
                          <span className="block text-[11px] font-normal text-orange-700">Terkunci</span>
                        </span>
                      </Link>
                    )}
                  </div>
                </section>
              )}

              <section id="lokasi" aria-labelledby="h-lokasi" className="space-y-3">
                <h2 id="h-lokasi" className="text-xl font-extrabold text-[#0F2A43]">Lokasi</h2>
                <p className="text-sm text-slate-700">
                  <span className="font-bold text-slate-900">Alamat:</span> {kostData.alamat}
                </p>
                {hasGeo && (
                  <>
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10] sm:aspect-[16/8]">
                      <iframe
                        title={`Peta lokasi ${kostData.nama}`}
                        loading="lazy"
                        className="w-full h-full"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${kostData.longitude! - 0.007}%2C${kostData.latitude! - 0.0045}%2C${kostData.longitude! + 0.007}%2C${kostData.latitude! + 0.0045}&layer=mapnik&marker=${kostData.latitude}%2C${kostData.longitude}`}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${kostData.latitude},${kostData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700"
                      >
                        <Route className="w-4 h-4" /> Petunjuk Arah
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${kostData.latitude},${kostData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700"
                      >
                        <Navigation className="w-4 h-4" /> Buka di Google Maps
                      </a>
                    </div>
                  </>
                )}
              </section>

              <section id="tata-tertib" aria-labelledby="h-tata" className="space-y-3">
                <h2 id="h-tata" className="text-xl font-extrabold text-[#0F2A43]">Tata Tertib</h2>
                <ul className="space-y-2.5">
                  {kostData.peraturan.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5 bg-slate-50 rounded-xl px-3.5 py-3 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>

        <ReviewsSection slug={slug} kostName={initialKost.nama} />

        {/* Kost serupa */}
        {similar.length > 0 && (
          <section className="space-y-4" aria-labelledby="similar-title">
            <h2 id="similar-title" className="text-xl font-extrabold text-[#0F2A43]">Kost Serupa</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-3 pt-3 pb-8 overflow-visible" style={{ overflow: 'visible' }}>
              {similar.map((k) => (
                <KostCard key={k.id} kost={k} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bilah aksi bawah (HP & tablet) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 px-4 py-3 flex gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          aria-pressed={comparing}
          onClick={() => {
            if (!compare.toggle(slug)) toast(`Maksimal ${COMPARE_MAX} kost untuk dibandingkan. Hapus salah satu dulu.`, 'error');
            else toast(comparing ? 'Dihapus dari perbandingan' : 'Ditambahkan ke perbandingan', comparing ? 'info' : 'success');
          }}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-colors ${comparing ? 'bg-[#0F2A43] border-[#0F2A43] text-white' : 'bg-white border-[#0F2A43] text-[#0F2A43]'}`}
        >
          <Scale className="w-4 h-4" /> {comparing ? 'Dibandingkan' : 'Bandingkan'}
        </button>
        {isSubscriber ? (
          waState.unlocked ? (
            <a href={ownerChatHref} target="_blank" rel="noopener noreferrer" className="flex-[1.3] inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold">
              <MessageCircle className="w-4 h-4" /> Chat WhatsApp
            </a>
          ) : (
            <button type="button" onClick={handleUnlockWhatsApp} disabled={waState.loading} className="flex-[1.3] inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-400 text-white text-sm font-bold">
              <Unlock className="w-4 h-4" /> {waState.loading ? 'Memuat...' : 'Tanya Pemilik'}
            </button>
          )
        ) : lockedUI ? (
          <Link href={buyHref} className="flex-[1.3] inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold">
            <Sparkles className="w-4 h-4" /> Buka Kontak Rp15.000
          </Link>
        ) : (
          <span className="flex-[1.3] py-3 rounded-xl bg-slate-100 animate-pulse" aria-hidden="true" />
        )}
      </div>

      {lightboxIndex !== null && photos.length > 0 && (
        <PhotoLightbox
          photos={photos}
          index={Math.min(lightboxIndex, photos.length - 1)}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
          title={kostData.nama}
        />
      )}
      <ReportDialog slug={slug} kostName={initialKost.nama} open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
