'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { Notice, SubmitButton, TextField } from '@/components/auth/AuthFields';

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
    <AuthShell side="none">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-[#0F2A43]">Lupa kata sandi</h1>
          <p className="text-slate-600">Masukkan email akunmu. Kami kirim tautan untuk membuat kata sandi baru.</p>
        </div>

        {done ? (
          <div className="space-y-4">
            <Notice tone="success">{done.message}</Notice>
            {done.devLink && (
              <div className="text-sm bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3.5 space-y-1.5">
                <p className="font-semibold text-slate-700">Mode pengembangan (email belum dikonfigurasi)</p>
                <Link href={done.devLink} className="break-all font-medium text-[#C2410C] hover:underline">Buka tautan atur ulang</Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField id="lupa-email" label="Email" type="email" inputMode="email" autoComplete="email" value={email} onChange={setEmail} placeholder="nama@email.com" />
            {error && <Notice tone="error">{error}</Notice>}
            <SubmitButton loading={loading} loadingText="Mengirim…">Kirim tautan</SubmitButton>
          </form>
        )}

        <Link href="/masuk" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F2A43] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Kembali ke halaman masuk
        </Link>
      </div>
    </AuthShell>
  );
}
