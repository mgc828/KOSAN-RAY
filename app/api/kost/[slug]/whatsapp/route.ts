import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_KOSTS } from '@/lib/mock-data';

// Simpan in-memory access log untuk monitoring MVP
const accessLogs: Array<{
  id: string;
  user_id: string;
  kost_id: string;
  action: string;
  created_at: string;
}> = [];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || req.headers.get('x-user-id');
    const subscriberStatus = body.subscriberStatus || req.headers.get('x-subscriber-status');

    const kost = INITIAL_KOSTS.find(k => k.slug === slug);

    if (!kost) {
      return NextResponse.json(
        { error: 'Kost tidak ditemukan' },
        { status: 404 }
      );
    }

    // SERVER-SIDE CHECK: Hanya user dengan status aktif yang diizinkan
    if (subscriberStatus !== 'active' || !userId) {
      return NextResponse.json(
        { 
          error: 'Akses ditolak. Anda harus memiliki langganan aktif (Rp10.000 / 30 Hari) untuk melihat nomor WhatsApp pemilik.',
          isLocked: true,
        },
        { status: 403 }
      );
    }

    // Catat access_log untuk monitoring (tanpa membatasi kuota harian)
    accessLogs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user_id: userId,
      kost_id: kost.id,
      action: 'view_whatsapp',
      created_at: new Date().toISOString(),
    });

    // Format link WhatsApp langsung
    const cleanNumber = kost.owner_whatsapp?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(
      `Halo pemilik ${kost.nama}, saya menemukan kost Anda melalui KostHunt Surabaya dan berminat untuk survey kamar.`
    );
    const waUrl = `https://wa.me/${cleanNumber}?text=${message}`;

    return NextResponse.json({
      success: true,
      whatsapp: kost.owner_whatsapp,
      whatsapp_url: waUrl,
      owner_name: `Pengelola ${kost.nama}`,
    });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat memproses nomor WhatsApp' },
      { status: 500 }
    );
  }
}
