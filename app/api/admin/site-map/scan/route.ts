import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromReq } from '@/lib/admin-session';
import { baseUrl } from '@/lib/config';
import { rateLimit } from '@/lib/json-store';
import { runScan } from '@/lib/site-scan-runner';
import { summarize } from '@/lib/site-map-store';

// Pemindaian bisa memakan waktu puluhan detik
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ error: 'Tidak diizinkan. Silakan login sebagai admin.' }, { status: 401 });

/** Pindai sebuah situs dan simpan struktur + selisihnya dari pindai sebelumnya. */
export async function POST(req: NextRequest) {
  const session = getAdminSessionFromReq(req);
  if (!session) return unauthorized();
  // Mencegah penekanan tombol beruntun yang membebani server / situs target
  if (!rateLimit(`sitemap-scan:${session.uid}`, 12, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Terlalu sering memindai. Tunggu beberapa menit.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const url = typeof body?.url === 'string' ? body.url.trim() : '';
  if (!url || url.length > 300) return NextResponse.json({ error: 'Alamat situs wajib diisi.' }, { status: 400 });

  const trustOrigin = baseUrl(req).toLowerCase();
  try {
    const { scan, diff, first, doc } = await runScan(
      url,
      { maxPages: Number(body?.maxPages) || 30, maxDepth: Number(body?.maxDepth) || 3 },
      { trustOrigin, cookie: req.headers.get('cookie') || undefined }
    );
    return NextResponse.json({ success: true, scan, diff, first, auto: doc.auto, history: doc.history, site: summarize(doc) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Pemindaian gagal';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
