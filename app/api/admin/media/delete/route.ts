import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromReq } from '@/lib/admin-session';
import { removeMedia, storageConfigured } from '@/lib/media-storage';

/** Menghapus berkas hasil unggahan (hanya kunci berawalan uploads/). */
export async function POST(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) {
    return NextResponse.json({ error: 'Tidak diizinkan. Silakan login sebagai admin.' }, { status: 401 });
  }
  if (!storageConfigured()) return NextResponse.json({ success: true, removed: 0 });

  try {
    const body = await req.json();
    const keys: string[] = Array.isArray(body?.keys) ? body.keys.filter((k: unknown) => typeof k === 'string').slice(0, 100) : [];
    const removed = await removeMedia(keys);
    return NextResponse.json({ success: true, removed });
  } catch (error) {
    console.error('[admin-media-delete] Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus berkas' }, { status: 500 });
  }
}
