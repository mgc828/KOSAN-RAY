'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { SITE_FAQS } from '@/lib/seo';
import { useRouter } from 'next/navigation';
import { Kost } from '@/lib/types';
import './papi-home.css';
import { useWishlist } from '@/lib/wishlist';
import { toast } from '@/lib/toast';
import { RatingBadge } from '@/components/StarRating';
import SearchSuggest from '@/components/SearchSuggest';
import type { Suggestion } from '@/lib/suggestions';
import {
  Search,
  Heart,
  MapPin,
  Home,
  Snowflake,
  Wifi,
  Bath,
  Tv,
  Archive,
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Map,
  Wallet,
  Camera,
  ShieldCheck,
  Armchair,
  Users,
  FileText,
  LockOpen,
  MessageCircle,
  Smartphone,
  Mars,
  Venus,
  Users2,
} from 'lucide-react';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1800&q=80';

const POPULAR_AREAS: { name: string; image: string }[] = [
  { name: 'Kuningan', image: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=600&q=70' },
  { name: 'Tebet', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=70' },
  { name: 'Benhil', image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=600&q=70' },
  { name: 'Palmerah', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=70' },
  { name: 'Grogol', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=70' },
  { name: 'Salemba', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=600&q=70' },
  { name: 'Setiabudi', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=600&q=70' },
  { name: 'Kelapa Gading', image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=600&q=70' },
  { name: 'Cilandak', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=70' },
];

const GUIDE_STEPS = [
  { icon: Search, title: 'Cari & Intip', text: 'Lihat 3 foto, 1 video, dan info kost gratis' },
  { icon: LockOpen, title: 'Unlock Sekali', text: 'Bayar Rp 15rb, semua kost kebuka 30 hari' },
  { icon: MessageCircle, title: 'Chat & Sewa', text: 'Dapat nomor WA, deal langsung sama pemilik' },
];

const TIPS = [
  { icon: Camera, title: 'Foto & Video Asli', text: 'Kami mendokumentasi foto & video secara langsung' },
  { icon: ShieldCheck, title: 'Garansi Kost Bohong', text: 'Kost tidak ditemukan? Uang kembali 100%' },
  { icon: Wallet, title: 'Harga Transparan', text: 'Tidak ada biaya tersembunyi, kamu deal langsung dengan pemilik' },
];

const TESTIMONIALS = [
  { name: 'Rani, mahasiswa Unpad', text: 'Awalnya ragu bayar 15rb, tapi pas unlock ternyata fotonya lengkap banget. Langsung chat pemilik, 2 hari pindahan.' },
  { name: 'Dimas, karyawan swasta', text: 'Videonya asli, jadi gak kaget pas datang. Kamarnya sama persis kayak di video, tinggal deal sama pemilik.' },
  { name: 'Sarah, mahasiswi Binus', text: 'Harganya jelas dari awal, gak ada biaya tambahan. Hemat waktu banget dibanding survei satu-satu.' },
];

const FAQS = SITE_FAQS;

function facilityIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('ac')) return Snowflake;
  if (n.includes('wifi') || n.includes('internet')) return Wifi;
  if (n.includes('mandi')) return Bath;
  if (n.includes('tv')) return Tv;
  if (n.includes('lemari')) return Archive;
  if (n.includes('meja') || n.includes('kursi')) return Armchair;
  return Check;
}

function genderBadge(tipe: Kost['tipe']) {
  if (tipe === 'putra') return { cls: 'pria', label: 'Pria', Icon: Mars };
  if (tipe === 'putri') return { cls: 'wanita', label: 'Wanita', Icon: Venus };
  return { cls: 'campur', label: 'Campur', Icon: Users2 };
}

function PropertyCard({ kost }: { kost: Kost }) {
  const thumbMedia =
    kost.media?.find((m) => m.tipe === 'foto_gedung') ||
    kost.media?.find((m) => m.is_preview) ||
    kost.media?.[0];
  const thumbUrl =
    thumbMedia?.url ||
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
  const detailUrl = `/kost/${(kost.kota || 'jakarta').toLowerCase()}/${kost.area.toLowerCase()}/${kost.slug}`;
  const g = genderBadge(kost.tipe);
  const shown = kost.fasilitas.slice(0, 5);
  const more = kost.fasilitas.length - shown.length;
  const wishlist = useWishlist();
  const liked = wishlist.has(kost.slug);

  return (
    <div className="papi-property-card">
      <Link href={detailUrl} className="property-card-link">
        <div className="papi-property-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbUrl} alt={kost.nama} loading="lazy" width={400} height={280} referrerPolicy="no-referrer" />
          <span className={`papi-room-count${kost.status === 'penuh' ? ' full' : ''}`}>
            {kost.status === 'penuh' ? 'Kamar penuh' : 'Kamar tersedia'}
          </span>
        </div>
        <div className="papi-property-info">
          <div className="papi-property-type">
            <div className="papi-property-badges">
              <span className="papi-badge"><Home size={12} /> Kost</span>
              <span className={`papi-gender-badge papi-gender-badge--${g.cls}`}><g.Icon size={12} /> {g.label}</span>
            </div>
          </div>
          <h3 className="property-title" title={kost.nama}>{kost.nama}</h3>
          <p className="papi-location">
            <MapPin size={13} className="location-pin" style={{ display: 'inline', verticalAlign: '-2px' }} /> {kost.area}, Jakarta
          </p>
          {kost.rating && kost.rating.count > 0 && (
            <div style={{ marginBottom: '0.5rem' }}><RatingBadge rating={kost.rating} /></div>
          )}
          <div className="papi-facilities">
            {shown.map((f) => {
              const Icon = facilityIcon(f);
              return (
                <span key={f} className="papi-facility-icon" title={f}><Icon /></span>
              );
            })}
            {more > 0 && (
              <span className="papi-facility-more" title={`Lihat ${more} fasilitas lainnya`}><Plus /> +{more}</span>
            )}
          </div>
          <div className="papi-price">
            <div className="papi-discounted-price" suppressHydrationWarning>
              {kost.harga.toLocaleString('en-US')} <span className="papi-price-period">/ bulan</span>
            </div>
          </div>
        </div>
      </Link>
      <button
        className="papi-wishlist-btn"
        aria-label="Tambah ke wishlist"
        aria-pressed={liked}
        onClick={() => {
          wishlist.toggle(kost.slug);
          toast(liked ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist', liked ? 'info' : 'success');
        }}
      >
        <Heart size={18} fill={liked ? '#e74c3c' : 'none'} color={liked ? '#e74c3c' : '#64748B'} />
      </button>
    </div>
  );
}

export default function HomeClient({ kosts }: { kosts: Kost[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // carousel
  const carouselRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(4);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setPerView(w <= 576 ? 1 : w <= 992 ? 2 : w <= 1200 ? 3 : 4);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const pages = Math.max(1, Math.ceil(kosts.length / perView));
  const goTo = useCallback((p: number) => {
    const clamped = Math.max(0, Math.min(p, pages - 1));
    setPage(clamped);
    const el = carouselRef.current;
    if (el) {
      const card = el.querySelector('.papi-property-card') as HTMLElement | null;
      if (card) el.scrollTo({ left: clamped * perView * (card.offsetWidth + 16), behavior: 'smooth' });
    }
  }, [pages, perView]);

  // Indikator titik ikut bergeser saat carousel digeser manual (trackpad, sentuh, panah keyboard), bukan hanya lewat tombol.
  const syncPageFromScroll = useCallback(() => {
    const el = carouselRef.current;
    const card = el?.querySelector('.papi-property-card') as HTMLElement | null;
    if (!el || !card) return;
    const step = perView * (card.offsetWidth + 16);
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const next = atEnd ? pages - 1 : Math.round(el.scrollLeft / step);
    setPage(Math.max(0, Math.min(next, pages - 1)));
  }, [pages, perView]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncPageFromScroll);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
    };
  }, [syncPageFromScroll]);

  const pickSuggestion = (sg: Suggestion) => {
    if (sg.kind === 'kost' && sg.href) router.push(sg.href);
    else if (sg.kind === 'area') router.push(`/cari-kost?area=${encodeURIComponent(sg.value)}`);
    else if (sg.kind === 'kampus' || sg.kind === 'stasiun') router.push(`/cari-kost?lm=${encodeURIComponent(sg.value)}`);
    else if (sg.kind === 'fasilitas') router.push(`/cari-kost?fac=${encodeURIComponent(sg.value)}`);
  };

  const doSearch = (value: string) => {
    const q = value.trim();
    router.push(q ? `/cari-kost?q=${encodeURIComponent(q)}` : '/cari-kost');
  };

  // explore carousel
  const exploreRef = useRef<HTMLDivElement>(null);
  const scrollExplore = (dir: 1 | -1) => {
    exploreRef.current?.scrollBy({ left: dir * 400, behavior: 'smooth' });
  };

  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // group popular areas like papikost: portrait, [landscape x2], portrait, ...
  const exploreCols: React.ReactNode[] = [];
  {
    let i = 0;
    let key = 0;
    const card = (a: (typeof POPULAR_AREAS)[number], shape: 'portrait' | 'landscape') => (
      <div key={a.name} className={`explore-card ${shape}`} onClick={() => doSearch(a.name)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.image} alt={a.name} loading="lazy" referrerPolicy="no-referrer" />
        <div className="explore-overlay">
          <h3 className="explore-city-name">{a.name}</h3>
          <div className="explore-arrow"><ArrowRight size={16} /></div>
        </div>
      </div>
    );
    while (i < POPULAR_AREAS.length) {
      exploreCols.push(card(POPULAR_AREAS[i++], 'portrait'));
      const pair = POPULAR_AREAS.slice(i, i + 2);
      i += pair.length;
      if (pair.length) {
        exploreCols.push(
          <div key={`col-${key++}`} className="explore-grid-column">
            {pair.map((a) => card(a, 'landscape'))}
          </div>
        );
      }
    }
  }

  return (
    <div className="papi-home">
      {/* HERO */}
      <header
        className="hero"
        data-header-theme="dark"
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)), url('${HERO_IMAGE}') center/cover no-repeat`,
        }}
      >
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Cari Kost di Jakarta Lebih Mudah, Jelas, dan Cepat</h1>
            <p className="hero-subtitle">Kost-Kostan membantu kamu menemukan kost di Jakarta, lengkap dengan harga, fasilitas, dan lokasi yang sudah kami verifikasi.</p>
          </div>
          <div className="search-container">
            <div className="search-input">
              <SearchSuggest
                className="sugg-hero"
                inputClassName="search-input__field"
                value={query}
                onChange={setQuery}
                onSubmit={doSearch}
                onPick={pickSuggestion}
                kosts={kosts}
                placeholder="Cari nama, alamat, daerah"
              />
              <div className="search-icon" onClick={() => doSearch(query)} role="button" aria-label="Cari">
                <Search />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* REKOMENDASI */}
      <section className="papi-recommendations">
        <div className="container">
          <h2>Rekomendasi Kost Di Jakarta Untukmu</h2>
          <p className="section-description">Cari kost terbaik di Jakarta yang sesuai dengan kebutuhan dan budget kamu</p>
          <div className="papi-property-carousel-container">
            <button className="papi-carousel-control papi-prev-btn" onClick={() => goTo(page - 1)} aria-label="Sebelumnya" style={{ display: pages > 1 ? 'flex' : 'none' }}>
              <ChevronLeft size={20} />
            </button>
            <div className="papi-property-carousel" ref={carouselRef} tabIndex={0} role="region" aria-label="Rekomendasi kost, geser dengan panah keyboard" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
              {kosts.map((k) => (
                <PropertyCard key={k.id} kost={k} />
              ))}
            </div>
            <button className="papi-carousel-control papi-next-btn" onClick={() => goTo(page + 1)} aria-label="Selanjutnya" style={{ display: pages > 1 ? 'flex' : 'none' }}>
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="papi-carousel-indicators">
            {Array.from({ length: pages }).map((_, i) => (
              <div key={i} className={`papi-indicator${i === page ? ' active' : ''}`} onClick={() => goTo(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* PANDUAN BOOKING */}
      <section className="booking-guide">
        <div className="container">
          <h2>Panduan Booking Kost</h2>
          <p className="guide-subtitle">Ikuti langkah mudah ini untuk booking kost impian kamu</p>
          <div className="guide-steps-container">
            {GUIDE_STEPS.map((s, i) => (
              <div className="guide-step" key={s.title}>
                <div className="step-icon">
                  <s.icon />
                  <div className="step-number">{i + 1}</div>
                </div>
                <div className="step-content">
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PENCARIAN POPULAR */}
      <section className="explore-cities">
        <div className="container">
          <div className="explore-header">
            <h2>Pencarian Popular</h2>
            <div className="explore-navigation popular-desktop-only">
              <button className="explore-carousel-control explore-prev-btn" aria-label="Sebelumnya" onClick={() => scrollExplore(-1)}>
                <ChevronLeft size={18} />
              </button>
              <button className="explore-carousel-control explore-next-btn" aria-label="Selanjutnya" onClick={() => scrollExplore(1)}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="explore-carousel-container" ref={exploreRef} tabIndex={0} role="region" aria-label="Daftar area pencarian populer, geser dengan panah keyboard" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
            <div className="explore-grid">{exploreCols}</div>
          </div>
        </div>
      </section>

      {/* TIPS */}
      <section className="tips-section" data-header-theme="light">
        <div className="container">
          <div className="tips-content">
            <h2>Kenapa Pilih Kost-Kostan ?</h2>
            <div className="tips-grid">
              {TIPS.map((t) => (
                <div className="tip-card" key={t.title}>
                  <div className="tip-icon"><t.icon /></div>
                  <div className="tip-content">
                    <h3>{t.title}</h3>
                    <p>{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="container">
          <h2>FAQ</h2>
          <div className="faq-container">
            {FAQS.map((f, i) => (
              <div className={`faq-item${openFaq === i ? ' active' : ''}`} key={f.q}>
                <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <h3>{f.q}</h3>
                  <div className="faq-icon">{openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                </div>
                <div className="faq-answer"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL / STATS */}
      <section className="testimonial-section" data-header-theme="light">
        <div className="container">
          <div className="testimonial-content" style={{ maxWidth: "none" }}>
            <h2>Testimoni</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto', gap: '1.5rem', marginTop: '2.5rem', textAlign: 'left' }}>
              {TESTIMONIALS.map((t) => (
                <div key={t.name} style={{ padding: '1.75rem', borderRadius: 20, background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
                  <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.7 }}>&ldquo;{t.text}&rdquo;</p>
                  <p style={{ color: '#0F2A43', fontWeight: 600, fontSize: '0.95rem' }}>
                    — <em>{t.name}</em>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-download">
        <div className="container">
          <div className="cta-row">
            <div className="cta-content">
              <h2 style={{ color: '#ffffff', fontSize: 'clamp(1.6rem, 6vw, 2.25rem)', fontWeight: 700, marginBottom: '1rem' }}>
                Lagi cari Kost di Jakarta? Butuh tempat tinggal yang nyaman?
              </h2>
              <p style={{ color: '#ffffff', fontSize: '1.125rem', marginBottom: '2rem' }}>
                Cari di #kost-kostan aja! Daftar dan mulai cari kost Kamu hari ini.
              </p>
              <div>
                <Link href="/register" className="cta-btn">
                  <Smartphone size={18} /> Daftar Sekarang!
                </Link>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="cta-mascot" src="/maskot-kost.svg" alt="Maskot kost-kostan berbentuk rumah yang tersenyum sambil memegang kunci" width={320} height={320} loading="lazy" />
          </div>
        </div>
      </section>

      {/* KATEGORI KOST */}
      <section className="kost-categories">
        <div className="category-columns">
          <div className="category-column">
            <h3>Kost Populer di Jakarta</h3>
            <ul className="kost-links">
              {['Kuningan', 'Tebet', 'Benhil', 'Palmerah', 'Grogol', 'Salemba', 'Setiabudi'].map((a) => (
                <li key={a}>
                  <Link href={`/kost/jakarta/${a.toLowerCase()}`}><ChevronRight size={14} /> Kost di {a}</Link>
                </li>
              ))}
            </ul>
            <Link href="/cari-kost" className="see-all-link">Lihat semua kost di kost-kostan <ChevronRight size={14} /></Link>
          </div>
          <div className="category-column">
            <h3>Kost Sekitar Kampus</h3>
            <ul className="kost-links">
              {[['BINUS', 'Palmerah'], ['Universitas Trisakti', 'Grogol'], ['Universitas Tarumanagara', 'Grogol'], ['Universitas Indonesia', 'Salemba']].map(([n, a]) => (
                <li key={n}>
                  <Link href={`/kost/jakarta/${a.toLowerCase()}`}><ChevronRight size={14} /> Kost dekat {n}</Link>
                </li>
              ))}
            </ul>
            <Link href="/cari-kost" className="see-all-link">Lihat semua kost di kost-kostan <ChevronRight size={14} /></Link>
          </div>
          <div className="category-column">
            <h3>Kost Sekitar Transportasi</h3>
            <ul className="kost-links">
              {[['Stasiun KRL Tebet', 'Tebet'], ['MRT & Sudirman', 'Benhil'], ['LRT Jabodebek', 'Setiabudi']].map(([n, a]) => (
                <li key={n}>
                  <Link href={`/kost/jakarta/${a.toLowerCase()}`}><ChevronRight size={14} /> Kost dekat {n}</Link>
                </li>
              ))}
            </ul>
            <Link href="/maps" className="see-all-link"><Map size={14} /> Lihat di peta <ChevronRight size={14} /></Link>
          </div>
        </div>
      </section>

      {showTop && (
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="home-return-top"
          aria-label="Kembali ke atas"
          style={{ position: 'fixed', right: 20, bottom: 24, width: 44, height: 44, borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 900, color: '#0F2A43' }}
        >
          <ChevronUp size={20} />
        </a>
      )}
    </div>
  );
}
