import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth-context';
import ToastHost from '@/components/ToastHost';
import CompareBar from '@/components/CompareBar';
import CookieConsent from '@/components/CookieConsent';
import Analytics from '@/components/Analytics';
import AuditTracker from '@/components/AuditTracker';
import ErrorReporter from '@/components/ErrorReporter';
import ElementInspector from '@/components/ElementInspector';
import SessionGuard from '@/components/SessionGuard';
import AdminLiveCustomizer from '@/components/AdminLiveCustomizer';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'kost-kostan - Cari kost terasa lebih mudah bersama kost-kostan',
  description: 'Platform cari kost terbaik di sekitar kamu. Temukan kost nyaman sesuai budget dan lokasi yang kamu inginkan.',
  keywords: [
    'kost jakarta',
    'kost kuningan',
    'kost tebet',
    'kost benhil',
    'kost dekat mrt jakarta',
    'kost palmerah binus',
    'kost grogol trisakti untar',
    'kost salemba ui',
    'kost putri jakarta',
    'kost campur jakarta',
    'kost eksklusif jakarta',
  ],
  authors: [{ name: 'kost-kostan' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  other: { 'geo.region': 'ID-JK', 'geo.placename': 'Jakarta' },
  openGraph: {
    title: 'kost-kostan - Akses Kost Rp15.000 / 30 Hari',
    description: 'Platform pencarian kost Jakarta dengan akses nomor WhatsApp pemilik dan media eksklusif Rp15.000 per 30 hari.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'kost-kostan',
  },
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  twitter: {
    card: 'summary_large_image',
    title: 'kost-kostan - Akses Kost Rp15.000 / 30 Hari',
    description: 'Platform pencarian kost Jakarta dengan akses nomor WhatsApp pemilik dan media eksklusif Rp15.000 per 30 hari.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CompareBar />
          <ToastHost />
          <CookieConsent />
          <Suspense fallback={null}>
            <AuditTracker />
          </Suspense>
          <Analytics />
          <ErrorReporter />
          <SessionGuard />
          <ElementInspector />
          <AdminLiveCustomizer />
        </AuthProvider>
      </body>
    </html>
  );
}
