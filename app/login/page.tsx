'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import BrandLogo from '@/components/BrandLogo';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import GoogleButton from '@/components/GoogleButton';

/** Hanya izinkan alamat tujuan di dalam situs ini. */
function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const next = safeNext(params.get('next'));
  const fromCheckout = next === '/checkout';
  const resetDone = params.get('reset') === '1';
  const destination = next || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(destination);
    } else {
      setError(res.error || 'Email atau kata sandi salah');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
      {/* Kotak info hanya muncul kalau pengunjung datang dari alur pembayaran */}
      {fromCheckout && (
        <div className="bg-[#FFEDD5] border border-[#F97316] rounded-3xl p-4 sm:p-5 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-black text-[#0F2A43]">
            <Sparkles className="w-4 h-4 text-[#C2410C]" />
            <span>Masuk untuk Melanjutkan Pembayaran</span>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium">
            Silakan masuk menggunakan email dan kata sandi yang telah Anda daftarkan. Setelah berhasil masuk, Anda akan langsung diarahkan ke tahap pembayaran QRIS Rp15.000.
          </p>
        </div>
      )}

      {resetDone && (
        <div className="bg-green-50 border border-[#16A34A]/40 text-[#166534] rounded-2xl p-3.5 text-xs font-semibold" role="status">
          Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.
        </div>
      )}

      <div className="text-center space-y-1.5">
        <BrandLogo variant="mark" className="h-16 mx-auto mb-2" />
        <h1 className="text-2xl font-black text-[#0F2A43] tracking-tight">Masuk ke Akun</h1>
        <p className="text-xs text-slate-500">
          Gunakan email dan kata sandi Anda untuk mengakses platform.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-bold text-slate-800">
              Alamat Email:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-800">
                Kata Sandi:
              </label>
              <Link href="/lupa-sandi" className="text-xs font-bold text-[#C2410C] hover:underline">
                Lupa kata sandi?
              </Link>
            </div>
            <PasswordInput id="login-password" value={password} onChange={setPassword} placeholder="Masukkan kata sandi..." autoComplete="current-password" />
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] disabled:bg-neutral-300 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            {loading ? (
              <span>Memverifikasi akun...</span>
            ) : (
              <>
                <span>{fromCheckout ? 'Masuk & Lanjut Pembayaran' : 'Masuk'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <GoogleButton onSuccess={() => router.push(destination)} onError={setError} />

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>Belum punya akun? </span>
          <Link href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'} className="font-bold text-[#0F2A43] hover:underline">
            Daftar akun baru di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
