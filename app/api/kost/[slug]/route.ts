import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_KOSTS } from '@/lib/mock-data';
import { sanitizeKostForPublic, formatKostForSubscriber } from '@/lib/security';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const kost = INITIAL_KOSTS.find(k => k.slug === slug);

  if (!kost) {
    return NextResponse.json(
      { error: 'Kost tidak ditemukan' },
      { status: 404 }
    );
  }

  // Cek otorisasi langganan dari request header / session cookie
  // Server-side verification: kita membaca header 'x-subscriber-status' atau session token
  const subscriberHeader = req.headers.get('x-subscriber-status');
  const isSubscriber = subscriberHeader === 'active';

  if (isSubscriber) {
    // Pelanggan Aktif: Kembalikan media lengkap
    const fullKost = formatKostForSubscriber(kost);
    return NextResponse.json(fullKost);
  }

  // Publik / Belum Berlangganan / Googlebot: Kembalikan versi preview yang aman
  // Tidak ada URL media premium dan TIDAK ADA owner_whatsapp di payload
  const publicKost = sanitizeKostForPublic(kost);
  return NextResponse.json(publicKost);
}
