'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Kost } from '@/lib/types';
import KostCard from '@/components/KostCard';
import './price-slider.css';
import { FACILITY_CATEGORIES } from '@/lib/facilities';
import SearchSuggest from '@/components/SearchSuggest';
import type { Suggestion } from '@/lib/suggestions';
import { LANDMARKS, getLandmark, haversine, formatDistance } from '@/lib/geo';
import { JAKARTA_REGIONS, JAKARTA_CITIES, getKostCity, getKostKecamatan } from '@/lib/jakarta-regions';
import { useSavedSearches, MAX_SAVED_SEARCHES, SearchState } from '@/lib/saved-searches';
import { toast } from '@/lib/toast';
import { 
  Search, 
  ChevronDown, 
  X, 
  MapPin, 
  SlidersHorizontal, 
  Check,
  Building2,
  Compass,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  LayoutGrid,
  List,
  Map as MapIcon,
  LocateFixed,
  Bookmark,
  BookmarkPlus,
  RotateCcw
} from 'lucide-react';

const MapsComponent = dynamic(() => import('@/components/MapsComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[640px] bg-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-500 gap-3">
      <Compass className="w-8 h-8 animate-spin text-[#F97316]" />
      <span className="text-xs font-bold text-slate-500">Memuat peta...</span>
    </div>
  ),
});

const PAGE_SIZE = 8;
type SortKey = 'rekomendasi' | 'terdekat' | 'rating' | 'termurah' | 'termahal' | 'terbaru';
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'rekomendasi', label: 'Rekomendasi' },
  { value: 'terdekat', label: 'Jarak terdekat' },
  { value: 'rating', label: 'Rating tertinggi' },
  { value: 'termurah', label: 'Harga termurah' },
  { value: 'termahal', label: 'Harga tertinggi' },
  { value: 'terbaru', label: 'Terbaru' },
];

const RADIUS_MIN = 100;
const RADIUS_MAX = 20000;
const RADIUS_STEP = 100;

const PRICE_MIN = 0;
const PRICE_MAX = 10000000;
const PRICE_PRESETS = [
  { label: '< 1 Juta', min: 0, max: 1000000 },
  { label: '1 - 2 Juta', min: 1000000, max: 2000000 },
  { label: '2 - 3 Juta', min: 2000000, max: 3000000 },
  { label: '> 3 Juta', min: 3000000, max: PRICE_MAX },
];
const PRICE_STEP = 100000;

/** ?area=... di URL bisa berupa kota ("Jakarta Selatan") atau nama area lama ("Tebet") -> kota + kecamatan. */
function resolveAreaParam(kosts: Kost[], value: string | null): { city?: string; kecamatan?: string } {
  if (!value) return {};
  const city = JAKARTA_CITIES.find((c) => c.toLowerCase() === value.toLowerCase());
  if (city) return { city };
  const hit = kosts.find((k) => k.area.toLowerCase() === value.toLowerCase());
  return hit ? { city: getKostCity(hit), kecamatan: getKostKecamatan(hit) } : {};
}

function getPaginationRange(current: number, total: number): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, 'ellipsis-end', total];
  }
  if (current >= total - 2) {
    return [1, 'ellipsis-start', total - 3, total - 2, total - 1, total];
  }
  return [1, 'ellipsis-start', current - 1, current, current + 1, 'ellipsis-end', total];
}

export default function CariKostClient({ kosts: allKosts }: { kosts: Kost[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saved = useSavedSearches();

  // State filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    const { city } = resolveAreaParam(allKosts, searchParams.get('area'));
    return city ? [city] : [];
  });
  const [selectedKecamatan, setSelectedKecamatan] = useState<string[]>(() => {
    const { kecamatan } = resolveAreaParam(allKosts, searchParams.get('area'));
    return kecamatan ? [kecamatan] : [];
  });
  const [selectedTipe, setSelectedTipe] = useState<string>('semua');
  const [sortBy, setSortBy] = useState<SortKey>(getLandmark(searchParams.get('lm')) ? 'terdekat' : 'rekomendasi');
  const [view, setView] = useState<'grid' | 'list' | 'peta'>('grid');
  const [page, setPage] = useState(1);
  const [mapSelected, setMapSelected] = useState<Kost | null>(null);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(() => {
    const f = searchParams.get('fac');
    const hit = f ? FACILITY_CATEGORIES.find((c) => c.label.toLowerCase() === f.toLowerCase()) : undefined;
    return hit ? [hit.label] : [];
  });
  const [landmarkId, setLandmarkId] = useState<string | null>(() => getLandmark(searchParams.get('lm'))?.id ?? null);
  const [radius, setRadius] = useState(2000);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [savingName, setSavingName] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState<number>(PRICE_MIN);
  const [priceMax, setPriceMax] = useState<number>(PRICE_MAX);
  const [priceMinInput, setPriceMinInput] = useState('');
  const [priceMaxInput, setPriceMaxInput] = useState('');

  // Dropdown open states
  // Di HP, filter disembunyikan di balik tombol supaya hasil pencarian tidak tertutup panel yang panjang.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isModalLocationOpen, setIsModalLocationOpen] = useState(false);
  const [isModalKecamatanOpen, setIsModalKecamatanOpen] = useState(false);
  const [isModalTipeOpen, setIsModalTipeOpen] = useState(false);
  const [isModalLandmarkOpen, setIsModalLandmarkOpen] = useState(false);
  const modalLocationRef = useRef<HTMLDivElement>(null);
  const modalKecamatanRef = useRef<HTMLDivElement>(null);
  const modalTipeRef = useRef<HTMLDivElement>(null);
  const modalLandmarkRef = useRef<HTMLDivElement>(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isKecamatanOpen, setIsKecamatanOpen] = useState(false);
  const [isTipeOpen, setIsTipeOpen] = useState(false);

  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const kecamatanDropdownRef = useRef<HTMLDivElement>(null);
  const tipeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside

  // Close filter modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFilterModalOpen) {
        setIsFilterModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFilterModalOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (kecamatanDropdownRef.current && !kecamatanDropdownRef.current.contains(event.target as Node)) {
        setIsKecamatanOpen(false);
      }
      if (tipeDropdownRef.current && !tipeDropdownRef.current.contains(event.target as Node)) {
        setIsTipeOpen(false);
      }
      if (modalLocationRef.current && !modalLocationRef.current.contains(event.target as Node)) {
        setIsModalLocationOpen(false);
      }
      if (modalKecamatanRef.current && !modalKecamatanRef.current.contains(event.target as Node)) {
        setIsModalKecamatanOpen(false);
      }
      if (modalTipeRef.current && !modalTipeRef.current.contains(event.target as Node)) {
        setIsModalTipeOpen(false);
      }
      if (modalLandmarkRef.current && !modalLandmarkRef.current.contains(event.target as Node)) {
        setIsModalLandmarkOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const locationOptions = JAKARTA_CITIES;

  const tipeOptions = [
    { label: 'Semua Tipe', value: 'semua' },
    { label: 'Kost Putri', value: 'putri' },
    { label: 'Kost Putra', value: 'putra' },
    { label: 'Kost Campur', value: 'campur' },
  ];

  const facilityOptions = FACILITY_CATEGORIES;

  const handleToggleFacility = (label: string) => {
    setSelectedFacilities(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const formatRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const priceActive = priceMin > PRICE_MIN || (priceMax < PRICE_MAX && priceMaxInput !== '') || priceMinInput !== '';

  const updateManualPrice = (bound: 'min' | 'max', rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '');
    const setInput = bound === 'min' ? setPriceMinInput : setPriceMaxInput;
    if (!digits) {
      setInput('');
      if (bound === 'min') {
        setPriceMin(PRICE_MIN);
      } else {
        setPriceMax(PRICE_MAX);
      }
      return;
    }

    const value = Number(digits);
    setInput(value.toLocaleString('id-ID'));
    if (bound === 'min') {
      setPriceMin(value);
    } else {
      setPriceMax(value);
    }
  };

  const syncPriceInputs = (min: number, max: number) => {
    setPriceMinInput(min > PRICE_MIN ? min.toLocaleString('id-ID') : '');
    setPriceMaxInput(max < PRICE_MAX ? max.toLocaleString('id-ID') : '');
  };

  const handleToggleLocation = (loc: string) => {
    const next = selectedLocations.includes(loc) ? selectedLocations.filter(l => l !== loc) : [...selectedLocations, loc];
    setSelectedLocations(next);
    // Kecamatan dibatasi pada Lokasi Area yang terpilih: buang yang sudah tidak termasuk
    setSelectedKecamatan(prev => prev.filter(kec => next.some(c => JAKARTA_REGIONS[c]?.includes(kec))));
  };

  const handleToggleKecamatan = (kec: string) => {
    setSelectedKecamatan(prev =>
      prev.includes(kec) ? prev.filter(k => k !== kec) : [...prev, kec]
    );
  };

  /** Nama area/kota -> kota administrasi (+ kecamatan bila area-nya berupa kecamatan/kelurahan). */
  const areaToRegion = (name: string): { city?: string; kecamatan?: string } => {
    if ((JAKARTA_CITIES as string[]).includes(name)) return { city: name };
    const hit = allKosts.find((k) => k.area.toLowerCase() === name.toLowerCase());
    return hit ? { city: getKostCity(hit), kecamatan: getKostKecamatan(hit) } : {};
  };

  const landmark = getLandmark(landmarkId);
  // Radius berlaku saat ada titik acuan: kampus/stasiun terpilih atau lokasi pengguna
  const hasRadiusRef = Boolean(landmark) || Boolean(userLoc);

  const activeFilterCount =
    selectedLocations.length +
    selectedKecamatan.length +
    (selectedTipe !== 'semua' ? 1 : 0) +
    selectedFacilities.length +
    (priceActive ? 1 : 0) +
    (landmark ? 1 : 0) +
    (userLoc ? 1 : 0);

  const hasActiveFilters =
    selectedLocations.length > 0 ||
    selectedKecamatan.length > 0 ||
    selectedTipe !== 'semua' ||
    selectedFacilities.length > 0 ||
    priceActive ||
    Boolean(landmark) ||
    Boolean(userLoc) ||
    searchQuery.trim() !== '';

  const resetAllFilters = () => {
    setSelectedLocations([]);
    setSelectedKecamatan([]);
    setSelectedTipe('semua');
    setSelectedFacilities([]);
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
    syncPriceInputs(PRICE_MIN, PRICE_MAX);
    setSearchQuery('');
    setLandmarkId(null);
    setUserLoc(null);
    setSortBy((cur) => (cur === 'terdekat' ? 'rekomendasi' : cur));
  };

  // Jarak tiap kost ke posisi pengguna dan ke tempat acuan terpilih (garis lurus, meter)
  const distances = useMemo(() => {
    const map = new Map<string, { fromUser?: number; toLandmark?: number }>();
    for (const k of allKosts) {
      if (typeof k.latitude !== 'number' || typeof k.longitude !== 'number') continue;
      map.set(k.id, {
        fromUser: userLoc ? haversine(userLoc.lat, userLoc.lng, k.latitude, k.longitude) : undefined,
        toLandmark: landmark ? haversine(landmark.lat, landmark.lng, k.latitude, k.longitude) : undefined,
      });
    }
    return map;
  }, [allKosts, userLoc, landmark]);

  const distanceLabelFor = (k: Kost): string | undefined => {
    const d = distances.get(k.id);
    if (!d) return undefined;
    if (landmark && d.toLandmark !== undefined) return `${formatDistance(d.toLandmark)} dari ${landmark.name}`;
    if (d.fromUser !== undefined) return `${formatDistance(d.fromUser)} dari lokasimu`;
    return undefined;
  };

  const locateMe = () => {
    if (!('geolocation' in navigator)) {
      toast('Browser kamu tidak mendukung deteksi lokasi.', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy('terdekat');
        setLocating(false);
        toast('Lokasimu terdeteksi. Hasil diurutkan dari yang terdekat.', 'success');
      },
      (err) => {
        setLocating(false);
        toast(err.code === err.PERMISSION_DENIED ? 'Izin lokasi ditolak. Aktifkan izin lokasi di browser untuk memakai fitur ini.' : 'Lokasimu belum bisa dideteksi. Coba lagi.', 'error');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const currentState = (): SearchState => ({
    q: searchQuery,
    locations: selectedLocations,
    kecamatan: selectedKecamatan,
    tipe: selectedTipe,
    facilities: selectedFacilities,
    priceMin,
    priceMax,
    landmark: landmarkId,
    radius,
    sortBy,
  });

  const applyState = (st: SearchState) => {
    const cities = new Set<string>();
    const kecs = new Set<string>(st.kecamatan ?? []);
    for (const loc of st.locations) {
      const r = areaToRegion(loc);
      if (r.city) cities.add(r.city);
      if (r.kecamatan && !(JAKARTA_CITIES as string[]).includes(loc)) kecs.add(r.kecamatan);
    }
    const locs = Array.from(cities);
    setSearchQuery(st.q);
    setSelectedLocations(locs);
    setSelectedKecamatan(Array.from(kecs).filter((k) => locs.some((c) => JAKARTA_REGIONS[c]?.includes(k))));
    setSelectedTipe(st.tipe);
    setSelectedFacilities(st.facilities);
    setPriceMin(st.priceMin);
    setPriceMax(st.priceMax);
    syncPriceInputs(st.priceMin, st.priceMax);
    setLandmarkId(st.landmark);
    setRadius(st.radius);
    setSortBy((st.sortBy === 'terdekat' && !st.landmark ? 'rekomendasi' : st.sortBy) as SortKey);
  };

  const pickSuggestion = (sg: Suggestion) => {
    if (sg.kind === 'kost' && sg.href) {
      router.push(sg.href);
      return;
    }
    if (sg.kind === 'area') {
      const r = areaToRegion(sg.value);
      if (r.city) {
        setSelectedLocations((cur) => (cur.includes(r.city!) ? cur : [...cur, r.city!]));
        if (r.kecamatan) setSelectedKecamatan((cur) => (cur.includes(r.kecamatan!) ? cur : [...cur, r.kecamatan!]));
      }
    }
    else if (sg.kind === 'kampus' || sg.kind === 'stasiun') {
      setLandmarkId(sg.value);
      setSortBy('terdekat');
    } else if (sg.kind === 'fasilitas') setSelectedFacilities((cur) => (cur.includes(sg.value) ? cur : [...cur, sg.value]));
    setSearchQuery('');
  };

  // Filtered kosts
  const filteredKosts = useMemo(() => {
    return allKosts.filter(kost => {
      // Location match: Lokasi Area (kota administrasi) lalu kecamatan di dalam area terpilih
      const matchLoc = 
        selectedLocations.length === 0 || 
        selectedLocations.some(loc => getKostCity(kost)?.toLowerCase() === loc.toLowerCase());
      const matchKecamatan =
        selectedKecamatan.length === 0 ||
        selectedKecamatan.some(kec => getKostKecamatan(kost)?.toLowerCase() === kec.toLowerCase());

      // Tipe match
      const matchTipe = selectedTipe === 'semua' || kost.tipe === selectedTipe;

      // Price match
      const matchPrice =
        kost.harga >= priceMin &&
        (priceMax >= PRICE_MAX || priceMaxInput === '' ? true : kost.harga <= priceMax);

      // Facilities match (semua fasilitas terpilih harus ada)
      const matchFacilities = selectedFacilities.every(label => {
        const opt = facilityOptions.find(o => o.label === label);
        return !opt || kost.fasilitas.some(opt.test);
      });

      // Query match
      const matchQuery = 
        !searchQuery.trim() ||
        kost.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kost.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kost.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kost.fasilitas.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

      // Dekat kampus/stasiun atau lokasi pengguna: hanya kost yang punya koordinat dan berada dalam radius
      const dRef = landmark ? distances.get(kost.id)?.toLandmark : userLoc ? distances.get(kost.id)?.fromUser : undefined;
      const matchLandmark = !hasRadiusRef || (dRef !== undefined && dRef <= radius);

      return matchLoc && matchKecamatan && matchTipe && matchPrice && matchFacilities && matchQuery && matchLandmark;
    });
  }, [allKosts, selectedLocations, selectedKecamatan, selectedTipe, selectedFacilities, priceMin, priceMax, priceMaxInput, searchQuery, landmark, userLoc, hasRadiusRef, radius, distances]);

  // Urutan hasil
  const sortedKosts = useMemo(() => {
    const list = [...filteredKosts];
    if (sortBy === 'terdekat') {
      const key = (k: Kost) => {
        const d = distances.get(k.id);
        return (landmark ? d?.toLandmark : d?.fromUser) ?? Number.POSITIVE_INFINITY;
      };
      list.sort((a, b) => key(a) - key(b));
    } else if (sortBy === 'rating') list.sort((a, b) => (b.rating?.avg ?? 0) - (a.rating?.avg ?? 0) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0));
    else if (sortBy === 'termurah') list.sort((a, b) => a.harga - b.harga);
    else if (sortBy === 'termahal') list.sort((a, b) => b.harga - a.harga);
    else if (sortBy === 'terbaru') list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [filteredKosts, sortBy, distances, landmark]);

  // Halaman
  const totalPages = Math.max(1, Math.ceil(sortedKosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sortedKosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Kembali ke halaman 1 setiap filter / urutan berubah
  useEffect(() => {
    setPage(1);
  }, [selectedLocations, selectedKecamatan, selectedTipe, selectedFacilities, priceMin, priceMax, searchQuery, sortBy, landmarkId, radius, userLoc]);

  const goToPage = (p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Breadcrumb - Exactly as caridisekitar */}
        <nav className="text-xs text-slate-500 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Cari Kost</span>
        </nav>

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Cari Kost
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Temukan kost pilihan di sekitarmu dengan harga transparan dan kontak langsung pemilik.
            </p>
          </div>
        </div>

        {/* Mobile Sticky Search & Filter Bar (div.flex.items-center.gap-2.5 matching /maps) */}
        <div className="lg:hidden sticky top-[80px] z-[1000] bg-white/95 backdrop-blur-md py-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-slate-100 shadow-xs mb-3 space-y-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Pill Input */}
            <div className="flex-1 relative flex items-center bg-white rounded-full border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] focus-within:shadow-[0_6px_24px_rgba(249,115,22,0.18)] focus-within:border-[#F97316] transition-all px-2 py-1 min-h-[50px] sm:min-h-[54px]">
              <SearchSuggest
                className="w-full flex-1 min-w-0"
                inputClassName="w-full bg-transparent pl-4 pr-2 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none"
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={() => undefined}
                onPick={pickSuggestion}
                kosts={allKosts}
                placeholder="Cari nama, alamat, daerah..."
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 mr-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F97316] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#F97316]/30 cursor-pointer hover:scale-105 active:scale-95 transition-transform" 
                role="button" 
                aria-label="Cari"
              >
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
            </div>

            {/* Filter Icon Button (Triggers Popup Modal) */}
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              aria-label="Buka filter pencarian"
              title="Filter Pencarian"
              className={`relative inline-flex items-center justify-center w-[50px] h-[50px] sm:w-[54px] sm:h-[54px] rounded-full sm:rounded-2xl border transition-all active:scale-95 shrink-0 ${
                activeFilterCount > 0
                  ? 'bg-[#FFEDD5] border-[#F97316] text-[#C2410C] shadow-md shadow-[#F97316]/20 font-bold'
                  : 'bg-white border-slate-200/90 text-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-[#F97316] hover:text-[#C2410C]'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-[#F97316] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              {selectedLocations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full text-[11px]"
                >
                  <span>{loc}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleLocation(loc)}
                    className="hover:text-red-600 rounded-full"
                    aria-label={`Hapus filter ${loc}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {selectedKecamatan.map((kec) => (
                <span
                  key={kec}
                  className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full text-[11px]"
                >
                  <span>{kec}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleKecamatan(kec)}
                    className="hover:text-red-600 rounded-full"
                    aria-label={`Hapus filter ${kec}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {selectedTipe !== 'semua' && (
                <span className="inline-flex items-center gap-1 bg-[#FFEDD5] text-[#0F2A43] font-semibold px-2.5 py-1 rounded-full text-[11px] border border-[#F97316]/30">
                  <span>{tipeOptions.find(t => t.value === selectedTipe)?.label}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTipe('semua')}
                    className="hover:text-red-600 rounded-full"
                    aria-label="Hapus filter tipe"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {priceActive && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 font-semibold px-2.5 py-1 rounded-full text-[11px] border border-amber-200">
                  <span>Rp {priceMin.toLocaleString('id-ID')} - {priceMax < PRICE_MAX ? `Rp ${priceMax.toLocaleString('id-ID')}` : 'Maks'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPriceMin(PRICE_MIN);
                      setPriceMax(PRICE_MAX);
                      setPriceMinInput('');
                      setPriceMaxInput('');
                    }}
                    className="hover:text-red-600 rounded-full"
                    aria-label="Hapus filter harga"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {landmark && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full text-[11px]">
                  <span>Dekat {landmark.name}</span>
                  <button
                    type="button"
                    onClick={() => setLandmarkId(null)}
                    className="hover:text-red-600 rounded-full"
                    aria-label="Hapus filter landmark"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {userLoc && (
                <span className="inline-flex items-center gap-1 bg-[#FFEDD5] text-[#0F2A43] font-semibold px-2.5 py-1 rounded-full text-[11px]">
                  <span>Dekat Saya</span>
                  <button
                    type="button"
                    onClick={() => setUserLoc(null)}
                    className="hover:text-red-600 rounded-full"
                    aria-label="Hapus filter lokasi saya"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedFacilities.map((fac) => (
                <span
                  key={fac}
                  className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full text-[11px]"
                >
                  <span>{fac}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleFacility(fac)}
                    className="hover:text-red-600 rounded-full"
                    aria-label={`Hapus filter fasilitas ${fac}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-rose-600 hover:underline pl-1 cursor-pointer inline-flex items-center gap-1"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,340px)_minmax(0,1fr)] gap-6 items-start">
        {/* Sidebar filter: di desktop menempel di bawah header saat halaman digulir */}
        <aside
          className="hidden lg:block space-y-4 p-1 sm:p-2 lg:p-3 relative z-30 lg:z-30 lg:sticky lg:top-[81px] lg:max-h-[calc(100vh-81px)] lg:overflow-y-auto lg:overscroll-contain overflow-visible"
          aria-label="Filter pencarian kost"
          tabIndex={0}
        >
        {/* Sekitar Filter Bar Component */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)] space-y-4">
          {/* Top Row: Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-[1.4rem] -translate-y-1/2 z-10 pointer-events-none" />
            <SearchSuggest
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={() => undefined}
              onPick={pickSuggestion}
              kosts={allKosts}
              placeholder="Cari nama kost, area, kampus, stasiun..."
              inputClassName="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white transition-all"
            />
          </div>

          {/* Tombol filter (hanya di HP) */}
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="filter-panel"
            className="lg:hidden w-full inline-flex items-center justify-between gap-2 py-3 px-4 rounded-2xl border border-slate-300 bg-white text-sm font-bold text-slate-800"
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#C2410C]" />
              Filter
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#F97316] text-white text-[11px]">{activeFilterCount}</span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>

          <div id="filter-panel" className={`${filtersOpen ? 'block' : 'hidden'} lg:block space-y-4`}>
          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {/* 1. Location Dropdown */}
            <div ref={locationDropdownRef} className="relative text-xs">
              <label className="font-bold text-slate-700 mb-1.5 block">Lokasi / Area</label>
              <button
                type="button"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className={`w-full flex justify-between items-center py-2.5 px-3.5 bg-white rounded-xl border transition-all ${
                  selectedLocations.length > 0 
                    ? 'border-[#F97316] ring-2 ring-[#F97316]/20 font-semibold text-slate-900' 
                    : 'border-slate-300 text-slate-500'
                }`}
              >
                <span className="truncate">
                  {selectedLocations.length > 0 
                    ? selectedLocations.join(', ') 
                    : 'Pilih Lokasi Area'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLocationOpen && (
                <div className="absolute left-0 right-0 mt-2 z-[9999] bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-auto p-2 space-y-1">
                  {locationOptions.map((loc) => {
                    const isChecked = selectedLocations.includes(loc);
                    return (
                      <label
                        key={loc}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-colors ${
                          isChecked ? 'bg-[#FFEDD5] text-[#0F2A43] font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleLocation(loc)}
                            className="rounded border-slate-300 text-[#C2410C] focus:ring-[#F97316]"
                          />
                          <span>{loc}</span>
                        </div>
                        {isChecked && <Check className="w-3.5 h-3.5 text-[#C2410C]" />}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 1b. Kecamatan Dropdown (hanya muncul setelah Lokasi Area dipilih) */}
            {selectedLocations.length > 0 && (
              <div ref={kecamatanDropdownRef} className="relative text-xs">
                <label className="font-bold text-slate-700 mb-1.5 block">Kecamatan</label>
                <button
                  type="button"
                  onClick={() => setIsKecamatanOpen(!isKecamatanOpen)}
                  className={`w-full flex justify-between items-center py-2.5 px-3.5 bg-white rounded-xl border transition-all ${
                    selectedKecamatan.length > 0
                      ? 'border-[#F97316] ring-2 ring-[#F97316]/20 font-semibold text-slate-900'
                      : 'border-slate-300 text-slate-500'
                  }`}
                >
                  <span className="truncate">
                    {selectedKecamatan.length > 0 ? selectedKecamatan.join(', ') : 'Semua Kecamatan'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isKecamatanOpen ? 'rotate-180' : ''}`} />
                </button>

                {isKecamatanOpen && (
                  <div className="absolute left-0 right-0 mt-2 z-[9999] bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-auto p-2 space-y-1">
                    {selectedLocations.map((city) => (
                      <div key={city}>
                        <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">{city}</p>
                        {(JAKARTA_REGIONS[city] ?? []).map((kec) => {
                          const isChecked = selectedKecamatan.includes(kec);
                          return (
                            <label
                              key={kec}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-colors ${
                                isChecked ? 'bg-[#FFEDD5] text-[#0F2A43] font-bold' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleKecamatan(kec)}
                                  className="rounded border-slate-300 text-[#C2410C] focus:ring-[#F97316]"
                                />
                                <span>{kec}</span>
                              </div>
                              {isChecked && <Check className="w-3.5 h-3.5 text-[#C2410C]" />}
                            </label>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Tipe Kost Dropdown */}
            <div ref={tipeDropdownRef} className="relative text-xs">
              <label className="font-bold text-slate-700 mb-1.5 block">Tipe Kost</label>
              <button
                type="button"
                onClick={() => setIsTipeOpen(!isTipeOpen)}
                className={`w-full flex justify-between items-center py-2.5 px-3.5 bg-white rounded-xl border transition-all ${
                  selectedTipe !== 'semua' 
                    ? 'border-[#F97316] ring-2 ring-[#F97316]/20 font-semibold text-slate-900' 
                    : 'border-slate-300 text-slate-500'
                }`}
              >
                <span className="truncate">
                  {tipeOptions.find(t => t.value === selectedTipe)?.label || 'Pilih Tipe Kost'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isTipeOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTipeOpen && (
                <div className="absolute left-0 right-0 mt-2 z-[9999] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-1.5 space-y-1">
                  {tipeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedTipe(opt.value);
                        setIsTipeOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        selectedTipe === opt.value 
                          ? 'bg-[#FFEDD5] text-[#0F2A43] font-bold' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedTipe === opt.value && <Check className="w-3.5 h-3.5 text-[#C2410C]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Rentang Harga - Input Manual & Bar Geser */}
          <div className="text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700">Rentang Harga</span>
              {priceActive && (
                <button
                  type="button"
                  onClick={() => {
                    setPriceMin(PRICE_MIN);
                    setPriceMax(PRICE_MAX);
                    setPriceMinInput('');
                    setPriceMaxInput('');
                  }}
                  className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Reset Harga
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2.5">
              <div>
                <span className="block text-[11px] font-bold text-slate-600 mb-1">Dari</span>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label="Harga minimum dalam rupiah"
                    value={priceMinInput}
                    onChange={(e) => updateManualPrice('min', e.target.value)}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2.5 bg-white rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-600 mb-1">Sampai</span>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label="Harga maksimum dalam rupiah"
                    value={priceMaxInput}
                    onChange={(e) => updateManualPrice('max', e.target.value)}
                    placeholder="Tanpa batas"
                    className="w-full pl-9 pr-3 py-2.5 bg-white rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Slider Range */}
            <div className="price-range mt-3 mb-1">
              <div className="track" />
              <div
                className="fill"
                style={{
                  left: `${((Math.min(priceMin, PRICE_MAX) - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                  right: `${100 - ((Math.min(Math.max(priceMax, PRICE_MIN), PRICE_MAX) - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                }}
              />
              <input
                type="range"
                aria-label="Harga minimum"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={Math.min(priceMin, PRICE_MAX)}
                onChange={(e) => {
                  const next = Math.min(Number(e.target.value), (priceMax || PRICE_MAX) - PRICE_STEP);
                  setPriceMin(next);
                  setPriceMinInput(next > PRICE_MIN ? next.toLocaleString('id-ID') : '');
                }}
              />
              <input
                type="range"
                aria-label="Harga maksimum"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={Math.min(priceMax, PRICE_MAX)}
                onChange={(e) => {
                  const next = Math.max(Number(e.target.value), priceMin + PRICE_STEP);
                  setPriceMax(next);
                  setPriceMaxInput(next < PRICE_MAX ? next.toLocaleString('id-ID') : '');
                }}
              />
            </div>

            {/* Quick chips presets */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[
                { label: '< 1 Juta', min: 0, max: 1000000 },
                { label: '1 - 2 Juta', min: 1000000, max: 2000000 },
                { label: '2 - 3 Juta', min: 2000000, max: 3000000 },
                { label: '> 3 Juta', min: 3000000, max: PRICE_MAX },
              ].map((preset) => {
                const isSelected = priceMin === preset.min && priceMax === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setPriceMin(PRICE_MIN);
                        setPriceMax(PRICE_MAX);
                        setPriceMinInput('');
                        setPriceMaxInput('');
                      } else {
                        setPriceMin(preset.min);
                        setPriceMax(preset.max);
                        setPriceMinInput(preset.min > 0 ? preset.min.toLocaleString('id-ID') : '');
                        setPriceMaxInput(preset.max < PRICE_MAX ? preset.max.toLocaleString('id-ID') : '');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#FFEDD5] border-[#F97316] text-[#0F2A43] font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dekat kampus / stasiun & dekat saya */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] lg:grid-cols-1 gap-3 items-end text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_9rem] lg:grid-cols-1 gap-3">
              <div>
                <label htmlFor="landmark" className="font-bold text-slate-700 mb-1.5 block">Dekat kampus / stasiun</label>
                <select
                  id="landmark"
                  value={landmarkId ?? ''}
                  onChange={(e) => {
                    const v = e.target.value || null;
                    setLandmarkId(v);
                    if (v) setSortBy('terdekat');
                    else setSortBy((cur) => (cur === 'terdekat' && !userLoc ? 'rekomendasi' : cur));
                  }}
                  className={`w-full py-2.5 px-3.5 bg-white rounded-xl border ${landmark ? 'border-[#F97316] ring-2 ring-[#F97316]/20 font-semibold text-slate-900' : 'border-slate-300 text-slate-500'}`}
                >
                  <option value="">Semua lokasi</option>
                  <optgroup label="Kampus">
                    {LANDMARKS.filter((l) => l.type === 'kampus').map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </optgroup>
                  <optgroup label="Stasiun & MRT">
                    {LANDMARKS.filter((l) => l.type === 'stasiun').map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </optgroup>
                </select>
              </div>
              <div>
                <label htmlFor="radius" className="font-bold text-slate-700 mb-1.5 block">Dalam radius</label>
                <div className="flex items-center gap-2">
                  <input
                    id="radius"
                    type="number"
                    min={RADIUS_MIN / 1000}
                    max={RADIUS_MAX / 1000}
                    step={0.1}
                    value={radius / 1000}
                    disabled={!hasRadiusRef}
                    onChange={(e) => {
                      const km = Number(e.target.value);
                      if (Number.isFinite(km)) setRadius(Math.round(Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, km * 1000))));
                    }}
                    className="w-full py-2.5 px-3 bg-white rounded-xl border border-slate-300 text-slate-700 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                  <span className="font-semibold text-slate-600">km</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => (userLoc ? (setUserLoc(null), setSortBy((cur) => (cur === 'terdekat' && !landmark ? 'rekomendasi' : cur))) : locateMe())}
              disabled={locating}
              aria-pressed={Boolean(userLoc)}
              className={`inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border font-bold transition-colors ${userLoc ? 'bg-[#F97316] border-[#F97316] text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'} disabled:opacity-60`}
            >
              <LocateFixed className="w-4 h-4" />
              <span>{locating ? 'Mencari lokasi...' : userLoc ? 'Dekat saya: aktif' : 'Dekat saya'}</span>
            </button>
          </div>
          {hasRadiusRef && (
            <div className="text-xs space-y-1.5 -mt-1">
              <div className="flex items-center justify-between">
                <label htmlFor="radius-slider" className="font-bold text-slate-700">Atur radius pencarian</label>
                <span className="font-bold text-slate-900">{formatDistance(radius)}</span>
              </div>
              <input
                id="radius-slider"
                type="range"
                min={RADIUS_MIN}
                max={RADIUS_MAX}
                step={RADIUS_STEP}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-[#F97316]"
              />
              <p className="text-[11px] text-slate-500">
                Jarak dihitung garis lurus dari {landmark ? landmark.name : 'lokasimu'} (perkiraan), bukan jarak tempuh.
              </p>
            </div>
          )}

          {/* Fasilitas */}
          <div className="text-xs">
            <label className="font-bold text-slate-700 mb-2 block">Fasilitas</label>
            <div className="flex flex-wrap gap-2">
              {facilityOptions.map((opt) => {
                const active = selectedFacilities.includes(opt.label);
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleToggleFacility(opt.label)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs transition-all ${
                      active
                        ? 'bg-[#F97316] border-[#F97316] text-[#0F2A43] font-bold shadow-xs'
                        : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400 font-medium'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Filter aktif:</span>
              {selectedLocations.map(loc => (
                <span key={loc} className="inline-flex items-center gap-1 bg-[#FFEDD5] text-[#0F2A43] font-bold px-2.5 py-1 rounded-full border border-[#F97316]/40">
                  <span>{loc}</span>
                  <button onClick={() => handleToggleLocation(loc)} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedKecamatan.map(kec => (
                <span key={kec} className="inline-flex items-center gap-1 bg-[#FFEDD5] text-[#0F2A43] font-bold px-2.5 py-1 rounded-full border border-[#F97316]/40">
                  <span>Kec. {kec}</span>
                  <button onClick={() => handleToggleKecamatan(kec)} aria-label={`Hapus kecamatan ${kec}`} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedTipe !== 'semua' && (
                <span className="inline-flex items-center gap-1 bg-[#FFEDD5] text-[#0F2A43] font-bold px-2.5 py-1 rounded-full border border-[#F97316]/40">
                  <span>Tipe: {selectedTipe}</span>
                  <button onClick={() => setSelectedTipe('semua')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedFacilities.map(label => (
                <span key={label} className="inline-flex items-center gap-1 bg-[#FFEDD5] text-[#0F2A43] font-bold px-2.5 py-1 rounded-full border border-[#F97316]/40">
                  <span>{label}</span>
                  <button onClick={() => handleToggleFacility(label)} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {priceActive && (
                <span className="inline-flex items-center gap-1 bg-[#FFEDD5] text-[#0F2A43] font-bold px-2.5 py-1 rounded-full border border-[#F97316]/40">
                  <span>{formatRp(priceMin)} - {priceMax >= PRICE_MAX || priceMaxInput === '' ? `${formatRp(PRICE_MAX)}+` : formatRp(priceMax)}</span>
                  <button onClick={() => { setPriceMin(PRICE_MIN); setPriceMax(PRICE_MAX); setPriceMinInput(''); setPriceMaxInput(''); }} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {landmark && (
                <span className="inline-flex items-center gap-1 bg-[#FFEDD5] text-[#0F2A43] font-bold px-2.5 py-1 rounded-full border border-[#F97316]/40">
                  <span>Dekat {landmark.name} (&lt; {radius < 1000 ? `${radius} m` : `${radius / 1000} km`})</span>
                  <button onClick={() => setLandmarkId(null)} aria-label="Hapus filter lokasi acuan" className="hover:text-red-600"><X className="w-3 h-3" /></button>
                </span>
              )}
              {userLoc && (
                <span className="inline-flex items-center gap-1 bg-[#FFEDD5] text-[#0F2A43] font-bold px-2.5 py-1 rounded-full border border-[#F97316]/40">
                  <span>Dekat saya{!landmark && ` (< ${formatDistance(radius)})`}</span>
                  <button onClick={() => setUserLoc(null)} aria-label="Matikan dekat saya" className="hover:text-red-600"><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full">
                  <span>&quot;{searchQuery}&quot;</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={resetAllFilters}
                className="text-red-600 hover:underline font-bold text-xs ml-auto"
              >
                Reset Filter
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Pencarian tersimpan */}
        {(hasActiveFilters || saved.list.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 text-xs px-1" aria-label="Pencarian tersimpan">
            {hasActiveFilters && (savingName === null ? (
              <button
                type="button"
                onClick={() => setSavingName(searchQuery.trim() || (landmark ? `Dekat ${landmark.name}` : ''))}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-dashed border-[#F97316] text-[#C2410C] font-bold hover:bg-[#FFEDD5] transition-colors"
              >
                <BookmarkPlus className="w-3.5 h-3.5" /> Simpan pencarian ini
              </button>
            ) : (
              <form
                className="inline-flex items-center gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (saved.save(savingName, currentState())) toast('Pencarian disimpan di browser ini.', 'success');
                  else toast(`Maksimal ${MAX_SAVED_SEARCHES} pencarian tersimpan. Hapus salah satu dulu.`, 'error');
                  setSavingName(null);
                }}
              >
                <label htmlFor="save-name" className="sr-only">Nama pencarian</label>
                <input
                  id="save-name"
                  autoFocus
                  value={savingName}
                  maxLength={40}
                  onChange={(e) => setSavingName(e.target.value)}
                  placeholder="Nama pencarian"
                  className="px-3 py-1.5 rounded-full border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
                <button type="submit" className="px-3 py-1.5 rounded-full bg-[#F97316] text-white font-bold hover:bg-[#EA580C]">Simpan</button>
                <button type="button" onClick={() => setSavingName(null)} className="px-2 py-1.5 text-slate-500 hover:text-slate-800">Batal</button>
              </form>
            ))}
            {saved.list.map((sv) => (
              <span key={sv.id} className="inline-flex items-center rounded-full bg-white border border-slate-200 overflow-hidden">
                <button type="button" onClick={() => applyState(sv.state)} className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 font-semibold text-slate-700 hover:bg-slate-50">
                  <Bookmark className="w-3.5 h-3.5 text-[#F97316]" /> {sv.name}
                </button>
                <button type="button" onClick={() => saved.remove(sv.id)} aria-label={`Hapus pencarian ${sv.name}`} className="px-2 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        </aside>

        {/* Kolom hasil (lebih lebar dari sidebar) */}
        <div className="space-y-6 min-w-0">
        {/* Ringkasan, urutan & tampilan - Sticky sejajar dengan sidebar filter di kiri */}
        <div className="static lg:sticky lg:top-[81px] z-20 p-1 sm:p-2 lg:p-3 mb-2 bg-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 bg-white p-4 sm:px-6 sm:py-3.5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <p className="font-medium" suppressHydrationWarning>
            {sortedKosts.length > 0
              ? `Menampilkan ${sortedKosts.length} kost terverifikasi`
              : 'Tidak ada kost yang cocok dengan filter'}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-3 pr-1.5 py-1 text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">Urutkan</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="bg-transparent font-bold text-[#0F2A43] py-1 pr-1 focus:outline-none cursor-pointer"
                aria-label="Urutkan hasil"
              >
                {SORT_OPTIONS.filter((o) => o.value !== 'terdekat' || landmark || userLoc).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <div className="inline-flex bg-white border border-slate-200 rounded-full p-1 shadow-2xs" role="group" aria-label="Pilih tampilan">
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-pressed={view === 'grid'}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-colors ${view === 'grid' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Daftar
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                aria-pressed={view === 'list'}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-colors ${view === 'list' ? 'bg-[#F97316] text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
              <button
                type="button"
                onClick={() => router.push(searchQuery ? `/maps?q=${encodeURIComponent(searchQuery)}` : '/maps')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 cursor-pointer"
              >
                <MapIcon className="w-3.5 h-3.5" /> Peta
              </button>
            </div>
          </div>
        </div>
        </div>

        {sortedKosts.length > 0 ? (
          view === 'grid' || view === 'list' ? (
            <>
              {view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-3 pt-4 sm:pt-6 pb-8 overflow-visible" style={{ overflow: 'visible' }}>
                  {pageItems.map((kost, i) => (
                    <KostCard key={kost.id} kost={kost} priority={currentPage === 1 && i < 4} distanceLabel={distanceLabelFor(kost)} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4 p-3 pt-4 sm:pt-6 pb-8 overflow-visible" style={{ overflow: 'visible' }}>
                  {pageItems.map((kost, i) => (
                    <KostCard key={kost.id} kost={kost} layout="list" priority={currentPage === 1 && i < 3} distanceLabel={distanceLabelFor(kost)} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-1 sm:gap-1.5 pt-6 pb-2" aria-label="Halaman hasil">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Halaman sebelumnya"
                    className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>
                  {getPaginationRange(currentPage, totalPages).map((item, idx) => {
                    if (typeof item === 'string') {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-5 sm:w-7 text-center text-xs font-bold text-slate-400 select-none"
                          aria-hidden="true"
                        >
                          …
                        </span>
                      );
                    }
                    const isCurrent = currentPage === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => goToPage(item)}
                        aria-current={isCurrent ? 'page' : undefined}
                        aria-label={`Ke halaman ${item}`}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                          isCurrent
                            ? 'bg-[#F97316] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Halaman berikutnya"
                    className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-5 items-start">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 xl:grid-cols-1 xl:max-h-[640px] xl:overflow-y-auto p-1.5 sm:p-2 xl:p-4 order-2 xl:order-1">
                {sortedKosts.map((kost) => (
                  <div
                    key={kost.id}
                    onMouseEnter={() => setMapSelected(kost)}
                    className={`rounded-xl transition-all overflow-visible ${mapSelected?.id === kost.id ? 'ring-2 ring-[#F97316] shadow-md' : ''}`}
                    style={{ overflow: 'visible' }}
                  >
                    <KostCard kost={kost} distanceLabel={distanceLabelFor(kost)} />
                  </div>
                ))}
              </div>
              <div className="h-[420px] xl:h-[640px] xl:sticky xl:top-24 order-1 xl:order-2 rounded-3xl overflow-hidden border border-slate-200">
                <MapsComponent kosts={sortedKosts} selectedKost={mapSelected} onSelectKost={setMapSelected} />
              </div>
            </div>
          )
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Belum ada kost ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat semua daftar kost.
            </p>
            <button
              onClick={resetAllFilters}
              className="text-xs font-bold text-[#0F2A43] hover:underline"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

        </div>
        </div>
      </div>
    
      {/* ========================================================================= */}
      {/* POPUP FILTER MODAL (Sama persis seperti filter di /maps) */}
      {/* ========================================================================= */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity z-0"
            onClick={() => setIsFilterModalOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter Pencarian Kost"
            className="relative w-full max-w-lg max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Filter Pencarian</h3>
                  <p className="text-[11px] text-slate-500 font-medium" suppressHydrationWarning>
                    {sortedKosts.length} kost cocok dengan kriteria
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Tutup filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* 1. Lokasi / Area & Kecamatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1a. Lokasi Dropdown */}
                <div ref={modalLocationRef} className="relative">
                  <label className="font-bold text-slate-700 mb-1.5 block">Lokasi / Area</label>
                  <button
                    type="button"
                    onClick={() => setIsModalLocationOpen(!isModalLocationOpen)}
                    className={`w-full flex justify-between items-center py-2.5 px-3.5 bg-white rounded-xl border transition-all ${
                      selectedLocations.length > 0 
                        ? 'border-[#F97316] ring-2 ring-[#F97316]/20 font-semibold text-slate-900' 
                        : 'border-slate-300 text-slate-500'
                    }`}
                  >
                    <span className="truncate">
                      {selectedLocations.length > 0 
                        ? selectedLocations.join(', ') 
                        : 'Pilih Lokasi Area'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isModalLocationOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isModalLocationOpen && (
                    <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-auto p-2 space-y-1">
                      {locationOptions.map((loc) => {
                        const isChecked = selectedLocations.includes(loc);
                        return (
                          <label
                            key={loc}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-colors ${
                              isChecked ? 'bg-[#FFEDD5] text-[#0F2A43] font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleLocation(loc)}
                                className="rounded border-slate-300 text-[#C2410C] focus:ring-[#F97316]"
                              />
                              <span>{loc}</span>
                            </div>
                            {isChecked && <Check className="w-3.5 h-3.5 text-[#C2410C]" />}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 1b. Kecamatan Dropdown */}
                <div ref={modalKecamatanRef} className="relative">
                  <label className="font-bold text-slate-700 mb-1.5 block">Kecamatan</label>
                  <button
                    type="button"
                    disabled={selectedLocations.length === 0}
                    onClick={() => setIsModalKecamatanOpen(!isModalKecamatanOpen)}
                    className={`w-full flex justify-between items-center py-2.5 px-3.5 bg-white rounded-xl border transition-all disabled:opacity-50 disabled:bg-slate-50 ${
                      selectedKecamatan.length > 0
                        ? 'border-[#F97316] ring-2 ring-[#F97316]/20 font-semibold text-slate-900'
                        : 'border-slate-300 text-slate-500'
                    }`}
                  >
                    <span className="truncate">
                      {selectedLocations.length === 0 
                        ? 'Pilih area dahulu' 
                        : selectedKecamatan.length > 0 
                          ? selectedKecamatan.join(', ') 
                          : 'Semua Kecamatan'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isModalKecamatanOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isModalKecamatanOpen && selectedLocations.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-auto p-2 space-y-1">
                      {selectedLocations.map((city) => (
                        <div key={city}>
                          <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">{city}</p>
                          {(JAKARTA_REGIONS[city] ?? []).map((kec) => {
                            const isChecked = selectedKecamatan.includes(kec);
                            return (
                              <label
                                key={kec}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-colors ${
                                  isChecked ? 'bg-[#FFEDD5] text-[#0F2A43] font-bold' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleKecamatan(kec)}
                                    className="rounded border-slate-300 text-[#C2410C] focus:ring-[#F97316]"
                                  />
                                  <span>{kec}</span>
                                </div>
                                {isChecked && <Check className="w-3.5 h-3.5 text-[#C2410C]" />}
                              </label>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Tipe Kost */}
              <div>
                <label className="font-bold text-slate-700 mb-1.5 block">Tipe Kost</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {tipeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedTipe(opt.value)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        selectedTipe === opt.value
                          ? 'bg-[#FFEDD5] border-[#F97316] text-[#0F2A43] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Rentang Harga */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700">Rentang Harga</span>
                  {priceActive && (
                    <button
                      type="button"
                      onClick={() => {
                        setPriceMin(PRICE_MIN);
                        setPriceMax(PRICE_MAX);
                        setPriceMinInput('');
                        setPriceMaxInput('');
                      }}
                      className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Reset Harga
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-2.5">
                  <div>
                    <span className="block text-[11px] font-bold text-slate-600 mb-1">Dari</span>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={priceMinInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setPriceMinInput(val);
                          setPriceMin(val === '' ? PRICE_MIN : Math.max(PRICE_MIN, Number(val)));
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-600 mb-1">Sampai</span>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Maks"
                        value={priceMaxInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setPriceMaxInput(val);
                          setPriceMax(val === '' ? PRICE_MAX : Math.min(PRICE_MAX, Number(val)));
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {PRICE_PRESETS.map((preset) => {
                    const isSelected = priceMin === preset.min && priceMax === preset.max;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setPriceMin(PRICE_MIN);
                            setPriceMax(PRICE_MAX);
                            setPriceMinInput('');
                            setPriceMaxInput('');
                          } else {
                            setPriceMin(preset.min);
                            setPriceMax(preset.max);
                            setPriceMinInput(preset.min > 0 ? preset.min.toLocaleString('id-ID') : '');
                            setPriceMaxInput(preset.max < PRICE_MAX ? preset.max.toLocaleString('id-ID') : '');
                          }
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#FFEDD5] border-[#F97316] text-[#0F2A43] shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Dekat kampus / stasiun */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                  <div ref={modalLandmarkRef} className="relative">
                    <label className="font-bold text-slate-700 mb-1.5 block">Dekat kampus / stasiun</label>
                    <button
                      type="button"
                      onClick={() => setIsModalLandmarkOpen(!isModalLandmarkOpen)}
                      className={`w-full flex justify-between items-center py-2.5 px-3.5 bg-white rounded-xl border transition-all ${
                        landmark
                          ? 'border-[#F97316] ring-2 ring-[#F97316]/20 font-semibold text-slate-900'
                          : 'border-slate-300 text-slate-500'
                      }`}
                    >
                      <span className="truncate">{landmark ? landmark.name : 'Semua lokasi'}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isModalLandmarkOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isModalLandmarkOpen && (
                      <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-auto p-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setLandmarkId(null);
                            setIsModalLandmarkOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                            !landmarkId ? 'bg-[#FFEDD5] text-[#0F2A43] font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>Semua lokasi</span>
                          {!landmarkId && <Check className="w-3.5 h-3.5 text-[#C2410C]" />}
                        </button>

                        <div>
                          <p className="px-3 pt-2 pb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Kampus</p>
                          {LANDMARKS.filter((l) => l.type === 'kampus').map((l) => {
                            const isSelected = landmarkId === l.id;
                            return (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => {
                                  setLandmarkId(l.id);
                                  setIsModalLandmarkOpen(false);
                                  setSortBy('terdekat');
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                                  isSelected ? 'bg-[#FFEDD5] text-[#0F2A43] font-bold' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span className="truncate">{l.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        <div>
                          <p className="px-3 pt-2 pb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Stasiun & MRT</p>
                          {LANDMARKS.filter((l) => l.type === 'stasiun').map((l) => {
                            const isSelected = landmarkId === l.id;
                            return (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => {
                                  setLandmarkId(l.id);
                                  setIsModalLandmarkOpen(false);
                                  setSortBy('terdekat');
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                                  isSelected ? 'bg-[#FFEDD5] text-[#0F2A43] font-bold' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span className="truncate">{l.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => (userLoc ? (setUserLoc(null), setSortBy((cur) => (cur === 'terdekat' && !landmark ? 'rekomendasi' : cur))) : locateMe())}
                    disabled={locating}
                    aria-pressed={Boolean(userLoc)}
                    className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl border font-bold transition-colors shrink-0 ${userLoc ? 'bg-[#F97316] border-[#F97316] text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'} disabled:opacity-60`}
                  >
                    <LocateFixed className="w-4 h-4" />
                    <span>{locating ? 'Mencari...' : userLoc ? 'Dekat saya: aktif' : 'Dekat saya'}</span>
                  </button>
                </div>

                {hasRadiusRef && (
                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>Radius pencarian:</span>
                      <span className="text-[#0F2A43]">{formatDistance(radius)}</span>
                    </div>
                    <input
                      type="range"
                      min={RADIUS_MIN}
                      max={RADIUS_MAX}
                      step={RADIUS_STEP}
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full accent-[#F97316]"
                    />
                  </div>
                )}
              </div>

              {/* 5. Fasilitas */}
              <div>
                <label className="font-bold text-slate-700 mb-2 block">Fasilitas</label>
                <div className="flex flex-wrap gap-1.5">
                  {facilityOptions.map((opt) => {
                    const active = selectedFacilities.includes(opt.label);
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleToggleFacility(opt.label)}
                        aria-pressed={active}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                          active
                            ? 'bg-[#F97316] border-[#F97316] text-white font-bold shadow-xs'
                            : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400 font-medium'
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" />}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-bold text-slate-600 hover:text-rose-600 transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Semua</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <span>Lihat {sortedKosts.length} Kost</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
