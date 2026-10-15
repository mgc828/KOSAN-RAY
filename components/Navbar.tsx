'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Home, ShieldCheck, Lock, Sparkles, User, LogOut, Menu, X, CreditCard } from 'lucide-react';

export default function Navbar() {
  const { user, subscription, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Top Banner Promo */}
      <div className="bg-emerald-700 text-white text-xs sm:text-sm py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>Buka semua foto kamar, 3 video lengkap & WhatsApp pemilik hanya <strong>Rp10.000 / 30 hari</strong></span>
        <Link 
          href="/checkout" 
          className="ml-2 inline-flex items-center gap-1 bg-amber-400 text-neutral-900 px-2.5 py-0.5 rounded-full text-xs font-semibold hover:bg-amber-300 transition-colors"
        >
          Aktivasi Instan
        </Link>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-neutral-900">KostHunt</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">JKT</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">Kost Terverifikasi Jakarta</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-700">
          <Link href="/kost/jakarta" className="hover:text-emerald-700 transition-colors">
            Cari Kost
          </Link>
          <Link href="/kost/jakarta/kuningan" className="hover:text-emerald-700 transition-colors">
            Kuningan
          </Link>
          <Link href="/kost/jakarta/tebet" className="hover:text-emerald-700 transition-colors">
            Tebet
          </Link>
          <Link href="/kost/jakarta/benhil" className="hover:text-emerald-700 transition-colors">
            Benhil (Sudirman)
          </Link>
          <Link href="/kost/jakarta/palmerah" className="hover:text-emerald-700 transition-colors">
            Palmerah (Binus)
          </Link>
        </div>

        {/* Right CTA / Auth Status */}
        <div className="hidden md:flex items-center gap-3">
          {subscription.status === 'active' ? (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pelanggan Aktif ({subscription.daysRemaining} hari)</span>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-emerald-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => logout()}
                title="Keluar"
                className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/checkout"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02]"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Langganan Rp10rb</span>
              </Link>
              <Link
                href="/login"
                className="px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Masuk
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {subscription.status === 'active' ? (
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
              Aktif ({subscription.daysRemaining}h)
            </span>
          ) : (
            <Link
              href="/checkout"
              className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-md"
            >
              Rp10rb
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-neutral-700 rounded-lg border border-neutral-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link 
              href="/kost/jakarta" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-neutral-50 text-neutral-800 font-medium hover:bg-neutral-100"
            >
              Semua Kost JKT
            </Link>
            <Link 
              href="/kost/jakarta/kuningan" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-neutral-50 text-neutral-800 font-medium hover:bg-neutral-100"
            >
              Kuningan
            </Link>
            <Link 
              href="/kost/jakarta/tebet" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-neutral-50 text-neutral-800 font-medium hover:bg-neutral-100"
            >
              Tebet
            </Link>
            <Link 
              href="/kost/jakarta/benhil" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-neutral-50 text-neutral-800 font-medium hover:bg-neutral-100"
            >
              Benhil
            </Link>
          </div>

          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold"
            >
              <CreditCard className="w-4 h-4" />
              <span>Akses Langganan Rp10.000 (30 Hari)</span>
            </Link>
            <div className="flex items-center justify-between text-xs text-neutral-600 pt-1">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                Dashboard Akun
              </Link>
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                Admin Kost
              </Link>
              {user ? (
                <button onClick={() => logout()} className="text-red-600 font-semibold">
                  Keluar
                </button>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-emerald-700 font-semibold">
                  Masuk / Daftar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
