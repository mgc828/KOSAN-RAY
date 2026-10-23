'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Scale, X, Check, Minus } from 'lucide-react';
import { Kost } from '@/lib/types';
import { useCompare, COMPARE_MAX } from '@/lib/wishlist';
import { FACILITY_CATEGORIES, otherFacilities } from '@/lib/facilities';
import { RatingBadge } from '@/components/StarRating';
import { formatKostLocation } from '@/lib/jakarta-regions';

const TIPE_LABEL: Record<string, string> = { putra: 'Putra', putri: 'Putri', campur: 'Campur' };

// Lebar kolom label & kolom kost di HP (px). Tabel menggulir ke samping bila kost lebih dari yang muat di layar.
const LABEL_W = 88;
const COL_W = 148;

function thumbOf(k: Kost) {
  const m = k.media?.find((x) => x.tipe === 'foto_gedung') || k.media?.find((x) => x.is_preview) || k.media?.[0];
  return m?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=70';
}
const detailUrl = (k: Kost) => `/kost/${(k.kota || 'jakarta').toLowerCase()}/${k.area.toLowerCase()}/${k.slug}`;

// Garis pemisah halus antar kolom kost
const DIVIDER = 'border-l border-slate-200/70';

export default function BandingkanClient({ kosts: all }: { kosts: Kost[] }) {
  const compare = useCompare();

  const items = useMemo(
    () => compare.ids.map((id) => all.find((k) => k.slug === id)).filter((k): k is Kost => !!k),
    [compare.ids, all]
  );
  const cheapest = items.length ? Math.min(...items.map((k) => k.harga)) : 0;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <nav className="text-xs text-slate-500 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Bandingkan</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F2A43] tracking-tight">Bandingkan Kost</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Pilih sampai {COMPARE_MAX} kost lewat ikon timbangan di kartu kost.</p>
          </div>
          {items.length > 0 && (
            <button type="button" onClick={() => compare.clear()} className="self-start sm:self-auto bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 px-4 py-2 rounded-full text-xs font-bold text-slate-700 transition-all">
              Kosongkan
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Scale className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Belum ada kost yang dibandingkan</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Tekan ikon timbangan di kartu kost untuk menambahkannya ke sini.</p>
            <Link href="/cari-kost" className="inline-block text-xs font-bold text-white bg-[#F97316] hover:bg-[#EA580C] px-5 py-2.5 rounded-full transition-colors">
              Cari Kost
            </Link>
          </div>
        ) : (
          <>
            {items.length > 2 && (
              <p className="sm:hidden text-[11px] text-slate-500 -mt-2 flex items-center gap-1.5">
                <span aria-hidden="true">↔</span> Geser ke samping untuk melihat kost lainnya
              </p>
            )}
            {/* HP: tabel selebar layar (tanpa tepi) dengan kolom label menempel di kiri saat digeser */}
            <div className="-mx-4 sm:mx-0 overflow-x-auto overscroll-x-contain snap-x snap-proximity scroll-pl-[88px] sm:scroll-pl-0 border-y sm:border border-slate-200 bg-white shadow-xs sm:rounded-3xl">
              <table
                className="w-full table-fixed min-w-[var(--cmp-min)] sm:min-w-[640px] text-[13px] sm:text-sm border-separate border-spacing-0"
                style={{ ['--cmp-min' as string]: `${LABEL_W + items.length * COL_W}px` }}
              >
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 bg-white w-[88px] min-w-[88px] sm:w-48 p-2.5 sm:p-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider align-bottom border-b border-slate-100 shadow-[1px_0_0_0_rgb(226_232_240_/_0.7)]">
                      Kost
                    </th>
                    {items.map((k, i) => (
                      <th key={k.id} className={`min-w-[148px] sm:min-w-0 snap-start p-2.5 sm:p-4 align-top text-left font-normal border-b border-slate-100 ${DIVIDER}`}>
                        <div className="relative">
                          <span className="sm:hidden absolute left-1.5 top-1.5 z-10 rounded-full bg-[#0F2A43]/90 px-2 py-0.5 text-[10px] font-bold text-white">Kost {i + 1}</span>
                          <button type="button" aria-label={`Hapus ${k.nama}`} onClick={() => compare.remove(k.slug)} className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 shadow flex items-center justify-center text-slate-500 hover:text-red-600">
                            <X className="w-4 h-4" />
                          </button>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={thumbOf(k)} alt={k.nama} className="w-full aspect-[4/3] object-cover rounded-xl sm:rounded-2xl" referrerPolicy="no-referrer" />
                          <Link href={detailUrl(k)} className="block mt-2 sm:mt-3 font-bold text-[13px] sm:text-base text-[#0F2A43] hover:text-[#F97316] leading-snug line-clamp-2 sm:line-clamp-none">
                            {k.nama}
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <Section title="Ringkasan" items={items} />
                  <Row label="Harga / bulan">
                    {items.map((k) => {
                      const best = k.harga === cheapest && items.length > 1;
                      return (
                        <Cell key={k.id}>
                          <span className={`block sm:inline font-extrabold ${best ? 'text-[#16A34A]' : 'text-slate-900'}`} suppressHydrationWarning>
                            Rp {k.harga.toLocaleString('id-ID')}
                          </span>
                          {best && <span className="inline-block mt-1 sm:mt-0 sm:ml-2 text-[10px] font-bold text-[#16A34A] bg-green-50 px-2 py-0.5 rounded-full">Termurah</span>}
                        </Cell>
                      );
                    })}
                  </Row>
                  <Row label="Rating">
                    {items.map((k) => (
                      <Cell key={k.id}>
                        {k.rating && k.rating.count > 0 ? <RatingBadge rating={k.rating} /> : <span className="text-xs text-slate-500">Belum ada ulasan</span>}
                      </Cell>
                    ))}
                  </Row>
                  <Row label="Area">
                    {items.map((k) => <Cell key={k.id} className="text-slate-700">{formatKostLocation(k)}</Cell>)}
                  </Row>
                  <Row label="Tipe">
                    {items.map((k) => <Cell key={k.id} className="text-slate-700">Kost {TIPE_LABEL[k.tipe] || k.tipe}</Cell>)}
                  </Row>
                  <Row label="Status kamar">
                    {items.map((k) => (
                      <Cell key={k.id}>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${k.status === 'penuh' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-[#16A34A]'}`}>
                          {k.status === 'penuh' ? 'Penuh' : 'Tersedia'}
                        </span>
                      </Cell>
                    ))}
                  </Row>

                  <Section title="Fasilitas" items={items} />
                  {FACILITY_CATEGORIES.map((cat) => (
                    <Row key={cat.label} label={cat.label} small>
                      {items.map((k) => (
                        <Cell key={k.id} compact>
                          <span className="flex justify-center sm:justify-start">
                            {k.fasilitas.some(cat.test) ? <Check className="w-4 h-4 text-[#16A34A]" aria-label="Ada" /> : <Minus className="w-4 h-4 text-slate-300" aria-label="Tidak ada" />}
                          </span>
                        </Cell>
                      ))}
                    </Row>
                  ))}
                  <Row label="Fasilitas lain">
                    {items.map((k) => {
                      const others = otherFacilities(k.fasilitas);
                      return (
                        <Cell key={k.id} className="text-xs text-slate-600">
                          {others.length ? <ul className="list-disc pl-4 space-y-1">{others.map((f) => <li key={f}>{f}</li>)}</ul> : <Minus className="w-4 h-4 text-slate-300" aria-label="Tidak ada" />}
                        </Cell>
                      );
                    })}
                  </Row>

                  <Section title="Peraturan" items={items} />
                  <Row label="Peraturan">
                    {items.map((k) => (
                      <Cell key={k.id} className="text-xs text-slate-600">
                        <ul className="list-disc pl-4 space-y-1">{k.peraturan.map((p) => <li key={p}>{p}</li>)}</ul>
                      </Cell>
                    ))}
                  </Row>
                  <Row label="" last>
                    {items.map((k) => (
                      <Cell key={k.id} last>
                        <Link href={detailUrl(k)} className="block sm:inline-block text-center text-xs font-bold text-white bg-[#F97316] hover:bg-[#EA580C] px-3 sm:px-4 py-2 rounded-full transition-colors">
                          Lihat detail
                        </Link>
                      </Cell>
                    ))}
                  </Row>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Pita judul bagian; di HP tiap kolom diberi label "Kost N" agar tidak tertukar saat tabel panjang. */
function Section({ title, items }: { title: string; items: Kost[] }) {
  return (
    <tr>
      <th scope="colgroup" className="sticky left-0 z-10 bg-slate-50 p-2.5 sm:p-3 text-left text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-[#0F2A43] border-b border-slate-100 shadow-[1px_0_0_0_rgb(226_232_240_/_0.7)]">
        {title}
      </th>
      {items.map((k, i) => (
        <td key={k.id} className={`bg-slate-50 p-2.5 sm:p-3 border-b border-slate-100 ${DIVIDER}`}>
          <span className="sm:hidden text-[10px] font-bold uppercase tracking-wide text-slate-400">Kost {i + 1}</span>
        </td>
      ))}
    </tr>
  );
}

function Row({ label, children, small, last }: { label: string; children: React.ReactNode; small?: boolean; last?: boolean }) {
  return (
    <tr>
      <th
        scope="row"
        className={`sticky left-0 z-10 bg-white text-left align-top font-semibold text-slate-600 shadow-[1px_0_0_0_rgb(226_232_240_/_0.7)] ${last ? '' : 'border-b border-slate-100'} ${small ? 'p-2.5 sm:p-3 text-[11px] sm:text-xs' : 'p-2.5 sm:p-4 text-[11px] sm:text-xs'}`}
      >
        {label}
      </th>
      {children}
    </tr>
  );
}

function Cell({ children, className = '', compact, last }: { children: React.ReactNode; className?: string; compact?: boolean; last?: boolean }) {
  return (
    <td className={`align-top ${compact ? 'p-2.5 sm:p-3' : 'p-2.5 sm:p-4'} ${last ? '' : 'border-b border-slate-100'} ${DIVIDER} ${className}`}>{children}</td>
  );
}
