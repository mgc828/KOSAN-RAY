import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getAdminSessionFromReq } from '@/lib/admin-session';
import {
  MEDIA_PREFIX,
  createSignedUpload,
  publicApiKey,
  publicMediaUrl,
  storageConfigured,
  validateUpload,
} from '@/lib/media-storage';

/** Menyiapkan unggahan: mengembalikan signed URL agar browser mengunggah berkas langsung ke Supabase Storage. */
export async function POST(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) {
    return NextResponse.json({ error: 'Tidak diizinkan. Silakan login sebagai admin.' }, { status: 401 });
  }
  if (!storageConfigured()) {
    return NextResponse.json({ error: 'Penyimpanan media belum dikonfigurasi (Supabase). Gunakan "Tambah via URL".' }, { status: 501 });
  }

  try {
    const body = await req.json();
    const check = validateUpload(body?.contentType, body?.size);
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

    const key = `${MEDIA_PREFIX}${new Date().getFullYear()}/${randomUUID()}.${check.ext}`;
    const signed = await createSignedUpload(key);
    return NextResponse.json({
      success: true,
      key,
      kind: check.kind,
      signedUrl: signed.signedUrl,
      apikey: publicApiKey(),
      publicUrl: publicMediaUrl(key),
    });
  } catch (error) {
    console.error('[admin-media-upload] Error:', error);
    return NextResponse.json({ error: 'Gagal menyiapkan unggahan' }, { status: 500 });
  }
}
