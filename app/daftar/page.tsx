import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import DaftarForm from './DaftarForm';

export const metadata: Metadata = {
  title: 'Daftar - kost-kostan',
  robots: { index: false },
};


export default function DaftarPage() {
  return (
    <AuthShell side="daftar">
      <Suspense fallback={<div className="h-96 rounded-2xl bg-slate-100 animate-pulse" aria-hidden />}>
        <DaftarForm />
      </Suspense>
    </AuthShell>
  );
}
