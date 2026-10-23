import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { SUBSCRIPTION_DAYS, SUBSCRIPTION_PRICE } from '@/lib/config';
import type { AuthShowcase } from '@/lib/auth-showcase';

const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

interface AuthShellProps {
  /** Panel samping untuk desktop: isi menyesuaikan konteks halaman. 'none' = satu kolom (lupa/atur ulang sandi). */
  side: 'masuk' | 'daftar' | 'none';
  showcase?: AuthShowcase | null;
  children: React.ReactNode;
}

/** Kerangka halaman akun: formulir di kiri, foto & angka nyata dari database di kanan (desktop). Tanpa header/footer situs. */
export default function AuthShell({ side, showcase, children }: AuthShellProps) {
  const hasSide = side !== 'none';
  return (
    <div className={`min-h-screen bg-white ${hasSide ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]' : ''}`}>
      <div className="flex min-h-screen flex-col px-5 sm:px-8 lg:px-12 xl:px-20 py-5 sm:py-7">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="kost-kostan, ke beranda">
            <BrandLogo variant="horizontal" className="h-9 sm:h-10" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Beranda
          </Link>
        </header>

        <main className="flex flex-1 items-center">
          <div className="w-full max-w-[420px] mx-auto py-8 sm:py-10">
            {children}
            {hasSide && showcase && <MobileStats showcase={showcase} />}
          </div>
        </main>

        <footer className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} kost-kostan</span>
          <Link href="/syarat-ketentuan" className="hover:text-slate-900">Syarat & Ketentuan</Link>
          <Link href="/kebijakan-privasi" className="hover:text-slate-900">Kebijakan Privasi</Link>
          <Link href="/kontak" className="hover:text-slate-900">Bantuan</Link>
        </footer>
      </div>

      {hasSide && <SidePanel side={side} showcase={showcase ?? null} />}
    </div>
  );
}

function statItems(showcase: AuthShowcase) {
  return [
    showcase.kostCount > 0 ? { value: showcase.kostCount.toLocaleString('id-ID'), label: 'kost terverifikasi' } : null,
    showcase.areaCount > 0 ? { value: showcase.areaCount.toLocaleString('id-ID'), label: 'kecamatan di Jakarta' } : null,
    showcase.minPrice ? { value: rp(showcase.minPrice), label: 'harga mulai / bulan' } : null,
  ].filter((x): x is { value: string; label: string } => x !== null);
}

/** Ringkasan angka untuk layar kecil (panel samping disembunyikan di HP). */
function MobileStats({ showcase }: { showcase: AuthShowcase }) {
  const items = statItems(showcase);
  if (items.length === 0) return null;
  return (
    <dl className="lg:hidden mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 gap-3 text-center">
      {items.map((s) => (
        <div key={s.label}>
          <dd className="text-base font-bold text-[#0F2A43] tabular-nums">{s.value}</dd>
          <dt className="text-[11px] leading-tight text-slate-500 mt-0.5">{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}

function SidePanel({ side, showcase }: { side: 'masuk' | 'daftar'; showcase: AuthShowcase | null }) {
  const photo = showcase?.photos[0];
  const items = showcase ? statItems(showcase) : [];

  return (
    <aside className="hidden lg:flex relative flex-col justify-end overflow-hidden bg-[#0F2A43] text-white" aria-label="Tentang kost-kostan">
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt="" className="absolute inset-0 h-full w-full object-cover" referrerPolicy="no-referrer" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A43] via-[#0F2A43]/70 to-[#0F2A43]/10" aria-hidden />

      {photo && (
        <div className="absolute top-8 right-8 max-w-[260px] rounded-xl bg-white/95 text-slate-900 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold leading-snug line-clamp-2">{photo.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{photo.place}</p>
          <p className="text-sm font-bold text-[#C2410C] mt-1.5 tabular-nums">{rp(photo.price)}<span className="text-xs font-medium text-slate-500"> / bulan</span></p>
        </div>
      )}

      <div className="relative px-12 xl:px-16 pb-12 space-y-8">
        {side === 'masuk' ? (
          <div className="space-y-4 max-w-md">
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">Lanjutkan cari kost yang cocok.</h2>
            <ul className="space-y-2.5 text-[15px] text-slate-200">
              {['Wishlist dan daftar bandingmu tetap ada', 'Riwayat pembayaran dan invoice tersimpan', `Nomor pemilik terbuka selama masa aktif ${SUBSCRIPTION_DAYS} hari`].map((t) => (
                <li key={t} className="flex gap-2.5"><Check className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />{t}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-5 max-w-md">
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">Lihat dulu semuanya, bayar kalau sudah yakin.</h2>
            <ol className="space-y-3.5 text-[15px]">
              {[
                ['Buat akun', 'Gratis. Lihat 3 foto, 1 video, dan info lengkap tiap kost.'],
                ['Buka akses', `${rp(SUBSCRIPTION_PRICE)} untuk ${SUBSCRIPTION_DAYS} hari lewat QRIS. Tanpa komisi.`],
                ['Hubungi pemilik', 'Nomor WhatsApp pemilik langsung terbuka untuk semua kost.'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-[#F97316] text-white text-sm font-bold flex items-center justify-center shrink-0 tabular-nums">{i + 1}</span>
                  <span><span className="block font-semibold">{t}</span><span className="block text-slate-300 text-sm">{d}</span></span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {items.length > 0 && (
          <dl className="grid grid-cols-3 gap-6 pt-6 border-t border-white/15 max-w-lg">
            {items.map((s) => (
              <div key={s.label}>
                <dd className="text-xl font-bold tabular-nums">{s.value}</dd>
                <dt className="text-xs text-slate-300 mt-0.5">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </div>
    </aside>
  );
}
