import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'KostHunt Jakarta - Akses Kost Rp10.000 / 30 Hari',
  description: 'Platform pencarian kost Jakarta dengan akses nomor WhatsApp pemilik dan media eksklusif Rp10.000 per 30 hari.',
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
  authors: [{ name: 'KostHunt Jakarta' }],
  openGraph: {
    title: 'KostHunt Jakarta - Akses Kost Rp10.000 / 30 Hari',
    description: 'Platform pencarian kost Jakarta dengan akses nomor WhatsApp pemilik dan media eksklusif Rp10.000 per 30 hari.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'KostHunt Jakarta',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'KostHunt Jakarta Platform Pencarian Kost Terpercaya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KostHunt Jakarta - Akses Kost Rp10.000 / 30 Hari',
    description: 'Platform pencarian kost Jakarta dengan akses nomor WhatsApp pemilik dan media eksklusif Rp10.000 per 30 hari.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 antialiased" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
