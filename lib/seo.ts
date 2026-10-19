/** Pembuat data terstruktur (JSON-LD schema.org) dan teks FAQ untuk SEO & mesin pencari AI. */
import type { Kost } from './types';
import { SITE_NAME, SUBSCRIPTION_PRICE, SUBSCRIPTION_DAYS, formatRupiah } from './config';

export interface Faq {
  q: string;
  a: string;
}

/** FAQ umum situs. Dipakai di Beranda dan harus sama dengan yang tampil di halaman. */
export const SITE_FAQS: Faq[] = [
  { q: 'Kenapa harus bayar buat lihat lengkap?', a: 'Biar kami bisa terus turun lapangan, foto & video asli tiap kost. Sekali bayar Rp 15rb, semua kost kebuka 30 hari.' },
  { q: 'Bisa lihat apa aja secara gratis?', a: '3 foto, 1 video, lokasi, harga, dan fasilitas. Cukup buat nge-shortlist.' },
  { q: 'Kalau kostnya gak sesuai foto?', a: 'Laporin lewat tombol di halaman kost. Kami verifikasi ulang, kost bermasalah kami turunin.' },
  { q: 'Berapa lama akses unlock berlaku?', a: '30 hari sejak pembayaran.' },
  { q: 'Pembayarannya pakai apa?', a: 'QRIS, transfer bank (semua bank), e-wallet (GoPay, OVO, DANA), dan minimarket.' },
];

/** Cegah "</script>" di dalam data memutus tag script. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function kostPath(k: Pick<Kost, 'kota' | 'area' | 'slug'>): string {
  return `/kost/${(k.kota || 'jakarta').toLowerCase()}/${k.area.toLowerCase()}/${k.slug}`;
}

export function breadcrumbLd(site: string, items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${site}${it.path}`,
    })),
  };
}

export function faqLd(faqs: Faq[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function itemListLd(site: string, name: string, kosts: Kost[]) {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: kosts.length,
    itemListElement: kosts.map((k, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${site}${kostPath(k)}`,
      name: k.nama,
    })),
  };
}

export function organizationLd(site: string) {
  return [
    {
      '@type': 'Organization',
      '@id': `${site}/#organization`,
      name: SITE_NAME,
      url: site,
      logo: `${site}/icon.svg`,
      areaServed: { '@type': 'AdministrativeArea', name: 'DKI Jakarta' },
    },
    {
      '@type': 'WebSite',
      '@id': `${site}/#website`,
      url: site,
      name: SITE_NAME,
      inLanguage: 'id-ID',
      publisher: { '@id': `${site}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${site}/cari-kost?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

const TIPE_LABEL: Record<string, string> = { putra: 'putra', putri: 'putri', campur: 'campur' };

/** Hanya foto pratinjau (publik); foto premium tidak pernah masuk data terstruktur. */
function previewImages(k: Kost): string[] {
  return (k.media ?? []).filter((m) => m.is_preview && m.tipe !== 'video').map((m) => m.url).filter((u): u is string => Boolean(u)).slice(0, 5);
}

/** LodgingBusiness + Accommodation (kamar yang disewakan) untuk halaman detail. */
export function lodgingLd(site: string, k: Kost, rating?: { avg: number; count: number }) {
  const url = `${site}${kostPath(k)}`;
  const images = previewImages(k);
  const hasGeo = typeof k.latitude === 'number' && typeof k.longitude === 'number';
  return {
    '@type': 'LodgingBusiness',
    '@id': `${url}#lodging`,
    name: k.nama,
    url,
    description: k.deskripsi,
    ...(images.length ? { image: images } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: k.alamat,
      addressLocality: k.kota,
      addressRegion: 'DKI Jakarta',
      addressCountry: 'ID',
    },
    ...(hasGeo ? { geo: { '@type': 'GeoCoordinates', latitude: k.latitude, longitude: k.longitude } } : {}),
    areaServed: k.area,
    priceRange: formatRupiah(k.harga),
    amenityFeature: k.fasilitas.map((f) => ({ '@type': 'LocationFeatureSpecification', name: f, value: true })),
    ...(rating && rating.count > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rating.avg, reviewCount: rating.count, bestRating: 5, worstRating: 1 } }
      : {}),
    makesOffer: {
      '@type': 'Offer',
      url,
      priceCurrency: 'IDR',
      price: k.harga,
      availability: k.status === 'tersedia' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: k.harga, priceCurrency: 'IDR', unitText: 'MON' },
      itemOffered: {
        '@type': 'Accommodation',
        name: `Kamar kost ${TIPE_LABEL[k.tipe] ?? k.tipe} di ${k.nama}`,
        amenityFeature: k.fasilitas.map((f) => ({ '@type': 'LocationFeatureSpecification', name: f, value: true })),
      },
    },
    hasPart: {
      '@type': 'WebPageElement',
      isAccessibleForFree: false,
      cssSelector: '.premium-locked-section',
      description: 'Semua foto kamar, video walkthrough, dan nomor WhatsApp pemilik kost (langganan).',
    },
  };
}

const rp = (n: number) => formatRupiah(n);

/** FAQ khusus satu kost, disusun dari datanya sendiri (jawaban berupa fakta, bukan promosi). */
export function kostFaqs(k: Kost): Faq[] {
  const tipe = TIPE_LABEL[k.tipe] ?? k.tipe;
  const faqs: Faq[] = [
    { q: `Berapa harga sewa ${k.nama}?`, a: `${k.nama} disewakan mulai ${rp(k.harga)} per bulan.` },
    { q: `Di mana lokasi ${k.nama}?`, a: `${k.nama} beralamat di ${k.alamat}.` },
    { q: `Ini kost putra, putri, atau campur?`, a: `${k.nama} adalah kost ${tipe}.` },
  ];
  if (k.fasilitas.length) faqs.push({ q: `Apa saja fasilitas ${k.nama}?`, a: `Fasilitasnya: ${k.fasilitas.join(', ')}.` });
  faqs.push({
    q: 'Bagaimana cara menghubungi pemilik?',
    a: `Foto pratinjau, harga, lokasi, dan fasilitas bisa dilihat gratis. Nomor WhatsApp pemilik dan seluruh foto/video terbuka setelah berlangganan ${rp(SUBSCRIPTION_PRICE)} untuk ${SUBSCRIPTION_DAYS} hari.`,
  });
  return faqs;
}

/** FAQ untuk halaman daftar (kota / area / Cari Kost), disusun dari data kost yang tampil. */
export function listingFaqs(scope: string, kosts: Kost[]): Faq[] {
  const faqs: Faq[] = [];
  if (kosts.length) {
    const prices = kosts.map((k) => k.harga);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    faqs.push({
      q: `Berapa harga kost di ${scope}?`,
      a: min === max ? `Harga kost di ${scope} di situs ini ${rp(min)} per bulan.` : `Harga kost di ${scope} di situs ini berkisar ${rp(min)} sampai ${rp(max)} per bulan.`,
    });
    const tipes = Array.from(new Set(kosts.map((k) => TIPE_LABEL[k.tipe] ?? k.tipe)));
    faqs.push({ q: `Ada kost putra, putri, atau campur di ${scope}?`, a: `Tersedia kost ${tipes.join(', ')} di ${scope}. Ada ${kosts.length} kost yang tampil saat ini.` });
  }
  faqs.push({
    q: 'Bagaimana cara mendapatkan nomor WhatsApp pemilik kost?',
    a: `Lihat gratis foto pratinjau, harga, lokasi, dan fasilitas. Nomor WhatsApp pemilik dan semua foto/video terbuka dengan langganan ${rp(SUBSCRIPTION_PRICE)} untuk ${SUBSCRIPTION_DAYS} hari.`,
  });
  faqs.push({ q: 'Bagaimana kalau kost tidak sesuai foto?', a: 'Laporkan lewat tombol di halaman kost. Kami verifikasi ulang, dan kost bermasalah kami turunkan.' });
  return faqs;
}
