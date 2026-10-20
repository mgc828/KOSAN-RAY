'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Compass, Mail, User, ArrowRight, Sparkles } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import GoogleButton from '@/components/GoogleButton';

function RegisterForm() {
  const router = useRouter();
  const rawNext = useSearchParams().get('next');
  const next = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/checkout';
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      return;
    }

    setLoading(true);
    const res = await register(email, password, fullName);
    setLoading(false);

    if (res.success) {
      // Sesuai alur yang diminta: Setelah daftar & otomatis login, langsung lanjut ke tahap pembayaran
      router.push(next);
    } else {
      setError(res.error || 'Gagal mendaftar');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
      
      {/* Informational Alert Box: Alur Aktivasi Langganan */}
      <div className="bg-[#FFEDD5] border border-[#F97316] rounded-3xl p-4 sm:p-5 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-black text-[#0F2A43]">
          <Sparkles className="w-4 h-4 text-[#C2410C]" />
          <span>Langkah 1 dari 2: Buat Akun Terlebih Dahulu</span>
        </div>
        <p className="text-slate-600 leading-relaxed font-medium">
          Sebelum melanjutkan ke pembayaran <strong>Paket Akses Rp15.000 / 30 Hari</strong>, silakan buat akun dengan email & kata sandi agar masa aktif langganan Anda dapat tersimpan aman dan bisa login di perangkat lain kapan saja.
        </p>
      </div>

      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 bg-[#F97316] text-[#0F2A43] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-[#0F2A43] tracking-tight">Daftar Akun Baru</h1>
        <p className="text-xs text-slate-500">
          Isi formulir di bawah untuk melanjutkan ke pembayaran QRIS Rp15.000.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Nama Lengkap:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Ray Orlando"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Alamat Email (Digunakan untuk Login):
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Buat Kata Sandi (Password):
            </label>
            <PasswordInput value={password} onChange={setPassword} placeholder="Minimal 6 karakter" minLength={6} autoComplete="new-password" />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Ulangi Kata Sandi:
            </label>
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Masukkan kembali kata sandi" minLength={6} autoComplete="new-password" />
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] disabled:bg-neutral-300 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            {loading ? (
              <span>Mendaftarkan akun...</span>
            ) : (
              <>
                <span>Daftar & Lanjut Pembayaran Rp15rb</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <GoogleButton onSuccess={() => router.push(next)} onError={setError} />

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>Sudah memiliki akun? </span>
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-[#0F2A43] hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
