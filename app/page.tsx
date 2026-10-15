'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { INITIAL_KOSTS } from '@/lib/mock-data';
import KostCard from '@/components/KostCard';
import { useAuth } from '@/lib/auth-context';
import { Search, MapPin, Sparkles, ShieldCheck, QrCode, Lock, CheckCircle2, SlidersHorizontal, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { subscription } = useAuth();
  const [selectedArea, setSelectedArea] = useState<string>('semua');
  const [selectedTipe, setSelectedTipe] = useState<string>('semua');
  const [maxHarga, setMaxHarga] = useState<number>(3500000);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const areas = ['semua', 'Kuningan', 'Tebet', 'Benhil', 'Palmerah', 'Grogol', 'Salemba', 'Setiabudi', 'Tanjung Duren', 'Kelapa Gading', 'Cilandak'];

  const filteredKosts = useMemo(() => {
    return INITIAL_KOSTS.filter(kost => {
      const matchArea = selectedArea === 'semua' || kost.area.toLowerCase() === selectedArea.toLowerCase();
      const matchTipe = selectedTipe === 'semua' || kost.tipe === selectedTipe;
      const matchPrice = kost.harga <= maxHarga;
      const matchQuery = 
        !searchQuery ||
        kost.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kost.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kost.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kost.fasilitas.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchArea && matchTipe && matchPrice && matchQuery;
    });
  }, [selectedArea, selectedTipe, maxHarga, searchQuery]);

  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-neutral-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle backdrop pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Fokus Jakarta: SCBD, Kuningan, Sudirman, Binus, Trisakti, UI Salemba, MRT & KRL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Cari Kost di Jakarta, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
              Langsung Kontak Pemilik
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-200 max-w-2xl mx-auto leading-relaxed">
            Hanya <strong>Rp10.000 untuk 30 hari</strong>. Dapatkan akses ke seluruh foto kamar lengkap, 3 video walkthrough 360°, dan nomor WhatsApp pemilik tanpa perantara.
          </p>

          {/* Quick Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">3 Foto & 1 Video Gratis</p>
                <p className="text-neutral-300">Preview bebas tanpa login</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
              <QrCode className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">QRIS Rp10.000 Flat</p>
                <p className="text-neutral-300">Tanpa biaya admin tambahan</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">WhatsApp Asli Pemilik</p>
                <p className="text-neutral-300">Bukan calo / agen palsu</p>
              </div>
            </div>
          </div>

          {/* Direct CTA Button */}
          <div className="pt-2">
            {subscription.status !== 'active' ? (
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-neutral-900 font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-amber-400/20 text-sm transition-all hover:scale-105"
              >
                <span>Buka Semua Akses (Rp10.000 / 30 Hari)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Langganan Anda Aktif ({subscription.daysRemaining} Hari Tersisa)</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama kost, area, atau fasilitas (misal: MRT, Sudirman, AC, Binus)..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Tipe Selector */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {['semua', 'putri', 'putra', 'campur'].map((tipe) => (
                <button
                  key={tipe}
                  onClick={() => setSelectedTipe(tipe)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-colors whitespace-nowrap ${
                    selectedTipe === tipe
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {tipe === 'semua' ? 'Semua Tipe' : `Kost ${tipe}`}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chips & Price Range */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-neutral-100">
            {/* Area Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="font-semibold text-neutral-500 mr-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" /> Area:
              </span>
              {areas.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                    selectedArea.toLowerCase() === area.toLowerCase()
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>

            {/* Price Max Slider */}
            <div className="flex items-center gap-3 shrink-0 text-xs">
              <span className="text-neutral-500 font-medium">
                Maksimal: <strong className="text-neutral-900">Rp {maxHarga.toLocaleString('id-ID')}</strong>
              </span>
              <input
                type="range"
                min="1200000"
                max="3500000"
                step="100000"
                value={maxHarga}
                onChange={(e) => setMaxHarga(Number(e.target.value))}
                className="w-32 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* LISTING KOST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Pilihan Kost di Jakarta
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Menampilkan {filteredKosts.length} kost terverifikasi dengan foto preview asli & video walkthrough
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Aturan Akses:</span>
            <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
              Gratis 3 Foto + 1 Video
            </span>
            <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
              Rp10.000 / 30 Hari Buka WA
            </span>
          </div>
        </div>

        {/* Kost Grid */}
        {filteredKosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKosts.map((kost) => (
              <KostCard key={kost.id} kost={kost} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8 space-y-3">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">Tidak ada kost yang sesuai filter</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Coba atur ulang batas harga atau pilih area lainnya untuk menemukan kost yang sesuai.
            </p>
            <button
              onClick={() => {
                setSelectedArea('semua');
                setSelectedTipe('semua');
                setMaxHarga(3500000);
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100"
            >
              Reset Filter
            </button>
          </div>
        )}
      </section>

      {/* HOW IT WORKS / TRANSPARANSI SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-10 border border-neutral-800">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Kenapa Bayar Rp10.000 di KostHunt?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Kami memutus rantai calo & listing palsu di Jakarta. Anda terhubung langsung ke pemilik kamar dengan data transparan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            <div className="bg-neutral-800/60 p-5 rounded-2xl border border-neutral-700/50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-white text-base">Preview Gratis</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Lihat fasilitas dasar, 3 foto kamar, 1 video preview, dan foto tampak gedung tanpa biaya sepeserpun.
              </p>
            </div>

            <div className="bg-neutral-800/60 p-5 rounded-2xl border border-neutral-700/50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-white text-base">Bayar Sekali Rp10.000</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Scan QRIS satu kali. Dapatkan akses penuh selama 30 hari ke seluruh kost di database tanpa batasan harian.
              </p>
            </div>

            <div className="bg-neutral-800/60 p-5 rounded-2xl border border-neutral-700/50 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-white text-base">Hubungi WhatsApp Pemilik</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Chat nomor pemilik langsung untuk tanya ketersediaan kamar, nego sewa, atau atur jadwal survey offline.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
