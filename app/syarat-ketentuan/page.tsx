import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan - KostHunt Surabaya',
  description: 'Ketentuan penggunaan akses langganan Rp10.000 / 30 hari di KostHunt Surabaya.',
};

export default function SyaratKetentuanPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2 border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Syarat & Ketentuan</h1>
        <p className="text-xs text-neutral-500">Berlaku untuk seluruh pengguna KostHunt Surabaya</p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
        <h2 className="text-base font-bold text-neutral-900">1. Skema Akses Berlangganan</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Paket berlangganan bernilai <strong>Rp10.000</strong> memberikan hak akses penuh selama <strong>30 hari kalender</strong> sejak status pembayaran dinyatakan sukses oleh sistem payment gateway.</li>
          <li>Akses meliputi pembukaan seluruh galeri foto kamar resolusi tinggi, video walkthrough 360°, dan nomor WhatsApp pemilik kost yang terdaftar di sistem.</li>
          <li>Status akses dievaluasi langsung oleh server saat request (real-time tanpa sistem cron).</li>
        </ul>

        <h2 className="text-base font-bold text-neutral-900">2. Perpanjangan Masa Aktif</h2>
        <p>
          Pengguna yang melakukan pembayaran baru saat langganan sebelumnya masih aktif akan mendapatkan perpanjangan masa berlaku otomatis sebanyak 30 hari dari tanggal kadaluarsa sebelumnya (akumulatif).
        </p>

        <h2 className="text-base font-bold text-neutral-900">3. Larangan Penyalahgunaan</h2>
        <p>
          Pengguna dilarang melakukan scraping otomatis, menyebarluaskan nomor WhatsApp pemilik kost untuk tujuan penipuan, spamming, atau telemarketing di luar keperluan pencarian tempat tinggal.
        </p>
      </div>
    </div>
  );
}
