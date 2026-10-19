import { NextRequest, NextResponse } from 'next/server';
import { generateR2SignedUrl } from '@/lib/security';
import { getSessionUser, getSubscription } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storageKey } = body;

    if (!storageKey || typeof storageKey !== 'string') {
      return NextResponse.json({ error: 'storageKey wajib diisi' }, { status: 400 });
    }

    // Pemeriksaan di server: harus masuk dan berlangganan aktif.
    const me = await getSessionUser(req);
    const active = me ? (await getSubscription(me.id)).active : false;
    if (!me || !active) {
      return NextResponse.json(
        { error: 'Akses ditolak. Media premium hanya dapat diakses oleh akun dengan langganan aktif.', isLocked: true },
        { status: 403 }
      );
    }

    // Signed URL berumur 10 menit (600 detik)
    const signedUrl = generateR2SignedUrl(storageKey, 600);
    return NextResponse.json({ success: true, storageKey, signedUrl, expiresInSeconds: 600 });
  } catch {
    return NextResponse.json({ error: 'Gagal membuat signed URL' }, { status: 500 });
  }
}
