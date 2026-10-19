'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

/** Bintang tampilan saja (mendukung setengah bintang lewat pemotongan). */
export function Stars({ value, size = 16, className = '' }: { value: number; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`Rating ${value.toFixed(1)} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }} aria-hidden>
            <Star width={size} height={size} className="absolute inset-0 text-slate-300" fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star width={size} height={size} className="text-[#F59E0B]" fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Ringkasan kecil untuk kartu: ★ 4,6 (12). Tidak ditampilkan kalau belum ada ulasan. */
export function RatingBadge({ rating }: { rating?: { avg: number; count: number } }) {
  if (!rating || rating.count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0F2A43]" title={`${rating.count} ulasan`}>
      <Star width={13} height={13} className="text-[#F59E0B]" fill="currentColor" strokeWidth={0} aria-hidden />
      <span>{rating.avg.toFixed(1).replace('.', ',')}</span>
      <span className="font-medium text-slate-400">({rating.count})</span>
    </span>
  );
}

/** Pilihan bintang untuk formulir. Bisa dipakai dengan keyboard (panah kiri/kanan). */
export function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Beri rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} bintang`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(5, (value || 0) + 1));
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(1, (value || 2) - 1));
          }}
          className="p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
        >
          <Star width={28} height={28} className={n <= shown ? 'text-[#F59E0B]' : 'text-slate-300'} fill="currentColor" strokeWidth={0} />
        </button>
      ))}
    </div>
  );
}
