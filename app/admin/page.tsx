'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  Building2 
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    monthRevenue: 4850000,
    revenueGrowth: '+18.4%',
    activeUnlocks: 142,
    unlocksGrowth: '+12.5%',
    totalKosts: 60,
    kostsGrowth: '+8.0%',
    totalUsers: 284,
    usersGrowth: '+24.1%',
  };

  const lineData = data?.lineData || [];
  const areaDonutData = data?.areaDonutData || [];
  const recentTransactions = data?.recentTransactions || [];
  const draftKosts = data?.actionRequired?.draftKosts || [];
  const pendingTx = data?.actionRequired?.pendingTransactions || [];

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2A43] tracking-tight">
            Ringkasan Platform Kost-Kostan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data operasional real-time seluruh wilayah DKI Jakarta.
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

      {/* BARIS 1: 4 KARTU STATISTIK (dengan % perubahan vs bulan lalu) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pendapatan bulan ini */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pendapatan Bulan Ini</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatRp(stats.monthRevenue)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>{stats.revenueGrowth}</span>
              <span className="text-slate-400 font-normal">vs bulan lalu</span>
            </div>
          </div>
        </div>

        {/* Card 2: Unlock aktif */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unlock Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center">
              <Unlock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.activeUnlocks} Member
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>{stats.unlocksGrowth}</span>
              <span className="text-slate-400 font-normal">vs bulan lalu</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total kost */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kost DKI</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalKosts} Unit
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>{stats.kostsGrowth}</span>
              <span className="text-slate-400 font-normal">terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total user */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengguna</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalUsers} Akun
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>{stats.usersGrowth}</span>
              <span className="text-slate-400 font-normal">pendaftar</span>
            </div>
          </div>
        </div>
      </div>

      {/* BARIS 2: GRAFIK (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Garis: Pendapatan 30 Hari Terakhir */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-[#0F2A43] tracking-tight">Tren Pendapatan (30 Hari Terakhir)</h3>
              <p className="text-xs text-slate-400">Total nominal unlock paket Rp 15.000 / 30 hari</p>
            </div>
            <span className="text-xs font-bold text-[#F97316] bg-orange-50 px-3 py-1 rounded-full border border-[#F97316]/20">
              30 Hari
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  formatter={(val: any) => [formatRp(Number(val)), 'Pendapatan']}
                  labelFormatter={(lbl) => `Tanggal: ${lbl}`}
                  contentStyle={{ 
                    backgroundColor: '#0F2A43', 
                    borderRadius: '1rem', 
                    color: '#fff', 
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#F97316" 
                  strokeWidth={3} 
                  dot={{ r: 3, fill: '#F97316' }} 
                  activeDot={{ r: 6, fill: '#0F2A43', stroke: '#F97316', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik Donat: Unlock per Area */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0F2A43] tracking-tight">Distribusi Unlock per Wilayah</h3>
            <p className="text-xs text-slate-400">Pangsa pasar pencarian kost di DKI</p>
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
                  formatter={(val: any) => [`${val}%`, 'Persentase']}
                  contentStyle={{ 
                    backgroundColor: '#0F2A43', 
                    borderRadius: '0.75rem', 
                    color: '#fff', 
                    fontSize: '11px',
                    fontWeight: 700 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {areaDonutData.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="text-slate-900 font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BARIS 3: DUA KOLOM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1: Tabel Transaksi Terbaru (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#0F2A43] tracking-tight">Transaksi Terbaru</h3>
              <p className="text-xs text-slate-400">Pembayaran akses unlock langganan</p>
            </div>
            <Link
              href="/admin/transaksi"
              className="text-xs font-bold text-[#F97316] hover:underline inline-flex items-center gap-1"
            >
              <span>Semua Transaksi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Pengguna</th>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5">Nominal</th>
                  <th className="px-4 py-3.5">Metode</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentTransactions.map((tx: any) => {
                  const isSuccess = tx.status === 'sukses';
                  const isPending = tx.status === 'pending';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 block truncate max-w-[160px]">{tx.user_name}</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">{tx.user_email}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{tx.date}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{formatRp(tx.amount)}</td>
                      <td className="px-4 py-3.5 text-slate-600">{tx.payment_method}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isSuccess
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isSuccess && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                          {!isSuccess && !isPending && <XCircle className="w-3 h-3 text-rose-600" />}
                          <span className="capitalize">{tx.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom 2: Butuh Tindakan (1/3 width) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-[#0F2A43] tracking-tight">Butuh Tindakan Segera</h3>
              <p className="text-xs text-slate-400">Verifikasi & kendala transaksi</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>

          {/* Draft Kost Menunggu Aktivasi */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Draft Kost Menunggu Aktivasi ({draftKosts.length})
            </span>
            {draftKosts.length > 0 ? (
              draftKosts.map((k: any) => (
                <div key={k.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-800 block truncate">{k.nama}</span>
                    <span className="text-[10px] text-slate-500">{k.area} • Belum aktif</span>
                  </div>
                  <Link
                    href={`/admin/kost`}
                    className="px-2.5 py-1 bg-[#0F2A43] text-white rounded-lg text-[10px] font-bold shrink-0 hover:bg-[#163a5d]"
                  >
                    Tinjau
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">Semua kost telah aktif terverifikasi.</p>
            )}
          </div>

          {/* Transaksi Butuh Review */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Transaksi Terkendala
            </span>
            {pendingTx.length > 0 ? (
              pendingTx.map((tx: any) => (
                <div key={tx.id} className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-amber-900 block truncate">{tx.order_id || tx.id}</span>
                    <span className="text-[10px] text-amber-700">QRIS Expired • {tx.user_email?.split('@')[0]}</span>
                  </div>
                  <Link
                    href="/admin/transaksi"
                    className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold shrink-0 hover:bg-amber-700"
                  >
                    Detail
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">Tidak ada transaksi bermasalah saat ini.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
