'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { Notice, PasswordField, SubmitButton } from '@/components/auth/AuthFields';

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
    if (password.length < 6) return setError('Kata sandi minimal 6 karakter.');
    if (password !== confirm) return setError('Konfirmasi kata sandi belum sama.');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) router.push('/masuk?reset=1');
      else setError(data.error || 'Gagal mengubah kata sandi.');
    } catch {
      setError('Terjadi gangguan jaringan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-[#0F2A43]">Kata sandi baru</h1>
        <p className="text-slate-600">Buat kata sandi baru untuk akunmu.</p>
      </div>

      {!token ? (
        <div className="space-y-3">
          <Notice tone="error">Tautan ini tidak lengkap. Minta tautan baru untuk mengatur ulang kata sandi.</Notice>
          <Link href="/lupa-sandi" className="inline-block text-sm font-semibold text-[#C2410C] hover:underline">Minta tautan baru</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField id="reset-baru" label="Kata sandi baru" autoComplete="new-password" value={password} onChange={setPassword} placeholder="Minimal 6 karakter" showStrength />
          <PasswordField id="reset-ulang" label="Ulangi kata sandi" autoComplete="new-password" value={confirm} onChange={setConfirm} placeholder="Ketik ulang kata sandi" />
          {error && (
            <Notice tone="error">
              {error}{' '}
              {error.includes('kedaluwarsa') && <Link href="/lupa-sandi" className="font-semibold underline">Minta tautan baru</Link>}
            </Notice>
          )}
          <SubmitButton loading={loading} loadingText="Menyimpan…">Simpan kata sandi</SubmitButton>
        </form>
      )}
    </div>
  );
}

export default function ResetSandiPage() {
  return (
    <AuthShell side="none">
      <Suspense fallback={<div className="h-64 rounded-2xl bg-slate-100 animate-pulse" aria-hidden />}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
