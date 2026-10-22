'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Render error: ${error.message}`, stack: error.stack, url: window.location.href }),
      keepalive: true,
    }).catch(() => undefined);
  }, [error]);

  const handleRetry = () => {
    const isNetworkOrChunk =
      typeof window !== 'undefined' &&
      (error?.message?.toLowerCase().includes('network') ||
        error?.message?.toLowerCase().includes('fetch') ||
        error?.message?.toLowerCase().includes('loading chunk') ||
        error?.name === 'ChunkLoadError' ||
        error?.name === 'TypeError');

    if (isNetworkOrChunk) {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
      <h1 className="text-3xl font-black text-[#0F2A43]">Ups, ada yang tidak beres</h1>
      <p className="text-sm text-slate-600">Halaman ini gagal ditampilkan. Kami sudah mencatat masalahnya. Coba muat ulang, atau kembali ke beranda.</p>
      {error.digest && <p className="text-[11px] text-slate-400 font-mono">Kode: {error.digest}</p>}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-4 h-4" /> Coba lagi
        </button>
        <Link href="/" className="text-sm font-bold text-[#0F2A43] hover:underline">Ke beranda</Link>
      </div>
    </div>
  );
}
