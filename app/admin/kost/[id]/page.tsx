'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import KostForm from '@/components/admin/KostForm';
import { Kost } from '@/lib/types';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function AdminKostEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [kost, setKost] = useState<Kost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/admin/data?type=kosts`)
      .then((res) => res.json())
      .then((data) => {
        const found = (data.kosts || []).find((k: Kost) => k.id === id);
        if (found) {
          setKost(found);
        } else {
          setError('Data kost tidak ditemukan');
        }
      })
      .catch(() => setError('Gagal memuat data kost'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm text-slate-500">Memuat data kost...</p>
      </div>
    );
  }

  if (error || !kost) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md mx-auto space-y-4 my-12">
        <p className="text-rose-600 font-semibold">{error || 'Data kost tidak ditemukan'}</p>
        <button
          onClick={() => router.push('/admin/kost')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Data Kost</span>
        </button>
      </div>
    );
  }

  return <KostForm initialKost={kost} isEdit={true} />;
}

