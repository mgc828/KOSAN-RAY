import { NextRequest, NextResponse } from 'next/server';
import { getKostBySlug } from '@/lib/data-store';
import { getSessionUser, getSubscription } from '@/lib/api-auth';
import { dbPut } from '@/lib/db';

/** Mengembalikan nomor WhatsApp pemilik hanya untuk pengguna yang sudah masuk DAN punya langganan aktif. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const kost = await getKostBySlug(slug);

    if (!kost || kost.is_draft) {
      return NextResponse.json({ error: 'Kost tidak ditemukan' }, { status: 404 });
    }

    const me = await getSessionUser(_req);
    const active = me ? (await getSubscription(me.id)).active : false;
    if (!me || !active) {
      return NextResponse.json(
        {
          error: 'Akses ditolak. Anda harus masuk dan memiliki langganan aktif untuk melihat nomor WhatsApp pemilik.',
          isLocked: true,
        },
        { status: 403 }
      );
    }

    // Catat akses untuk pemantauan (tidak membatasi kuota harian).
    await dbPut('access-logs', {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user_id: me.id,
      kost_id: kost.id,
      area: kost.area,
      action: 'view_whatsapp',
      created_at: new Date().toISOString(),
    }).catch(() => undefined);

    const cleanNumber = kost.owner_whatsapp?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(
      `Halo pemilik ${kost.nama}, saya menemukan kost Anda melalui kost-kostan dan berminat untuk survey kamar.`
    );

    return NextResponse.json({
      success: true,
      whatsapp: kost.owner_whatsapp,
      whatsapp_url: `https://wa.me/${cleanNumber}?text=${message}`,
      owner_name: `Pengelola ${kost.nama}`,
    });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server saat memproses nomor WhatsApp' }, { status: 500 });
  }
}
