'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  ChevronRight,
  X,
  AlertCircle,
  RefreshCw,
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAdmin } from '@/lib/admin-client';
import { PaymentTransaction } from '@/lib/payment-store';
import SingleSelectDropdown from '@/components/SingleSelectDropdown';

export default function AdminTransaksiPage() {
  const { addToast } = useAdmin();

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, TODAY, THIS_WEEK, THIS_MONTH

  // Detail Drawer
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [showConfirmSuccessModal, setShowConfirmSuccessModal] = useState<PaymentTransaction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data?type=transactions');
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch {
      addToast('Gagal memuat data transaksi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast(`ID "${text}" berhasil disalin! 📋`, 'info');
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        tx.order_id.toLowerCase().includes(q) ||
        tx.user_email.toLowerCase().includes(q) ||
        (tx.user_name && tx.user_name.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'settlement' && (tx.transaction_status === 'settlement' || tx.transaction_status === 'capture')) ||
        (statusFilter === 'pending' && tx.transaction_status === 'pending') ||
        (statusFilter === 'failed' && ['expire', 'cancel', 'deny', 'failed'].includes(tx.transaction_status));

      const matchesMethod =
        methodFilter === 'ALL' ||
        tx.payment_type?.toLowerCase() === methodFilter.toLowerCase();

      // Date filtering
      let matchesDate = true;
      if (dateFilter !== 'ALL') {
        const txDate = new Date(tx.created_at);
        const now = new Date();
        if (dateFilter === 'TODAY') {
          matchesDate = txDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'THIS_WEEK') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
          matchesDate = txDate >= sevenDaysAgo;
        } else if (dateFilter === 'THIS_MONTH') {
          matchesDate =
            txDate.getMonth() === now.getMonth() &&
            txDate.getFullYear() === now.getFullYear();
        }
      }

      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });
  }, [transactions, searchQuery, statusFilter, methodFilter, dateFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = transactions.length;
    const successList = transactions.filter(
      (t) => t.transaction_status === 'settlement' || t.transaction_status === 'capture'
    );
    const pendingList = transactions.filter((t) => t.transaction_status === 'pending');

    const totalSuccessRp = successList.reduce((acc, t) => acc + (t.gross_amount || 0), 0);
    const totalPendingRp = pendingList.reduce((acc, t) => acc + (t.gross_amount || 0), 0);
    const successRate = totalCount > 0 ? Math.round((successList.length / totalCount) * 100) : 0;

    return {
      totalCount,
      totalSuccessRp,
      totalPendingRp,
      successRate,
    };
  }, [transactions]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      addToast('Tidak ada data transaksi untuk diekspor', 'error');
      return;
    }

    const headers = [
      'Order ID',
      'User Email',
      'User Name',
      'Tanggal',
      'Nominal (Rp)',
      'Metode Pembayaran',
      'Status Transaksi',
      'Waktu Bayar',
    ];

    const rows = filteredTransactions.map((tx) => [
      `"${tx.order_id}"`,
      `"${tx.user_email}"`,
      `"${tx.user_name || '-'}"`,
      `"${new Date(tx.created_at).toLocaleString('id-ID')}"`,
      tx.gross_amount || 0,
      `"${tx.payment_type || '-'}"`,
      `"${tx.transaction_status}"`,
      `"${tx.paid_at ? new Date(tx.paid_at).toLocaleString('id-ID') : '-'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `transaksi-kost-kostan-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('File CSV berhasil diunduh! 📥', 'success');
  };

  // Mark Success Manual
  const handleMarkSuccess = async () => {
    if (!showConfirmSuccessModal) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transaction_mark_success',
          id: showConfirmSuccessModal.order_id,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        addToast(`Transaksi ${showConfirmSuccessModal.order_id} berhasil ditandai Sukses ✅`, 'success');
        setTransactions((prev) =>
          prev.map((t) =>
            t.order_id === showConfirmSuccessModal.order_id
              ? { ...t, transaction_status: 'settlement', paid_at: new Date().toISOString() }
              : t
          )
        );
        setShowConfirmSuccessModal(null);
        if (selectedTx?.order_id === showConfirmSuccessModal.order_id) {
          setSelectedTx((cur) => (cur ? { ...cur, transaction_status: 'settlement' } : null));
        }
      } else {
        addToast(resData.message || 'Gagal menandai transaksi', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getMethodBadge = (method: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('qris')) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          QRIS
        </span>
      );
    }
    if (m.includes('gopay')) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
          GoPay
        </span>
      );
    }
    if (m.includes('shopeepay')) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
          ShopeePay
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase">
        {method || 'VA / Bank'}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'settlement' || status === 'capture') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Sukses</span>
        </span>
      );
    }
    if (status === 'pending') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
        <XCircle className="w-3.5 h-3.5" />
        <span>Gagal</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Data Transaksi</h1>
          <p className="text-xs text-slate-500">
            Riwayat pembayaran unlock pass Midtrans, status webhook, dan audit nominal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTransactions}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
            title="Muat ulang data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Strips (Baris Ringkasan di atas tabel) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Transaksi</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalCount}</p>
          <span className="text-[11px] text-slate-400">Semua riwayat transaksi</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Berhasil (Rp)</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            Rp {metrics.totalSuccessRp.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Dana masuk terverifikasi</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending (Rp)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            Rp {metrics.totalPendingRp.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-slate-400">Menunggu pembayaran</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tingkat Keberhasilan</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{metrics.successRate}%</p>
          <span className="text-[11px] text-slate-400">Konversi pembayaran</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID transaksi atau email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 font-medium"
            />
          </div>

          {/* Status Filter */}
          <SingleSelectDropdown
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: 'ALL', label: 'Semua Status' },
              { value: 'settlement', label: 'Sukses (Settlement)' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Gagal / Expired' },
            ]}
            placeholder="Semua Status"
            buttonClassName="!py-2 !px-3"
          />

          {/* Method Filter */}
          <SingleSelectDropdown
            value={methodFilter}
            onChange={(val) => setMethodFilter(val)}
            options={[
              { value: 'ALL', label: 'Semua Metode' },
              { value: 'qris', label: 'QRIS' },
              { value: 'gopay', label: 'GoPay' },
              { value: 'shopeepay', label: 'ShopeePay' },
              { value: 'bank_transfer', label: 'Virtual Account' },
            ]}
            placeholder="Semua Metode"
            buttonClassName="!py-2 !px-3"
          />

          {/* Date Filter */}
          <SingleSelectDropdown
            value={dateFilter}
            onChange={(val) => setDateFilter(val)}
            options={[
              { value: 'ALL', label: 'Semua Waktu' },
              { value: 'TODAY', label: 'Hari Ini' },
              { value: 'THIS_WEEK', label: '7 Hari Terakhir' },
              { value: 'THIS_MONTH', label: 'Bulan Ini' },
            ]}
            placeholder="Semua Waktu"
            buttonClassName="!py-2 !px-3"
          />
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">ID Transaksi</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                    <span>Memuat data transaksi...</span>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan filter aktif
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.order_id} className="hover:bg-slate-50/70 transition-colors">
                    {/* ID Transaksi (Click to copy) */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-900">
                      <button
                        onClick={() => copyToClipboard(tx.order_id)}
                        className="flex items-center gap-1.5 hover:text-orange-600 transition-colors group"
                        title="Klik untuk salin ID"
                      >
                        <span>{tx.order_id}</span>
                        <Copy className="w-3 h-3 text-slate-400 group-hover:text-orange-600" />
                      </button>
                    </td>

                    {/* Pengguna */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{tx.user_name || 'Pengguna Kost'}</div>
                      <div className="text-[11px] text-slate-400">{tx.user_email}</div>
                    </td>

                    {/* Tanggal & Waktu */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Nominal */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      Rp {(tx.gross_amount || 0).toLocaleString('id-ID')}
                    </td>

                    {/* Metode */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getMethodBadge(tx.payment_type)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(tx.transaction_status)}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition-all"
                        >
                          Detail
                        </button>

                        {tx.transaction_status !== 'settlement' && tx.transaction_status !== 'capture' && (
                          <button
                            onClick={() => setShowConfirmSuccessModal(tx)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold transition-all"
                            title="Tandai Sukses Manual (Aktivasi Akses)"
                          >
                            Tandai Sukses
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer (Midtrans Raw Payload & Audit) */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Detail Transaksi
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedTx.order_id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-5 space-y-5 text-xs">
                {/* Status Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Status Pembayaran</span>
                    <div className="mt-1">{getStatusBadge(selectedTx.transaction_status)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Total Nominal</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      Rp {(selectedTx.gross_amount || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Key Metadata Table */}
                <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-white">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Pengguna</span>
                    <span className="font-semibold text-slate-800">{selectedTx.user_name || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Email</span>
                    <span className="font-semibold text-slate-800">{selectedTx.user_email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Metode Bayar</span>
                    <span className="font-semibold text-slate-800 uppercase">{selectedTx.payment_type || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Waktu Order</span>
                    <span className="text-slate-700">
                      {new Date(selectedTx.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Waktu Settlement</span>
                    <span className="text-slate-700">
                      {selectedTx.paid_at
                        ? new Date(selectedTx.paid_at).toLocaleString('id-ID')
                        : 'Belum bayar'}
                    </span>
                  </div>
                </div>

                {/* Raw Midtrans Payload / Webhook Response */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Payload Webhook Midtrans (Raw JSON)
                  </label>
                  <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-60 leading-relaxed">
                    {JSON.stringify(selectedTx.raw_response || selectedTx, null, 2)}
                  </pre>
                </div>

                {/* Audit Trail Note */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Audit Trail</p>
                    <p className="opacity-80">
                      Transaksi ini tercatat di database dengan perlindungan idempotency key Midtrans.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Tutup
              </button>
              {selectedTx.transaction_status !== 'settlement' && (
                <button
                  onClick={() => {
                    setShowConfirmSuccessModal(selectedTx);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Tandai Sukses Manual
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Manual Success Modal */}
      {showConfirmSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Konfirmasi Tandai Sukses Manual
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menandai transaksi{' '}
              <strong className="text-slate-900 font-mono">
                {showConfirmSuccessModal.order_id}
              </strong>{' '}
              sebagai <strong>Sukses</strong>? Pengguna ({showConfirmSuccessModal.user_email}) akan
              langsung menerima akses unlock kost selama 30 hari.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmSuccessModal(null)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleMarkSuccess}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Tandai Sukses</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

