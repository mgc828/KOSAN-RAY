import { NextRequest, NextResponse } from 'next/server';
import { getKostBySlug } from '@/lib/data-store';
import { sanitizeKostForPublic, formatKostForSubscriber } from '@/lib/security';
import { getSessionUser, getSubscription } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kost = await getKostBySlug(slug);

  if (!kost) {
    return NextResponse.json({ error: 'Kost tidak ditemukan' }, { status: 404 });
  }

  // Langganan diperiksa dari sesi login + data server, bukan dari header yang dikirim browser.
  const me = await getSessionUser(req);
  const isSubscriber = me ? (await getSubscription(me.id)).active : false;

  if (isSubscriber) {
    return NextResponse.json(formatKostForSubscriber(kost));
  }

  // Publik / belum berlangganan / mesin pencari: versi preview yang aman (tanpa media premium & nomor WhatsApp).
  return NextResponse.json(sanitizeKostForPublic(kost));
}
