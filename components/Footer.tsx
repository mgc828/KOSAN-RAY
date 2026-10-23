'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, QrCode, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import '@/app/papi-home.css';
import { CookieSettingsLink } from '@/components/CookieConsent';

export default function Footer() {
  const pathname = usePathname();
  // Cari Kost, Maps, dan Admin tidak menampilkan footer utama.
  if (pathname?.startsWith('/cari-kost') || pathname?.startsWith('/maps') || pathname?.startsWith('/admin')) return null;
  return (
    <div className="papi-home">
      <footer className="site-footer" data-header-theme="dark">
        <div className="container" style={{ overflow: 'visible' }}>
          {/* Logo Kost-Kostan di atas konten footer dan posisinya di kiri */}
          <div className="footer-top-brand" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '2rem' }}>
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', margin: 0, background: 'transparent', padding: 0 }}>
              <BrandLogo variant="horizontal" light className="h-12" />
            </div>
          </div>

          <div className="footer-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2.5rem' }}>
            {/* Bagian Brand: Isi dibuat space between */}
            <div className="footer-brand" style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', flex: '1.8 1 450px', flexWrap: 'wrap', textAlign: 'left', alignItems: 'flex-start' }}>
              <div className="footer-social" style={{ flex: '1 1 200px', maxWidth: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left', alignItems: 'flex-start' }}>
                <div>
                  <h4>TETAP TERHUBUNG</h4>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                    Platform cari kost terpercaya di sekitarmu. Buka seluruh nomor kontak pemilik kost asli, foto kamar resolusi tinggi, dan video walkthrough 360° tanpa calo hanya Rp15.000 / 30 hari.
                  </p>
                </div>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#F97316', fontWeight: 600, marginTop: 12 }}>
                  <Shield size={16} /> Verifikasi Langsung ke Pemilik
                </p>
              </div>
              <div className="footer-app" style={{ flex: '1 1 200px', maxWidth: 300, textAlign: 'left', alignItems: 'flex-start' }}>
                <h4>SISTEM TRANSPARAN</h4>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F97316', fontWeight: 800, fontSize: 14 }}>
                  <QrCode size={16} /> Rp15.000 Flat / 30 Hari
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginTop: 6 }}>
                  Pembayaran instan QRIS (GoPay, OVO, ShopeePay, DANA) langsung aktif otomatis. kost-kostan tidak memotong komisi sewa bulanan apapun dari pemilik maupun penghuni kost.
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34d399', fontWeight: 600, marginTop: 8 }}>
                  <CheckCircle2 size={14} /> Tanpa batas kuota lihat nomor kontak
                </p>
              </div>
            </div>

            {/* Di tengah: MENU & LEGAL */}
            <div className="footer-nav-column" style={{ flex: '1 1 200px', minWidth: 180 }}>
              <h4><span>MENU &amp; LEGAL</span></h4>
              <ul>
                <li><Link href="/tentang">Tentang kost-kostan</Link></li>
                <li><Link href="/kebijakan-privasi">Kebijakan Privasi</Link></li>
                <li><Link href="/syarat-ketentuan">Syarat &amp; Ketentuan Akses</Link></li>
                <li><Link href="/kontak">Kontak &amp; Bantuan WhatsApp</Link></li>
                <li><Link href="/admin">Panel Pengelola Kost (Admin)</Link></li>
              </ul>
            </div>

            {/* Sebelah kanan: Halaman */}
            <div className="footer-nav-column" style={{ flex: '0.8 1 150px', minWidth: 140 }}>
              <h4><span>Halaman</span></h4>
              <ul>
                <li><Link href="/" scroll={true} onClick={() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}>Beranda</Link></li>
                <li><Link href="/cari-kost" scroll={true} onClick={() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}>Cari Kost</Link></li>
                <li><Link href="/maps" scroll={true} onClick={() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}>Maps</Link></li>
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
