import { NextRequest, NextResponse } from 'next/server';
import { generateR2SignedUrl } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storageKey, subscriberStatus, userId, kostId } = body;

    if (!storageKey) {
      return NextResponse.json({ error: 'storageKey wajib diisi' }, { status: 400 });
    }

    // SERVER-SIDE SECURITY CHECK
    if (subscriberStatus !== 'active' || !userId) {
      return NextResponse.json(
        { 
          error: 'Akses ditolak. Media premium hanya dapat diakses oleh akun dengan langganan aktif.',
          isLocked: true 
        },
        { status: 403 }
      );
    }

    // Buat signed URL berumur 10 menit (600 detik)
    const signedUrl = generateR2SignedUrl(storageKey, 600);

    return NextResponse.json({
      success: true,
      storageKey,
      signedUrl,
      expiresInSeconds: 600,
    });
  } catch {
    return NextResponse.json({ error: 'Gagal membuat signed URL' }, { status: 500 });
  }
}
