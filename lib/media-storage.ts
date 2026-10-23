import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Penyimpanan berkas media kost (foto & video) di Supabase Storage.
 * Berkas diunggah langsung dari browser lewat signed upload URL, jadi tidak melewati batas body fungsi serverless.
 */

export const MEDIA_BUCKET = 'kost-media';
/** Semua berkas unggahan admin memakai awalan ini (dipakai juga untuk membatasi penghapusan). */
export const MEDIA_PREFIX = 'uploads/';

const IMAGE_MAX = 8 * 1024 * 1024;
const VIDEO_MAX = 50 * 1024 * 1024;

const ALLOWED: Record<string, { ext: string; kind: 'image' | 'video' }> = {
  'image/jpeg': { ext: 'jpg', kind: 'image' },
  'image/png': { ext: 'png', kind: 'image' },
  'image/webp': { ext: 'webp', kind: 'image' },
  'video/mp4': { ext: 'mp4', kind: 'video' },
  'video/webm': { ext: 'webm', kind: 'video' },
};

function isPlaceholder(v: string | undefined) {
  return !v || /your-|mock-|placeholder|changeme/i.test(v);
}

export function storageConfigured() {
  return !isPlaceholder(process.env.NEXT_PUBLIC_SUPABASE_URL) && !isPlaceholder(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let client: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export type UploadCheck = { ok: true; ext: string; kind: 'image' | 'video' } | { ok: false; error: string };

export function validateUpload(contentType: unknown, size: unknown): UploadCheck {
  const meta = typeof contentType === 'string' ? ALLOWED[contentType] : undefined;
  if (!meta) return { ok: false, error: 'Format tidak didukung. Gunakan JPG, PNG, WebP, MP4, atau WebM.' };
  const bytes = typeof size === 'number' ? size : NaN;
  if (!Number.isFinite(bytes) || bytes <= 0) return { ok: false, error: 'Ukuran berkas tidak valid.' };
  const max = meta.kind === 'image' ? IMAGE_MAX : VIDEO_MAX;
  if (bytes > max) {
    return { ok: false, error: `Berkas terlalu besar (maksimal ${meta.kind === 'image' ? '8 MB untuk foto' : '50 MB untuk video'}).` };
  }
  return { ok: true, ext: meta.ext, kind: meta.kind };
}

let bucketReady = false;
/** Buat bucket publik bila belum ada. Kunci berkas acak (UUID) sehingga alamatnya tidak bisa ditebak. */
export async function ensureMediaBucket(): Promise<void> {
  if (bucketReady) return;
  const { data } = await sb().storage.getBucket(MEDIA_BUCKET);
  if (!data) {
    const { error } = await sb().storage.createBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: VIDEO_MAX,
      allowedMimeTypes: Object.keys(ALLOWED),
    });
    if (error && !/already exists/i.test(error.message)) throw new Error(`Gagal membuat bucket media: ${error.message}`);
  }
  bucketReady = true;
}

export async function createSignedUpload(key: string) {
  await ensureMediaBucket();
  const { data, error } = await sb().storage.from(MEDIA_BUCKET).createSignedUploadUrl(key);
  if (error || !data) throw new Error(error?.message || 'Gagal membuat URL unggah');
  return data; // { signedUrl, token, path }
}

export function publicMediaUrl(key: string): string {
  return sb().storage.from(MEDIA_BUCKET).getPublicUrl(key).data.publicUrl;
}

export async function removeMedia(keys: string[]): Promise<number> {
  const safe = keys.filter((k) => typeof k === 'string' && k.startsWith(MEDIA_PREFIX) && !k.includes('..'));
  if (safe.length === 0) return 0;
  const { data, error } = await sb().storage.from(MEDIA_BUCKET).remove(safe);
  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

/** Kunci publik (anon/publishable) yang dibutuhkan gateway Supabase saat browser mengunggah ke signed URL. */
export function publicApiKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}
