'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { Kost } from '@/lib/types';
import { useWishlist } from '@/lib/wishlist';
import KostCard from '@/components/KostCard';

export default function WishlistClient({ kosts: all }: { kosts: Kost[] }) {
  const wishlist = useWishlist();

  const saved = all.filter((k) => wishlist.has(k.slug));

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <nav className="text-xs text-slate-500 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Wishlist</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F2A43] tracking-tight">Kost Favorit</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1" suppressHydrationWarning>
              {saved.length > 0 ? `${saved.length} kost tersimpan di browser ini.` : 'Simpan kost yang kamu suka dengan ikon hati.'}
            </p>
          </div>
          {saved.length > 0 && (
            <button
              type="button"
              onClick={() => wishlist.clear()}
              className="inline-flex items-center gap-2 self-start sm:self-auto bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 px-4 py-2 rounded-full text-xs font-bold text-slate-700 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus semua</span>
            </button>
          )}
        </div>

        {saved.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-1.5 pt-2 pb-4">
            {saved.map((k) => (
              <KostCard key={k.id} kost={k} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Heart className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Belum ada kost favorit</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tekan ikon hati di kartu kost untuk menyimpannya di sini. Daftar ini tersimpan di browser kamu.
            </p>
            <Link href="/cari-kost" className="inline-block text-xs font-bold text-white bg-[#F97316] hover:bg-[#EA580C] px-5 py-2.5 rounded-full transition-colors">
              Cari Kost
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
