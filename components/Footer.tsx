import React from 'react';
import Link from 'next/link';
import { Home, Shield, QrCode, Phone, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-12 pb-8 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-800">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">KostHunt Jakarta</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Platform validasi kost nomor satu di Jakarta. Buka seluruh foto kamar, video walkthrough, dan nomor WhatsApp pemilik langsung tanpa perantara calo hanya Rp10.000 / 30 hari.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Verifikasi Langsung ke Pemilik</span>
            </div>
          </div>

          {/* Area Populer Jakarta */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Area Kost Jakarta</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/kost/jakarta/kuningan" className="hover:text-emerald-400 transition-colors">
                  Kost Kuningan (Dekat Mega Kuningan & SCBD)
                </Link>
              </li>
              <li>
                <Link href="/kost/jakarta/tebet" className="hover:text-emerald-400 transition-colors">
                  Kost Tebet (Dekat Stasiun KRL & Kuliner)
                </Link>
              </li>
              <li>
                <Link href="/kost/jakarta/benhil" className="hover:text-emerald-400 transition-colors">
                  Kost Benhil (Dekat MRT & Sudirman)
                </Link>
              </li>
              <li>
                <Link href="/kost/jakarta/palmerah" className="hover:text-emerald-400 transition-colors">
                  Kost Palmerah (Dekat Kampus BINUS)
                </Link>
              </li>
              <li>
                <Link href="/kost/jakarta/grogol" className="hover:text-emerald-400 transition-colors">
                  Kost Grogol (Dekat Trisakti, UNTAR & Mall Ciputra)
                </Link>
              </li>
              <li>
                <Link href="/kost/jakarta/setiabudi" className="hover:text-emerald-400 transition-colors">
                  Kost Setiabudi (Dekat Stasiun LRT)
                </Link>
              </li>
            </ul>
          </div>

          {/* Informasi & Legalitas */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Halaman & Kebijakan</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tentang" className="hover:text-emerald-400 transition-colors">
                  Tentang KostHunt
                </Link>
              </li>
              <li>
                <Link href="/kebijakan-privasi" className="hover:text-emerald-400 transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/syarat-ketentuan" className="hover:text-emerald-400 transition-colors">
                  Syarat & Ketentuan Akses
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-emerald-400 transition-colors">
                  Kontak & Bantuan
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors text-neutral-500">
                  Panel Pengelola Kost (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparansi Pembayaran */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Model Transparan</h4>
            <div className="bg-neutral-800/80 p-3.5 rounded-xl border border-neutral-700/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <QrCode className="w-4 h-4" />
                <span>Rp10.000 / 30 Hari</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug">
                Hanya menggunakan QRIS & E-Wallet (GoPay, OVO, ShopeePay, DANA) untuk efisiensi biaya tanpa potongan Virtual Account.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tanpa batas kuota survey harian</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-3">
          <p>© {new Date().getFullYear()} KostHunt Jakarta. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            <span>Dibuat untuk kemudahan pencari kost Jakarta</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
