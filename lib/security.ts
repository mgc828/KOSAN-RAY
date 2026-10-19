import { Kost, KostMedia } from './types';

/**
 * Memfilter objek Kost untuk pengunjung non-langganan / publik / Googlebot.
 * SANGAT PENTING:
 * 1. Menghilangkan sama sekali field `owner_whatsapp`.
 * 2. Menghilangkan semua media yang `is_preview: false`.
 * 3. Menghitung ringkasan item terkunci (+X foto, +Y video, nomor WhatsApp pemilik).
 */
export function sanitizeKostForPublic(kost: Kost): Kost {
  const allMedia = kost.media || [];
  
  // Hanya ambil media preview (maksimal 3 foto kamar, 1 video, 1 foto gedung)
  const previewMedia = allMedia.filter(m => m.is_preview);
  
  // Hitung jumlah konten yang terkunci
  const lockedPhotosCount = allMedia.filter(m => !m.is_preview && m.tipe === 'foto_kamar').length;
  const lockedVideosCount = allMedia.filter(m => !m.is_preview && m.tipe === 'video').length;

  return {
    id: kost.id,
    slug: kost.slug,
    nama: kost.nama,
    alamat: kost.alamat,
    area: kost.area,
    kota: kost.kota,
    // Lokasi (peta) bersifat publik: alamat kost sudah tampil di halaman
    latitude: kost.latitude,
    longitude: kost.longitude,
    harga: kost.harga,
    tipe: kost.tipe,
    fasilitas: kost.fasilitas,
    deskripsi: kost.deskripsi,
    peraturan: kost.peraturan,
    status: kost.status,
    created_at: kost.created_at,
    updated_at: kost.updated_at,
    // TIDAK MENYERTAKAN owner_whatsapp (dihilangkan sepenuhnya)
    owner_whatsapp: undefined,
    // HANYA media preview
    media: previewMedia,
    locked_media_summary: {
      locked_photos_count: lockedPhotosCount,
      locked_videos_count: lockedVideosCount,
      has_locked_whatsapp: true,
    },
  };
}

/**
 * Menyajikan objek Kost lengkap untuk pelanggan aktif.
 * Media premium tetap diberikan URL signed sementara atau URL terverifikasi.
 */
export function formatKostForSubscriber(kost: Kost): Kost {
  const allMedia = kost.media || [];
  
  return {
    ...kost,
    // Pada response penuh, owner_whatsapp tetap disarankan diambil via tombol / endpoint terpisah
    // atau ditampilkan secara eksplisit untuk pelanggan aktif
    owner_whatsapp: kost.owner_whatsapp,
    media: allMedia,
    locked_media_summary: {
      locked_photos_count: 0,
      locked_videos_count: 0,
      has_locked_whatsapp: false,
    },
  };
}

/**
 * Simulasi pembuatan signed URL Cloudflare R2 berumur 5-10 menit (300-600 detik).
 * Dalam mode produksi dengan kredensial R2 AWS SDK S3:
 * S3Client.getSignedUrl(new GetObjectCommand({ Bucket, Key }), { expiresIn: 600 })
 */
export function generateR2SignedUrl(storageKey: string, expiresInSeconds: number = 600): string {
  const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://media.kosthunt.id';
  const expiresTimestamp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  
  // Signature token dummy/HMAC untuk simulasi sandbox
  const signature = Buffer.from(`${storageKey}-${expiresTimestamp}`).toString('base64url').slice(0, 24);
  return `${r2PublicDomain}/${storageKey}?expires=${expiresTimestamp}&sig=${signature}`;
}
