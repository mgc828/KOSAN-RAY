import { Metadata } from 'next';
import { AdminAuthProvider } from '@/lib/admin-client';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Dashboard Admin - Kost-Kostan Jakarta',
  description: 'Panel Pengelolaan Kost, Media, Transaksi, dan Pengguna Kost-Kostan DKI Jakarta.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </AdminAuthProvider>
  );
}

