import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import { getAuthShowcase } from '@/lib/auth-showcase';
import MasukForm from './MasukForm';

export const metadata: Metadata = {
  title: 'Masuk - kost-kostan',
  robots: { index: false },
};

// Angka & foto di panel samping cukup diperbarui tiap beberapa menit
export const revalidate = 300;

export default async function MasukPage() {
  const showcase = await getAuthShowcase();
  return (
    <AuthShell side="masuk" showcase={showcase}>
      <Suspense fallback={<div className="h-72 rounded-2xl bg-slate-100 animate-pulse" aria-hidden />}>
        <MasukForm />
      </Suspense>
    </AuthShell>
  );
}
