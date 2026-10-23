'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import BrandLogo from '@/components/BrandLogo';
import { ShieldCheck, User, LogOut, Menu, X, Sparkles, Compass, Heart, Bell } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist';

export default function Navbar() {
  const { user, subscription, logout, unreadNotifications } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const wishlist = useWishlist();
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  // Warna tulisan tiap item header (logo, tiap tab, Masuk) mengikuti apa yang ada tepat di bawahnya.
  const [dark, setDark] = useState<Record<string, boolean>>({});
  // Halaman dengan panel yang menempel (Cari Kost, Maps): header dibuat putih solid, bukan transparan/buram,
  // supaya isi yang bergulir di belakangnya tidak tampak samar.
  const solid = pathname.startsWith('/cari-kost') || pathname.startsWith('/maps');
  const dk = (key: string) => !solid && !!dark[key];
  // Paling atas halaman: header benar-benar transparan (tanpa buram); buram muncul setelah di-scroll
  const [atTop, setAtTop] = useState(true);
  // Latar kaca buram mengikuti mayoritas item: dominan gelap -> tint gelap, selain itu tint putih
  const darkVals = Object.values(dark);
  const headerDark = !solid && darkVals.length > 0 && darkVals.filter(Boolean).length > darkVals.length / 2;

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }

      if (event.key === 'Tab') {
        const focusable = mobileMenuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    mobileMenuRef.current?.querySelector<HTMLElement>('button')?.focus();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      menuTriggerRef.current?.focus();
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const raf = requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [pathname]);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const hero = document.getElementById('hero-header');
      if (hero) {
        hero.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        const h = document.getElementById('hero-header');
        if (h) {
          h.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      });
    }
  };

  // Swipe down gesture to close mobile navigation sheet
  const touchStartY = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!mobileMenuOpen && mobileMenuRef.current) {
      mobileMenuRef.current.style.transform = '';
      mobileMenuRef.current.style.transition = '';
    }
  }, [mobileMenuOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const sheet = mobileMenuRef.current;
    if (!sheet) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    // Only drag down when swiping downwards and sheet scroll position is at the top
    if (diff > 0 && sheet.scrollTop <= 0) {
      isDraggingRef.current = true;
      sheet.style.transition = 'none';
      sheet.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const sheet = mobileMenuRef.current;
    if (!sheet) return;

    if (isDraggingRef.current) {
      const endY = e.changedTouches[0].clientY;
      const diff = endY - touchStartY.current;

      sheet.style.transition = 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)';
      if (diff > 75) {
        // Swiped down sufficiently -> animate closed
        sheet.style.transform = 'translateY(100%)';
        setTimeout(() => {
          setMobileMenuOpen(false);
          if (sheet) {
            sheet.style.transform = '';
            sheet.style.transition = '';
          }
        }, 200);
      } else {
        // Snap back up
        sheet.style.transform = 'translateY(0)';
        setTimeout(() => {
          if (sheet) {
            sheet.style.transform = '';
            sheet.style.transition = '';
          }
        }, 250);
      }
      isDraggingRef.current = false;
    }
  };

  // Header transparan penuh. Untuk tiap titik di bawah header, cari latar yang terlihat
  // (warna solid, gradien, atau foto) lalu hitung kecerahannya: gelap -> tulisan putih, terang -> hitam.
  useEffect(() => {
    // Kecerahan relatif (WCAG) dari string warna CSS. Mengembalikan null kalau tidak terbaca / transparan.
    const parse = (str: string): { lum: number; a: number } | null => {
      const m = str.match(/^(rgba?|oklab|oklch|color)\(([^)]*)\)/i);
      if (!m) return null;
      const kind = m[1].toLowerCase();
      const body = m[2].trim();
      const [main, alphaStr] = body.split('/');
      const parts = main.replace(/,/g, ' ').trim().split(/\s+/);
      const alpha = alphaStr !== undefined ? parseFloat(alphaStr) : kind === 'rgba' && parts.length > 3 ? parseFloat(parts[3]) : 1;
      const a = Number.isNaN(alpha) ? 1 : alphaStr?.includes('%') ? alpha / 100 : alpha;
      const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
      if (kind === 'rgb' || kind === 'rgba') {
        const [r, g, bl] = parts.slice(0, 3).map(parseFloat);
        return { lum: 0.2126 * lin(r / 255) + 0.7152 * lin(g / 255) + 0.0722 * lin(bl / 255), a };
      }
      if (kind === 'color') {
        // color(srgb r g b)
        const nums = parts.filter((x) => !Number.isNaN(parseFloat(x))).map(parseFloat);
        if (nums.length < 3) return null;
        return { lum: 0.2126 * lin(nums[0]) + 0.7152 * lin(nums[1]) + 0.0722 * lin(nums[2]), a };
      }
      // oklab / oklch: L (0..1) -> kecerahan relatif ~ L^3
      let L = parseFloat(parts[0]);
      if (parts[0].includes('%')) L /= 100;
      return { lum: Math.pow(L, 3), a };
    };


    // --- Membaca kecerahan foto yang ada di bawah header (via canvas) ---
    const imgCache = new Map<string, HTMLCanvasElement | 'pending' | 'fail'>();
    const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    let redetect: () => void = () => {};
    const loadImg = (src: string) => {
      imgCache.set(src, 'pending');
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => {
        try {
          const sc = Math.min(1, 240 / im.naturalWidth);
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(im.naturalWidth * sc));
          c.height = Math.max(1, Math.round(im.naturalHeight * sc));
          c.getContext('2d', { willReadFrequently: true })!.drawImage(im, 0, 0, c.width, c.height);
          c.getContext('2d')!.getImageData(0, 0, 1, 1); // gagal jika canvas "tainted"
          imgCache.set(src, c);
          redetect();
        } catch {
          imgCache.set(src, 'fail');
        }
      };
      im.onerror = () => imgCache.set(src, 'fail');
      im.src = src;
    };
    // Rata-rata kecerahan area sekitar titik (cx, cy) pada foto <img>; null jika belum/tidak bisa dibaca.
    const imageLum = (img: HTMLImageElement, cx: number, cy: number): number | null => {
      const src = img.currentSrc || img.src;
      if (!src) return null;
      const c = imgCache.get(src);
      if (!c) {
        loadImg(src);
        return null;
      }
      if (c === 'pending' || c === 'fail') return null;
      const r = img.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      const cover = getComputedStyle(img).objectFit === 'cover';
      const sxScale = cover ? Math.max(r.width / c.width, r.height / c.height) : r.width / c.width;
      const syScale = cover ? sxScale : r.height / c.height;
      const ox = cover ? (c.width * sxScale - r.width) / 2 : 0;
      const oy = cover ? (c.height * syScale - r.height) / 2 : 0;
      const px = (cx - r.left + ox) / sxScale;
      const py = (cy - r.top + oy) / syScale;
      const hw = Math.max(2, 45 / sxScale);
      const hh = Math.max(2, 14 / syScale);
      const x0 = Math.max(0, Math.floor(px - hw));
      const y0 = Math.max(0, Math.floor(py - hh));
      const x1 = Math.min(c.width, Math.ceil(px + hw));
      const y1 = Math.min(c.height, Math.ceil(py + hh));
      if (x1 <= x0 || y1 <= y0) return null;
      const d = c.getContext('2d')!.getImageData(x0, y0, x1 - x0, y1 - y0).data;
      let t = 0;
      for (let i = 0; i < d.length; i += 4) {
        t += 0.2126 * lin(d[i] / 255) + 0.7152 * lin(d[i + 1] / 255) + 0.0722 * lin(d[i + 2] / 255);
      }
      return t / (d.length / 4);
    };

    const lumAt = (x: number, y: number, header: HTMLElement): number => {
      const stack = document.elementsFromPoint(x, y).filter((el) => !header.contains(el));
      for (const el of stack) {
        let n: Element | null = el;
        while (n && n !== document.documentElement) {
          const forced = n.getAttribute('data-header-theme');
          if (forced) return forced === 'dark' ? 0.02 : 0.9;
          if (n instanceof HTMLImageElement) {
            const l = imageLum(n, x, y);
            return l === null ? 0.02 : l;
          }
          if (n instanceof HTMLVideoElement || n instanceof HTMLCanvasElement) return 0.02;
          const cs = getComputedStyle(n);
          const bg = parse(cs.backgroundColor);
          if (bg && bg.a >= 0.5) return bg.lum;
          if (cs.backgroundImage && cs.backgroundImage !== 'none') {
            const colors = cs.backgroundImage.match(/(rgba?|oklab|oklch)\([^)]*\)/gi);
            if (colors) {
              const all = colors.map(parse).filter((c): c is { lum: number; a: number } => !!c);
              const meanA = all.length ? all.reduce((t, c) => t + c.a, 0) / all.length : 0;
              if (all.length && meanA >= 0.6) return all.reduce((t, c) => t + c.lum, 0) / all.length;
              if (meanA > 0) break; // overlay tipis: biarkan elemen di bawahnya yang menentukan
            }
            if (cs.backgroundImage.includes('url(')) return 0.02; // foto latar tanpa info warna -> anggap gelap
          }
          n = n.parentElement;
        }
      }
      return 1;
    };

    let raf = 0;
    const detect = () => {
      raf = 0;
      setAtTop(window.scrollY <= 8);
      const header = headerRef.current;
      if (!header) return;
      const next: Record<string, boolean> = {};
      header.querySelectorAll<HTMLElement>('[data-hdr]').forEach((el) => {
        const rc = el.getBoundingClientRect();
        if (!rc.width || !rc.height) return;
        // Baca 3 titik sepanjang lebar item, lalu pilih warna yang kontrasnya paling aman di titik terburuk.
        const cy = rc.top + rc.height / 2;
        const ls = [0.12, 0.5, 0.88].map((f) => lumAt(rc.left + rc.width * f, cy, header));
        const whiteWorst = Math.min(...ls.map((l) => 1.05 / (l + 0.05)));
        const blackWorst = Math.min(...ls.map((l) => (l + 0.05) / 0.05));
        next[el.dataset.hdr as string] = whiteWorst > blackWorst;
      });
      setDark((prev) => {
        const keys = Object.keys(next);
        return keys.length === Object.keys(prev).length && keys.every((k) => prev[k] === next[k]) ? prev : next;
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(detect);
    };
    redetect = schedule;
    detect();
    const t1 = window.setTimeout(detect, 300);
    const t2 = window.setTimeout(detect, 1200);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [pathname]);
  const isHome = pathname === '/';
  // Bayangan/halo tipis: putih -> bayangan gelap, hitam -> halo terang (pengaman di atas foto)
  const shadowFor = (isDark: boolean): React.CSSProperties => ({
    textShadow: isDark
      ? '0 0 3px rgba(0,0,0,0.75), 0 1px 8px rgba(0,0,0,0.6)'
      : '0 0 3px rgba(255,255,255,0.95), 0 0 10px rgba(255,255,255,0.9)',
  });

  // Active checks
  const isHomeActive = pathname === '/';
  const isCariActive = pathname.startsWith('/cari-kost') || pathname.startsWith('/kost');
  const isMapsActive = pathname.startsWith('/maps');

  // Bubble style helper
  const getBubbleClass = (isActive: boolean, key: string) => {
    return isActive
      ? 'bg-[#F97316] text-white font-bold'
      : dk(key)
        ? 'text-white hover:bg-white/20 font-semibold'
        : 'text-black hover:bg-black/10 font-semibold';
  };

  const getMobileBubbleClass = (isActive: boolean) => {
    return isActive
      ? 'bg-[#F97316] text-white font-bold shadow-sm'
      : 'bg-white/80 text-black font-semibold hover:bg-white';
  };

  // Di halaman admin, sembunyikan header navigasi utama
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
    <header ref={headerRef} className={`${isHome ? 'fixed inset-x-0' : 'sticky'} top-0 z-[9990] transition-all duration-300 border-b ${solid ? 'bg-white border-slate-200 backdrop-blur-none' : atTop ? 'bg-transparent border-transparent backdrop-blur-none' : `backdrop-blur-xl ${headerDark ? 'bg-black/20 border-white/10' : 'bg-white/30 border-white/40'}`}`}>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo - Sekitar Style */}
        <Link href="/" onClick={handleNavClick} scroll={true} className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div data-hdr="brand">
            <BrandLogo variant="horizontal" light={dk('brand')} className="h-9 sm:h-11 transition-opacity group-hover:opacity-90" />
          </div>
        </Link>

        {/* Desktop Navigation Links with Active State Bubbles */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          {/* Beranda Bubble */}
          <Link 
            href="/" 
            onClick={handleNavClick}
            scroll={true}
            className={`px-5 py-2.5 rounded-lg transition-all duration-300 flex items-center gap-2 ${getBubbleClass(isHomeActive, 'home')}`}
            data-hdr="home"
            style={isHomeActive ? undefined : shadowFor(dk('home'))}
          >
            <span>Beranda</span>
          </Link>

          {/* Cari Kost Bubble */}
          <Link 
            href="/cari-kost" 
            onClick={handleNavClick}
            scroll={true}
            className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${getBubbleClass(isCariActive, 'cari')}`}
            data-hdr="cari"
            style={isCariActive ? undefined : shadowFor(dk('cari'))}
          >
            <span>Cari Kost</span>
          </Link>

          {/* Maps Bubble */}
          <Link 
            href="/maps" 
            onClick={handleNavClick}
            scroll={true}
            className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${getBubbleClass(isMapsActive, 'maps')}`}
            data-hdr="maps"
            style={isMapsActive ? undefined : shadowFor(dk('maps'))}
          >
            <Compass className={`w-4 h-4 ${isMapsActive ? 'text-white' : 'text-[#F97316]'}`} />
            <span>Maps</span>
          </Link>
        </div>

        {/* Right CTA / Auth Status */}
        <div className="hidden md:flex items-center gap-3" suppressHydrationWarning>
          {user || subscription.status === 'active' ? (
            <div className="flex items-center gap-2.5">
              {subscription.status === 'active' && (
                <div className="inline-flex items-center gap-1.5 bg-[#FFEDD5] border border-[#F97316]/50 text-[#0F2A43] px-3.5 py-1.5 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#C2410C]" />
                  <span>Akses Aktif ({subscription.daysRemaining} hari)</span>
                </div>
              )}
              <Link
                href="/dashboard#notifikasi"
                aria-label={`Notifikasi${unreadNotifications ? `, ${unreadNotifications} belum dibaca` : ''}`}
                title="Notifikasi"
                className="relative p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>
              <Link
                href="/wishlist"
                aria-label={`Wishlist (${wishlist.count})`}
                title="Kost favorit"
                className="relative p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Heart className="w-4 h-4" />
                {wishlist.count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center" suppressHydrationWarning>
                    {wishlist.count}
                  </span>
                )}
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
              >
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span className="max-w-[120px] truncate">{user?.email ? user.email.split('@')[0] : 'Akun Saya'}</span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                }}
                title="Keluar dari akun"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-full transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/wishlist"
                aria-label={`Wishlist (${wishlist.count})`}
                title="Kost favorit"
                data-hdr="wish"
                className={`relative p-2 rounded-lg transition-colors duration-300 ${dk('wish') ? 'text-white hover:bg-white/20' : 'text-black hover:bg-black/10'}`}
                style={shadowFor(dk('wish'))}
              >
                <Heart className="w-5 h-5" />
                {wishlist.count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center" suppressHydrationWarning>
                    {wishlist.count}
                  </span>
                )}
              </Link>
              <Link
                href="/login"
                className={`px-4 py-2.5 text-xs font-bold transition-colors duration-300 ${dk('masuk') ? 'text-white' : 'text-black hover:text-black/70'}`}
                data-hdr="masuk"
                style={shadowFor(dk('masuk'))}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all hover:scale-102"
              >
                <span>Akses Rp15rb / 30 Hari</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2" suppressHydrationWarning>
          {subscription.status === 'active' ? (
            <span className="text-[11px] font-bold bg-[#FFEDD5] text-[#0F2A43] px-2.5 py-1 rounded-full border border-[#F97316]/40">
              Aktif ({subscription.daysRemaining}h)
            </span>
          ) : (
            <Link
              href={user ? "/checkout" : "/register"}
              className="bg-[#F97316] text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-xs whitespace-nowrap"
            >
              Rp15rb
            </Link>
          )}
          <button
            ref={menuTriggerRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-800 rounded-xl bg-white/80 backdrop-blur border border-white/60 shadow-sm"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-sheet"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>
    </header>

    {/* Mobile Backdrop Overlay */}
    <div
      role="presentation"
      aria-hidden="true"
      onClick={() => setMobileMenuOpen(false)}
      className={`md:hidden fixed inset-0 z-[9998] bg-black/60 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    />

    {/* Mobile bottom sheet navigation */}
    <section
      ref={mobileMenuRef}
      id="mobile-navigation-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi"
      aria-hidden={!mobileMenuOpen}
      inert={!mobileMenuOpen}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`md:hidden fixed inset-x-0 bottom-0 z-[9999] max-h-[88dvh] overflow-y-auto overscroll-contain rounded-t-[1.75rem] border-t border-slate-200/90 bg-white px-6 pt-2 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none touch-pan-y ${
        mobileMenuOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Top drag handle indicator (swipe down area) */}
      <div 
        className="w-full py-2.5 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
        aria-hidden="true"
      >
        <div className="h-1.5 w-12 rounded-full bg-slate-300 transition-colors hover:bg-slate-400" />
      </div>

      {/* Header: "Menu" & "X" */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Menu</h2>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Tutup menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Vertical navigation list with spacious gap */}
      <nav aria-label="Navigasi utama mobile" className="space-y-2 py-1 text-base">
        <Link
          href="/"
          onClick={handleNavClick}
          scroll={true}
          className={`flex min-h-12 items-center rounded-xl px-4 transition-colors ${getMobileBubbleClass(isHomeActive)}`}
        >
          Beranda
        </Link>
        <Link
          href="/cari-kost"
          onClick={handleNavClick}
          scroll={true}
          className={`flex min-h-12 items-center rounded-xl px-4 transition-colors ${getMobileBubbleClass(isCariActive)}`}
        >
          Cari Kost
        </Link>
        <Link
          href="/maps"
          onClick={handleNavClick}
          scroll={true}
          className={`flex min-h-12 items-center gap-2.5 rounded-xl px-4 transition-colors ${getMobileBubbleClass(isMapsActive)}`}
        >
          <Compass className={`h-4 w-4 ${isMapsActive ? 'text-white' : 'text-[#F97316]'}`} />
          Maps
        </Link>
        <Link
          href="/dashboard"
          onClick={handleNavClick}
          scroll={true}
          className="flex min-h-12 items-center gap-2.5 rounded-xl px-4 font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
        >
          <User className="h-4 w-4 text-slate-500" />
          Dashboard Akun
        </Link>
        <Link
          href="/wishlist"
          onClick={handleNavClick}
          scroll={true}
          className="flex min-h-12 items-center justify-between rounded-xl px-4 font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
        >
          <div className="flex items-center gap-2.5">
            <Heart className="h-4 w-4 text-slate-500" />
            <span>Wishlist</span>
          </div>
          {wishlist.count > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#F97316] text-white text-xs font-bold flex items-center justify-center">
              {wishlist.count}
            </span>
          )}
        </Link>
      </nav>

      {/* Horizontal separator line */}
      <div className="my-4 border-t border-slate-200" />

      {/* Bottom two side-by-side buttons: Masuk & Akses Penuh (atau Profil & Keluar saat sudah login) */}
      <div className="pt-1 pb-1" suppressHydrationWarning>
        <div className="flex items-center gap-3">
          {user || subscription.status === 'active' ? (
            <>
              <Link
                href="/profil"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 min-h-12 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 shadow-xs transition-colors hover:bg-slate-50 active:scale-[0.98] text-center"
              >
                <User className="h-4 w-4 text-slate-600" />
                <span>Profil</span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                }}
                className="flex-1 min-h-12 px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 text-center text-sm font-bold text-white shadow-xs transition-colors hover:bg-rose-700 active:scale-[0.98] cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Keluar</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 min-h-12 px-4 inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 shadow-xs transition-colors hover:bg-slate-50 active:scale-[0.98] text-center"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 min-h-12 px-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] text-center text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#EA580C] active:scale-[0.98]"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Akses Penuh</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
    </>
  );
}
