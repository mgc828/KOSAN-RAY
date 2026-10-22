'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  ShieldCheck,
  ChevronRight,
  X,
  CreditCard,
  Eye,
  RefreshCw,
  Loader2,
  PlusCircle,
  UserX
} from 'lucide-react';
import { useAdmin } from '@/lib/admin-client';
import { AppUser } from '@/lib/payment-store';
import SingleSelectDropdown from '@/components/SingleSelectDropdown';

export default function AdminPenggunaPage() {
  const { addToast } = useAdmin();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Drawer
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data?type=users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch {
      addToast('Gagal memuat data pengguna', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        u.email.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'active' && u.subscription_status === 'active') ||
        (statusFilter === 'expired' && u.subscription_status === 'expired') ||
        (statusFilter === 'free' && (!u.subscription_status || u.subscription_status === 'free'));

      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  // Toggle Block / Unblock
  const handleToggleBlock = async (user: AppUser) => {
    const newBlockedState = !user.is_blocked;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'user_toggle_block',
          userId: user.id,
          blocked: newBlockedState,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast(
          newBlockedState
            ? `Pengguna ${user.email} berhasil diblokir ⛔`
            : `Blokir ${user.email} berhasil dibuka ✅`,
          'info'
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, is_blocked: newBlockedState } : u))
        );
        if (selectedUser?.id === user.id) {
          setSelectedUser((cur) => (cur ? { ...cur, is_blocked: newBlockedState } : null));
        }
      } else {
        addToast(data.message || 'Gagal mengubah status blokir', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Give manual access (+30 days)
  const handleGiveAccess = async (user: AppUser) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unlock_extend',
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast(`Akses premium berhasil diberikan kepada ${user.email} (+30 hari) ✅`, 'success');
        fetchUsers();
        if (selectedUser?.id === user.id) {
          setSelectedUser((cur) =>
            cur ? { ...cur, subscription_status: 'active', days_remaining: 30 } : null
          );
        }
      } else {
        addToast(data.message || 'Gagal memberikan akses', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Revoke manual access
  const handleRevokeAccess = async (user: AppUser) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unlock_revoke',
          userId: user.id,
          reason: 'Dicabut manual dari halaman pengguna',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast(`Akses premium ${user.email} berhasil dicabut ⛔`, 'info');
        fetchUsers();
        if (selectedUser?.id === user.id) {
          setSelectedUser((cur) =>
            cur ? { ...cur, subscription_status: 'expired', days_remaining: 0 } : null
          );
        }
      } else {
        addToast(data.message || 'Gagal mencabut akses', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status?: string, isBlocked?: boolean) => {
    if (isBlocked) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
          <Ban className="w-3.5 h-3.5" />
          <span>Diblokir</span>
        </span>
      );
    }
    if (status === 'active') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Premium Aktif</span>
        </span>
      );
    }
    if (status === 'expired') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Kedaluwarsa</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        Free
      </span>
    );
  };

  const getInitials = (name?: string, email?: string) => {
    const text = name || email || 'User';
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Pengguna</h1>
          <p className="text-xs text-slate-500">
            Daftar pengguna terdaftar, status langganan, riwayat transaksi, dan moderasi akun
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
          title="Muat ulang data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

          {/* Status Filter */}
          <SingleSelectDropdown
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: 'ALL', label: 'Semua Status Langganan' },
              { value: 'active', label: 'Premium Aktif' },
              { value: 'expired', label: 'Kedaluwarsa' },
              { value: 'free', label: 'Free Tier' },
            ]}
            placeholder="Semua Status Langganan"
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
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Tanggal Daftar</th>
                <th className="py-3 px-4">Status Langganan</th>
                <th className="py-3 px-4 text-center">Total Transaksi</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                    <span>Memuat data pengguna...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada pengguna yang sesuai dengan kriteria pencarian
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Avatar & Identitas */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0 border border-orange-200">
                          {getInitials(user.name, user.email)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {user.name || 'Pengguna Kost'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tanggal Daftar */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>

                    {/* Status Langganan */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(user.subscription_status, user.is_blocked)}
                    </td>

                    {/* Total Transaksi */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {user.total_transactions || 0}x
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition-all"
                        >
                          Detail
                        </button>

                        <button
                          onClick={() => handleGiveAccess(user)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold transition-all"
                          title="Beri Akses Manual 30 Hari"
                        >
                          Beri Akses
                        </button>

                        <button
                          onClick={() => handleToggleBlock(user)}
                          disabled={actionLoading}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                            user.is_blocked
                              ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                          title={user.is_blocked ? 'Buka Blokir Akun' : 'Blokir Akun'}
                        >
                          {user.is_blocked ? 'Buka Blokir' : 'Blokir'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer (User Activity & Unlocked Kosts) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 font-bold text-sm flex items-center justify-center border border-orange-200">
                    {getInitials(selectedUser.name, selectedUser.email)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedUser.name || 'Pengguna Kost'}
                    </h3>
                    <p className="text-xs text-slate-400">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-5 space-y-5 text-xs">
                {/* Status Langganan Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">Status Langganan</span>
                    <div className="mt-1">
                      {getStatusBadge(selectedUser.subscription_status, selectedUser.is_blocked)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Masa Aktif</span>
                    <p className="text-xs font-bold text-slate-900 mt-1">
                      {selectedUser.expires_at
                        ? new Date(selectedUser.expires_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Belum berlangganan'}
                    </p>
                  </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGiveAccess(selectedUser)}
                    disabled={actionLoading}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+30 Hari Akses</span>
                  </button>

                  {selectedUser.subscription_status === 'active' && (
                    <button
                      onClick={() => handleRevokeAccess(selectedUser)}
                      disabled={actionLoading}
                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold"
                    >
                      Cabut Akses
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleBlock(selectedUser)}
                    disabled={actionLoading}
                    className={`py-2 px-3 rounded-xl border font-semibold ${
                      selectedUser.is_blocked
                        ? 'border-blue-200 text-blue-700 hover:bg-blue-50'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {selectedUser.is_blocked ? 'Buka Blokir' : 'Blokir'}
                  </button>
                </div>

                {/* Riwayat Kost yang Di-unlock */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-orange-500" />
                    Kost yang Pernah Dibuka
                  </h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <span>Kost Kuningan Executive Residence</span>
                      <span className="text-[11px] text-slate-400">18 Okt 2026</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <span>Kost Menteng Heritage Residence</span>
                      <span className="text-[11px] text-slate-400">16 Okt 2026</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <span>Kost Sudirman Co-Living Hub</span>
                      <span className="text-[11px] text-slate-400">12 Okt 2026</span>
                    </div>
                  </div>
                </div>

                {/* Riwayat Transaksi Midtrans */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-orange-500" />
                    Riwayat Pembayaran
                  </h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <div>
                        <div className="font-bold">Rp 15.000 (QRIS)</div>
                        <div className="text-[10px] text-slate-400 font-mono">ORDER-20261018-001</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Sukses
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

