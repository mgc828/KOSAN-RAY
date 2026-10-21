'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Shield, QrCode, CheckCircle2 } from 'lucide-react';
import '@/app/papi-home.css';
import { CookieSettingsLink } from '@/components/CookieConsent';

export default function Footer() {
  const pathname = usePathname();
  // Cari Kost, Maps, dan Admin tidak menampilkan footer utama.
  if (pathname?.startsWith('/cari-kost') || pathname?.startsWith('/maps') || pathname?.startsWith('/admin')) return null;
  return (
    <div className="papi-home">
      <footer className="site-footer" data-header-theme="dark">
        <div className="container">
          {/* Logo Kost-Kostan di atas konten footer dan posisinya di kiri */}
          <div className="footer-top-brand" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '2rem' }}>
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10, margin: 0 }}>
              <Compass size={26} color="#0F2A43" />
              <span style={{ fontSize: 26, fontWeight: 900, color: '#0F2A43', letterSpacing: '-0.02em' }}>
                Kost-Kostan
              </span>
            </div>
          </div>

          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-social">
                <h4>TETAP TERHUBUNG</h4>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: 280 }}>
                  Platform cari kost terpercaya di sekitarmu. Buka seluruh nomor kontak pemilik kost asli, foto kamar resolusi tinggi, dan video walkthrough 360° tanpa calo hanya Rp15.000 / 30 hari.
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#F97316', fontWeight: 600, marginTop: 12 }}>
                  <Shield size={16} /> Verifikasi Langsung ke Pemilik
                </p>
              </div>
              <div className="footer-app">
                <h4>SISTEM TRANSPARAN</h4>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F97316', fontWeight: 800, fontSize: 14 }}>
                  <QrCode size={16} /> Rp15.000 Flat / 30 Hari
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 280, marginTop: 6 }}>
                  Pembayaran instan QRIS (GoPay, OVO, ShopeePay, DANA) langsung aktif otomatis. kost-kostan tidak memotong komisi sewa bulanan apapun dari pemilik maupun penghuni kost.
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34d399', fontWeight: 600, marginTop: 8 }}>
                  <CheckCircle2 size={14} /> Tanpa batas kuota lihat nomor kontak
                </p>
              </div>
            </div>

            <div className="footer-nav-column">
              <h4><span>Halaman</span></h4>
              <ul>
                <li><Link href="/">Beranda</Link></li>
                <li><Link href="/cari-kost">Cari Kost</Link></li>
                <li><Link href="/maps">Maps</Link></li>
              </ul>
            </div>

            <div className="footer-nav-column">
              <h4><span>MENU &amp; LEGAL</span></h4>
              <ul>
                <li><Link href="/tentang">Tentang kost-kostan</Link></li>
                <li><Link href="/kebijakan-privasi">Kebijakan Privasi</Link></li>
                <li><Link href="/syarat-ketentuan">Syarat &amp; Ketentuan Akses</Link></li>
                <li><Link href="/kontak">Kontak &amp; Bantuan WhatsApp</Link></li>
                <li><Link href="/admin">Panel Pengelola Kost (Admin)</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      <footer className="footer-bottom-center">
        <div className="footer-content">
          <p className="copyright-text" style={{ color: '#F97316' }}>© {new Date().getFullYear()} kost-kostan. Hak Cipta Dilindungi. <CookieSettingsLink /></p>
        </div>
      </footer>
    </div>
  );
}
