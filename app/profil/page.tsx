'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_DAYS } from '@/lib/config';
import { useWishlist, useCompare } from '@/lib/wishlist';
import { toast } from '@/lib/toast';
import {
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Heart,
  Lock,
  LogOut,
  Mail,
  PhoneCall,
  Receipt,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Unlock,
  UserRound,
  Wallet,
} from 'lucide-react';

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

type TabKey = 'ringkasan' | 'transaksi' | 'notifikasi' | 'pengaturan';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ringkasan', label: 'Ringkasan' },
  { key: 'transaksi', label: 'Transaksi' },
  { key: 'notifikasi', label: 'Notifikasi' },
  { key: 'pengaturan', label: 'Pengaturan' },
];

const STATUS: Record<string, { label: string; cls: string }> = {
  settlement: { label: 'Lunas', cls: 'bg-green-50 text-[#16A34A] border-green-200' },
  pending: { label: 'Menunggu bayar', cls: 'bg-[#FFEDD5] text-[#C2410C] border-[#F97316]/30' },
  expire: { label: 'Kedaluwarsa', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  cancel: { label: 'Dibatalkan', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  deny: { label: 'Ditolak', cls: 'bg-red-50 text-red-700 border-red-200' },
  failure: { label: 'Gagal', cls: 'bg-red-50 text-red-700 border-red-200' },
};

const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
const fmtDate = (iso: string | null | undefined, long = false) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: long ? 'long' : 'short', year: 'numeric' }) : '-';

export default function ProfilPage() {
  const router = useRouter();
  const { user, subscription, ready, logout, settings, setRemindersOff, profile, updateName, refresh } = useAuth();
  const wishlist = useWishlist();
  const compare = useCompare();
  const isActive = subscription.status === 'active';

  const [tab, setTab] = useState<TabKey>('ringkasan');
  const [txs, setTxs] = useState<Tx[] | null>(null);
  const [notifs, setNotifs] = useState<Notif[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);

  // Belum masuk -> arahkan ke halaman masuk dan kembali ke sini setelahnya.
  useEffect(() => {
    if (ready && !user) router.replace('/login?next=/profil');
  }, [ready, user, router]);

  // Tab dari #hash (mis. tautan lonceng notifikasi -> /profil#notifikasi), saat dibuka maupun saat hash berubah
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace('#', '') as TabKey;
      if (TABS.some((t) => t.key === h)) setTab(h);
    };
    apply();
    window.addEventListener('hashchange', apply);
    window.addEventListener('kk-profil-hash', apply);
    return () => {
      window.removeEventListener('hashchange', apply);
      window.removeEventListener('kk-profil-hash', apply);
    };
  }, []);

  const selectTab = (k: TabKey) => {
    setTab(k);
    window.history.replaceState(null, '', k === 'ringkasan' ? '/profil' : `/profil#${k}`);
  };

  const loadData = useCallback(async () => {
    setLoadError(false);
    try {
      const [t, n] = await Promise.all([
        fetch('/api/me/transactions', { credentials: 'same-origin', cache: 'no-store' }),
        fetch('/api/notifications', { credentials: 'same-origin', cache: 'no-store' }),
      ]);
      if (t.ok) setTxs((await t.json()).transactions);
      else setTxs([]);
      if (n.ok) setNotifs((await n.json()).items);
      else setNotifs([]);
      if (!t.ok && !n.ok) setLoadError(true);
    } catch {
      setTxs((cur) => cur ?? []);
      setNotifs((cur) => cur ?? []);
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [user, loadData]);

  const markRead = async (body: { all: true } | { id: string }) => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
    });
    setNotifs((cur) => cur?.map((n) => ('all' in body || n.id === body.id ? { ...n, read: true } : n)) ?? cur);
    void refresh();
  };

  const paid = useMemo(() => (txs ?? []).filter((t) => t.status === 'settlement'), [txs]);
  const pendingTx = useMemo(() => (txs ?? []).find((t) => t.status === 'pending'), [txs]);
  const unread = notifs?.filter((n) => !n.read).length ?? 0;
  const totalPaid = profile.totalPaid || paid.reduce((s, t) => s + t.amount, 0);
  const progress = isActive ? Math.max(4, Math.min(100, Math.round((subscription.daysRemaining / SUBSCRIPTION_DAYS) * 100))) : 0;
  const expiringSoon = isActive && subscription.daysRemaining <= 3;

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-40 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
          </div>
          <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  const displayName = user.fullName || user.email.split('@')[0] || 'Pengguna';
  const initial = displayName.charAt(0).toUpperCase();

  const saveName = async () => {
    if (nameDraft === null) return;
    setSavingName(true);
    const res = await updateName(nameDraft);
    setSavingName(false);
    if (res.success) {
      setNameDraft(null);
      toast('Nama berhasil diperbarui.', 'success');
    } else {
      toast(res.error || 'Gagal menyimpan nama.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <nav className="text-xs text-slate-500 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-slate-900 transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Profil Saya</span>
        </nav>

        {/* Header profil */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F2A43] to-[#16385A] text-white p-6 sm:p-8 shadow-md">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#F97316]/15 pointer-events-none" aria-hidden />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#F97316] to-[#FB923C] flex items-center justify-center text-3xl font-black shadow-lg shadow-black/20 shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate">{displayName}</h1>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16A34A] text-white">
                    <ShieldCheck className="w-3.5 h-3.5" /> Member Premium
                  </span>
                ) : subscription.status === 'expired' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-white">Akses berakhir</span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-white">Akun Gratis</span>
                )}
              </div>
              <p className="text-sm text-slate-300 flex items-center gap-1.5 min-w-0">
                <Mail className="w-4 h-4 shrink-0" /> <span className="truncate">{user.email}</span>
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5" suppressHydrationWarning>
                <CalendarClock className="w-3.5 h-3.5" /> Bergabung sejak {fmtDate(profile.createdAt, true)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="hidden sm:inline-flex items-center gap-1.5 self-start text-xs font-bold text-white/90 bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </section>

        {/* Ringkasan angka (dari database) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Ringkasan akun">
          <StatTile icon={<Clock className="w-4 h-4" />} label="Sisa akses" value={isActive ? `${subscription.daysRemaining} hari` : '-'} hint={isActive ? `s/d ${fmtDate(subscription.expiresAt)}` : 'Belum aktif'} tone={expiringSoon ? 'warn' : isActive ? 'good' : 'muted'} onClick={() => selectTab('ringkasan')} />
          <StatTile icon={<Wallet className="w-4 h-4" />} label="Total dibayar" value={rp(totalPaid)} hint={`${paid.length} transaksi lunas`} onClick={() => selectTab('transaksi')} />
          <StatTile icon={<Heart className="w-4 h-4" />} label="Kost favorit" value={String(wishlist.count)} hint="Disimpan di wishlist" href="/wishlist" />
          <StatTile icon={<Bell className="w-4 h-4" />} label="Notifikasi baru" value={String(unread)} hint={unread ? 'Belum dibaca' : 'Semua sudah dibaca'} tone={unread ? 'warn' : 'muted'} onClick={() => selectTab('notifikasi')} />
        </section>

        {/* Tab */}
        <div className="sticky top-[81px] z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-2 bg-slate-50/90 backdrop-blur">
          <div role="tablist" aria-label="Bagian profil" className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => selectTab(t.key)}
                className={`flex-1 min-w-fit whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${tab === t.key ? 'bg-[#0F2A43] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {t.label}
                {t.key === 'notifikasi' && unread > 0 && (
                  <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${tab === t.key ? 'bg-[#F97316] text-white' : 'bg-[#F97316] text-white'}`}>{unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {loadError && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700" role="alert">
            <span>Sebagian data belum bisa dimuat. Periksa koneksi Anda.</span>
            <button type="button" onClick={loadData} className="font-bold underline cursor-pointer">Coba lagi</button>
          </div>
        )}

        {/* === Ringkasan === */}
        {tab === 'ringkasan' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className={`lg:col-span-2 self-start rounded-3xl border p-6 sm:p-7 space-y-5 ${isActive ? 'bg-white border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)]' : 'bg-white border-dashed border-[#F97316]/50'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isActive ? 'bg-green-50 text-[#16A34A]' : 'bg-slate-100 text-slate-600'}`}>
                    {isActive ? 'Langganan aktif' : subscription.status === 'expired' ? 'Langganan berakhir' : 'Belum berlangganan'}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {isActive ? 'Akses penuh sedang aktif' : `Buka akses penuh ${rp(SUBSCRIPTION_PRICE)} / ${SUBSCRIPTION_DAYS} hari`}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {isActive
                      ? `Berlaku sampai ${fmtDate(subscription.expiresAt, true)}. Perpanjangan ditambahkan di belakang masa aktif.`
                      : subscription.status === 'expired'
                        ? `Masa aktif berakhir pada ${fmtDate(subscription.expiresAt, true)}. Perpanjang untuk membuka kembali nomor pemilik dan foto eksklusif.`
                        : 'Lihat nomor WhatsApp pemilik, semua foto, dan video kamar tanpa batas selama masa aktif.'}
                  </p>
                </div>
                <Link href="/checkout" className="inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md shadow-[#F97316]/20 transition-all shrink-0">
                  <Sparkles className="w-4 h-4" />
                  {isActive ? `Perpanjang ${SUBSCRIPTION_DAYS} hari` : subscription.status === 'expired' ? 'Perpanjang akses' : `Beli akses ${rp(SUBSCRIPTION_PRICE)}`}
                </Link>
              </div>

              {isActive && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={expiringSoon ? 'text-[#C2410C]' : 'text-slate-600'}>{subscription.daysRemaining} dari {SUBSCRIPTION_DAYS} hari tersisa</span>
                    {expiringSoon && <span className="text-[#C2410C]">Segera berakhir</span>}
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={subscription.daysRemaining} aria-valuemin={0} aria-valuemax={SUBSCRIPTION_DAYS} aria-label="Sisa masa aktif">
                    <div className={`h-full rounded-full transition-all ${expiringSoon ? 'bg-[#F97316]' : 'bg-[#16A34A]'}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {pendingTx && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-[#FFEDD5]/60 border border-[#F97316]/30 px-4 py-3 text-xs">
                  <span className="text-[#9A3412] font-semibold">Ada pembayaran {rp(pendingTx.amount)} yang belum selesai.</span>
                  <Link href="/checkout" className="font-bold text-[#C2410C] hover:underline">Lanjutkan pembayaran →</Link>
                </div>
              )}

              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {[
                  { icon: <PhoneCall className="w-4 h-4" />, text: 'Nomor WhatsApp pemilik' },
                  { icon: <Unlock className="w-4 h-4" />, text: 'Semua foto & video kamar' },
                  { icon: <ShieldCheck className="w-4 h-4" />, text: 'Tanpa kuota & tanpa komisi' },
                ].map((b) => (
                  <li key={b.text} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ${isActive ? 'bg-green-50 text-[#166534]' : 'bg-slate-50 text-slate-500'}`}>
                    {isActive ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Lock className="w-4 h-4" />}
                    <span>{b.text}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold text-slate-800 px-1">Pintasan</h2>
              <ShortcutRow href="/cari-kost" icon={<Search className="w-4 h-4" />} title="Cari kost" desc="Temukan kost sesuai lokasi & budget" />
              <ShortcutRow href="/wishlist" icon={<Heart className="w-4 h-4" />} title="Kost favorit" desc={wishlist.count ? `${wishlist.count} kost tersimpan` : 'Belum ada yang disimpan'} />
              <ShortcutRow href="/bandingkan" icon={<Scale className="w-4 h-4" />} title="Bandingkan kost" desc={compare.count ? `${compare.count} kost dipilih` : 'Pilih hingga 3 kost'} />
              <button type="button" onClick={() => selectTab('transaksi')} className="w-full text-left cursor-pointer">
                <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3.5 hover:border-slate-300 hover:shadow-xs transition-all">
                  <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><Receipt className="w-4 h-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-800">Riwayat transaksi</span>
                    <span className="block text-xs text-slate-500 truncate" suppressHydrationWarning>
                      {txs === null ? 'Memuat…' : paid[0] ? `Terakhir: ${rp(paid[0].amount)} · ${fmtDate(paid[0].paidAt ?? paid[0].createdAt)}` : 'Belum ada pembayaran'}
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </button>
            </section>
          </div>
        )}

        {/* === Transaksi === */}
        {tab === 'transaksi' && (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-[#F97316]" /> Riwayat transaksi</h2>
              <button type="button" onClick={loadData} aria-label="Muat ulang riwayat" className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {txs === null ? (
              <div className="p-6"><div className="h-28 rounded-xl bg-slate-100 animate-pulse" aria-hidden /></div>
            ) : txs.length === 0 ? (
              <EmptyState icon={<CreditCard className="w-8 h-8" />} title="Belum ada transaksi" text="Pembayaran akses penuh akan tercatat di sini." action={<Link href="/checkout" className="inline-block text-xs font-bold text-white bg-[#F97316] hover:bg-[#EA580C] px-5 py-2.5 rounded-full transition-colors">Buka akses penuh</Link>} />
            ) : (
              <ul className="divide-y divide-slate-100">
                {txs.map((t) => {
                  const st = STATUS[t.status] ?? { label: t.status, cls: 'bg-slate-100 text-slate-500 border-slate-200' };
                  return (
                    <li key={t.orderId} className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-sm font-bold text-slate-900" suppressHydrationWarning>{rp(t.amount)} <span className="font-medium text-slate-400">· {t.method}</span></p>
                        <p className="text-[11px] font-mono text-slate-500 truncate">{t.orderId}</p>
                        <p className="text-xs text-slate-500" suppressHydrationWarning>{fmtDate(t.paidAt ?? t.createdAt, true)}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
                        {t.status === 'settlement' ? (
                          <Link href={`/invoice/${t.orderId}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#C2410C] hover:underline"><FileText className="w-3.5 h-3.5" /> Invoice</Link>
                        ) : t.status === 'pending' ? (
                          <Link href="/checkout" className="text-xs font-bold text-[#C2410C] hover:underline">Lanjut bayar</Link>
                        ) : (
                          <span className="w-14" />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* === Notifikasi === */}
        {tab === 'notifikasi' && (
          <section id="notifikasi" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-28">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 flex items-center gap-2"><Bell className="w-4 h-4 text-[#F97316]" /> Notifikasi</h2>
              {unread > 0 && <button type="button" onClick={() => markRead({ all: true })} className="text-xs font-bold text-[#C2410C] hover:underline cursor-pointer">Tandai semua dibaca</button>}
            </div>
            {notifs === null ? (
              <div className="p-6"><div className="h-28 rounded-xl bg-slate-100 animate-pulse" aria-hidden /></div>
            ) : notifs.length === 0 ? (
              <EmptyState icon={<Bell className="w-8 h-8" />} title="Belum ada notifikasi" text="Kabar pembayaran dan pengingat masa aktif akan muncul di sini." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifs.map((n) => {
                  const inner = (
                    <div className="flex gap-3">
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-[#F97316]'}`} aria-hidden />
                      <div className="min-w-0 space-y-0.5">
                        <p className={`text-sm ${n.read ? 'text-slate-600' : 'font-bold text-[#0F2A43]'}`}>{n.title}</p>
                        <p className="text-xs text-slate-500">{n.body}</p>
                        <p className="text-[11px] text-slate-400" suppressHydrationWarning>{fmtDate(n.created_at, true)}</p>
                      </div>
                    </div>
                  );
                  return (
                    <li key={n.id} className={n.read ? '' : 'bg-[#FFEDD5]/30'}>
                      {n.href ? (
                        <Link href={n.href} onClick={() => !n.read && markRead({ id: n.id })} className="block px-5 sm:px-6 py-4 hover:bg-slate-50 transition-colors">{inner}</Link>
                      ) : (
                        <button type="button" onClick={() => !n.read && markRead({ id: n.id })} className="block w-full text-left px-5 sm:px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer">{inner}</button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* === Pengaturan === */}
        {tab === 'pengaturan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
              <h2 className="font-bold text-slate-900 flex items-center gap-2"><UserRound className="w-4 h-4 text-[#F97316]" /> Informasi akun</h2>
              <div className="space-y-1.5">
                <label htmlFor="nama" className="text-xs font-bold text-slate-600">Nama tampilan</label>
                <div className="flex gap-2">
                  <input
                    id="nama"
                    value={nameDraft ?? displayName}
                    onChange={(e) => setNameDraft(e.target.value)}
                    maxLength={60}
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
                  />
                  <button
                    type="button"
                    onClick={saveName}
                    disabled={savingName || nameDraft === null || nameDraft.trim() === displayName}
                    className="px-4 rounded-xl bg-[#0F2A43] text-white text-sm font-bold disabled:opacity-40 hover:bg-[#16385A] transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    {savingName ? 'Menyimpan…' : 'Simpan'}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">Email</span>
                <p className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 truncate">{user.email}</p>
              </div>
            </section>

            <div className="space-y-6">
              <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Bell className="w-4 h-4" /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">Email pengingat</p>
                      <p className="text-xs text-slate-500">Kabari 3 hari sebelum akses berakhir.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={!settings.remindersOff}
                      onChange={async (e) => {
                        // Simpan nilai SEBELUM await: setelah itu input terkontrol sudah dikembalikan React
                        const enable = e.target.checked;
                        const ok = await setRemindersOff(!enable);
                        toast(ok ? (enable ? 'Email pengingat diaktifkan.' : 'Email pengingat dinonaktifkan.') : 'Gagal memperbarui pengaturan.', ok ? 'success' : 'error');
                      }}
                      className="sr-only peer"
                      aria-label="Email pengingat"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus-visible:ring-2 peer-focus-visible:ring-[#F97316]/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F97316]" />
                  </label>
                </div>
              </section>

              <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3">
                <h2 className="font-bold text-slate-900 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#16A34A]" /> Keamanan sesi</h2>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> Keluar otomatis setelah 15 menit tanpa aktivitas.</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> Sesi berakhir saat browser ditutup.</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> Akses berbayar tetap melekat pada akunmu, tidak hilang saat keluar.</li>
                </ul>
              </section>

              <button
                type="button"
                onClick={() => logout()}
                className="w-full py-3.5 px-4 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Keluar dari akun
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, hint, tone = 'muted', onClick, href }: { icon: React.ReactNode; label: string; value: string; hint: string; tone?: 'good' | 'warn' | 'muted'; onClick?: () => void; href?: string }) {
  const toneCls = tone === 'good' ? 'text-[#16A34A]' : tone === 'warn' ? 'text-[#C2410C]' : 'text-slate-900';
  const body = (
    <div className="h-full rounded-2xl bg-white border border-slate-200 p-4 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">{icon}{label}</div>
      <p className={`mt-1.5 text-xl font-black tracking-tight truncate ${toneCls}`} suppressHydrationWarning>{value}</p>
      <p className="text-[11px] text-slate-500 truncate" suppressHydrationWarning>{hint}</p>
    </div>
  );
  if (href) return <Link href={href} className="block">{body}</Link>;
  return <button type="button" onClick={onClick} className="block w-full text-left cursor-pointer">{body}</button>;
}

function ShortcutRow({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3.5 hover:border-slate-300 hover:shadow-xs transition-all group">
      <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-[#FFEDD5] group-hover:text-[#C2410C] transition-colors">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-800">{title}</span>
        <span className="block text-xs text-slate-500 truncate">{desc}</span>
      </span>
      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}

function EmptyState({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="px-6 py-12 text-center space-y-2">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">{icon}</div>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500 max-w-xs mx-auto">{text}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
