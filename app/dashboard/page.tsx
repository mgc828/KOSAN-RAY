'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_DAYS } from '@/lib/config';
import { toast } from '@/lib/toast';
import { CreditCard, CheckCircle2, PhoneCall, LogOut, FileText, Bell, RefreshCw, Receipt } from 'lucide-react';

interface Tx {
  orderId: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  paidAt: string | null;
  expiresAt: string | null;
}

interface Notif {
  id: string;
  title: string;
  body: string;
  href?: string;
  created_at: string;
  read: boolean;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  settlement: { label: 'Lunas', cls: 'bg-green-50 text-[#16A34A]' },
  pending: { label: 'Menunggu', cls: 'bg-[#FFEDD5] text-[#C2410C]' },
  expire: { label: 'Kedaluwarsa', cls: 'bg-slate-100 text-slate-500' },
  cancel: { label: 'Dibatalkan', cls: 'bg-slate-100 text-slate-500' },
  deny: { label: 'Ditolak', cls: 'bg-red-50 text-red-700' },
  failure: { label: 'Gagal', cls: 'bg-red-50 text-red-700' },
};

const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export default function DashboardPage() {
  const router = useRouter();
  const { user, subscription, ready, settings, setRemindersOff, logout } = useAuth();
  const isActive = subscription.status === 'active';

  const [txs, setTxs] = useState<Tx[] | null>(null);
  const [notifs, setNotifs] = useState<Notif[] | null>(null);

  // Belum masuk -> arahkan ke halaman masuk.
  useEffect(() => {
    if (ready && !user) router.replace('/login?next=/dashboard');
  }, [ready, user, router]);

  const loadData = useCallback(async () => {
    try {
      const [t, n] = await Promise.all([
        fetch('/api/me/transactions', { credentials: 'same-origin', cache: 'no-store' }),
        fetch('/api/notifications', { credentials: 'same-origin', cache: 'no-store' }),
      ]);
      if (t.ok) setTxs((await t.json()).transactions);
      if (n.ok) setNotifs((await n.json()).items);
    } catch {
      setTxs((cur) => cur ?? []);
      setNotifs((cur) => cur ?? []);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [user, loadData]);

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ all: true }),
    });
    setNotifs((cur) => cur?.map((n) => ({ ...n, read: true })) ?? cur);
  };

  if (!ready || !user) {
    return <div className="max-w-4xl mx-auto px-4 py-16"><div className="h-40 rounded-3xl bg-slate-100 animate-pulse" aria-hidden /></div>;
  }

  const unread = notifs?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2A43] tracking-tight">Dashboard Akun & Langganan</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Kelola akses, lihat riwayat pembayaran, dan perpanjang langganan {rp(SUBSCRIPTION_PRICE)} / {SUBSCRIPTION_DAYS} hari.
          </p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar dari Akun</span>
        </button>
      </div>

      {/* Status langganan */}
      <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 ${isActive ? 'bg-[#0F2A43] text-white border-[#16385A] shadow-md' : 'bg-white border-neutral-200 shadow-xs'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isActive ? 'bg-[#16A34A] text-white' : 'bg-neutral-200 text-neutral-700'}`}>
              {isActive ? 'Langganan Aktif' : subscription.status === 'expired' ? 'Langganan Berakhir' : 'Belum Berlangganan'}
            </span>
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${isActive ? 'text-white' : 'text-neutral-900'}`}>
              Paket kost-kostan {rp(SUBSCRIPTION_PRICE)} / {SUBSCRIPTION_DAYS} Hari
            </h2>
          </div>

          {isActive ? (
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center sm:text-right shrink-0">
              <p className="text-xs text-neutral-300 font-medium">Aktif sampai:</p>
              <p className="text-lg font-bold text-[#F97316]" suppressHydrationWarning>
                {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Sisa {subscription.daysRemaining} hari lagi</p>
            </div>
          ) : (
            <Link href="/checkout" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all shrink-0">
              <CreditCard className="w-4 h-4" />
              <span>{subscription.status === 'expired' ? 'Perpanjang' : 'Beli'} Akses {rp(SUBSCRIPTION_PRICE)}</span>
            </Link>
          )}
        </div>

        <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${isActive ? 'border-white/10 text-neutral-300' : 'border-neutral-100 text-neutral-500'}`}>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Semua foto & video terbuka</span>
            <span className="flex items-center gap-1.5"><PhoneCall className="w-4 h-4 text-[#16A34A]" /> Nomor WhatsApp pemilik terbuka</span>
          </div>
          {isActive && (
            <Link href="/checkout" className="font-bold underline text-[#F97316] hover:text-[#FB923C]">
              + Perpanjang {SUBSCRIPTION_DAYS} hari lagi ({rp(SUBSCRIPTION_PRICE)})
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Akun & pengingat */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 self-start">
          <h3 className="font-bold text-neutral-900 text-base">Informasi Akun</h3>
          <div className="space-y-3 text-xs text-neutral-600">
            <div className="flex justify-between gap-3 py-2 border-b border-neutral-100">
              <span className="text-neutral-500">Email:</span>
              <span className="font-semibold text-neutral-900 truncate">{user.email}</span>
            </div>
            <div className="flex justify-between gap-3 py-2 border-b border-neutral-100">
              <span className="text-neutral-500">Status akses:</span>
              <span className={`font-bold ${isActive ? 'text-[#16A34A]' : 'text-[#C2410C]'}`}>{isActive ? 'Member Premium' : 'Pengguna Gratis (Preview)'}</span>
            </div>
            <label className="flex items-start justify-between gap-3 py-2 cursor-pointer">
              <span>
                <span className="block font-semibold text-neutral-900">Email pengingat</span>
                <span className="text-neutral-500">Kabari saya 3 hari sebelum akses berakhir.</span>
              </span>
              <input
                type="checkbox"
                checked={!settings.remindersOff}
                onChange={async (e) => {
                  const ok = await setRemindersOff(!e.target.checked);
                  toast(ok ? (e.target.checked ? 'Email pengingat dinyalakan.' : 'Email pengingat dimatikan.') : 'Gagal menyimpan pengaturan.', ok ? 'success' : 'error');
                }}
                className="mt-1 w-5 h-5 accent-[#F97316] shrink-0"
                aria-label="Email pengingat"
              />
            </label>
          </div>
        </div>

        {/* Notifikasi */}
        <div id="notifikasi" className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3 scroll-mt-24">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#F97316]" /> Notifikasi
              {unread > 0 && <span className="text-[10px] font-bold bg-[#F97316] text-white rounded-full px-1.5 py-0.5">{unread}</span>}
            </h3>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className="text-[11px] font-bold text-[#C2410C] hover:underline">Tandai dibaca</button>
            )}
          </div>
          {notifs === null ? (
            <div className="h-20 rounded-xl bg-slate-100 animate-pulse" aria-hidden />
          ) : notifs.length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada notifikasi. Kabar pembayaran dan pengingat masa aktif akan muncul di sini.</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {notifs.slice(0, 8).map((n) => {
                const inner = (
                  <>
                    <p className={`text-xs ${n.read ? 'text-slate-600' : 'font-bold text-[#0F2A43]'}`}>{n.title}</p>
                    <p className="text-[11px] text-slate-500">{n.body}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5" suppressHydrationWarning>{fmtDate(n.created_at)}</p>
                  </>
                );
                return (
                  <li key={n.id} className={`rounded-xl p-3 border ${n.read ? 'border-slate-100' : 'border-[#F97316]/30 bg-[#FFEDD5]/40'}`}>
                    {n.href ? <Link href={n.href} className="block hover:opacity-80">{inner}</Link> : inner}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Riwayat transaksi */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-neutral-900 text-base flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#F97316]" /> Riwayat Transaksi
          </h3>
          <button type="button" onClick={loadData} aria-label="Muat ulang riwayat" className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {txs === null ? (
          <div className="h-24 rounded-xl bg-slate-100 animate-pulse" aria-hidden />
        ) : txs.length === 0 ? (
          <p className="text-xs text-slate-500">Belum ada transaksi. <Link href="/checkout" className="font-bold text-[#C2410C] hover:underline">Buka akses penuh</Link></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="py-2 pr-3 font-semibold">Tanggal</th>
                  <th className="py-2 pr-3 font-semibold">Order ID</th>
                  <th className="py-2 pr-3 font-semibold">Jumlah</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 font-semibold text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {txs.map((t) => {
                  const st = STATUS[t.status] ?? { label: t.status, cls: 'bg-slate-100 text-slate-500' };
                  return (
                    <tr key={t.orderId}>
                      <td className="py-2.5 pr-3 text-slate-600" suppressHydrationWarning>{fmtDate(t.paidAt ?? t.createdAt)}</td>
                      <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-700">{t.orderId}</td>
                      <td className="py-2.5 pr-3 font-semibold text-slate-900" suppressHydrationWarning>{rp(t.amount)}</td>
                      <td className="py-2.5 pr-3"><span className={`font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span></td>
                      <td className="py-2.5 text-right">
                        {t.status === 'settlement' ? (
                          <Link href={`/invoice/${t.orderId}`} className="inline-flex items-center gap-1 font-bold text-[#C2410C] hover:underline">
                            <FileText className="w-3.5 h-3.5" /> Lihat
                          </Link>
                        ) : t.status === 'pending' ? (
                          <Link href="/checkout" className="font-bold text-[#C2410C] hover:underline">Lanjut bayar</Link>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
