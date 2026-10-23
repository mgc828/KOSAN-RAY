import React from 'react';
import BrandLogo from '@/components/BrandLogo';

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
      <BrandLogo variant="mark" className="h-14 animate-pulse" />
      <p className="text-xs font-bold text-slate-500 tracking-tight">Memuat data kost...</p>
    </div>
  );
}

