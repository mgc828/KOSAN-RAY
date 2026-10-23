import React from 'react';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50/50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 text-center border border-slate-200/80 shadow-sm space-y-5">
        <BrandLogo variant="mark" className="h-20 mx-auto" />
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900">Halaman Tidak Ditemukan</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Kost atau halaman yang kamu cari mungkin sudah berpindah atau tidak tersedia.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-slate-950 px-5 py-3 rounded-full text-xs font-black transition-all shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link
            href="/cari-kost"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-3 rounded-full text-xs font-bold transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Cari Kost Lain</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

