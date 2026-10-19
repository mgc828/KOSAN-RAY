import React from 'react';
import { Compass } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-[#FFEDD5] border border-[#F97316]/50 flex items-center justify-center shadow-xs">
        <Compass className="w-6 h-6 text-[#C2410C] animate-spin" />
      </div>
      <p className="text-xs font-bold text-slate-500 tracking-tight">Memuat data kost...</p>
    </div>
  );
}

