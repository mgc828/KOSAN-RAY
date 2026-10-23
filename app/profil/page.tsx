'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_DAYS } from '@/lib/config';
import { useWishlist, useCompare } from '@/lib/wishlist';
import { toast } from '@/lib/toast';
import BrandLogo from '@/components/BrandLogo';
import {
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Heart,
  LayoutGrid,
  LogOut,
  Map as MapIcon,
  RefreshCw,
  Receipt,
  Scale,
  Search,
  Settings,
  ShieldCheck,
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

type SectionKey = 'ringkasan' | 'transaksi' | 'notifikasi' | 'pengaturan';

const SECTIONS: { key: SectionKey; label: string; title: string; subtitle: string; icon: React.ElementType }[] = [
  { key: 'ringkasan', label: 'Ringkasan', title: 'Ringkasan', subtitle: 'Status akses dan aktivitas akunmu', icon: LayoutGrid },
  { key: 'transaksi', label: 'Transaksi', title: 'Riwayat transaksi', subtitle: 'Pembayaran akses dan invoice', icon: Receipt },
  { key: 'notifikasi', label: 'Notifikasi', title: 'Notifikasi', subtitle: 'Kabar pembayaran dan masa aktif', icon: Bell },
  { key: 'pengaturan', label: 'Pengaturan', title: 'Pengaturan akun', subtitle: 'Nama, pengingat, dan keamanan', icon: Settings },
];

const STATUS: Record<string, { label: string; cls: string }> = {
  settlement: { label: 'Lunas', cls: 'bg-green-50 text-green-700 ring-green-600/20' },
  pending: { label: 'Menunggu bayar', cls: 'bg-amber-50 text-amber-800 ring-amber-600/25' },
  expire: { label: 'Kedaluwarsa', cls: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  cancel: { label: 'Dibatalkan', cls: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  deny: { label: 'Ditolak', cls: 'bg-red-50 text-red-700 ring-red-600/20' },
  failure: { label: 'Gagal', cls: 'bg-red-50 text-red-700 ring-red-600/20' },
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

  const [section, setSection] = useState<SectionKey>('ringkasan');
  const [txs, setTxs] = useState<Tx[] | null>(null);
  const [notifs, setNotifs] = useState<Notif[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);

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

  const go = (k: SectionKey) => {
    setSection(k);
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

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[256px_1fr]">
        <div className="hidden lg:block bg-[#0F2A43]" />
        <div className="p-6 space-y-4">
          <div className="h-16 rounded-xl bg-white border border-slate-200 animate-pulse" />
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-white border border-slate-200 animate-pulse" />)}</div>
          <div className="h-64 rounded-xl bg-white border border-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  const displayName = user.fullName || user.email.split('@')[0] || 'Pengguna';
  const initial = displayName.charAt(0).toUpperCase();
  const current = SECTIONS.find((s) => s.key === section)!;

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

  const navBadge = (k: SectionKey) => (k === 'notifikasi' && unread > 0 ? unread : 0);

  // Langkah berikutnya: disusun dari kondisi akun yang nyata
  const todo: { key: string; text: string; cta: string; href?: string; onClick?: () => void; tone: 'warn' | 'info' }[] = [];
  if (pendingTx) todo.push({ key: 'pending', text: `Pembayaran ${rp(pendingTx.amount)} belum selesai.`, cta: 'Lanjutkan bayar', href: '/checkout', tone: 'warn' });
  if (expiringSoon) todo.push({ key: 'expiring', text: `Akses berakhir ${subscription.daysRemaining <= 0 ? 'hari ini' : `${subscription.daysRemaining} hari lagi`}.`, cta: 'Perpanjang', href: '/checkout', tone: 'warn' });
  if (!isActive && !pendingTx) todo.push({ key: 'buy', text: subscription.status === 'expired' ? 'Aksesmu sudah berakhir. Nomor pemilik terkunci lagi.' : 'Buka akses untuk melihat nomor WhatsApp pemilik.', cta: subscription.status === 'expired' ? 'Perpanjang akses' : `Buka akses ${rp(SUBSCRIPTION_PRICE)}`, href: '/checkout', tone: 'info' });
  if (unread > 0) todo.push({ key: 'notif', text: `${unread} notifikasi belum dibaca.`, cta: 'Baca', onClick: () => go('notifikasi'), tone: 'info' });
  if (settings.remindersOff && isActive) todo.push({ key: 'remind', text: 'Email pengingat sedang mati.', cta: 'Atur', onClick: () => go('pengaturan'), tone: 'info' });
  if (wishlist.count === 0) todo.push({ key: 'wish', text: 'Belum ada kost favorit. Simpan yang menarik untuk dibandingkan nanti.', cta: 'Cari kost', href: '/cari-kost', tone: 'info' });

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex sticky top-0 h-screen flex-col bg-[#0F2A43] text-white" aria-label="Menu akun">
        <div className="h-20 flex items-center px-5 border-b border-white/10">
          <Link href="/" aria-label="Ke beranda"><BrandLogo variant="horizontal" light className="h-9" /></Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3.5 space-y-1.5">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.key;
            const badge = navBadge(s.key);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => go(s.key)}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${active ? 'bg-[#F97316] text-white shadow-md shadow-[#F97316]/25' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="flex-1 text-left">{s.label}</span>
                {badge > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-white text-[#C2410C] text-[11px] font-bold flex items-center justify-center">{badge}</span>}
              </button>
            );
          })}

          <p className="px-3.5 pt-5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/45">Jelajahi</p>
          {[
            { href: '/cari-kost', label: 'Cari kost', icon: Search, extra: '' },
            { href: '/maps', label: 'Peta kost', icon: MapIcon, extra: '' },
            { href: '/wishlist', label: 'Kost favorit', icon: Heart, extra: wishlist.count ? String(wishlist.count) : '' },
            { href: '/bandingkan', label: 'Bandingkan', icon: Scale, extra: compare.count ? String(compare.count) : '' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white transition-colors">
              <l.icon className="w-[18px] h-[18px] shrink-0" />
              <span className="flex-1">{l.label}</span>
              {l.extra && <span className="text-xs text-white/60 tabular-nums" suppressHydrationWarning>{l.extra}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
            <span className="w-9 h-9 rounded-full bg-[#F97316] text-white font-bold flex items-center justify-center shrink-0">{initial}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-[11px] text-white/60 truncate">{isActive ? 'Akses aktif' : 'Akun gratis'}</p>
            </div>
            <button type="button" onClick={() => logout()} title="Keluar" aria-label="Keluar" className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Konten */}
      <div className="min-w-0 flex flex-col min-h-screen pb-20 lg:pb-0">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="h-16 lg:h-20 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
            <Link href="/" className="lg:hidden shrink-0" aria-label="Ke beranda"><BrandLogo variant="mark" className="h-9" /></Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg lg:text-xl font-bold text-[#0F2A43] truncate">{current.title}</h1>
              <p className="hidden sm:block text-xs text-slate-500 truncate">{current.subtitle}</p>
            </div>
            <Link href="/cari-kost" className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Search className="w-4 h-4" /> Cari kost
            </Link>
            <button type="button" onClick={() => go('notifikasi')} aria-label={`Notifikasi${unread ? `, ${unread} belum dibaca` : ''}`} className="relative w-10 h-10 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
              <Bell className="w-[18px] h-[18px]" />
              {unread > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>}
            </button>
            <button type="button" onClick={() => logout()} className="lg:hidden w-10 h-10 rounded-xl border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer" aria-label="Keluar">
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1200px] w-full">
          {loadError && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              <span>Sebagian data belum bisa dimuat.</span>
              <button type="button" onClick={loadData} className="font-semibold underline cursor-pointer">Coba lagi</button>
            </div>
          )}

          {section === 'ringkasan' && (
            <>
              <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4" aria-label="Ringkasan akun">
                <Stat icon={Clock} label="Sisa akses" value={isActive ? `${subscription.daysRemaining} hari` : '–'} note={isActive ? `Sampai ${fmtDate(subscription.expiresAt)}` : subscription.status === 'expired' ? `Berakhir ${fmtDate(subscription.expiresAt)}` : 'Belum berlangganan'} tone={expiringSoon ? 'warn' : isActive ? 'good' : 'muted'} />
                <Stat icon={Wallet} label="Total dibayar" value={rp(totalPaid)} note={`${paid.length} transaksi lunas`} onClick={() => go('transaksi')} />
                <Stat icon={Heart} label="Kost favorit" value={String(wishlist.count)} note={compare.count ? `${compare.count} dalam perbandingan` : 'Tersimpan di perangkat ini'} href="/wishlist" />
                <Stat icon={Bell} label="Notifikasi baru" value={String(unread)} note={unread ? 'Belum dibaca' : 'Semua sudah dibaca'} tone={unread ? 'warn' : 'muted'} onClick={() => go('notifikasi')} />
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <Card className="xl:col-span-2" title="Status akses" action={<Link href="/checkout" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold transition-colors">{isActive ? `Perpanjang ${SUBSCRIPTION_DAYS} hari` : subscription.status === 'expired' ? 'Perpanjang' : `Buka akses ${rp(SUBSCRIPTION_PRICE)}`}<ArrowUpRight className="w-4 h-4" /></Link>}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ${isActive ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-slate-100 text-slate-600 ring-slate-500/20'}`}>
                      <ShieldCheck className="w-3.5 h-3.5" />{isActive ? 'Aktif' : subscription.status === 'expired' ? 'Berakhir' : 'Belum aktif'}
                    </span>
                    <p className="text-sm text-slate-600">
                      {isActive ? `Berlaku sampai ${fmtDate(subscription.expiresAt, true)}.` : subscription.status === 'expired' ? `Masa aktif berakhir ${fmtDate(subscription.expiresAt, true)}.` : `Paket ${rp(SUBSCRIPTION_PRICE)} untuk ${SUBSCRIPTION_DAYS} hari.`}
                    </p>
                  </div>
                  {isActive && (
                    <div className="mt-5">
                      <div className="flex items-baseline justify-between text-sm mb-1.5">
                        <span className="font-semibold text-slate-800 tabular-nums">{subscription.daysRemaining} <span className="font-normal text-slate-500">dari {SUBSCRIPTION_DAYS} hari tersisa</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={subscription.daysRemaining} aria-valuemin={0} aria-valuemax={SUBSCRIPTION_DAYS} aria-label="Sisa masa aktif">
                        <div className={`h-full rounded-full ${expiringSoon ? 'bg-[#F97316]' : 'bg-green-600'}`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                  <ul className="mt-5 grid sm:grid-cols-3 gap-x-4 gap-y-2 text-sm text-slate-600">
                    {['Nomor WhatsApp pemilik', 'Semua foto dan video kamar', 'Tanpa kuota dan komisi'].map((t) => (
                      <li key={t} className="flex items-center gap-2"><Check className={`w-4 h-4 shrink-0 ${isActive ? 'text-green-600' : 'text-slate-300'}`} />{t}</li>
                    ))}
                  </ul>
                </Card>

                <Card title="Langkah berikutnya">
                  {todo.length === 0 ? (
                    <p className="text-sm text-slate-500">Semua beres. Tidak ada yang perlu kamu lakukan sekarang.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100 -my-2">
                      {todo.slice(0, 4).map((t) => (
                        <li key={t.key} className="py-3 flex items-start gap-3">
                          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${t.tone === 'warn' ? 'bg-[#F97316]' : 'bg-slate-300'}`} aria-hidden />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-700">{t.text}</p>
                            {t.href ? <Link href={t.href} className="text-sm font-semibold text-[#C2410C] hover:underline">{t.cta}</Link> : <button type="button" onClick={t.onClick} className="text-sm font-semibold text-[#C2410C] hover:underline cursor-pointer">{t.cta}</button>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <Card className="xl:col-span-2" title="Transaksi terakhir" action={<button type="button" onClick={() => go('transaksi')} className="text-sm font-semibold text-[#C2410C] hover:underline cursor-pointer">Lihat semua</button>} flush>
                  {txs === null ? <Skeleton /> : txs.length === 0 ? <EmptyRow text="Belum ada transaksi." /> : <TxList items={txs.slice(0, 4)} />}
                </Card>
                <Card title="Notifikasi terbaru" action={<button type="button" onClick={() => go('notifikasi')} className="text-sm font-semibold text-[#C2410C] hover:underline cursor-pointer">Lihat semua</button>} flush>
                  {notifs === null ? <Skeleton /> : notifs.length === 0 ? <EmptyRow text="Belum ada notifikasi." /> : <NotifList items={notifs.slice(0, 4)} onRead={(id) => markRead({ id })} />}
                </Card>
              </div>
            </>
          )}

          {section === 'transaksi' && (
            <Card title={`${txs?.length ?? 0} transaksi`} action={<button type="button" onClick={loadData} aria-label="Muat ulang" className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"><RefreshCw className="w-4 h-4" /></button>} flush>
              {txs === null ? <Skeleton /> : txs.length === 0 ? (
                <div className="px-6 py-14 text-center space-y-3">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm text-slate-600">Belum ada transaksi. Pembayaran akses akan tercatat di sini.</p>
                  <Link href="/checkout" className="inline-flex h-10 items-center px-5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold">Buka akses {rp(SUBSCRIPTION_PRICE)}</Link>
                </div>
              ) : <TxList items={txs} detailed />}
            </Card>
          )}

          {section === 'notifikasi' && (
            <Card title={unread ? `${unread} belum dibaca` : 'Semua sudah dibaca'} action={unread > 0 ? <button type="button" onClick={() => markRead({ all: true })} className="text-sm font-semibold text-[#C2410C] hover:underline cursor-pointer">Tandai semua dibaca</button> : undefined} flush>
              {notifs === null ? <Skeleton /> : notifs.length === 0 ? <EmptyRow text="Belum ada notifikasi. Kabar pembayaran dan pengingat masa aktif muncul di sini." /> : <NotifList items={notifs} onRead={(id) => markRead({ id })} />}
            </Card>
          )}

          {section === 'pengaturan' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <Card title="Informasi akun">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nama" className="block text-sm font-medium text-slate-700 mb-1.5">Nama tampilan</label>
                    <div className="flex gap-2">
                      <input id="nama" value={nameDraft ?? displayName} onChange={(e) => setNameDraft(e.target.value)} maxLength={60} className="flex-1 min-w-0 h-11 rounded-lg border border-slate-300 px-3.5 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]" />
                      <button type="button" onClick={saveName} disabled={savingName || nameDraft === null || nameDraft.trim() === displayName} className="h-11 px-5 rounded-lg bg-[#0F2A43] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#16385A] transition-colors cursor-pointer">{savingName ? 'Menyimpan…' : 'Simpan'}</button>
                    </div>
                  </div>
                  <dl className="grid grid-cols-[110px_1fr] gap-y-2.5 text-sm pt-1">
                    <dt className="text-slate-500">Email</dt><dd className="text-slate-800 truncate">{user.email}</dd>
                    <dt className="text-slate-500">Bergabung</dt><dd className="text-slate-800" suppressHydrationWarning>{fmtDate(profile.createdAt, true)}</dd>
                    <dt className="text-slate-500">Status</dt><dd className="text-slate-800">{isActive ? 'Member premium' : 'Akun gratis'}</dd>
                  </dl>
                </div>
              </Card>

              <div className="space-y-6">
                <Card title="Email pengingat">
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <span className="text-sm text-slate-600">Kabari lewat email 3 hari sebelum akses berakhir.</span>
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
                      <span className="w-11 h-6 bg-slate-300 rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-[#F97316]/40 peer-checked:bg-[#F97316] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
                    </span>
                  </label>
                </Card>

                <Card title="Keamanan sesi">
                  <ul className="space-y-2 text-sm text-slate-600">
                    {['Keluar otomatis setelah 15 menit tanpa aktivitas.', 'Sesi berakhir saat browser ditutup.', 'Akses berbayar melekat pada akunmu dan tidak hilang saat keluar.'].map((t) => (
                      <li key={t} className="flex gap-2"><Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />{t}</li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => logout()} className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold transition-colors cursor-pointer">
                    <LogOut className="w-4 h-4" /> Keluar dari akun
                  </button>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Navigasi bawah (HP & tablet) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]" aria-label="Menu akun">
        <ul className="grid grid-cols-4">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.key;
            const badge = navBadge(s.key);
            return (
              <li key={s.key}>
                <button type="button" onClick={() => go(s.key)} aria-current={active ? 'page' : undefined} className={`relative w-full h-16 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer ${active ? 'text-[#C2410C]' : 'text-slate-500'}`}>
                  <span className="relative">
                    <Icon className="w-5 h-5" />
                    {badge > 0 && <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center">{badge}</span>}
                  </span>
                  {s.label}
                  {active && <span className="absolute top-0 inset-x-6 h-0.5 bg-[#F97316] rounded-b" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function Stat({ icon: Icon, label, value, note, tone = 'muted', onClick, href }: { icon: React.ElementType; label: string; value: string; note: string; tone?: 'good' | 'warn' | 'muted'; onClick?: () => void; href?: string }) {
  const valueCls = tone === 'good' ? 'text-green-700' : tone === 'warn' ? 'text-[#C2410C]' : 'text-[#0F2A43]';
  const body = (
    <div className="h-full rounded-xl bg-white border border-slate-200 p-4 sm:p-5 hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
        <Icon className="w-4 h-4" />
      </div>
      <p className={`mt-2 text-2xl font-bold tabular-nums truncate ${valueCls}`} suppressHydrationWarning>{value}</p>
      <p className="mt-0.5 text-xs text-slate-500 truncate" suppressHydrationWarning>{note}</p>
    </div>
  );
  if (href) return <Link href={href} className="block">{body}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className="block w-full text-left cursor-pointer">{body}</button>;
  return body;
}

function Card({ title, action, children, className = '', flush }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string; flush?: boolean }) {
  return (
    <section className={`rounded-xl bg-white border border-slate-200 ${className}`}>
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 min-h-[57px]">
        <h2 className="text-sm font-bold text-[#0F2A43]">{title}</h2>
        {action}
      </div>
      <div className={flush ? '' : 'p-5'}>{children}</div>
    </section>
  );
}

function Skeleton() {
  return <div className="p-5"><div className="h-24 rounded-lg bg-slate-100 animate-pulse" aria-hidden /></div>;
}

function EmptyRow({ text }: { text: string }) {
  return <p className="px-5 py-8 text-sm text-slate-500 text-center">{text}</p>;
}

function TxList({ items, detailed }: { items: Tx[]; detailed?: boolean }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((t) => {
        const st = STATUS[t.status] ?? { label: t.status, cls: 'bg-slate-100 text-slate-600 ring-slate-500/20' };
        return (
          <li key={t.orderId} className="px-5 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <div className="min-w-0 flex-1 basis-48">
              <p className="text-sm font-semibold text-slate-900 tabular-nums" suppressHydrationWarning>{rp(t.amount)}<span className="font-normal text-slate-500"> · {t.method}</span></p>
              <p className="text-xs text-slate-500 truncate" suppressHydrationWarning>{fmtDate(t.paidAt ?? t.createdAt, detailed)}{detailed && <span className="font-mono"> · {t.orderId}</span>}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ${st.cls}`}>{st.label}</span>
            <span className="w-24 text-right">
              {t.status === 'settlement' ? (
                <Link href={`/invoice/${t.orderId}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#C2410C] hover:underline"><FileText className="w-4 h-4" />Invoice</Link>
              ) : t.status === 'pending' ? (
                <Link href="/checkout" className="text-sm font-semibold text-[#C2410C] hover:underline">Lanjut bayar</Link>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function NotifList({ items, onRead }: { items: Notif[]; onRead: (id: string) => void }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((n) => {
        const inner = (
          <div className="flex gap-3">
            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-[#F97316]'}`} aria-hidden />
            <div className="min-w-0">
              <p className={`text-sm ${n.read ? 'text-slate-600' : 'font-semibold text-[#0F2A43]'}`}>{n.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
              <p className="text-[11px] text-slate-400 mt-1" suppressHydrationWarning>{fmtDate(n.created_at, true)}</p>
            </div>
            {n.href && <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0 self-center" />}
          </div>
        );
        return (
          <li key={n.id} className={n.read ? '' : 'bg-[#FFEDD5]/30'}>
            {n.href ? (
              <Link href={n.href} onClick={() => !n.read && onRead(n.id)} className="block px-5 py-3.5 hover:bg-slate-50 transition-colors">{inner}</Link>
            ) : (
              <button type="button" onClick={() => !n.read && onRead(n.id)} className="block w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer">{inner}</button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
