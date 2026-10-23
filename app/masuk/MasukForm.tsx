'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import GoogleButton from '@/components/GoogleButton';
import { Notice, OrDivider, PasswordField, SubmitButton, TextField } from '@/components/auth/AuthFields';
import { SUBSCRIPTION_PRICE } from '@/lib/config';

/** Hanya izinkan alamat tujuan di dalam situs ini. */
function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

export default function MasukForm() {
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
  const idleOut = params.get('reason') === 'idle';
  const destination = next || '/profil';
  const googleOn = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(email.trim(), password);
    setLoading(false);
    if (res.success) router.push(destination);
    else setError(res.error || 'Email atau kata sandi salah');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-[#0F2A43]">{fromCheckout ? 'Masuk untuk lanjut bayar' : 'Masuk'}</h1>
        <p className="text-slate-600">
          {fromCheckout
            ? `Setelah masuk, kamu langsung ke pembayaran QRIS Rp ${SUBSCRIPTION_PRICE.toLocaleString('id-ID')}.`
            : 'Selamat datang kembali. Masuk untuk membuka profil dan akses kostmu.'}
        </p>
      </div>

      {idleOut && <Notice tone="info">Kamu keluar otomatis karena tidak ada aktivitas selama 15 menit. Silakan masuk lagi.</Notice>}
      {resetDone && <Notice tone="success">Kata sandi berhasil diubah. Masuk dengan kata sandi barumu.</Notice>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
        <TextField id="masuk-email" label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={setEmail} placeholder="nama@email.com" />
        <PasswordField
          id="masuk-sandi"
          label="Kata sandi"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder="Masukkan kata sandi"
          aside={<Link href="/lupa-sandi" className="text-sm font-medium text-[#C2410C] hover:underline">Lupa kata sandi?</Link>}
        />
        {error && <Notice tone="error">{error}</Notice>}
        <SubmitButton loading={loading} loadingText="Memeriksa…">{fromCheckout ? 'Masuk & lanjut bayar' : 'Masuk'}</SubmitButton>
      </form>

      {googleOn && (
        <>
          <OrDivider />
          <GoogleButton onSuccess={() => router.push(destination)} onError={setError} />
        </>
      )}

      <p className="text-center text-sm text-slate-600">
        Belum punya akun?{' '}
        <Link href={next ? `/daftar?next=${encodeURIComponent(next)}` : '/daftar'} className="font-semibold text-[#0F2A43] hover:underline">
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}
