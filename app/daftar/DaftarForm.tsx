'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import GoogleButton from '@/components/GoogleButton';
import { Notice, OrDivider, PasswordChecklist, PasswordField, SubmitButton, TextField } from '@/components/auth/AuthFields';

export default function DaftarForm() {
  const router = useRouter();
  const rawNext = useSearchParams().get('next');
  // Dari tombol "Beli akses" membawa ?next=/checkout; pendaftaran biasa langsung ke profil
  const next = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null;
  const toCheckout = next === '/checkout';
  const destination = next || '/profil';
  const googleOn = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mismatch = confirm.length > 0 && confirm !== password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Kata sandi minimal 6 karakter.');
    if (password !== confirm) return setError('Konfirmasi kata sandi belum sama.');

    setLoading(true);
    const res = await register(email.trim(), password, fullName.trim());
    setLoading(false);
    if (res.success) router.push(destination);
    else setError(res.error || 'Pendaftaran gagal. Coba lagi.');
  };

  return (
    <div className="space-y-6">
      <div className="hidden lg:block space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-[#0F2A43]">Buat akun</h1>
        <p className="text-slate-600">
          {toCheckout ? 'Satu langkah lagi sebelum pembayaran. Akun menyimpan masa aktifmu di semua perangkat.' : 'Gratis. Kamu baru membayar kalau ingin membuka nomor pemilik.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField id="daftar-nama" label="Nama lengkap" autoComplete="name" value={fullName} onChange={setFullName} placeholder="Nama kamu" />
        <TextField id="daftar-email" label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={setEmail} placeholder="nama@email.com" hint="Dipakai untuk masuk dan menerima invoice." />
        <PasswordField id="daftar-sandi" label="Kata sandi" autoComplete="new-password" value={password} onChange={setPassword} placeholder="Minimal 6 karakter" showStrength />
        <PasswordChecklist password={password} confirm={confirm} />
        <PasswordField id="daftar-ulang" label="Ulangi kata sandi" autoComplete="new-password" value={confirm} onChange={setConfirm} placeholder="Ketik ulang kata sandi" error={mismatch ? 'Belum sama dengan kata sandi di atas.' : undefined} />
        {error && <Notice tone="error">{error}</Notice>}
        <SubmitButton loading={loading} loadingText="Membuat akun…">{toCheckout ? 'Buat akun & lanjut bayar' : 'Buat akun'}</SubmitButton>
        <p className="text-xs text-slate-500 leading-relaxed">
          Dengan membuat akun, kamu menyetujui <Link href="/syarat-ketentuan" className="underline hover:text-slate-900">Syarat & Ketentuan</Link> dan{' '}
          <Link href="/kebijakan-privasi" className="underline hover:text-slate-900">Kebijakan Privasi</Link>.
        </p>
      </form>

      {googleOn && (
        <>
          <OrDivider />
          <GoogleButton text="signup_with" onSuccess={() => router.push(destination)} onError={setError} />
        </>
      )}

      <p className="hidden lg:block text-center text-sm text-slate-600">
        Sudah punya akun?{' '}
        <Link href={next ? `/masuk?next=${encodeURIComponent(next)}` : '/masuk'} className="font-semibold text-[#0F2A43] hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
