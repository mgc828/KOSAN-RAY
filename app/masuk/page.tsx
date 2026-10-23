import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import MasukForm from './MasukForm';

export const metadata: Metadata = {
  title: 'Masuk - kost-kostan',
  robots: { index: false },
};


export default function MasukPage() {
  return (
    <AuthShell side="masuk">
      <Suspense fallback={<div className="h-72 rounded-2xl bg-slate-100 animate-pulse" aria-hidden />}>
        <MasukForm />
      </Suspense>
    </AuthShell>
  );
}
