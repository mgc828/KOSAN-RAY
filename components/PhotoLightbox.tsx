'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxPhoto {
  id: string;
  url: string;
  alt: string;
}

interface Props {
  photos: LightboxPhoto[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  title?: string;
}

/**
 * Pop-up foto layar penuh: geser kiri/kanan (trackpad, sentuh, panah di layar, atau panah keyboard),
 * Esc / klik area gelap untuk menutup. Hanya menampilkan foto yang boleh dilihat pengguna.
 */
export default function PhotoLightbox({ photos, index, onIndexChange, onClose, title }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const programmatic = useRef(false);
  const last = photos.length - 1;

  const scrollToIndex = useCallback((i: number, smooth: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    programmatic.current = true;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
    window.setTimeout(() => {
      programmatic.current = false;
    }, smooth ? 450 : 0);
  }, []);

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(i, last));
      onIndexChange(next);
      scrollToIndex(next, true);
    },
    [last, onIndexChange, scrollToIndex]
  );

  // Buka tepat di foto yang diklik
  useEffect(() => {
    scrollToIndex(index, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kunci gulir halaman, kembalikan fokus saat ditutup
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') go(index - 1);
      else if (e.key === 'Tab') {
        // Fokus tetap di dalam dialog
        const focusables = Array.from(document.querySelectorAll<HTMLElement>('[data-lightbox] button:not([disabled])'));
        if (!focusables.length) return;
        const first = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index, onClose]);

  // Geser manual (trackpad / sentuh): perbarui nomor foto sesuai posisi
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (programmatic.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(el.scrollLeft / el.clientWidth);
        if (i !== index && i >= 0 && i <= last) onIndexChange(i);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
    };
  }, [index, last, onIndexChange]);

  // Ukuran jendela berubah: jaga foto aktif tetap di tengah
  useEffect(() => {
    const onResize = () => scrollToIndex(index, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [index, scrollToIndex]);

  // Thumbnail aktif selalu terlihat
  useEffect(() => {
    const t = thumbsRef.current?.querySelector<HTMLElement>(`[data-i="${index}"]`);
    t?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);

  const current = photos[index];

  return (
    <div
      data-lightbox
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Foto ${title}` : 'Galeri foto'}
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex flex-col"
    >
      {/* Bar atas */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 text-white">
        <p className="text-sm font-semibold tabular-nums" aria-live="polite">
          {index + 1} / {photos.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Tutup galeri foto"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Area foto: geser horizontal dengan snap */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={trackRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Foto kost, geser kiri atau kanan"
          className="h-full flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
        >
          {photos.map((p, i) => (
            <div
              key={p.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} dari ${photos.length}`}
              className="relative flex-none w-full h-full snap-center snap-always"
              onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
              }}
            >
              <Image
                src={p.url}
                alt={p.alt}
                fill
                sizes="100vw"
                priority={Math.abs(i - index) <= 1}
                className="object-contain select-none pointer-events-none px-2 sm:px-16"
                referrerPolicy="no-referrer"
                draggable={false}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Foto sebelumnya"
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === last}
          aria-label="Foto berikutnya"
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Keterangan + thumbnail */}
      <div className="px-4 sm:px-6 pt-3 pb-4 space-y-3">
        <p className="text-center text-sm text-white/90 min-h-[1.25rem]">{current?.alt}</p>
        <div
          ref={thumbsRef}
          className="flex gap-2 overflow-x-auto justify-start sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Pilih foto"
        >
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              data-i={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Foto ${i + 1}`}
              onClick={() => go(i)}
              className={`relative flex-none w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === index ? 'border-[#F97316] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={p.url} alt="" fill sizes="80px" className="object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
