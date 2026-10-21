'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Kost } from '@/lib/types';
import SearchSuggest from '@/components/SearchSuggest';
import type { Suggestion } from '@/lib/suggestions';
import { LANDMARKS, getLandmark, haversine, formatDistance } from '@/lib/geo';
import { JAKARTA_REGIONS, JAKARTA_CITIES, getKostCity, getKostKecamatan } from '@/lib/jakarta-regions';
import { FACILITY_CATEGORIES } from '@/lib/facilities';
import { toast } from '@/lib/toast';
import '@/app/cari-kost/price-slider.css';
import { 
  Search, 
  MapPin, 
  Compass, 
  ChevronRight,
  ChevronDown,
  Building2,
  SlidersHorizontal,
  X,
  Check,
  LocateFixed,
  Sparkles,
  RotateCcw
} from 'lucide-react';

const PRICE_MIN = 0;
const PRICE_MAX = 10000000;
const PRICE_STEP = 100000;
const RADIUS_MIN = 100;
const RADIUS_MAX = 20000;
const RADIUS_STEP = 100;

// Dynamic import for Leaflet map component to prevent SSR window reference error
const MapsComponent = dynamic(() => import('@/components/MapsComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] lg:h-full bg-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-3">
      <Compass className="w-8 h-8 animate-spin text-[#F97316]" />
      <span className="text-xs font-bold text-slate-500">Memuat Peta Kost Sekitar...</span>
    </div>
  ),
});

export default function MapsClient({ kosts: allKosts }: { kosts: Kost[] }) {
  // Search & Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKost, setSelectedKost] = useState<Kost | null>(allKosts[0] || null);

  // Filter States
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedKecamatan, setSelectedKecamatan] = useState<string[]>([]);
  const [selectedTipe, setSelectedTipe] = useState<string>('semua');
  const [priceMin, setPriceMin] = useState<number>(PRICE_MIN);
  const [priceMax, setPriceMax] = useState<number>(PRICE_MAX);
  const [priceMinInput, setPriceMinInput] = useState('');
  const [priceMaxInput, setPriceMaxInput] = useState('');
  const [landmarkId, setLandmarkId] = useState<string | null>(null);
  const [radius, setRadius] = useState(2000);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  // Filter dropdown states inside modal
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isKecamatanDropdownOpen, setIsKecamatanDropdownOpen] = useState(false);
  const [isTipeDropdownOpen, setIsTipeDropdownOpen] = useState(false);
  const [isLandmarkDropdownOpen, setIsLandmarkDropdownOpen] = useState(false);

  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const kecamatanDropdownRef = useRef<HTMLDivElement>(null);
  const tipeDropdownRef = useRef<HTMLDivElement>(null);
  const landmarkDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
      if (kecamatanDropdownRef.current && !kecamatanDropdownRef.current.contains(event.target as Node)) {
        setIsKecamatanDropdownOpen(false);
      }
      if (tipeDropdownRef.current && !tipeDropdownRef.current.contains(event.target as Node)) {
        setIsTipeDropdownOpen(false);
      }
      if (landmarkDropdownRef.current && !landmarkDropdownRef.current.contains(event.target as Node)) {
        setIsLandmarkDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modal on Escape
  useEffect(() => {
    if (!isFilterModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFilterModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFilterModalOpen]);

  const landmark = getLandmark(landmarkId);
  const hasRadiusRef = Boolean(landmark || userLoc);

  // Distance calculations
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

  const locateMe = () => {
    if (!('geolocation' in navigator)) {
      toast('Browser kamu tidak mendukung deteksi lokasi.', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast('Lokasimu terdeteksi.', 'success');
      },
      (err) => {
        setLocating(false);
        toast(err.code === err.PERMISSION_DENIED ? 'Izin lokasi ditolak di browser.' : 'Lokasimu belum bisa dideteksi.', 'error');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const updateManualPrice = (type: 'min' | 'max', rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '');
    const num = digits === '' ? 0 : Number(digits);
    if (type === 'min') {
      setPriceMinInput(digits ? num.toLocaleString('id-ID') : '');
      setPriceMin(Math.min(num, priceMax));
    } else {
      setPriceMaxInput(digits ? num.toLocaleString('id-ID') : '');
      setPriceMax(digits === '' ? PRICE_MAX : Math.max(num, priceMin));
    }
  };

  const handleToggleLocation = (city: string) => {
    setSelectedLocations(prev => {
      const next = prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city];
      // Clean up kecamatan that don't belong to selected cities
      setSelectedKecamatan(curKec => curKec.filter(k => next.some(c => JAKARTA_REGIONS[c]?.includes(k))));
      return next;
    });
  };

  const handleToggleKecamatan = (kec: string) => {
    setSelectedKecamatan(prev => prev.includes(kec) ? prev.filter(k => k !== kec) : [...prev, kec]);
  };

  const handleToggleFacility = (label: string) => {
    setSelectedFacilities(prev => prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label]);
  };

  const pickSuggestion = (sg: Suggestion) => {
    if (sg.kind === 'area') {
      const city = JAKARTA_CITIES.find(c => c.toLowerCase() === sg.value.toLowerCase());
      if (city && !selectedLocations.includes(city)) {
        setSelectedLocations(cur => [...cur, city]);
      }
      setSearchQuery(sg.value);
    } else if (sg.kind === 'kampus' || sg.kind === 'stasiun') {
      setLandmarkId(sg.value);
    } else {
      setSearchQuery(sg.value);
    }
  };

  const priceActive = priceMin > PRICE_MIN || (priceMax < PRICE_MAX && priceMaxInput !== '');

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (selectedLocations.length > 0) c += selectedLocations.length;
    if (selectedKecamatan.length > 0) c += selectedKecamatan.length;
    if (selectedTipe !== 'semua') c += 1;
    if (priceActive) c += 1;
    if (landmarkId || userLoc) c += 1;
    if (selectedFacilities.length > 0) c += selectedFacilities.length;
    return c;
  }, [selectedLocations, selectedKecamatan, selectedTipe, priceActive, landmarkId, userLoc, selectedFacilities]);

  const resetAllFilters = () => {
    setSelectedLocations([]);
    setSelectedKecamatan([]);
    setSelectedTipe('semua');
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
    setPriceMinInput('');
    setPriceMaxInput('');
    setLandmarkId(null);
    setUserLoc(null);
    setSelectedFacilities([]);
    toast('Semua filter direset', 'info');
  };

  // Filtered kosts matching search query AND all active filters
  const filteredKosts = useMemo(() => {
    return allKosts.filter(kost => {
      // 1. Search Query Match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQ = 
          kost.nama.toLowerCase().includes(q) ||
          kost.area.toLowerCase().includes(q) ||
          kost.alamat.toLowerCase().includes(q) ||
          kost.tipe.toLowerCase().includes(q) ||
          kost.fasilitas.some(f => f.toLowerCase().includes(q));
        if (!matchQ) return false;
      }

      // 2. Location & Kecamatan Match
      if (selectedLocations.length > 0) {
        const city = getKostCity(kost);
        if (!city || !selectedLocations.some(l => l.toLowerCase() === city.toLowerCase())) return false;
      }
      if (selectedKecamatan.length > 0) {
        const kec = getKostKecamatan(kost);
        if (!kec || !selectedKecamatan.some(k => k.toLowerCase() === kec.toLowerCase())) return false;
      }

      // 3. Tipe Match
      if (selectedTipe !== 'semua' && kost.tipe !== selectedTipe) return false;

      // 4. Price Match
      if (kost.harga < priceMin) return false;
      if (priceMax < PRICE_MAX && priceMaxInput !== '' && kost.harga > priceMax) return false;

      // 5. Facilities Match
      if (selectedFacilities.length > 0) {
        const hasAll = selectedFacilities.every(label => {
          const opt = FACILITY_CATEGORIES.find(o => o.label === label);
          return !opt || kost.fasilitas.some(opt.test);
        });
        if (!hasAll) return false;
      }

      // 6. Landmark / Radius Match
      if (hasRadiusRef) {
        const dRef = landmark ? distances.get(kost.id)?.toLandmark : userLoc ? distances.get(kost.id)?.fromUser : undefined;
        if (dRef === undefined || dRef > radius) return false;
      }

      return true;
    });
  }, [allKosts, searchQuery, selectedLocations, selectedKecamatan, selectedTipe, priceMin, priceMax, priceMaxInput, selectedFacilities, hasRadiusRef, landmark, userLoc, radius, distances]);

  // Keep selected kost valid
  useEffect(() => {
    if (selectedKost && !filteredKosts.some(k => k.id === selectedKost.id)) {
      setSelectedKost(filteredKosts[0] || null);
    }
  }, [filteredKosts, selectedKost]);

  const tipeOptions = [
    { label: 'Semua Tipe', value: 'semua' },
    { label: 'Kost Putri', value: 'putri' },
    { label: 'Kost Putra', value: 'putra' },
    { label: 'Kost Campur', value: 'campur' },
  ];

  const pricePresets = [
    { label: '< 1 Juta', min: 0, max: 1000000 },
    { label: '1 - 2 Juta', min: 1000000, max: 2000000 },
    { label: '2 - 3 Juta', min: 2000000, max: 3000000 },
    { label: '> 3 Juta', min: 3000000, max: PRICE_MAX },
  ];

  return (
    <div className="min-h-screen bg-white pb-16 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Maps</span>
        </nav>

        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Maps
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Jelajahi kost di sekitarmu langsung dari peta interaktif.
            </p>
          </div>

          
        </div>

        {/* Mobile Sticky Search Bar (div.flex.items-center.gap-2.5) */}
        <div className="lg:hidden sticky top-[80px] z-30 bg-white/95 backdrop-blur-md py-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-slate-100 shadow-xs space-y-2">
          {/* Search Bar (div.search-input style from /) + Filter Icon Button */}
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
          {activeFilterCount > 0 && (
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
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          )}
        </div>

        {/* Main 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Search & Kost List */}
          <div className="w-full lg:w-1/2 xl:w-2/5 space-y-4">
            
            {/* Search Bar + Filter Bar (Sticky on Desktop) */}
            <div className="hidden lg:block lg:sticky lg:top-[81px] z-20 bg-white space-y-3 pb-3 lg:pt-3 -mx-1 px-1">
              
              {/* Search Bar (div.search-input style from /) + Filter Icon Button */}
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

              {/* Active Filter Badges (Removable Quick Chips) */}
              {activeFilterCount > 0 && (
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
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
              )}

              {/* "Lokasi di sekitarmu" Section Title */}
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold px-1 pt-1">
                <div className="flex items-center gap-1.5 text-[#0F2A43]">
                  <Compass className="w-4 h-4 text-[#C2410C]" />
                  <span>Lokasi di sekitarmu</span>
                </div>
                <span className="text-slate-400 font-medium" suppressHydrationWarning>
                  {filteredKosts.length} kost ditemukan
                </span>
              </div>

            </div>

            {/* Kost Mini Cards Grid */}
            <div className="space-y-4">
              {filteredKosts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3.5">
                  {filteredKosts.map((kost) => {
                    const isSelected = selectedKost?.id === kost.id;
                    const thumbMedia = kost.media?.find(m => m.tipe === 'foto_gedung') || kost.media?.[0];
                    const thumbUrl = thumbMedia?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80';

                    const tipeColor = {
                      putri: 'bg-[#FFF0F5] text-[#D81B60]',
                      putra: 'bg-[#EBF5FB] text-[#0F2A43]',
                      campur: 'bg-[#F4ECF7] text-[#6C3483]',
                    }[kost.tipe];

                    return (
                      <div
                        key={kost.id}
                        onClick={() => setSelectedKost(kost)}
                        className={`cursor-pointer group rounded-2xl p-2.5 border transition-all text-left bg-white ${
                          isSelected 
                            ? 'border-[#F97316] ring-2 ring-[#F97316]/50 shadow-md bg-[#FFEDD5]/40' 
                            : 'border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm'
                        }`}
                      >
                        {/* Image Thumbnail */}
                        <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 mb-2">
                          <Image
                            src={thumbUrl}
                            alt={kost.nama}
                            fill
                            sizes="(max-width: 640px) 50vw, 240px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full capitalize shadow-xs backdrop-blur-xs ${tipeColor}`}>
                            {kost.tipe}
                          </span>
                        </div>

                        {/* Content */}
                        <h4 className="font-extrabold text-slate-900 text-xs truncate group-hover:text-[#0F2A43] transition-colors">
                          {kost.nama}
                        </h4>
                        <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{kost.area}</span>
                        </p>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-baseline justify-between">
                          <span className="text-xs font-black text-slate-900" suppressHydrationWarning>
                            Rp {(kost.harga / 1000000).toFixed(1)} Jt
                          </span>
                          <span className="text-[10px] text-slate-400">/bln</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-3">
                  <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">Tidak ada kost yang cocok</p>
                  <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau sesuaikan filter Anda.</p>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-[#F97316] hover:underline cursor-pointer"
                  >
                    Reset Semua Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Interactive Leaflet Map */}
          <div className="w-full lg:w-1/2 xl:w-3/5 h-[360px] sm:h-[460px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-24 order-first lg:order-last">
            <MapsComponent
              kosts={filteredKosts}
              selectedKost={selectedKost}
              onSelectKost={setSelectedKost}
            />
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* POPUP FILTER MODAL (Sama persis seperti filter di /cari-kost) */}
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
                    {filteredKosts.length} kost cocok dengan kriteria
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
                <div ref={locationDropdownRef} className="relative">
                  <label className="font-bold text-slate-700 mb-1.5 block">Lokasi / Area</label>
                  <button
                    type="button"
                    onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
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
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isLocationDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-auto p-2 space-y-1">
                      {JAKARTA_CITIES.map((loc) => {
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
                <div ref={kecamatanDropdownRef} className="relative">
                  <label className="font-bold text-slate-700 mb-1.5 block">Kecamatan</label>
                  <button
                    type="button"
                    disabled={selectedLocations.length === 0}
                    onClick={() => setIsKecamatanDropdownOpen(!isKecamatanDropdownOpen)}
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
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isKecamatanDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isKecamatanDropdownOpen && selectedLocations.length > 0 && (
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
              <div ref={tipeDropdownRef} className="relative">
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
                        aria-label="Harga minimum dalam rupiah"
                        value={priceMinInput}
                        onChange={(e) => updateManualPrice('min', e.target.value)}
                        placeholder="0"
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all"
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
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all"
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

                {/* Quick presets */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {pricePresets.map((preset) => {
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

              {/* 4. Dekat kampus / stasiun */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                  <div ref={landmarkDropdownRef} className="relative">
                    <label className="font-bold text-slate-700 mb-1.5 block">Dekat kampus / stasiun</label>
                    <button
                      type="button"
                      onClick={() => setIsLandmarkDropdownOpen(!isLandmarkDropdownOpen)}
                      className={`w-full flex justify-between items-center py-2.5 px-3.5 bg-white rounded-xl border transition-all ${
                        landmark
                          ? 'border-[#F97316] ring-2 ring-[#F97316]/20 font-semibold text-slate-900'
                          : 'border-slate-300 text-slate-500'
                      }`}
                    >
                      <span className="truncate">{landmark ? landmark.name : 'Semua lokasi'}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isLandmarkDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isLandmarkDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-auto p-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setLandmarkId(null);
                            setIsLandmarkDropdownOpen(false);
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
                                  setIsLandmarkDropdownOpen(false);
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
                                  setIsLandmarkDropdownOpen(false);
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
                    onClick={() => (userLoc ? setUserLoc(null) : locateMe())}
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
                  {FACILITY_CATEGORIES.map((opt) => {
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
                <span>Lihat {filteredKosts.length} Kost</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
