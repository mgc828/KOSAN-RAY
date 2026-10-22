export type KostType = 'putra' | 'putri' | 'campur';
export type KostStatus = 'tersedia' | 'penuh';
export type MediaType = 'foto_kamar' | 'video' | 'foto_gedung';

export interface KostMedia {
  id: string;
  kost_id: string;
  tipe: MediaType;
  storage_key: string;
  url?: string; // Resolved URL (signed or public)
  urutan: number;
  is_preview: boolean;
  alt_text: string;
}

export interface Kost {
  id: string;
  slug: string;
  nama: string;
  alamat: string;
  alamat_jalan?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota: string;
  provinsi?: string;
  kodepos?: string;
  area: string;
  harga: number; // Harga per bulan (IDR)
  tipe: KostType;
  latitude?: number;
  longitude?: number;
  fasilitas: string[];
  deskripsi: string;
  peraturan: string[];
  status: KostStatus;
  /** true bila disimpan sebagai draft (belum dipublikasikan). */
  is_draft?: boolean;
  owner_whatsapp?: string; // RESTRICTED: Hanya untuk pelanggan aktif lewat endpoint terverifikasi
  created_at: string;
  updated_at: string;
  media?: KostMedia[];
  
  /** Ringkasan ulasan (diisi server untuk daftar publik). */
  rating?: { avg: number; count: number };

  // Statistik locked untuk preview
  locked_media_summary?: {
    locked_photos_count: number;
    locked_videos_count: number;
    has_locked_whatsapp: boolean;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  started_at: string;
  expires_at: string;
  status: 'active' | 'expired';
}

export interface Payment {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'settlement' | 'expire' | 'cancel';
  payment_method: 'qris' | 'gopay' | 'shopeepay' | 'other';
  paid_at?: string | null;
  raw_webhook?: Record<string, unknown>;
}

export interface AccessLog {
  id: string;
  user_id: string;
  kost_id: string;
  action: 'view_premium_media' | 'view_whatsapp';
  created_at: string;
}

export interface SearchFilter {
  kota?: string;
  area?: string;
  tipe?: KostType | 'semua';
  minHarga?: number;
  maxHarga?: number;
  searchQuery?: string;
}
