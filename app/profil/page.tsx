'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_DAYS } from '@/lib/config';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  CreditCard, 
  LogOut, 
  LayoutDashboard, 
  ChevronRight,
  Bell,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useWishlist } from '@/lib/wishlist';
import { toast } from '@/lib/toast';

const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export default function ProfilPage() {
  const router = useRouter();
  const { user, subscription, ready, logout, settings, setRemindersOff } = useAuth();
  const wishlist = useWishlist();
  const isActive = subscription.status === 'active';

  useEffect(() => {
    if (ready && !user) {
      router.replace('/login?next=/profil');
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-44 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          <div className="h-64 bg-white rounded-3xl border border-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  const displayName = user.fullName || (user.email ? user.email.split('@')[0] : 'Pengguna');
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-slate-900 transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Profil Saya</span>
        </nav>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#FFEDD5] to-transparent rounded-bl-full pointer-events-none opacity-60" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#F97316] to-[#FB923C] text-white flex items-center justify-center text-3xl font-black shadow-md shadow-[#F97316]/25 shrink-0">
              {initial}
            </div>
            
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight truncate">
                  {displayName}
                </h1>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 self-center sm:self-auto px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFEDD5] text-[#0F2A43] border border-[#F97316]/40">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C2410C]" />
                    <span>Member Premium</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 self-center sm:self-auto px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    Akun Gratis
                  </span>
                )}
              </div>
              
              <p className="text-xs sm:text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className={`rounded-3xl border p-6 transition-all ${
          isActive 
            ? 'bg-gradient-to-br from-[#0F2A43] to-[#16385A] text-white border-[#16385A] shadow-md' 
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                isActive ? 'bg-[#16A34A] text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {isActive ? 'Status: Langganan Aktif' : 'Status: Belum Langganan'}
              </span>
              <h2 className={`text-lg sm:text-xl font-extrabold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                {isActive ? `Akses Penuh (${subscription.daysRemaining} Hari Tersisa)` : `Akses Penuh ${rp(SUBSCRIPTION_PRICE)} / ${SUBSCRIPTION_DAYS} Hari`}
              </h2>
              <p className={`text-xs ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                {isActive 
                  ? 'Anda dapat membuka nomor WhatsApp semua pemilik kost dan foto eksklusif.'
                  : 'Buka nomor WhatsApp langsung pemilik kost dan ratusan foto kamar eksklusif.'
                }
              </p>
            </div>

            {isActive ? (
              <Link 
                href="/checkout" 
                className="inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Perpanjang</span>
              </Link>
            ) : (
              <Link 
                href="/checkout" 
                className="inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all shrink-0 hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Beli Akses Rp15.000</span>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Menu List */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Menu & Pengaturan</h3>
          </div>
          
          <div className="divide-y divide-slate-100 text-sm">
            <Link 
              href="/dashboard"
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3 text-slate-700 group-hover:text-slate-900 font-semibold">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span>Dashboard Akun & Transaksi</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link 
              href="/wishlist"
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3 text-slate-700 group-hover:text-slate-900 font-semibold">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <Heart className="w-4 h-4" />
                </div>
                <span>Kost Favorit / Wishlist</span>
              </div>
              <div className="flex items-center gap-2">
                {wishlist.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#F97316] text-white text-xs font-bold">
                    {wishlist.count}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            {/* Email reminder toggle */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Email Pengingat</p>
                  <p className="text-xs text-slate-400">Pemberitahuan sebelum akses berakhir</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!settings.remindersOff}
                  onChange={async (e) => {
                    const ok = await setRemindersOff(!e.target.checked);
                    toast(
                      ok 
                        ? (e.target.checked ? 'Email pengingat diaktifkan.' : 'Email pengingat dinonaktifkan.')
                        : 'Gagal memperbarui pengaturan.',
                      ok ? 'success' : 'error'
                    );
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F97316]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Logout */}
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push('/');
          }}
          className="w-full py-3.5 px-4 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </button>

      </div>
    </div>
  );
}

