'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_DAYS } from '@/lib/config';
import { useWishlist, useCompare } from '@/lib/wishlist';
import { toast } from '@/lib/toast';
import BrandLogo from '@/components/BrandLogo';
import Sheet from '@/components/ui/Sheet';
import {
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  Heart,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Mail,
  Map as MapIcon,
  Receipt,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Wallet,
  XCircle,
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

type SectionKey = 'ringkasan' | 'transaksi' | 'notifikasi' | 'pengaturan';

const SECTIONS: { key: SectionKey; label: string; title: string; subtitle: string; icon: React.ElementType }[] = [
  { key: 'ringkasan', label: 'Beranda', title: 'Akun Saya', subtitle: 'Status akses dan aktivitasmu', icon: LayoutGrid },
  { key: 'transaksi', label: 'Transaksi', title: 'Transaksi', subtitle: 'Riwayat pembayaran dan invoice', icon: Receipt },
  { key: 'notifikasi', label: 'Notifikasi', title: 'Notifikasi', subtitle: 'Kabar pembayaran dan masa aktif', icon: Bell },
  { key: 'pengaturan', label: 'Pengaturan', title: 'Pengaturan', subtitle: 'Nama, pengingat, dan keamanan', icon: Settings },
];

const STATUS: Record<string, { label: string; cls: string; tone: 'ok' | 'wait' | 'bad' }> = {
  settlement: { label: 'Lunas', cls: 'bg-green-50 text-green-700 ring-green-600/20', tone: 'ok' },
  pending: { label: 'Menunggu bayar', cls: 'bg-amber-50 text-amber-800 ring-amber-600/25', tone: 'wait' },
  expire: { label: 'Kedaluwarsa', cls: 'bg-slate-100 text-slate-600 ring-slate-500/20', tone: 'bad' },
  cancel: { label: 'Dibatalkan', cls: 'bg-slate-100 text-slate-600 ring-slate-500/20', tone: 'bad' },
  deny: { label: 'Ditolak', cls: 'bg-red-50 text-red-700 ring-red-600/20', tone: 'bad' },
  failure: { label: 'Gagal', cls: 'bg-red-50 text-red-700 ring-red-600/20', tone: 'bad' },
};

const TX_FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'ok', label: 'Lunas' },
  { key: 'wait', label: 'Menunggu' },
  { key: 'bad', label: 'Gagal / kedaluwarsa' },
] as const;
type TxFilter = (typeof TX_FILTERS)[number]['key'];

const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
const fmtDate = (iso: string | null | undefined, long = false) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: long ? 'long' : 'short', year: 'numeric' }) : '-';
const fmtDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const toneOf = (status: string) => STATUS[status]?.tone ?? 'bad';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Baru saja';
  if (min < 60) return `${min} menit lalu`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Kemarin';
  if (d < 7) return `${d} hari lalu`;
  return fmtDate(iso);
}

function groupOf(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d < 1) return 'Hari ini';
  if (d < 2) return 'Kemarin';
  if (d < 7) return 'Minggu ini';
  return 'Lebih lama';
}

export default function ProfilPage() {
  const router = useRouter();
  const { user, subscription, ready, logout, settings, setRemindersOff, profile, updateName, refresh } = useAuth();
  const wishlist = useWishlist();
  const compare = useCompare();
  const isActive = subscription.status === 'active';

  const [section, setSection] = useState<SectionKey>('ringkasan');
  const [txs, setTxs] = useState<Tx[] | null>(null);
  const [notifs, setNotifs] = useState<Notif[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Filter transaksi
  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [txQuery, setTxQuery] = useState('');
  const [txSort, setTxSort] = useState<'new' | 'old' | 'high' | 'low'>('new');
  const [txDetail, setTxDetail] = useState<Tx | null>(null);
  // Filter notifikasi
  const [nFilter, setNFilter] = useState<'all' | 'unread'>('all');
  const [nDetail, setNDetail] = useState<Notif | null>(null);
  // Pengaturan
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready && !user) router.replace('/masuk?next=/profil');
  }, [ready, user, router]);

  // Bagian dari #hash (mis. lonceng notifikasi -> /profil#notifikasi), saat dibuka maupun saat hash berubah
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace('#', '') as SectionKey;
      if (SECTIONS.some((s) => s.key === h)) setSection(h);
    };
    apply();
    window.addEventListener('hashchange', apply);
    window.addEventListener('kk-profil-hash', apply);
    return () => {
      window.removeEventListener('hashchange', apply);
      window.removeEventListener('kk-profil-hash', apply);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  const go = (k: SectionKey) => {
    setSection(k);
    setMenuOpen(false);
    window.history.replaceState(null, '', k === 'ringkasan' ? '/profil' : `/profil#${k}`);
    window.scrollTo({ top: 0 });
  };

  const loadData = useCallback(async () => {
    setLoadError(false);
    try {
      const [t, n] = await Promise.all([
        fetch('/api/me/transactions', { credentials: 'same-origin', cache: 'no-store' }),
        fetch('/api/notifications', { credentials: 'same-origin', cache: 'no-store' }),
      ]);
      setTxs(t.ok ? (await t.json()).transactions : []);
      setNotifs(n.ok ? (await n.json()).items : []);
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

  const txCounts = useMemo(() => {
    const c = { all: 0, ok: 0, wait: 0, bad: 0 };
    (txs ?? []).forEach((t) => { c.all++; c[toneOf(t.status)]++; });
    return c;
  }, [txs]);

  const txShown = useMemo(() => {
    const q = txQuery.trim().toLowerCase();
    const list = (txs ?? []).filter((t) => (txFilter === 'all' || toneOf(t.status) === txFilter) && (!q || t.orderId.toLowerCase().includes(q) || String(t.amount).includes(q.replace(/\D/g, '') || '§') || t.method.toLowerCase().includes(q)));
    const by = { new: (a: Tx, b: Tx) => b.createdAt.localeCompare(a.createdAt), old: (a: Tx, b: Tx) => a.createdAt.localeCompare(b.createdAt), high: (a: Tx, b: Tx) => b.amount - a.amount, low: (a: Tx, b: Tx) => a.amount - b.amount }[txSort];
    return [...list].sort(by);
  }, [txs, txFilter, txQuery, txSort]);

  const nShown = useMemo(() => (notifs ?? []).filter((n) => nFilter === 'all' || !n.read), [notifs, nFilter]);
  const nGroups = useMemo(() => {
    const order = ['Hari ini', 'Kemarin', 'Minggu ini', 'Lebih lama'];
    const map = new Map<string, Notif[]>();
    nShown.forEach((n) => map.set(groupOf(n.created_at), [...(map.get(groupOf(n.created_at)) ?? []), n]));
    return order.filter((g) => map.has(g)).map((g) => ({ label: g, items: map.get(g)! }));
  }, [nShown]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 space-y-4">
        <div className="h-14 rounded-2xl bg-white border border-slate-200 animate-pulse" />
        <div className="h-56 rounded-3xl bg-orange-100 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200 animate-pulse" />)}</div>
      </div>
    );
  }

  const displayName = user.fullName || user.email.split('@')[0] || 'Pengguna';
  const firstName = displayName.split(' ')[0];
  const initial = displayName.charAt(0).toUpperCase();
  const current = SECTIONS.find((s) => s.key === section)!;
  const badgeFor = (k: SectionKey) => (k === 'notifikasi' ? unread : 0);

  const openName = () => { setNameDraft(displayName); setNameOpen(true); };
  const saveName = async () => {
    setSavingName(true);
    const res = await updateName(nameDraft);
    setSavingName(false);
    if (res.success) { setNameOpen(false); toast('Nama berhasil diperbarui.', 'success'); }
    else toast(res.error || 'Gagal menyimpan nama.', 'error');
  };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast('Order ID disalin.', 'success'); } catch { toast('Tidak bisa menyalin.', 'error'); }
  };

  // Langkah berikutnya, disusun dari kondisi akun yang nyata
  const todo: { key: string; text: string; cta: string; href?: string; onClick?: () => void; urgent?: boolean }[] = [];
  if (pendingTx) todo.push({ key: 'pending', text: `Pembayaran ${rp(pendingTx.amount)} belum selesai.`, cta: 'Lanjutkan bayar', href: '/checkout', urgent: true });
  if (expiringSoon) todo.push({ key: 'expiring', text: `Akses berakhir ${subscription.daysRemaining <= 0 ? 'hari ini' : `${subscription.daysRemaining} hari lagi`}.`, cta: 'Perpanjang', href: '/checkout', urgent: true });
  if (!isActive && !pendingTx) todo.push({ key: 'buy', text: subscription.status === 'expired' ? 'Aksesmu sudah berakhir, nomor pemilik terkunci lagi.' : 'Buka akses untuk melihat nomor WhatsApp pemilik.', cta: subscription.status === 'expired' ? 'Perpanjang akses' : `Buka akses ${rp(SUBSCRIPTION_PRICE)}`, href: '/checkout' });
  if (unread > 0) todo.push({ key: 'notif', text: `${unread} notifikasi belum dibaca.`, cta: 'Baca sekarang', onClick: () => go('notifikasi') });
  if (settings.remindersOff && isActive) todo.push({ key: 'remind', text: 'Email pengingat sedang mati.', cta: 'Nyalakan', onClick: () => go('pengaturan') });
  if (wishlist.count === 0) todo.push({ key: 'wish', text: 'Belum ada kost favorit. Simpan yang menarik untuk dibandingkan.', cta: 'Cari kost', href: '/cari-kost' });

  const navLinks = [
    { href: '/cari-kost', label: 'Cari kost' },
    { href: '/maps', label: 'Peta' },
    { href: '/wishlist', label: 'Favorit', count: wishlist.count },
    { href: '/bandingkan', label: 'Bandingkan', count: compare.count },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-10">
      {/* Bilah atas */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto h-14 md:h-16 px-4 md:px-6 flex items-center gap-3">
          <Link href="/" className="shrink-0" aria-label="Ke beranda">
            <BrandLogo variant="mark" className="h-8 md:hidden" />
            <BrandLogo variant="horizontal" className="h-9 hidden md:block" />
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Jelajahi situs">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                {l.label}{l.count ? <span className="ml-1.5 text-xs text-[#C2410C] font-semibold tabular-nums" suppressHydrationWarning>{l.count}</span> : null}
              </Link>
            ))}
          </nav>
          <h1 className="md:hidden flex-1 text-base font-bold text-[#0F2A43] truncate">{current.title}</h1>
          <div className="hidden md:block flex-1" />
          <button type="button" onClick={() => go('notifikasi')} aria-label={`Notifikasi${unread ? `, ${unread} belum dibaca` : ''}`} className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            {unread > 0 && <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>}
          </button>
          <div className="relative" ref={menuRef}>
            <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen} className="flex items-center gap-2 h-10 pl-1 md:pr-2.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
              <span className="w-8 h-8 rounded-full bg-[#F97316] text-white text-sm font-bold flex items-center justify-center">{initial}</span>
              <span className="hidden md:block text-sm font-medium text-slate-700 max-w-[140px] truncate">{firstName}</span>
              <ChevronDown className="hidden md:block w-4 h-4 text-slate-400" />
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-40">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <button role="menuitem" type="button" onClick={() => go('pengaturan')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"><Settings className="w-4 h-4" /> Pengaturan</button>
                <Link role="menuitem" href="/wishlist" className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"><Heart className="w-4 h-4" /> Kost favorit</Link>
                <button role="menuitem" type="button" onClick={() => logout()} className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"><LogOut className="w-4 h-4" /> Keluar</button>
              </div>
            )}
          </div>
        </div>

        {/* Tab (desktop) */}
        <div className="hidden md:block border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6 flex gap-1" role="tablist" aria-label="Bagian akun">
            {SECTIONS.map((s) => {
              const active = section === s.key;
              const b = badgeFor(s.key);
              return (
                <button key={s.key} type="button" role="tab" aria-selected={active} onClick={() => go(s.key)} className={`relative px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${active ? 'text-[#C2410C]' : 'text-slate-500 hover:text-slate-800'}`}>
                  {s.label}
                  {b > 0 && <span className="ml-1.5 rounded-full bg-[#F97316] text-white text-[10px] font-bold px-1.5 py-0.5">{b}</span>}
                  {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#F97316]" aria-hidden />}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7 space-y-5 md:space-y-6">
        {loadError && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            <span>Sebagian data belum bisa dimuat.</span>
            <button type="button" onClick={loadData} className="font-semibold underline cursor-pointer">Coba lagi</button>
          </div>
        )}

        {section !== 'ringkasan' && (
          <div className="hidden md:block">
            <h2 className="text-2xl font-bold text-[#0F2A43]">{current.title}</h2>
            <p className="text-sm text-slate-500">{current.subtitle}</p>
          </div>
        )}

        {/* ===================== BERANDA ===================== */}
        {section === 'ringkasan' && (
          <>
            <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#F97316_0%,#EA580C_100%)] text-white p-5 md:p-8" aria-label="Status akses">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/maskot-kost.svg" alt="" aria-hidden className="absolute -right-3 top-3 w-24 md:w-44 md:right-6 md:top-6 h-auto drop-shadow-[0_8px_14px_rgba(15,42,67,0.25)]" />
              <div className="relative pr-20 md:pr-52">
                <p className="text-sm font-semibold text-[#0F2A43]">{isActive ? 'Akses aktif' : subscription.status === 'expired' ? 'Akses berakhir' : 'Akun gratis'}</p>
                <h2 className="mt-0.5 text-2xl md:text-4xl font-extrabold leading-tight">Halo, {firstName}!</h2>
                <p className="mt-1.5 text-sm md:text-base font-medium text-[#0F2A43] max-w-md">
                  {isActive ? `Nomor pemilik dan semua foto terbuka sampai ${fmtDate(subscription.expiresAt, true)}.` : subscription.status === 'expired' ? `Masa aktifmu berakhir ${fmtDate(subscription.expiresAt, true)}. Perpanjang untuk membukanya lagi.` : `Buka akses ${rp(SUBSCRIPTION_PRICE)} untuk ${SUBSCRIPTION_DAYS} hari dan hubungi pemilik langsung.`}
                </p>
              </div>

              {isActive && (
                <div className="relative mt-5 max-w-xl">
                  <div className="flex items-baseline justify-between text-sm font-semibold text-[#0F2A43]">
                    <span><span className="text-3xl md:text-4xl font-extrabold text-white tabular-nums">{subscription.daysRemaining}</span> hari tersisa</span>
                    <span className="font-medium">dari {SUBSCRIPTION_DAYS} hari</span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-white/35 overflow-hidden" role="progressbar" aria-valuenow={subscription.daysRemaining} aria-valuemin={0} aria-valuemax={SUBSCRIPTION_DAYS} aria-label="Sisa masa aktif">
                    <div className="h-full rounded-full bg-[#0F2A43]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <div className="relative mt-5 flex flex-col sm:flex-row gap-2.5">
                <Link href="/checkout" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#0F2A43] hover:bg-[#16385A] text-white text-base font-semibold transition-colors">
                  {isActive ? `Perpanjang ${SUBSCRIPTION_DAYS} hari` : subscription.status === 'expired' ? 'Perpanjang akses' : `Buka akses ${rp(SUBSCRIPTION_PRICE)}`} <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link href="/cari-kost" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/90 hover:bg-white text-[#0F2A43] text-base font-semibold transition-colors">
                  <Search className="w-4 h-4" /> Cari kost
                </Link>
              </div>

              <dl className="relative mt-5 grid grid-cols-[1.5fr_1fr_1fr] gap-2 md:gap-3 max-w-xl">
                {[
                  { label: 'Total dibayar', value: rp(totalPaid), go: 'transaksi' as SectionKey },
                  { label: 'Transaksi lunas', value: String(paid.length), go: 'transaksi' as SectionKey },
                  { label: 'Notifikasi baru', value: String(unread), go: 'notifikasi' as SectionKey },
                ].map((s) => (
                  <button key={s.label} type="button" onClick={() => go(s.go)} className="text-left rounded-xl bg-white/25 hover:bg-white/35 px-2.5 md:px-3 py-2.5 transition-colors cursor-pointer min-w-0">
                    <dt className="text-[11px] font-semibold text-[#0F2A43] leading-tight">{s.label}</dt>
                    <dd className="mt-0.5 text-base md:text-lg font-bold text-white tabular-nums truncate" suppressHydrationWarning>{s.value}</dd>
                  </button>
                ))}
              </dl>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 items-start">
              {/* Desktop: dua kolom mandiri (tanpa celah). HP: pembungkus "melebur" dan urutan diatur lewat order. */}
              <div className="contents lg:flex lg:flex-col lg:gap-6 lg:col-start-3 lg:row-start-1">
              <Panel title="Langkah berikutnya" className="order-1 lg:order-none">
                {todo.length === 0 ? (
                  <p className="text-sm text-slate-500 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Semua beres. Tidak ada yang perlu dilakukan.</p>
                ) : (
                  <ul className="space-y-3">
                    {todo.slice(0, 4).map((t) => (
                      <li key={t.key} className={`rounded-xl border p-3.5 ${t.urgent ? 'border-[#F97316]/40 bg-orange-50' : 'border-slate-200 bg-white'}`}>
                        <p className="text-sm text-slate-700">{t.text}</p>
                        {t.href ? (
                          <Link href={t.href} className="mt-2 inline-flex h-9 items-center px-3.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold transition-colors">{t.cta}</Link>
                        ) : (
                          <button type="button" onClick={t.onClick} className="mt-2 inline-flex h-9 items-center px-3.5 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer">{t.cta}</button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel title="Notifikasi terbaru" action={<button type="button" onClick={() => go('notifikasi')} className="text-sm font-semibold text-[#C2410C] hover:underline cursor-pointer">Lihat semua</button>} className="order-4 lg:order-none">
                {notifs === null ? <Skeleton /> : notifs.length === 0 ? <Empty icon={Bell} text="Belum ada notifikasi." /> : (
                  <ul className="space-y-3">{notifs.slice(0, 3).map((n) => <NotifCard key={n.id} n={n} onDetail={() => { setNDetail(n); if (!n.read) void markRead({ id: n.id }); }} onRead={() => markRead({ id: n.id })} compact />)}</ul>
                )}
              </Panel>
              </div>

              <div className="contents lg:flex lg:flex-col lg:gap-6 lg:col-span-2 lg:col-start-1 lg:row-start-1">
              <section className="order-2 lg:order-none" aria-label="Pintasan">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { href: '/cari-kost', label: 'Cari kost', sub: 'Filter lokasi & harga', icon: Search },
                    { href: '/maps', label: 'Peta kost', sub: 'Lihat di sekitarmu', icon: MapIcon },
                    { href: '/wishlist', label: 'Favorit', sub: wishlist.count ? `${wishlist.count} tersimpan` : 'Belum ada', icon: Heart },
                    { href: '/bandingkan', label: 'Bandingkan', sub: compare.count ? `${compare.count} dipilih` : 'Pilih hingga 3', icon: Scale },
                  ].map((q) => (
                    <Link key={q.href} href={q.href} className="group rounded-2xl bg-white border border-slate-200 p-4 hover:border-[#F97316]/60 hover:shadow-sm transition-all">
                      <span className="w-10 h-10 rounded-xl bg-orange-50 text-[#C2410C] flex items-center justify-center group-hover:bg-[#F97316] group-hover:text-white transition-colors"><q.icon className="w-5 h-5" /></span>
                      <p className="mt-3 text-sm font-bold text-slate-900">{q.label}</p>
                      <p className="text-xs text-slate-500" suppressHydrationWarning>{q.sub}</p>
                    </Link>
                  ))}
                </div>
              </section>

              <Panel title="Transaksi terakhir" action={<button type="button" onClick={() => go('transaksi')} className="text-sm font-semibold text-[#C2410C] hover:underline cursor-pointer">Lihat semua</button>} className="order-3 lg:order-none">
                {txs === null ? <Skeleton /> : txs.length === 0 ? <Empty icon={Receipt} text="Belum ada transaksi." /> : (
                  <ul className="space-y-3">{txs.slice(0, 3).map((t) => <TxCard key={t.orderId} t={t} onDetail={() => setTxDetail(t)} compact />)}</ul>
                )}
              </Panel>
              </div>
            </div>
          </>
        )}

        {/* ===================== TRANSAKSI ===================== */}
        {section === 'transaksi' && (
          <>
            <div className="grid grid-cols-[1.7fr_1fr_1fr] gap-2.5 md:gap-4">
              <Mini label="Total dibayar" value={rp(totalPaid)} />
              <Mini label="Lunas" value={String(txCounts.ok)} />
              <Mini label="Menunggu" value={String(txCounts.wait)} tone={txCounts.wait ? 'warn' : undefined} />
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-3.5 md:p-4 space-y-3">
              <div className="flex gap-2.5">
                <label className="relative flex-1 min-w-0">
                  <span className="sr-only">Cari transaksi</span>
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={txQuery} onChange={(e) => setTxQuery(e.target.value)} placeholder="Cari order ID atau nominal" className="w-full h-11 rounded-xl border border-slate-300 pl-10 pr-3 text-base focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]" />
                </label>
                <label className="shrink-0">
                  <span className="sr-only">Urutkan</span>
                  <select value={txSort} onChange={(e) => setTxSort(e.target.value as typeof txSort)} className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 cursor-pointer">
                    <option value="new">Terbaru</option>
                    <option value="old">Terlama</option>
                    <option value="high">Nominal tertinggi</option>
                    <option value="low">Nominal terendah</option>
                  </select>
                </label>
              </div>
              <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter status">
                {TX_FILTERS.map((f) => (
                  <Chip key={f.key} active={txFilter === f.key} onClick={() => setTxFilter(f.key)} count={txCounts[f.key]}>{f.label}</Chip>
                ))}
              </div>
            </div>

            {txs === null ? <Skeleton /> : txs.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 px-6 py-12 text-center space-y-3">
                <Receipt className="w-9 h-9 mx-auto text-slate-300" />
                <p className="text-sm text-slate-600">Belum ada transaksi. Pembayaran akses akan tercatat di sini.</p>
                <Link href="/checkout" className="inline-flex h-11 items-center px-5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold">Buka akses {rp(SUBSCRIPTION_PRICE)}</Link>
              </div>
            ) : txShown.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 px-6 py-10 text-center space-y-3">
                <p className="text-sm text-slate-600">Tidak ada transaksi yang cocok dengan filter.</p>
                <button type="button" onClick={() => { setTxFilter('all'); setTxQuery(''); }} className="h-10 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">Reset filter</button>
              </div>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">{txShown.map((t) => <TxCard key={t.orderId} t={t} onDetail={() => setTxDetail(t)} />)}</ul>
            )}
          </>
        )}

        {/* ===================== NOTIFIKASI ===================== */}
        {section === 'notifikasi' && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2" role="group" aria-label="Filter notifikasi">
                <Chip active={nFilter === 'all'} onClick={() => setNFilter('all')} count={notifs?.length ?? 0}>Semua</Chip>
                <Chip active={nFilter === 'unread'} onClick={() => setNFilter('unread')} count={unread}>Belum dibaca</Chip>
              </div>
              {unread > 0 && <button type="button" onClick={() => markRead({ all: true })} className="shrink-0 text-sm font-semibold text-[#C2410C] hover:underline cursor-pointer">Tandai semua dibaca</button>}
            </div>
            {notifs === null ? <Skeleton /> : nGroups.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 px-6 py-12 text-center space-y-2">
                <Bell className="w-9 h-9 mx-auto text-slate-300" />
                <p className="text-sm text-slate-600">{nFilter === 'unread' ? 'Tidak ada notifikasi yang belum dibaca.' : 'Belum ada notifikasi. Kabar pembayaran dan pengingat masa aktif muncul di sini.'}</p>
                {nFilter === 'unread' && <button type="button" onClick={() => setNFilter('all')} className="h-10 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">Lihat semua</button>}
              </div>
            ) : (
              nGroups.map((g) => (
                <section key={g.label} aria-label={g.label} className="space-y-2.5">
                  <h3 className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">{g.label}</h3>
                  <ul className="grid gap-3 md:grid-cols-2">{g.items.map((n) => <NotifCard key={n.id} n={n} onDetail={() => { setNDetail(n); if (!n.read) void markRead({ id: n.id }); }} onRead={() => markRead({ id: n.id })} />)}</ul>
                </section>
              ))
            )}
          </>
        )}

        {/* ===================== PENGATURAN ===================== */}
        {section === 'pengaturan' && (
          <div className="grid md:grid-cols-2 gap-5 md:gap-6 items-start">
            <div className="space-y-5">
              <Group title="Akun">
                <Row label="Nama" value={displayName} onClick={openName} />
                <Row label="Email" value={user.email} />
                <Row label="Bergabung" value={fmtDate(profile.createdAt, true)} />
                <Row label="Status" value={isActive ? 'Member premium' : 'Akun gratis'} />
              </Group>
              <Group title="Preferensi">
                <label className="flex items-center justify-between gap-4 px-4 py-3.5 cursor-pointer">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">Email pengingat</span>
                    <span className="block text-xs text-slate-500">Kabari 3 hari sebelum akses berakhir.</span>
                  </span>
                  <span className="relative inline-flex shrink-0">
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
                    <span className="w-12 h-7 bg-slate-300 rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-[#F97316]/40 peer-checked:bg-[#F97316] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-6 after:h-6 after:bg-white after:rounded-full after:shadow after:transition-transform peer-checked:after:translate-x-5" />
                  </span>
                </label>
              </Group>
            </div>
            <div className="space-y-5">
              <Group title="Keamanan sesi">
                <ul className="px-4 py-3.5 space-y-2.5 text-sm text-slate-600">
                  {['Keluar otomatis setelah 15 menit tanpa aktivitas.', 'Sesi berakhir saat browser ditutup.', 'Akses berbayar melekat pada akunmu dan tidak hilang saat keluar.'].map((t) => (
                    <li key={t} className="flex gap-2.5"><ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />{t}</li>
                  ))}
                </ul>
              </Group>
              <Group title="Bantuan">
                <LinkRow href="/kontak" icon={Mail} label="Hubungi kami" />
                <LinkRow href="/syarat-ketentuan" icon={FileText} label="Syarat & Ketentuan" />
                <LinkRow href="/kebijakan-privasi" icon={HelpCircle} label="Kebijakan Privasi" />
              </Group>
              <button type="button" onClick={() => logout()} className="w-full h-12 rounded-2xl border border-red-200 bg-white text-red-700 hover:bg-red-50 text-base font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <LogOut className="w-5 h-5" /> Keluar dari akun
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Navigasi bawah (HP) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]" aria-label="Menu akun">
        <ul className="grid grid-cols-4">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.key;
            const b = badgeFor(s.key);
            return (
              <li key={s.key}>
                <button type="button" onClick={() => go(s.key)} aria-current={active ? 'page' : undefined} className={`relative w-full h-16 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer ${active ? 'text-[#C2410C]' : 'text-slate-500'}`}>
                  <span className="relative">
                    <Icon className="w-6 h-6" />
                    {b > 0 && <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center">{b}</span>}
                  </span>
                  {s.label}
                  {active && <span className="absolute top-0 inset-x-7 h-0.5 bg-[#F97316] rounded-b" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Detail transaksi */}
      <Sheet
        open={txDetail !== null}
        onClose={() => setTxDetail(null)}
        title="Detail transaksi"
        footer={txDetail && (txDetail.status === 'settlement' ? (
          <Link href={`/invoice/${txDetail.orderId}`} className="w-full h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-base font-semibold inline-flex items-center justify-center gap-2"><FileText className="w-5 h-5" /> Lihat invoice</Link>
        ) : txDetail.status === 'pending' ? (
          <Link href="/checkout" className="w-full h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-base font-semibold inline-flex items-center justify-center">Lanjutkan pembayaran</Link>
        ) : (
          <Link href="/checkout" className="w-full h-12 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-50 text-base font-semibold inline-flex items-center justify-center">Buat pembayaran baru</Link>
        ))}
      >
        {txDetail && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="text-3xl font-extrabold text-[#0F2A43] tabular-nums">{rp(txDetail.amount)}</p>
              <span className={`mt-2 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ${(STATUS[txDetail.status] ?? STATUS.expire).cls}`}>{STATUS[txDetail.status]?.label ?? txDetail.status}</span>
            </div>
            <dl className="divide-y divide-slate-100 text-sm">
              <Detail label="Paket" value={`Akses ${SUBSCRIPTION_DAYS} hari`} />
              <Detail label="Metode" value={txDetail.method} />
              <Detail label="Dibuat" value={fmtDateTime(txDetail.createdAt)} />
              {txDetail.paidAt && <Detail label="Dibayar" value={fmtDateTime(txDetail.paidAt)} />}
              {txDetail.status === 'pending' && txDetail.expiresAt && <Detail label="Bayar sebelum" value={fmtDateTime(txDetail.expiresAt)} />}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <dt className="text-slate-500 shrink-0">Order ID</dt>
                <dd className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs text-slate-800 truncate">{txDetail.orderId}</span>
                  <button type="button" onClick={() => copy(txDetail.orderId)} aria-label="Salin order ID" className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"><Copy className="w-4 h-4" /></button>
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Sheet>

      {/* Detail notifikasi */}
      <Sheet
        open={nDetail !== null}
        onClose={() => setNDetail(null)}
        title="Notifikasi"
        footer={nDetail?.href ? <Link href={nDetail.href} className="w-full h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-base font-semibold inline-flex items-center justify-center gap-2">Buka halaman terkait <ChevronRight className="w-5 h-5" /></Link> : undefined}
      >
        {nDetail && (
          <div className="space-y-2">
            <p className="text-base font-bold text-[#0F2A43]">{nDetail.title}</p>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{nDetail.body}</p>
            <p className="text-xs text-slate-400 pt-1">{fmtDateTime(nDetail.created_at)}</p>
          </div>
        )}
      </Sheet>

      {/* Ubah nama */}
      <Sheet
        open={nameOpen}
        onClose={() => setNameOpen(false)}
        title="Ubah nama"
        footer={<button type="button" onClick={saveName} disabled={savingName || nameDraft.trim().length < 2 || nameDraft.trim() === displayName} className="w-full h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 disabled:cursor-not-allowed text-white text-base font-semibold cursor-pointer">{savingName ? 'Menyimpan…' : 'Simpan'}</button>}
      >
        <label htmlFor="nama" className="block text-sm font-medium text-slate-700 mb-1.5">Nama tampilan</label>
        <input id="nama" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={60} autoFocus className="w-full h-12 rounded-xl border border-slate-300 px-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]" />
        <p className="mt-2 text-xs text-slate-500">2 sampai 60 karakter. Nama ini tampil di profilmu.</p>
      </Sheet>
    </div>
  );
}

/* ---------- komponen kecil ---------- */

function Panel({ title, action, children, className = '' }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white border border-slate-200 p-4 md:p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <h2 className="text-base font-bold text-[#0F2A43]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: 'warn' }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 px-3.5 py-3">
      <p className="text-xs font-semibold text-slate-500 truncate">{label}</p>
      <p className={`mt-0.5 text-lg md:text-xl font-bold tabular-nums truncate ${tone === 'warn' ? 'text-[#C2410C]' : 'text-[#0F2A43]'}`} suppressHydrationWarning>{value}</p>
    </div>
  );
}

function Chip({ active, onClick, count, children }: { active: boolean; onClick: () => void; count?: number; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`shrink-0 h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-2 border transition-colors cursor-pointer ${active ? 'bg-[#0F2A43] border-[#0F2A43] text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'}`}>
      {children}
      {count !== undefined && <span className={`text-xs tabular-nums ${active ? 'text-white/70' : 'text-slate-400'}`}>{count}</span>}
    </button>
  );
}

function Skeleton() {
  return <div className="space-y-3"><div className="h-24 rounded-2xl bg-slate-200/70 animate-pulse" /><div className="h-24 rounded-2xl bg-slate-200/70 animate-pulse" /></div>;
}

function Empty({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return <div className="py-6 text-center text-sm text-slate-500 space-y-2"><Icon className="w-7 h-7 mx-auto text-slate-300" />{text}</div>;
}

function TxCard({ t, onDetail, compact }: { t: Tx; onDetail: () => void; compact?: boolean }) {
  const st = STATUS[t.status] ?? { label: t.status, cls: 'bg-slate-100 text-slate-600 ring-slate-500/20', tone: 'bad' as const };
  const Icon = st.tone === 'ok' ? CheckCircle2 : st.tone === 'wait' ? Clock : XCircle;
  const iconCls = st.tone === 'ok' ? 'bg-green-50 text-green-600' : st.tone === 'wait' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500';
  return (
    <li className="rounded-2xl bg-white border border-slate-200 p-4">
      <div className="flex items-start gap-3">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}><Icon className="w-5 h-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">Akses {SUBSCRIPTION_DAYS} hari</p>
          <p className="text-xs text-slate-500" suppressHydrationWarning>{fmtDate(t.paidAt ?? t.createdAt, !compact)} · {t.method}</p>
          {!compact && <p className="mt-0.5 text-[11px] font-mono text-slate-400 truncate">{t.orderId}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-slate-900 tabular-nums" suppressHydrationWarning>{rp(t.amount)}</p>
          <span className={`mt-1 inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${st.cls}`}>{st.label}</span>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onDetail} className="flex-1 h-10 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer">Detail</button>
        {t.status === 'settlement' ? (
          <Link href={`/invoice/${t.orderId}`} className="flex-1 h-10 rounded-xl bg-orange-50 text-[#C2410C] hover:bg-orange-100 text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"><FileText className="w-4 h-4" /> Invoice</Link>
        ) : t.status === 'pending' ? (
          <Link href="/checkout" className="flex-1 h-10 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold inline-flex items-center justify-center transition-colors">Lanjut bayar</Link>
        ) : null}
      </div>
    </li>
  );
}

function NotifCard({ n, onDetail, onRead, compact }: { n: Notif; onDetail: () => void; onRead: () => void; compact?: boolean }) {
  return (
    <li className={`rounded-2xl border p-4 ${n.read ? 'bg-white border-slate-200' : 'bg-orange-50/60 border-[#F97316]/30'}`}>
      <div className="flex gap-3">
        <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${n.read ? 'bg-slate-200' : 'bg-[#F97316]'}`} aria-label={n.read ? 'Sudah dibaca' : 'Belum dibaca'} />
        <div className="min-w-0 flex-1">
          <p className={`text-sm ${n.read ? 'font-medium text-slate-700' : 'font-bold text-[#0F2A43]'}`}>{n.title}</p>
          <p className={`mt-0.5 text-xs text-slate-500 ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>{n.body}</p>
          <p className="mt-1 text-[11px] text-slate-400" suppressHydrationWarning>{timeAgo(n.created_at)}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onDetail} className="flex-1 h-10 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 hover:bg-white transition-colors cursor-pointer">Detail</button>
        {!n.read && <button type="button" onClick={onRead} className="flex-1 h-10 rounded-xl bg-orange-50 text-[#C2410C] hover:bg-orange-100 text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"><Check className="w-4 h-4" /> Tandai dibaca</button>}
      </div>
    </li>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="px-1 mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100 overflow-hidden">{children}</div>
    </section>
  );
}

function Row({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  const inner = (
    <>
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <span className="flex items-center gap-1.5 min-w-0">
        <span className="text-sm font-semibold text-slate-900 truncate" suppressHydrationWarning>{value}</span>
        {onClick && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
      </span>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className="w-full flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-slate-50 text-left cursor-pointer">{inner}</button>
  ) : (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">{inner}</div>
  );
}

function LinkRow({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50">
      <Icon className="w-4 h-4 text-slate-500" />
      <span className="flex-1 text-sm font-semibold text-slate-800">{label}</span>
      <ChevronRight className="w-4 h-4 text-slate-400" />
    </Link>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2.5 flex items-center justify-between gap-3">
      <dt className="text-slate-500 shrink-0">{label}</dt>
      <dd className="text-slate-900 font-medium text-right" suppressHydrationWarning>{value}</dd>
    </div>
  );
}
