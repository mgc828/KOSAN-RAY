'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Scale, X, Check, Minus } from 'lucide-react';
import { Kost } from '@/lib/types';
import { useCompare, COMPARE_MAX } from '@/lib/wishlist';
import { FACILITY_CATEGORIES, otherFacilities } from '@/lib/facilities';
import { RatingBadge } from '@/components/StarRating';
import { formatKostLocation } from '@/lib/jakarta-regions';

const TIPE_LABEL: Record<string, string> = { putra: 'Putra', putri: 'Putri', campur: 'Campur' };

function thumbOf(k: Kost) {
  const m = k.media?.find((x) => x.tipe === 'foto_gedung') || k.media?.find((x) => x.is_preview) || k.media?.[0];
  return m?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=70';
}
const detailUrl = (k: Kost) => `/kost/${(k.kota || 'jakarta').toLowerCase()}/${k.area.toLowerCase()}/${k.slug}`;

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
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full min-w-[640px] text-sm border-collapse">
              <thead>
                <tr>
                  <th className="w-40 sm:w-48 p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider align-bottom">Kost</th>
                  {items.map((k) => (
                    <th key={k.id} className="p-4 align-top text-left font-normal">
                      <div className="relative">
                        <button type="button" aria-label={`Hapus ${k.nama}`} onClick={() => compare.remove(k.slug)} className="absolute right-2 top-2 z-10 w-8 h-8 rounded-full bg-white/95 shadow flex items-center justify-center text-slate-500 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumbOf(k)} alt={k.nama} className="w-full aspect-[4/3] object-cover rounded-2xl" referrerPolicy="no-referrer" />
                        <Link href={detailUrl(k)} className="block mt-3 font-bold text-[#0F2A43] hover:text-[#F97316] leading-snug">
                          {k.nama}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <Row label="Harga / bulan">
                  {items.map((k) => (
                    <td key={k.id} className="p-4 align-top">
                      <span className={`font-extrabold ${k.harga === cheapest && items.length > 1 ? 'text-[#16A34A]' : 'text-slate-900'}`} suppressHydrationWarning>
                        Rp {k.harga.toLocaleString('id-ID')}
                      </span>
                      {k.harga === cheapest && items.length > 1 && <span className="ml-2 text-[10px] font-bold text-[#16A34A] bg-green-50 px-2 py-0.5 rounded-full">Termurah</span>}
                    </td>
                  ))}
                </Row>
                <Row label="Rating">
                  {items.map((k) => (
                    <td key={k.id} className="p-4 align-top">
                      {k.rating && k.rating.count > 0 ? <RatingBadge rating={k.rating} /> : <span className="text-xs text-slate-500">Belum ada ulasan</span>}
                    </td>
                  ))}
                </Row>
                <Row label="Area">
                  {items.map((k) => <td key={k.id} className="p-4 align-top text-slate-700">{formatKostLocation(k)}</td>)}
                </Row>
                <Row label="Tipe">
                  {items.map((k) => <td key={k.id} className="p-4 align-top text-slate-700">Kost {TIPE_LABEL[k.tipe] || k.tipe}</td>)}
                </Row>
                <Row label="Status kamar">
                  {items.map((k) => (
                    <td key={k.id} className="p-4 align-top">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${k.status === 'penuh' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-[#16A34A]'}`}>
                        {k.status === 'penuh' ? 'Penuh' : 'Tersedia'}
                      </span>
                    </td>
                  ))}
                </Row>
                {FACILITY_CATEGORIES.map((cat) => (
                  <Row key={cat.label} label={cat.label} small>
                    {items.map((k) => (
                      <td key={k.id} className="p-3 align-top">
                        {k.fasilitas.some(cat.test) ? <Check className="w-4 h-4 text-[#16A34A]" aria-label="Ada" /> : <Minus className="w-4 h-4 text-slate-300" aria-label="Tidak ada" />}
                      </td>
                    ))}
                  </Row>
                ))}
                <Row label="Fasilitas lain">
                  {items.map((k) => {
                    const others = otherFacilities(k.fasilitas);
                    return (
                      <td key={k.id} className="p-4 align-top text-xs text-slate-600">
                        {others.length ? <ul className="list-disc pl-4 space-y-1">{others.map((f) => <li key={f}>{f}</li>)}</ul> : <Minus className="w-4 h-4 text-slate-300" aria-label="Tidak ada" />}
                      </td>
                    );
                  })}
                </Row>
                <Row label="Peraturan">
                  {items.map((k) => (
                    <td key={k.id} className="p-4 align-top text-xs text-slate-600">
                      <ul className="list-disc pl-4 space-y-1">{k.peraturan.map((p) => <li key={p}>{p}</li>)}</ul>
                    </td>
                  ))}
                </Row>
                <Row label="">
                  {items.map((k) => (
                    <td key={k.id} className="p-4">
                      <Link href={detailUrl(k)} className="inline-block text-xs font-bold text-white bg-[#F97316] hover:bg-[#EA580C] px-4 py-2 rounded-full transition-colors">
                        Lihat detail
                      </Link>
                    </td>
                  ))}
                </Row>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, children, small }: { label: string; children: React.ReactNode; small?: boolean }) {
  return (
    <tr>
      <th scope="row" className={`text-left align-top font-semibold text-slate-600 ${small ? 'p-3 text-xs' : 'p-4 text-xs'}`}>{label}</th>
      {children}
    </tr>
  );
}
