'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Home, Mail, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await register(email);
    setLoading(false);

    if (res.success) {
      router.push('/checkout');
    } else {
      setError(res.error || 'Gagal mendaftar');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Home className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-neutral-900">Buat Akun KostHunt</h1>
        <p className="text-xs text-neutral-500">
          Daftar sekarang untuk aktivasi langganan Rp10.000 / 30 hari.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Alamat Email:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-colors"
          >
            {loading ? (
              <span>Mendaftarkan...</span>
            ) : (
              <>
                <span>Lanjut ke Pembayaran Rp10rb</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-neutral-100 text-center text-xs text-neutral-500">
          <span>Sudah punya akun? </span>
          <Link href="/login" className="font-bold text-emerald-700 hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
