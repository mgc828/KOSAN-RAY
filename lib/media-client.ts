'use client';

import { toast } from '@/lib/toast';

/** Hapus berkas hasil unggahan dari Supabase Storage (hanya kunci berawalan uploads/). Gagal diam-diam: berkas yatim tidak merusak data. */
export async function deleteStoredMedia(keys: string[]): Promise<void> {
  const list = keys.filter((k) => k.startsWith('uploads/'));
  if (list.length === 0) return;
  try {
    await fetch('/api/admin/media/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: list }),
      keepalive: true,
    });
  } catch {
    // abaikan
  }
}

export interface UploadInit {
  key: string;
  kind: 'image' | 'video';
  signedUrl: string;
  apikey: string;
  publicUrl: string;
}

/** Minta signed URL ke server. */
export async function initUpload(file: File): Promise<UploadInit> {
  const res = await fetch('/api/admin/media/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menyiapkan unggahan');
  return data as UploadInit;
}

/** Unggah berkas langsung ke Supabase Storage dengan progres asli. */
export function putToStorage(init: UploadInit, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', init.signedUrl);
    if (init.apikey) xhr.setRequestHeader('apikey', init.apikey);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Unggah gagal (${xhr.status})`)));
    xhr.onerror = () => reject(new Error('Koneksi terputus saat mengunggah'));
    const body = new FormData();
    body.append('cacheControl', '3600');
    body.append('', file);
    xhr.send(body);
  });
}

export function notifyError(msg: string) {
  toast(msg, 'error');
}
