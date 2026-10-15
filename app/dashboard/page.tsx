'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  ShieldCheck, 
  Clock, 
  Calendar, 
  CreditCard, 
  LogOut, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  PhoneCall
} from 'lucide-react';

export default function DashboardPage() {
  const { user, subscription, activateSubscription, resetSubscription, logout } = useAuth();
  const isActive = subscription.status === 'active';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Dashboard Akun & Langganan
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Kelola akses pencarian kost dan perpanjangan langganan Rp10.000 / 30 hari.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-red-600 bg-neutral-100 hover:bg-neutral-200 px-3 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 ${
        isActive 
          ? 'bg-gradient-to-br from-emerald-900 to-neutral-900 text-white border-emerald-700/50 shadow-md'
          : 'bg-white border-neutral-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                isActive ? 'bg-emerald-400 text-neutral-950' : 'bg-neutral-200 text-neutral-700'
              }`}>
                {isActive ? 'Langganan Aktif' : 'Belum Berlangganan'}
              </span>
              {isActive && (
                <span className="text-xs text-emerald-300 font-medium">Akses Tanpa Batas</span>
              )}
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${isActive ? 'text-white' : 'text-neutral-900'}`}>
              Paket KostHunt Rp10.000 / 30 Hari
            </h2>
          </div>

          <div className="shrink-0">
            {isActive ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center sm:text-right">
                <p className="text-xs text-neutral-300 font-medium">Aktif Sampai:</p>
                <p className="text-lg font-bold text-emerald-300">
                  {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }) : '-'}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Sisa {subscription.daysRemaining} hari lagi
                </p>
              </div>
            ) : (
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Beli Akses Rp10.000</span>
              </Link>
            )}
          </div>
        </div>

        {/* Action Bar inside card */}
        <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
          isActive ? 'border-white/10 text-neutral-300' : 'border-neutral-100 text-neutral-500'
        }`}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Semua foto & video terbuka</span>
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Nomor WhatsApp pemilik terbuka</span>
            </span>
          </div>

          {isActive && (
            <Link
              href="/checkout"
              className="font-bold underline text-emerald-300 hover:text-emerald-200"
            >
              + Perpanjang 30 Hari Lagi (Rp10.000)
            </Link>
          )}
        </div>
      </div>

      {/* Profil & Detail Pengguna */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          <h3 className="font-bold text-neutral-900 text-base">Informasi Akun</h3>
          <div className="space-y-3 text-xs text-neutral-600">
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-400">Email Akun:</span>
              <span className="font-semibold text-neutral-900">{user?.email || 'pencari.kost@example.com'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-400">Status Akses:</span>
              <span className={`font-bold ${isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isActive ? 'Member Premium' : 'Pengguna Gratis (Preview)'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-400">Pengecekan Server:</span>
              <span className="font-medium text-neutral-800">Real-time pada setiap request (tanpa cron)</span>
            </div>
          </div>
        </div>

        {/* Quick Testing Tools for MVP */}
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-neutral-900 text-base">Alat Uji Coba Cepat (MVP)</h3>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Anda dapat menguji respons antarmuka saat status langganan aktif vs expired tanpa harus melakukan pembayaran berulang.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => activateSubscription(30)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              +30 Hari Akses
            </button>
            <button
              onClick={() => resetSubscription()}
              className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              Set Kadaluarsa
            </button>
            <Link
              href="/kost/jakarta"
              className="inline-flex items-center gap-1 bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ml-auto"
            >
              <span>Jelajah Kost</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
