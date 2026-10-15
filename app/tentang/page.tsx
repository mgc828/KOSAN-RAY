import React from 'react';
import Link from 'next/link';
import { ShieldCheck, QrCode, Home, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang KostHunt Jakarta - Validasi Kost Tanpa Calo',
  description: 'Misi KostHunt Jakarta dalam mempermudah mahasiswa dan pekerja mencari tempat tinggal terverifikasi dengan akses WhatsApp pemilik langsung.',
};

export default function TentangPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          Tentang KostHunt Jakarta
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed">
          Platform kurasi kost pertama di Jakarta yang mengutamakan transparansi dan memutus perantara calo.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 text-sm text-neutral-700 leading-relaxed">
        <h2 className="text-lg font-bold text-neutral-900">Misi Kami</h2>
        <p>
          Banyak pencari kost di Jakarta—terutama mahasiswa baru BINUS, Trisakti, UNTAR, UI Salemba serta pekerja di kawasan Sudirman, SCBD, dan Kuningan—menghadapi kendala foto tidak sesuai realita, nomor kontak yang dipegang calo tidak bertanggung jawab, atau pungutan biaya survey yang tidak wajar.
        </p>
        <p>
          KostHunt hadir dengan model sederhana: <strong>preview gratis 3 foto & 1 video untuk setiap kost</strong>, dan paket <strong>Rp10.000 untuk akses penuh 30 hari</strong> yang membuka seluruh foto beresolusi tinggi, video walkthrough 360°, dan nomor WhatsApp pemilik kost langsung.
        </p>

        <h2 className="text-lg font-bold text-neutral-900 pt-4">Kenapa Memilih KostHunt?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1.5">
            <h3 className="font-bold text-neutral-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Kontak Asli Pemilik
            </h3>
            <p className="text-xs text-neutral-600">
              Setiap listing diverifikasi nomor teleponnya sehingga Anda langsung berurusan dengan pemilik atau pengelola sah.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1.5">
            <h3 className="font-bold text-neutral-900 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-600" />
              Harga Bersahabat Rp10.000
            </h3>
            <p className="text-xs text-neutral-600">
              Sekali bayar via QRIS tanpa langganan otomatis (non-recurring auto-debit). Anda tidak akan ditagih diam-diam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
