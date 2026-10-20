'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Key,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  PlusCircle,
  RefreshCw,
  Loader2,
  Calendar,
  Eye,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { useAdmin } from '@/lib/admin-client';
import { UnlockUserItem } from '@/lib/admin-types';

export default function AdminUnlockPage() {
  const { addToast } = useAdmin();

  const [users, setUsers] = useState<UnlockUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRING_SOON'>('ALL');

  // Modal actions
  const [revokeUser, setRevokeUser] = useState<UnlockUserItem | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUnlocks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data?type=unlocks');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch {
      addToast('Gagal memuat data akses unlock', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnlocks();
  }, []);

  // Filtered members
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        u.email.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q));

      const isUserActive = u.status === 'active' && u.daysRemaining > 0;

      if (activeTab === 'active' && !isUserActive) return false;
      if (activeTab === 'expired' && isUserActive) return false;

      if (activeTab === 'active') {
        if (statusFilter === 'EXPIRING_SOON' && u.daysRemaining > 7) return false;
      }

      return matchesSearch;
    });
  }, [users, searchQuery, activeTab, statusFilter]);

  // Extend 30 days
  const handleExtend = async (userId: string, email: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unlock_extend',
          userId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast(`Akses untuk ${email} berhasil diperpanjang +30 hari ✅`, 'success');
        fetchUnlocks();
      } else {
        addToast(data.message || 'Gagal memperpanjang akses', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Revoke membership
  const handleRevoke = async () => {
    if (!revokeUser) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unlock_revoke',
          userId: revokeUser.id,
          reason: revokeReason.trim() || 'Dicabut oleh admin',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast(`Akses untuk ${revokeUser.email} berhasil dicabut ⛔`, 'info');
        setRevokeUser(null);
        setRevokeReason('');
        fetchUnlocks();
      } else {
        addToast(data.message || 'Gagal mencabut akses', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getCountdownBadge = (days: number, status: string) => {
    if (status !== 'active' || days <= 0) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
          Kedaluwarsa
        </span>
      );
    }
    if (days <= 1) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
          Sisa {days} hari (Kritis)
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Sisa {days} hari
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Sisa {days} hari
      </span>
    );
  };

  const activeCount = users.filter((u) => u.status === 'active' && u.daysRemaining > 0).length;
  const expiredCount = users.filter((u) => u.status !== 'active' || u.daysRemaining <= 0).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Akses Unlock</h1>
          <p className="text-xs text-slate-500">
            Daftar member aktif, perpanjangan masa aktif, countdown kedaluwarsa, dan audit akses
          </p>
        </div>

        <button
          onClick={fetchUnlocks}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
          title="Muat ulang data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Member Aktif ({activeCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('expired')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'expired'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Riwayat Kedaluwarsa ({expiredCount})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email pengguna..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 font-medium"
            />
          </div>

          {/* Status Filter for Active Tab */}
          {activeTab === 'active' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="ALL">Semua Member Aktif</option>
              <option value="EXPIRING_SOON">Segera Berakhir (≤ 7 Hari)</option>
            </select>
          )}
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Tanggal Mulai</th>
                <th className="py-3 px-4">Tanggal Kedaluwarsa</th>
                <th className="py-3 px-4">Status & Sisa Hari</th>
                <th className="py-3 px-4 text-center">Kost Dilihat</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                    <span>Memuat data member...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada member pada kategori ini
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Pengguna */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>

                    {/* Tanggal Mulai */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {user.startDate
                        ? new Date(user.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>

                    {/* Tanggal Kedaluwarsa */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {user.expiresAt
                        ? new Date(user.expiresAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>

                    {/* Countdown Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getCountdownBadge(user.daysRemaining, user.status)}
                    </td>

                    {/* Kost Dilihat */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.unlockedKostsCount}</span>
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleExtend(user.id, user.email)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-semibold transition-all flex items-center gap-1"
                          title="Perpanjang +30 Hari"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+30 Hari</span>
                        </button>

                        {user.status === 'active' && user.daysRemaining > 0 && (
                          <button
                            onClick={() => {
                              setRevokeUser(user);
                              setRevokeReason('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition-all"
                            title="Cabut Akses Pengguna"
                          >
                            Cabut Akses
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

      {/* Revoke Access Modal */}
      {revokeUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Cabut Akses Langganan
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda akan mencabut akses unlock untuk pengguna{' '}
              <strong className="text-slate-900">{revokeUser.email}</strong>. Tindakan ini akan
              dicatat ke dalam audit trail sistem.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Alasan Pencabutan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Contoh: Permintaan refund pengguna, pelanggaran scraping, dll."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokeUser(null)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleRevoke}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Cabut Akses Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

