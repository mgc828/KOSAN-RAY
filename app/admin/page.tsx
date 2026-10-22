'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  Unlock, 
  Home, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  UploadCloud, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ChevronRight, 
  ChevronDown,
  Calendar,
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  Building2,
  Eye 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { toast } from '@/lib/toast';

type PeriodKey = '1m' | '2m' | '3m' | '6m' | '9m' | '1y' | '3y' | '5y' | 'custom';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('1m');

  const defaultEnd = useMemo(() => new Date().toISOString().split('T')[0], []);
  const defaultStart = useMemo(() => new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], []);
  const [customStartDate, setCustomStartDate] = useState(defaultStart);
  const [customEndDate, setCustomEndDate] = useState(defaultEnd);
  const [tempStartDate, setTempStartDate] = useState(defaultStart);
  const [tempEndDate, setTempEndDate] = useState(defaultEnd);
  const [isOtherOpen, setIsOtherOpen] = useState(false);
  const otherDropdownRef = useRef<HTMLDivElement>(null);

  // Close other dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (otherDropdownRef.current && !otherDropdownRef.current.contains(e.target as Node)) {
        setIsOtherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mouse hover state for SVG path follower popup
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; visible: boolean; label?: string; val?: number }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/data?type=dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
      toast('Gagal memuat statistik dashboard', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatRp = (num: number) => {
    return 'Rp ' + (num || 0).toLocaleString('id-ID');
  };

  // Label periode aktif
  const currentPeriodLabel = useMemo(() => {
    if (selectedPeriod === '1m') return '1 Bulan Terakhir';
    if (selectedPeriod === '2m') return '2 Bulan Terakhir';
    if (selectedPeriod === '3m') return '3 Bulan Terakhir';
    if (selectedPeriod === '6m') return '6 Bulan Terakhir';
    if (selectedPeriod === '9m') return '9 Bulan Terakhir';
    if (selectedPeriod === '1y') return '1 Tahun Terakhir';
    if (selectedPeriod === '3y') return '3 Tahun Terakhir';
    if (selectedPeriod === '5y') return '5 Tahun Terakhir';
    if (selectedPeriod === 'custom') {
      const s = new Date(customStartDate + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      const e = new Date(customEndDate + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      return `Kustom (${s} - ${e})`;
    }
    return '1 Bulan Terakhir';
  }, [selectedPeriod, customStartDate, customEndDate]);

  // Generate dynamic chart data based on selected filter and 100% REAL DB transactions (no fabricated/sine data)
  const lineChartData = useMemo(() => {
    const rawTx: { amount: number; date: string }[] = data?.allTransactions || [];

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (selectedPeriod === '1m') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
    } else if (selectedPeriod === '2m') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 59, 0, 0, 0, 0);
    } else if (selectedPeriod === '3m') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89, 0, 0, 0, 0);
    } else if (selectedPeriod === '6m') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate(), 0, 0, 0, 0);
    } else if (selectedPeriod === '9m') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 9, now.getDate(), 0, 0, 0, 0);
    } else if (selectedPeriod === '1y') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 0, 0, 0, 0);
    } else if (selectedPeriod === '3y') {
      startDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate(), 0, 0, 0, 0);
    } else if (selectedPeriod === '5y') {
      startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate(), 0, 0, 0, 0);
    } else if (selectedPeriod === 'custom') {
      startDate = new Date(customStartDate ? `${customStartDate}T00:00:00` : now.getTime() - 30 * 86400000);
      endDate = new Date(customEndDate ? `${customEndDate}T23:59:59` : now.getTime());
      if (startDate > endDate) {
        const tmp = startDate;
        startDate = endDate;
        endDate = tmp;
      }
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
    }

    // Filter transaksi yang valid dan berada dalam rentang tanggal
    const inRangeTx = rawTx.filter((t) => {
      const td = new Date(t.date).getTime();
      return !isNaN(td) && td >= startDate.getTime() && td <= endDate.getTime();
    });

    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Jika rentang <= 92 hari: agregasi harian murni dari database
    if (diffDays <= 92) {
      const points = [];
      const cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      while (cur <= endDay) {
        const y = cur.getFullYear();
        const m = cur.getMonth();
        const d = cur.getDate();
        const dayStr = cur.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

        const dayTxs = inRangeTx.filter((t) => {
          const td = new Date(t.date);
          return td.getFullYear() === y && td.getMonth() === m && td.getDate() === d;
        });

        const realRevenue = dayTxs.reduce((acc, curTx) => acc + (curTx.amount || 15000), 0);
        const realUnlocks = dayTxs.length;

        points.push({
          date: dayStr,
          revenue: realRevenue,
          unlocks: realUnlocks,
        });

        cur.setDate(cur.getDate() + 1);
      }
      return points;
    }

    // Jika rentang > 92 hari: agregasi bulanan murni dari database
    const points = [];
    const curMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (curMonth <= endMonth) {
      const y = curMonth.getFullYear();
      const m = curMonth.getMonth();
      const monthStr = curMonth.toLocaleDateString('id-ID', {
        month: 'short',
        year: diffDays > 365 ? '2-digit' : undefined,
      });

      const monthTxs = inRangeTx.filter((t) => {
        const td = new Date(t.date);
        return td.getFullYear() === y && td.getMonth() === m;
      });

      const realRevenue = monthTxs.reduce((acc, curTx) => acc + (curTx.amount || 15000), 0);
      const realUnlocks = monthTxs.length;

      points.push({
        date: monthStr,
        revenue: realRevenue,
        unlocks: realUnlocks,
      });

      curMonth.setMonth(curMonth.getMonth() + 1);
    }
    return points;
  }, [data, selectedPeriod, customStartDate, customEndDate]);

  const totalPeriodRevenue = useMemo(() => {
    return lineChartData.reduce((acc, cur) => acc + cur.revenue, 0);
  }, [lineChartData]);

  // Handle mouse move across chart container to follow mouse cursor over path
  const handleChartMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const isPath = target && (target.tagName === 'path' || target.closest('.recharts-line-curve') || target.closest('.recharts-layer'));
    if (isPath) {
      setCursorPos({
        x: e.clientX,
        y: e.clientY,
        visible: true,
      });
    }
  };

  const handleChartMouseLeave = () => {
    setCursorPos(prev => ({ ...prev, visible: false }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200/70 rounded-xl w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-slate-200/80 p-6" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white rounded-3xl border border-slate-200/80 p-6" />
          <div className="h-80 bg-white rounded-3xl border border-slate-200/80 p-6" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    monthRevenue: 0,
    revenueGrowth: '0%',
    activeUnlocks: 0,
    unlocksGrowth: '0%',
    totalKosts: 0,
    kostsGrowth: '0%',
    totalUsers: 0,
    usersGrowth: '0%',
  };


  const areaDonutData = data?.areaDonutData || [];
  const recentTransactions = data?.recentTransactions || [];
  const draftKosts = data?.actionRequired?.draftKosts || [];
  const pendingTx = data?.actionRequired?.pendingTransactions || [];
  const txDetailHref = (orderId: string) => `/admin/transaksi?order=${encodeURIComponent(orderId)}`;

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2A43] tracking-tight">
            Ringkasan Platform Kost-Kostan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data operasional real-time seluruh wilayah DKI Jakarta dari Database.
          </p>
        </div>

        {/* Quick Actions (Right Top) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadDashboardData}
            title="Segarkan data"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/admin/media"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-xs transition-all active:scale-[0.98]"
          >
            <UploadCloud className="w-4 h-4 text-[#0F2A43]" />
            <span>Upload Media</span>
          </Link>

          <Link
            href="/admin/kost/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F97316] text-white hover:bg-[#EA580C] shadow-md shadow-[#F97316]/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kost</span>
          </Link>
        </div>
      </div>

      {/* BARIS 1: 4 KARTU STATISTIK (Dapat diklik mengarah ke halaman masing-masing) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pendapatan bulan ini -> /admin/transaksi */}
        <Link 
          href="/admin/transaksi"
          className="group bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#F97316] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#F97316] transition-colors">
              Pendapatan Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatRp(stats.monthRevenue)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.revenueGrowth}</span>
                <span className="text-slate-400 font-normal">vs bulan lalu</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#F97316] transition-colors" />
            </div>
          </div>
        </Link>

        {/* Card 2: Unlock aktif -> /admin/unlock */}
        <Link 
          href="/admin/unlock"
          className="group bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#F97316] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#F97316] transition-colors">
              Unlock Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Unlock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.activeUnlocks} Member
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.unlocksGrowth}</span>
                <span className="text-slate-400 font-normal">vs bulan lalu</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#F97316] transition-colors" />
            </div>
          </div>
        </Link>

        {/* Card 3: Total kost -> /admin/kost */}
        <Link 
          href="/admin/kost"
          className="group bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#F97316] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#F97316] transition-colors">
              Total Kost DKI
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalKosts} Unit
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.kostsGrowth}</span>
                <span className="text-slate-400 font-normal">terverifikasi</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#F97316] transition-colors" />
            </div>
          </div>
        </Link>

        {/* Card 4: Total user -> /admin/pengguna */}
        <Link 
          href="/admin/pengguna"
          className="group bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-[#F97316] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#F97316] transition-colors">
              Total Pengguna
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalUsers} Akun
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.usersGrowth}</span>
                <span className="text-slate-400 font-normal">pendaftar</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#F97316] transition-colors" />
            </div>
          </div>
        </Link>
      </div>

      {/* BARIS 2: GRAFIK (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Garis: Tren Pendapatan dengan Filter Waktu Lengkap */}
        <div 
          ref={chartContainerRef}
          onMouseMove={handleChartMouseMove}
          onMouseLeave={handleChartMouseLeave}
          className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#0F2A43] tracking-tight">
                Tren Pendapatan ({currentPeriodLabel})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total nominal unlock real: <span className="font-bold text-slate-700">{formatRp(totalPeriodRevenue)}</span>
              </p>
            </div>

            {/* Tombol Filter Pilihan: 1 Bulan, 2 Bulan, 3 Bulan, 1 Tahun, Lainnya */}
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap relative">
              {[
                { key: '1m', label: '1 Bulan' },
                { key: '2m', label: '2 Bulan' },
                { key: '3m', label: '3 Bulan' },
                { key: '1y', label: '1 Tahun' },
              ].map((p) => {
                const isActive = selectedPeriod === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(p.key as PeriodKey);
                      setIsOtherOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#F97316] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}

              {/* Tombol Lainnya dengan Dropdown Popup */}
              <div ref={otherDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsOtherOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    ['6m', '9m', '3y', '5y', 'custom'].includes(selectedPeriod)
                      ? 'bg-[#F97316] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>
                    {selectedPeriod === '6m'
                      ? '6 Bulan'
                      : selectedPeriod === '9m'
                      ? '9 Bulan'
                      : selectedPeriod === '3y'
                      ? '3 Tahun'
                      : selectedPeriod === '5y'
                      ? '5 Tahun'
                      : selectedPeriod === 'custom'
                      ? 'Kustom'
                      : 'Lainnya'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOtherOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Popup Pilihan Lainnya */}
                {isOtherOpen && (
                  <div className="absolute right-0 mt-2 z-50 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Pilihan Rentang Cepat
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: '6m', label: '6 Bulan' },
                          { key: '9m', label: '9 Bulan' },
                          { key: '3y', label: '3 Tahun' },
                          { key: '5y', label: '5 Tahun' },
                        ].map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                              setSelectedPeriod(item.key as PeriodKey);
                              setIsOtherOpen(false);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                              selectedPeriod === item.key
                                ? 'bg-[#F97316] text-white border-[#F97316]'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-orange-50/50 hover:border-[#F97316]/50'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Kustom Tanggal Kalender
                      </span>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Dari Tanggal (Start Date)</label>
                          <input
                            type="date"
                            value={tempStartDate}
                            onChange={(e) => setTempStartDate(e.target.value)}
                            className="w-full text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F97316] text-slate-800 bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Sampai Tanggal (End Date)</label>
                          <input
                            type="date"
                            value={tempEndDate}
                            onChange={(e) => setTempEndDate(e.target.value)}
                            className="w-full text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F97316] text-slate-800 bg-slate-50"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!tempStartDate || !tempEndDate) {
                              toast('Silakan pilih rentang tanggal lengkap', 'warning');
                              return;
                            }
                            setCustomStartDate(tempStartDate);
                            setCustomEndDate(tempEndDate);
                            setSelectedPeriod('custom');
                            setIsOtherOpen(false);
                          }}
                          className="w-full py-2 bg-[#0F2A43] hover:bg-[#F97316] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-1"
                        >
                          Terapkan Rentang Tanggal
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={lineChartData} 
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  axisLine={{ stroke: '#CBD5E1' }} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `Rp ${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  content={({ active, payload, label }: any) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0];
                    return (
                      <div className="bg-[#0F2A43] text-white p-3 rounded-2xl shadow-2xl border border-white/20 text-xs pointer-events-none select-none">
                        <p className="font-semibold text-white text-[11px] mb-0.5">{label}</p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-white">{formatRp(item.value)}</span>
                          <span className="text-[10px] text-white font-bold">
                            ({item.payload.unlocks || 0} transaksi unlock)
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-white font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-white">Data Real Database</span>
                        </div>
                      </div>
                    );
                  }}
                  cursor={{ stroke: '#F97316', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#F97316" 
                  strokeWidth={3} 
                  dot={{ r: 3, fill: '#F97316' }} 
                  activeDot={{ r: 6, fill: '#0F2A43', stroke: '#F97316', strokeWidth: 2.5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Donat: Unlock per Wilayah */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0F2A43] tracking-tight">Distribusi Unlock per Wilayah</h3>
            <p className="text-xs text-slate-400">Pangsa pasar pencarian & unlock kost di DKI Jakarta dari Database</p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={areaDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {areaDonutData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any, _name: any, item: any) => [
                    `${item?.payload?.unlockCount ?? item?.payload?.count ?? 0} unlock (${val}%)`,
                    item?.payload?.name || 'Wilayah'
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#0F2A43', 
                    borderRadius: '0.75rem', 
                    color: '#fff', 
                    fontSize: '11px', 
                    fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.15)' 
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {areaDonutData.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-semibold py-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-bold">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {item.unlockCount ?? item.count ?? 0} unlock
                  </span>
                  {item.kostCount !== undefined && (
                    <span className="text-[10px] text-slate-400">
                      ({item.kostCount} unit)
                    </span>
                  )}
                  <span className="font-extrabold text-[#0F2A43] min-w-[32px] text-right">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BARIS 3: TABEL TRANSAKSI TERBARU & ITEM BUTUH TINDAKAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1-2: 6 Transaksi Terakhir */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#0F2A43] tracking-tight">Transaksi Terakhir</h3>
              <p className="text-xs text-slate-400">Semua transaksi pembayaran QRIS masuk</p>
            </div>
            <Link 
              href="/admin/transaksi" 
              className="text-xs font-bold text-[#F97316] hover:underline inline-flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Order ID / User</th>
                  <th className="pb-3">Waktu</th>
                  <th className="pb-3">Nominal</th>
                  <th className="pb-3">Metode</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">Belum ada transaksi</td>
                  </tr>
                )}
                {recentTransactions.map((tx: any) => (
                  <tr
                    key={tx.id}
                    onClick={() => router.push(txDetailHref(tx.order_id))}
                    onKeyDown={(e) => { if (e.key === 'Enter') router.push(txDetailHref(tx.order_id)); }}
                    tabIndex={0}
                    role="link"
                    title="Lihat detail transaksi"
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 font-medium">
                      <p className="font-bold text-slate-800">{tx.order_id}</p>
                      <p className="text-[11px] text-slate-400">{tx.user_email}</p>
                    </td>
                    <td className="py-3 text-slate-500 whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 font-bold text-slate-900">{formatRp(tx.amount)}</td>
                    <td className="py-3 text-slate-600">{tx.payment_method}</td>
                    <td className="py-3 text-right">
                      {tx.status === 'sukses' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Berhasil
                        </span>
                      )}
                      {tx.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                          <Clock className="w-3 h-3" /> Menunggu
                        </span>
                      )}
                      {tx.status === 'gagal' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          <XCircle className="w-3 h-3" /> Gagal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom 3: Butuh Tindakan (Draft & Pending) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-[#0F2A43] tracking-tight">Butuh Tindakan</h3>
              <p className="text-xs text-slate-400">Verifikasi data & review operasional</p>
            </div>

            {/* List draft kosts */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Kost Menunggu Review
              </span>
              {draftKosts.length > 0 ? (
                draftKosts.map((kost: any) => (
                  <div
                    key={kost.id}
                    className="p-3 rounded-2xl border border-slate-200/80 hover:border-[#F97316] hover:bg-orange-50/30 transition-all text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{kost.nama}</p>
                        <p className="text-[11px] text-slate-500">{kost.area}, {kost.kota || 'DKI Jakarta'}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Draft
                        </span>
                        <Link
                          href={`/admin/kost/${kost.id}`}
                          title="Lihat detail & lengkapi data"
                          aria-label={`Detail ${kost.nama}`}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#F97316] hover:border-[#F97316] bg-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                    <ul className="space-y-0.5 text-[11px] text-slate-600">
                      {(kost.steps || []).map((step: string) => (
                        <li key={step} className="flex items-start gap-1.5">
                          <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 text-center text-xs text-slate-400">
                  Semua kost aktif & terverifikasi
                </div>
              )}
            </div>

            {/* Transaksi pending */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Status Pembayaran Pending
              </span>
              {pendingTx.length > 0 ? (
                pendingTx.map((tx: any) => (
                  <Link
                    key={tx.id}
                    href={txDetailHref(tx.order_id)}
                    title="Lihat detail transaksi"
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 hover:bg-orange-50/60 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-700">{tx.order_id}</p>
                      <p className="text-[11px] text-slate-400">{tx.user_email}</p>
                    </div>
                    <span className="font-bold text-amber-600">Pending</span>
                  </Link>
                ))
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 text-center text-xs text-slate-400">
                  Tidak ada transaksi tertunda
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/admin/pengaturan"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>Pengaturan Platform</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
