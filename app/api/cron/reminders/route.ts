import { NextRequest, NextResponse } from 'next/server';
import { runReminders } from '@/lib/reminders';
import { baseUrl } from '@/lib/config';

/**
 * Dijalankan terjadwal (lihat vercel.json). Vercel otomatis mengirim "Authorization: Bearer <CRON_SECRET>".
 * Manual:  curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'CRON_SECRET belum diisi.' }, { status: 503 });
  }
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 401 });
  }
  const result = await runReminders(baseUrl(req));
  return NextResponse.json({ success: true, ...result });
}
