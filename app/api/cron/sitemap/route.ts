import { NextRequest, NextResponse } from 'next/server';
import { dbPut } from '@/lib/db';
import { baseUrl } from '@/lib/config';
import { runScan } from '@/lib/site-scan-runner';
import { isDiffEmpty, listSites } from '@/lib/site-map-store';
import type { AdminNotification } from '@/lib/admin-types';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Pantau struktur situs: memindai ulang situs yang diberi tanda "pantau otomatis" dan memberi tahu admin bila ada
 * halaman baru / hilang / berubah. Dijalankan terjadwal (vercel.json) dengan header Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'CRON_SECRET belum diisi.' }, { status: 503 });
  }
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 401 });
  }

  const started = Date.now();
  const trustOrigin = baseUrl(req).toLowerCase();
  const results: { origin: string; changed: boolean; added: number; removed: number; changedPages: number; error?: string }[] = [];

  for (const site of (await listSites()).filter((s) => s.auto)) {
    // Sisakan waktu agar fungsi tidak terpotong
    if (Date.now() - started > 40_000) break;
    try {
      const { diff } = await runScan(site.origin, site.latest.options, { trustOrigin }, true);
      const changed = !isDiffEmpty(diff);
      results.push({ origin: site.origin, changed, added: diff.added.length, removed: diff.removed.length, changedPages: diff.changed.length });
      if (changed) {
        const n: AdminNotification = {
          id: `ntf-site-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'system',
          title: `Struktur situs berubah: ${site.origin.replace(/^https?:\/\//, '')}`,
          message: `${diff.added.length} halaman baru, ${diff.removed.length} hilang, ${diff.changed.length} berubah.`,
          time: new Date().toISOString(),
          read: false,
          link: '/admin/peta-situs',
        };
        await dbPut<AdminNotification>('admin_notifications', n).catch(() => undefined);
      }
    } catch (e) {
      results.push({ origin: site.origin, changed: false, added: 0, removed: 0, changedPages: 0, error: e instanceof Error ? e.message : 'gagal' });
    }
  }
  return NextResponse.json({ success: true, scanned: results.length, results });
}
