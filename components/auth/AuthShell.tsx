import React from 'react';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { SUBSCRIPTION_DAYS, SUBSCRIPTION_PRICE } from '@/lib/config';

const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

/** Gradien yang sama dengan blok ajakan di beranda. */
const BRAND_GRADIENT = 'bg-[linear-gradient(135deg,#F97316_0%,#EA580C_100%)]';

interface AuthShellProps {
  /** masuk/daftar: dua kolom di desktop + header berwarna di HP. 'none' = satu kolom sederhana (lupa/atur ulang sandi). */
  side: 'masuk' | 'daftar' | 'none';
  children: React.ReactNode;
}

const MOBILE = {
  masuk: { title: 'Masuk', subtitle: 'Selamat datang kembali. Lanjutkan cari kost impianmu.', mascot: '/maskot-masuk.svg', switchText: 'Belum punya akun?', switchCta: 'Daftar', switchHref: '/daftar' },
  daftar: { title: 'Buat akun gratis', subtitle: 'Lihat dulu semuanya, bayar kalau sudah yakin.', mascot: '/maskot-daftar.svg', switchText: 'Sudah punya akun?', switchCta: 'Masuk', switchHref: '/masuk' },
} as const;

/**
 * Kerangka halaman akun. HP: header gradien beranda + maskot, formulir di kartu putih yang naik menimpa header.
 * Desktop: formulir di kiri, panel gradien beranda + maskot di kanan. Tanpa header/footer situs.
 */
export default function AuthShell({ side, children }: AuthShellProps) {
  if (side === 'none') return <PlainShell>{children}</PlainShell>;
  const m = MOBILE[side];

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Kolom formulir (satu kali dirender; hanya hiasan di sekitarnya yang berbeda antara HP dan desktop) */}
      <div className="flex min-h-screen flex-col lg:px-12 xl:px-20 lg:py-7">
        {/* HP: header berwarna */}
        <header className={`${BRAND_GRADIENT} lg:hidden relative overflow-hidden px-5 pt-4 pb-24 text-[#0F2A43]`}>
          <div className="flex items-center justify-between">
            <Link href="/" aria-label="Tutup, kembali ke beranda" className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#0F2A43] shadow-sm">
              <X className="w-5 h-5" />
            </Link>
            <Link href={m.switchHref} className="rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#0F2A43] shadow-sm">
              {m.switchText} <span className="font-bold underline">{m.switchCta}</span>
            </Link>
          </div>
          <div className="relative mt-5 pr-28">
            <BrandLogo variant="horizontal" light className="h-7 mb-4" />
            <h2 className="text-[28px] leading-tight font-extrabold text-white">{m.title}</h2>
            <p className="mt-1.5 text-[15px] leading-snug font-medium text-[#0F2A43]">{m.subtitle}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.mascot} alt="" aria-hidden className="absolute right-1 bottom-9 w-[148px] h-auto drop-shadow-[0_10px_18px_rgba(15,42,67,0.28)]" />
        </header>

        {/* Desktop: bilah atas */}
        <header className="hidden lg:flex items-center justify-between">
          <Link href="/" aria-label="kost-kostan, ke beranda"><BrandLogo variant="horizontal" className="h-10" /></Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Beranda
          </Link>
        </header>

        <main className="relative flex-1 -mt-10 lg:mt-0 rounded-t-[28px] lg:rounded-none bg-white px-5 lg:px-0 pt-7 pb-8 lg:py-10 shadow-[0_-8px_24px_rgba(15,42,67,0.10)] lg:shadow-none lg:flex lg:items-center">
          <div className="w-full max-w-[420px] mx-auto">
            {children}
            <div className="lg:hidden mt-8 flex items-center gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/maskot-kost.svg" alt="" aria-hidden className="w-14 h-14 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#0F2A43]">{m.switchText}</p>
                <p className="text-xs text-slate-600">{side === 'masuk' ? 'Gratis, cuma butuh satu menit.' : 'Masuk untuk lanjut ke profil dan aksesmu.'}</p>
              </div>
              <Link href={m.switchHref} className="shrink-0 h-10 px-4 rounded-xl border border-[#F97316] text-[#C2410C] text-sm font-bold inline-flex items-center hover:bg-orange-100 transition-colors">
                {m.switchCta}
              </Link>
            </div>
            <LegalLinks className="lg:hidden mt-6 justify-center" />
          </div>
        </main>

        <LegalLinks className="hidden lg:flex" showYear />
      </div>

      {/* ===== Desktop: panel gradien ===== */}
      <aside className={`hidden lg:flex ${BRAND_GRADIENT} relative flex-col items-center justify-center overflow-hidden px-12 xl:px-20 text-[#0F2A43]`} aria-label="Ajakan">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={m.mascot} alt="" aria-hidden className={`h-auto drop-shadow-[0_16px_28px_rgba(15,42,67,0.28)] ${side === 'masuk' ? 'w-[min(440px,78%)]' : 'w-[min(320px,60%)]'}`} />
        {side === 'daftar' && (
          <div className="mt-6 w-full max-w-md space-y-5">
            <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">Lihat dulu semuanya, bayar kalau sudah yakin.</h2>
            <ol className="space-y-3.5 text-[15px]">
              {[
                ['Buat akun', 'Gratis. Lihat 3 foto, 1 video, dan info lengkap tiap kost.'],
                ['Buka akses', `${rp(SUBSCRIPTION_PRICE)} untuk ${SUBSCRIPTION_DAYS} hari lewat QRIS. Tanpa komisi.`],
                ['Hubungi pemilik', 'Nomor WhatsApp pemilik langsung terbuka untuk semua kost.'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-[#0F2A43] text-white text-sm font-bold flex items-center justify-center shrink-0 tabular-nums">{i + 1}</span>
                  <span><span className="block font-bold">{t}</span><span className="block text-sm font-medium text-[#0F2A43]/85">{d}</span></span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </aside>
    </div>
  );
}

function LegalLinks({ className = '', showYear }: { className?: string; showYear?: boolean }) {
  return (
    <footer className={`flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 ${className}`}>
      {showYear && <span>© {new Date().getFullYear()} kost-kostan</span>}
      <Link href="/syarat-ketentuan" className="hover:text-slate-900">Syarat & Ketentuan</Link>
      <Link href="/kebijakan-privasi" className="hover:text-slate-900">Kebijakan Privasi</Link>
      <Link href="/kontak" className="hover:text-slate-900">Bantuan</Link>
    </footer>
  );
}

/** Satu kolom untuk halaman sederhana (lupa / atur ulang sandi). */
function PlainShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col px-5 sm:px-8 py-5 sm:py-7">
      <header className="flex items-center justify-between">
        <Link href="/" aria-label="kost-kostan, ke beranda"><BrandLogo variant="horizontal" className="h-9 sm:h-10" /></Link>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Beranda
        </Link>
      </header>
      <main className="flex flex-1 items-center">
        <div className="w-full max-w-[420px] mx-auto py-8 sm:py-10">{children}</div>
      </main>
      <LegalLinks showYear />
    </div>
  );
}
