import React from 'react';

type Variant = 'horizontal' | 'mark' | 'stacked';

interface BrandLogoProps {
  /** horizontal: rumah + tulisan sejajar (header); mark: rumah saja (ikon); stacked: rumah di atas tulisan. */
  variant?: Variant;
  /** Pakai versi terang (putih) untuk latar gelap. */
  light?: boolean;
  className?: string;
  alt?: string;
}

// Ukuran asli berkas (lebar x tinggi) agar tata letak tidak bergeser saat gambar dimuat
const SIZES: Record<Variant, { src: string; w: number; h: number }> = {
  horizontal: { src: 'logo-horizontal', w: 825, h: 160 },
  mark: { src: 'logo-mark', w: 512, h: 448 },
  stacked: { src: 'logo-kost-kostan', w: 720, h: 504 },
};

/** Logo Kost-Kostan. Atur tinggi lewat className (mis. "h-10"); lebar mengikuti. */
export default function BrandLogo({ variant = 'horizontal', light = false, className = 'h-10', alt = 'Kost-Kostan' }: BrandLogoProps) {
  const s = SIZES[variant];
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/${s.src}${light ? '-light' : ''}.png`} width={s.w} height={s.h} alt={alt} className={`w-auto ${className}`} decoding="async" />;
}
