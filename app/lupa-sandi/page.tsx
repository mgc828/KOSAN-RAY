'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function LupaSandiPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ message: string; devLink?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) setDone({ message: data.message, devLink: data.devLink });
      else setError(data.error || 'Permintaan gagal. Coba lagi.');
    } catch {
      setError('Terjadi gangguan jaringan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
      <div className="text-center space-y-1.5">
        <BrandLogo variant="mark" className="h-16 mx-auto mb-2" />
        <h1 className="text-2xl font-black text-[#0F2A43] tracking-tight">Lupa Kata Sandi</h1>
        <p className="text-xs text-slate-500">Masukkan email akun Anda. Kami kirim tautan untuk mengatur ulang kata sandi.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        {done ? (
          <div className="space-y-4" role="status">
            <div className="flex items-start gap-2.5 text-sm text-[#166534] bg-green-50 border border-[#16A34A]/30 rounded-2xl p-4">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium">{done.message}</p>
            </div>
            {done.devLink && (
              <div className="text-xs bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-3.5 space-y-1.5">
                <p className="font-bold text-slate-700">Mode pengembangan (email belum dikonfigurasi)</p>
                <Link href={done.devLink} className="break-all font-semibold text-[#C2410C] hover:underline">
                  Buka tautan atur ulang
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="forgot-email" className="block text-xs font-bold text-slate-800">Alamat Email:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="forgot-email"
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

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:bg-neutral-300 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              {loading ? 'Mengirim...' : 'Kirim Tautan Atur Ulang'}
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
          <Link href="/login" className="inline-flex items-center gap-1.5 font-bold text-[#0F2A43] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
