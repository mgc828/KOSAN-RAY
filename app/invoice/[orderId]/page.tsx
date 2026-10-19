'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Printer, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Invoice {
  number: string;
  issuedAt: string;
  customer: { name: string; email: string };
  seller: { name: string; email: string };
  item: { description: string; quantity: number; price: number };
  total: number;
  method: string;
  status: string;
}

const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export default function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const { ready, user } = useAuth();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [state, setState] = useState<'loading' | 'missing'>('loading');

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(`/invoice/${orderId}`)}`);
      return;
    }
    fetch(`/api/invoices/${encodeURIComponent(orderId)}`, { credentials: 'same-origin', cache: 'no-store' })
      .then(async (res) => {
        if (res.ok) setInv((await res.json()).invoice);
        else setState('missing');
      })
      .catch(() => setState('missing'));
  }, [ready, user, orderId, router]);

  if (state === 'missing') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-3">
        <h1 className="text-2xl font-black text-[#0F2A43]">Invoice tidak ditemukan</h1>
        <p className="text-sm text-slate-500">Invoice hanya tersedia untuk pembayaran yang sudah lunas dan milik akun yang sedang masuk.</p>
        <Link href="/dashboard" className="inline-block text-sm font-bold text-[#C2410C] hover:underline">Kembali ke Dashboard</Link>
      </div>
    );
  }
  if (!inv) return <div className="max-w-2xl mx-auto px-4 py-16"><div className="h-80 rounded-3xl bg-slate-100 animate-pulse" aria-hidden /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
          <Printer className="w-4 h-4" /> Cetak / Simpan PDF
        </button>
      </div>

      <article className="bg-white rounded-3xl border border-neutral-200 p-8 space-y-8 print:border-0 print:p-0 print:rounded-none" aria-label={`Invoice ${inv.number}`}>
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-black text-[#F97316]">{inv.seller.name}</p>
            <p className="text-xs text-slate-500">{inv.seller.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-extrabold text-[#0F2A43]">INVOICE</p>
            <p className="text-xs font-mono text-slate-500">{inv.number}</p>
            <span className="inline-block mt-1 text-[11px] font-bold text-[#16A34A] bg-green-50 px-2.5 py-0.5 rounded-full">{inv.status}</span>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Ditagihkan kepada</p>
            <p className="font-bold text-slate-900">{inv.customer.name}</p>
            <p className="text-slate-500 break-all">{inv.customer.email}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tanggal bayar</p>
            <p className="font-bold text-slate-900" suppressHydrationWarning>
              {new Date(inv.issuedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
            <p className="text-slate-500">Metode: {inv.method}</p>
          </div>
        </section>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <th className="py-2 font-bold">Deskripsi</th>
              <th className="py-2 font-bold text-center">Jml</th>
              <th className="py-2 font-bold text-right">Harga</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3 text-slate-800">{inv.item.description}</td>
              <td className="py-3 text-center text-slate-600">{inv.item.quantity}</td>
              <td className="py-3 text-right text-slate-800" suppressHydrationWarning>{rp(inv.item.price)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-4 text-right font-bold text-slate-600">Total dibayar</td>
              <td className="pt-4 text-right text-xl font-black text-[#0F2A43]" suppressHydrationWarning>{rp(inv.total)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="text-xs text-slate-500 border-t border-slate-100 pt-4">
          Dokumen ini dibuat otomatis dan sah tanpa tanda tangan. Pertanyaan tentang pembayaran? Hubungi {inv.seller.email}.
        </p>
      </article>
    </div>
  );
}
