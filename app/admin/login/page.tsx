'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Eye, EyeOff, Lock, Mail, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { useAdmin } from '@/lib/admin-client';
import { toast } from '@/lib/toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAdmin();

  const [email, setEmail] = useState('admin@kost-kostan.id');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  if (isAuthenticated) {
    router.push('/admin');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Email dan kata sandi wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        toast('Login berhasil! Selamat datang di Admin Dashboard ✅', 'success');
        router.push('/admin');
      } else {
        setErrorMsg(res.error || 'Email atau password salah');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand & Logo Header */}
      <div className="w-full max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2A43] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Compass className="w-7 h-7 text-[#F97316]" />
          </div>
          <div className="text-left">
            <span className="font-black text-2xl tracking-tight text-[#0F2A43] block">
              Kost-Kostan
            </span>
            <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider">
              Admin & Curator Portal
            </span>
          </div>
        </Link>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          Masuk untuk mengelola data kost, transaksi, media, dan pengguna DKI Jakarta.
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-6">
          <h2 className="text-xl font-black text-[#0F2A43] tracking-tight">Masuk Administrator</h2>
          <p className="text-xs text-slate-500 mt-1">Gunakan akun admin terdaftar Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="email">
              Email Administrator
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="admin@kost-kostan.id"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white disabled:opacity-60 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="password">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={isSubmitting}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan kata sandi..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white disabled:opacity-60 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={isSubmitting}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#F97316] focus:ring-[#F97316]"
              />
              <span className="text-xs text-slate-600 font-semibold">Ingat saya</span>
            </label>

            <span className="text-[11px] text-slate-400 font-medium">Batas sesi 30 hari</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#0F2A43] hover:bg-[#163a5d] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#0F2A43]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>

      {/* Back to public site */}
      <div className="mt-6">
        <Link href="/" className="text-xs text-slate-500 hover:text-[#0F2A43] font-semibold transition-colors">
          ← Kembali ke Halaman Publik
        </Link>
      </div>
    </div>
  );
}

