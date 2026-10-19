/** Konfigurasi bersama (server & klien). Harga dan durasi hanya ditulis di sini. */
export const SITE_NAME = 'kost-kostan';
export const SUBSCRIPTION_PRICE = 15000; // rupiah
export const SUBSCRIPTION_DAYS = 30;

export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'halo@kost-kostan.id';

/** Alamat dasar situs untuk tautan di email/sitemap. Di produksi wajib diisi lewat APP_URL. */
export function baseUrl(req?: Request): string {
  if (process.env.NODE_ENV === 'production' && process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (req) {
    const h = req.headers;
    const host = h.get('x-forwarded-host') || h.get('host');
    if (host) {
      const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
      return `${proto}://${host}`;
    }
  }
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

/** Pilihan topik di formulir Kontak. */
export const CONTACT_TOPICS = ['Pertanyaan umum', 'Kendala pembayaran', 'Laporan kost bermasalah', 'Pemilik kost / kerja sama', 'Lainnya'];
