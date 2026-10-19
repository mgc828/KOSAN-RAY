'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Kata sandi minimal 6 karakter');
    if (password !== confirm) return setError('Konfirmasi kata sandi tidak cocok');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) router.push('/login?reset=1');
      else setError(data.error || 'Gagal mengubah kata sandi.');
    } catch {
      setError('Terjadi gangguan jaringan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 bg-[#F97316] text-[#0F2A43] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-[#0F2A43] tracking-tight">Atur Ulang Kata Sandi</h1>
        <p className="text-xs text-slate-500">Buat kata sandi baru untuk akun Anda.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        {!token ? (
          <div className="space-y-3 text-sm text-slate-600">
            <p>Tautan ini tidak lengkap. Minta tautan baru untuk mengatur ulang kata sandi.</p>
            <Link href="/lupa-sandi" className="inline-block font-bold text-[#C2410C] hover:underline">Minta tautan baru</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="block text-xs font-bold text-slate-800">Kata Sandi Baru:</label>
              <PasswordInput id="new-password" value={password} onChange={setPassword} placeholder="Minimal 6 karakter" minLength={6} autoComplete="new-password" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-800">Ulangi Kata Sandi:</label>
              <PasswordInput id="confirm-password" value={confirm} onChange={setConfirm} placeholder="Masukkan kembali kata sandi" minLength={6} autoComplete="new-password" />
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium" role="alert">
                {error}{' '}
                {error.includes('kedaluwarsa') && (
                  <Link href="/lupa-sandi" className="font-bold underline">Minta tautan baru</Link>
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:bg-neutral-300 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetSandiPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
