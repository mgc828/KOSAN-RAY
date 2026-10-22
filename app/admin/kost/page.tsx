'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Archive, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { Kost } from '@/lib/types';
import { toast } from '@/lib/toast';
import SingleSelectDropdown from '@/components/SingleSelectDropdown';

export default function AdminKostsPage() {
  const [kosts, setKosts] = useState<Kost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState('semua');
  const [filterTipe, setFilterTipe] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Modal konfirmasi arsip
  const [archiveModalKost, setArchiveModalKost] = useState<Kost | null>(null);
  const [archiveReason, setArchiveReason] = useState('Kamar penuh / perbaikan fasilitas');
  const [isArchiving, setIsArchiving] = useState(false);

  const loadKosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/data?type=kosts');
      if (res.ok) {
        const json = await res.json();
        setKosts(json.kosts || []);
      }
    } catch {
      toast('Gagal memuat data kost', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKosts();
  }, []);

  // Filter & Search
  const filteredKosts = useMemo(() => {
    return kosts.filter(k => {
      const matchSearch = !searchQuery.trim() || 
        k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.alamat.toLowerCase().includes(searchQuery.toLowerCase());

      const matchArea = filterArea === 'semua' || k.area.toLowerCase() === filterArea.toLowerCase();
      const matchTipe = filterTipe === 'semua' || k.tipe === filterTipe;
      
      const isDraft = (k as any).is_draft || k.status !== 'tersedia';
      const matchStatus = filterStatus === 'semua' || 
        (filterStatus === 'aktif' && !isDraft) || 
        (filterStatus === 'draft' && isDraft);

      return matchSearch && matchArea && matchTipe && matchStatus;
    });
  }, [kosts, searchQuery, filterArea, filterTipe, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredKosts.length / pageSize) || 1;
  const paginatedKosts = filteredKosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // List of unique areas for filter
  const areasList = useMemo(() => {
    return Array.from(new Set(kosts.map(k => k.area))).filter(Boolean).sort();
  }, [kosts]);

  const handleArchive = async () => {
    if (!archiveModalKost) return;
    setIsArchiving(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'kost_delete',
          id: archiveModalKost.id,
          reason: archiveReason,
        }),
      });
      if (res.ok) {
        toast(`Kost "${archiveModalKost.nama}" berhasil diarsipkan ✅`, 'success');
        setArchiveModalKost(null);
        loadKosts();
      } else {
        toast('Gagal mengarsipkan kost', 'error');
      }
    } catch {
      toast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setIsArchiving(false);
    }
  };

  const formatRp = (num: number) => {
    return 'Rp ' + (num || 0).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2A43] tracking-tight">
            Data Kost DKI Jakarta
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola {kosts.length} listing kost, harga bulanan, kamar, dan status kurasi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadKosts}
            title="Segarkan data"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/admin/kost/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#F97316] text-white hover:bg-[#EA580C] shadow-md shadow-[#F97316]/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kost Baru</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama kost, alamat, atau area..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Area Filter */}
          <div className="w-44">
            <SingleSelectDropdown
              value={filterArea}
              onChange={(val) => {
                setFilterArea(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'semua', label: `Semua Area (${areasList.length})` },
                ...areasList.map((a) => ({ value: a, label: a })),
              ]}
              placeholder="Pilih Area"
              buttonClassName="!py-2 !px-3 !bg-slate-50 !border-slate-200 hover:!bg-white"
            />
          </div>

          {/* Tipe Filter */}
          <div className="w-36">
            <SingleSelectDropdown
              value={filterTipe}
              onChange={(val) => {
                setFilterTipe(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'semua', label: 'Semua Tipe' },
                { value: 'putra', label: 'Putra' },
                { value: 'putri', label: 'Putri' },
                { value: 'campur', label: 'Campur' },
              ]}
              placeholder="Semua Tipe"
              buttonClassName="!py-2 !px-3 !bg-slate-50 !border-slate-200 hover:!bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="w-44">
            <SingleSelectDropdown
              value={filterStatus}
              onChange={(val) => {
                setFilterStatus(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'semua', label: 'Semua Status' },
                { value: 'aktif', label: 'Aktif Terverifikasi' },
                { value: 'draft', label: 'Draft / Arsip' },
              ]}
              placeholder="Semua Status"
              buttonClassName="!py-2 !px-3 !bg-slate-50 !border-slate-200 hover:!bg-white"
            />
          </div>
        </div>
      </div>

      {/* Kosts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Thumbnail & Nama</th>
                <th className="px-4 py-3.5">Area / Lokasi</th>
                <th className="px-4 py-3.5">Harga / Bulan</th>
                <th className="px-4 py-3.5">Tipe</th>
                <th className="px-4 py-3.5">Kamar</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Memuat daftar kost...
                  </td>
                </tr>
              ) : paginatedKosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Tidak ada kost yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedKosts.map((kost) => {
                  const isDraft = (kost as any).is_draft || kost.status !== 'tersedia';
                  const thumbnail = kost.media?.find(m => m.tipe === 'foto_gedung' || m.tipe === 'foto_kamar')?.url || 
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&auto=format&fit=crop&q=80';

                  const tipeColor = 
                    kost.tipe === 'putra' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : kost.tipe === 'putri' 
                        ? 'bg-pink-50 text-pink-700 border-pink-200' 
                        : 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <tr key={kost.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Thumbnail & Nama */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={thumbnail}
                            alt={kost.nama}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 bg-slate-100"
                          />
                          <div className="min-w-0 max-w-xs">
                            <span className="font-bold text-slate-900 block truncate">{kost.nama}</span>
                            <span className="text-[11px] text-slate-400 block truncate">{kost.alamat}</span>
                          </div>
                        </div>
                      </td>

                      {/* Area */}
                      <td className="px-4 py-3 text-slate-700 font-semibold whitespace-nowrap">
                        <span>{kost.area}</span>
                        <span className="text-[10px] text-slate-400 block">{kost.kota}</span>
                      </td>

                      {/* Harga */}
                      <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                        {formatRp(kost.harga)}
                      </td>

                      {/* Tipe Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${tipeColor}`}>
                          {kost.tipe}
                        </span>
                      </td>

                      {/* Kamar */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        <span className="font-bold text-slate-800">{(kost as any).kamar_sisa ?? 2}</span> / {(kost as any).kamar_total ?? 10} kmr
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          isDraft 
                            ? 'bg-slate-100 text-slate-600 border-slate-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isDraft ? <Clock className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                          <span>{isDraft ? 'Draft' : 'Aktif'}</span>
                        </span>
                      </td>

                      {/* Aksi Buttons */}
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Preview Button */}
                          <Link
                            href={`/kost/jakarta/${kost.area.toLowerCase().replace(/\s+/g, '-')}/${kost.slug}`}
                            target="_blank"
                            title="Preview publik (Tab Baru)"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Edit Button */}
                          <Link
                            href={`/admin/kost/${kost.id}`}
                            title="Edit data kost"
                            className="p-1.5 text-slate-600 hover:text-[#0F2A43] hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {/* Arsipkan / Hapus Button */}
                          <button
                            type="button"
                            onClick={() => setArchiveModalKost(kost)}
                            title="Arsipkan kost (Soft Delete)"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (20 baris per halaman) */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredKosts.length)} dari {filteredKosts.length} kost
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold px-2 text-slate-800">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Arsipkan */}
      {archiveModalKost && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Arsipkan Kost?</h3>
                  <p className="text-xs text-slate-500">Soft-delete (riwayat transaksi tetap utuh).</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setArchiveModalKost(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Kost <strong className="text-slate-900">{archiveModalKost.nama}</strong> akan disembunyikan dari hasil pencarian publik tanpa menghapus data pembayaran member terdahulu.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Alasan Pengarsipan:</label>
              <input
                type="text"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setArchiveModalKost(null)}
                disabled={isArchiving}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleArchive}
                disabled={isArchiving}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-sm"
              >
                {isArchiving ? 'Mengarsipkan...' : 'Ya, Arsipkan Kost'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

