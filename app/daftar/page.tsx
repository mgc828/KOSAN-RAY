import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import { getAuthShowcase } from '@/lib/auth-showcase';
import DaftarForm from './DaftarForm';

export const metadata: Metadata = {
  title: 'Daftar - kost-kostan',
  robots: { index: false },
};

export const revalidate = 300;

export default async function DaftarPage() {
  const showcase = await getAuthShowcase();
  return (
    <AuthShell side="daftar" showcase={showcase}>
      <Suspense fallback={<div className="h-96 rounded-2xl bg-slate-100 animate-pulse" aria-hidden />}>
        <DaftarForm />
      </Suspense>
    </AuthShell>
  );
}
