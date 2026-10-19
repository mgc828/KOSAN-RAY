import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi - kost-kostan',
  description: 'Kebijakan privasi data pengguna dan keamanan nomor kontak di platform kost-kostan.',
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2 border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Kebijakan Privasi</h1>
        <p className="text-xs text-neutral-500">Terakhir diperbarui: 15 Maret 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed">
        <h2 className="text-base font-bold text-neutral-900">1. Data yang Kami Kumpulkan</h2>
        <p>
          Kami mengumpulkan alamat email yang Anda berikan untuk identifikasi akun, riwayat transaksi pembayaran langganan, serta log akses media premium demi menjaga keamanan sistem.
        </p>

        <h2 className="text-base font-bold text-neutral-900">2. Keamanan Data Pemilik Kost</h2>
        <p>
          Nomor WhatsApp pemilik kost dilindungi secara ketat di sisi server (Server-Side Restricted) dan tidak pernah disertakan dalam payload publik, metadata halaman, atau disajikan kepada bot perayap mesin pencari (Googlebot). Nomor hanya diserahkan kepada pengguna yang memiliki status langganan terverifikasi aktif.
        </p>

        <h2 className="text-base font-bold text-neutral-900">3. Pemrosesan Pembayaran</h2>
        <p>
          Pembayaran diproses melalui payment gateway berlisensi (Midtrans/Xendit) dengan metode QRIS dan E-Wallet. Kami tidak menyimpan detail kartu kredit maupun data rahasia perbankan Anda.
        </p>

        <h2 className="text-base font-bold text-neutral-900">4. Hubungi Kami</h2>
        <p>
          Jika Anda memiliki pertanyaan seputar kebijakan privasi atau permohonan penghapusan data akun, silakan hubungi kami melalui email: <span className="font-semibold text-emerald-700">support@kost-kostan.id</span>.
        </p>
      </div>
    </div>
  );
}
