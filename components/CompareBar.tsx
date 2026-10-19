'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, X } from 'lucide-react';
import { useCompare } from '@/lib/wishlist';

/** Bar kecil di bawah layar saat ada kost yang dipilih untuk dibandingkan. */
export default function CompareBar() {
  const compare = useCompare();
  const pathname = usePathname();

  // Di halaman detail kost (HP/tablet) ada bilah aksi di bawah layar: naikkan bar ini supaya tidak menumpuk.
  const onDetail = /^\/kost\/[^/]+\/[^/]+\/[^/]+/.test(pathname);

  if (compare.count === 0 || pathname.startsWith('/bandingkan') || pathname.startsWith('/admin')) return null;

  return (
    <div className={`fixed left-1/2 -translate-x-1/2 ${onDetail ? 'bottom-[88px] lg:bottom-5' : 'bottom-5'} z-40 flex items-center gap-3 rounded-full bg-[#0F2A43] text-white pl-4 pr-2 py-2 shadow-xl`} suppressHydrationWarning>
      <Scale className="w-4 h-4 text-[#F97316]" />
      <span className="text-sm font-semibold whitespace-nowrap">{compare.count} kost dipilih</span>
      <Link
        href="/bandingkan"
        className="rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold px-4 py-2 transition-colors whitespace-nowrap"
      >
        Bandingkan
      </Link>
      <button type="button" aria-label="Kosongkan perbandingan" onClick={() => compare.clear()} className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
