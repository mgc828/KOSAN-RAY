'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MapPin, RefreshCw, Home, Search } from 'lucide-react';

export default function MapsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Maps render error: ${error.message}`,
        stack: error.stack,
        url: typeof window !== 'undefined' ? window.location.href : '/maps',
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, [error]);

  const handleRetry = () => {
    // Apabila error terjadi karena jaringan terputus/lambat atau chunk gagal dimuat,
    // muat ulang halaman secara penuh untuk mengambil ulang aset yang gagal
    const isNetworkOrChunk =
      typeof window !== 'undefined' &&
      (error?.message?.toLowerCase().includes('network') ||
        error?.message?.toLowerCase().includes('fetch') ||
        error?.name === 'ChunkLoadError' ||
        error?.name === 'TypeError');

    if (isNetworkOrChunk) {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-5 text-[#F97316]">
        <MapPin className="w-8 h-8 animate-bounce" />
      </div>
      <h2 className="text-2xl font-black text-[#0F2A43] mb-2">Gagal Memuat Peta Kost</h2>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        Koneksi internet Anda mungkin sedang lambat atau terputus saat mengambil data peta. Silakan coba muat ulang halaman.
      </p>
      {error.digest && (
        <p className="text-xs font-mono text-slate-400 mb-6 bg-slate-100 px-3 py-1 rounded-md">
          Kode referensi: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Muat Ulang Peta</span>
        </button>
        <Link
          href="/cari-kost"
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Cari Kost (Daftar)</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Beranda</span>
        </Link>
      </div>
    </div>
  );
}

