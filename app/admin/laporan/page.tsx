'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Download,
  Building2,
  Filter,
  DollarSign,
  Users,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Loader2,
  Award
} from 'lucide-react';
import { useAdmin } from '@/lib/admin-client';

export default function AdminLaporanPage() {
  const { addToast } = useAdmin();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data?type=reports');
      const resData = await res.json();
      if (resData.report) {
        setData(resData.report);
      }
    } catch {
      addToast('Gagal memuat laporan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportMonthlyCSV = () => {
    if (!data?.monthlyRevenue || data.monthlyRevenue.length === 0) {
      addToast('Data bulanan tidak tersedia', 'error');
      return;
    }

    const headers = ['Bulan', 'Pendapatan (Rp)', 'Total Transaksi'];
    const rows = data.monthlyRevenue.map((m: any) => [
      `"${m.month}"`,
      m.revenue,
      m.count,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-pendapatan-bulanan-${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Laporan bulanan berhasil diekspor! 📥', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm text-slate-500">Mempersiapkan data analitik dan laporan...</p>
      </div>
    );
  }

  const funnel = data?.conversionFunnel || [
    { stage: 'Pengunjung Detail Kost', count: 12450, percentage: 100 },
    { stage: 'Klik "Buka Kontak"', count: 4890, percentage: 39.2 },
    { stage: 'Masuk Checkout Midtrans', count: 1820, percentage: 14.6 },
    { stage: 'Transaksi Sukses (Settlement)', count: 980, percentage: 7.9 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Laporan & Analitik Platform</h1>
          <p className="text-xs text-slate-500">
            Kinerja finansial 12 bulan terakhir, funnel konversi paywall, top kost, dan metrik area
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
            title="Muat ulang laporan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportMonthlyCSV}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV Bulanan</span>
          </button>
        </div>
      </div>

      {/* Row 1: 12-Month Revenue Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Pendapatan 12 Bulan Terakhir
            </h2>
            <p className="text-xs text-slate-500">
              Total volume transaksi unlock pass (Rp15.000 / 30 hari)
            </p>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(1)}Jt`}
              />
              <Tooltip
                formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Pendapatan']}
                contentStyle={{
                  backgroundColor: '#0F2A43',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="revenue" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Conversion Funnel & Top 10 Kosts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Filter className="w-5 h-5 text-orange-500" />
            Conversion Funnel (Alur Paywall)
          </h2>
          <p className="text-xs text-slate-500">
            Perbandingan persentase pengguna dari melihat detail kost hingga menyelesaikan pembayaran
          </p>

          <div className="space-y-3 pt-2">
            {funnel.map((item: any, idx: number) => {
              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{item.stage}</span>
                    </span>
                    <span>
                      {item.count.toLocaleString('id-ID')} ({item.percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 10 Kost Paling Banyak Di-Unlock */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-orange-500" />
            Top Kost Paling Banyak Di-Unlock
          </h2>

          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto pr-1">
            {(data?.topKosts || []).map((k: any, idx: number) => (
              <div key={k.id || idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-700'
                        : idx === 2
                        ? 'bg-orange-100 text-orange-800'
                        : 'text-slate-400 bg-slate-50'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{k.name}</p>
                    <p className="text-[11px] text-slate-400">{k.area}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-orange-600">{k.unlockCount}x</span>
                  <span className="text-[11px] text-slate-400 block">dibuka</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Tabel Performa Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            Tabel Performa Area DKI Jakarta
          </h2>
          <p className="text-xs text-slate-500">
            Rincian jumlah kost, total unlock, estimasi pendapatan, dan rata-rata harga kamar per area
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Nama Area</th>
                <th className="py-3 px-4 text-center">Jumlah Kost</th>
                <th className="py-3 px-4 text-center">Total Unlock</th>
                <th className="py-3 px-4">Total Pendapatan (Rp)</th>
                <th className="py-3 px-4">Rata-rata Harga Kost / Bulan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {(data?.areaPerformance || []).map((row: any) => (
                <tr key={row.area} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.area}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                    {row.totalKost} kost
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-orange-600">
                    {row.totalUnlock}x
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    Rp {row.revenue.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-semibold">
                    Rp {row.avgPrice.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

