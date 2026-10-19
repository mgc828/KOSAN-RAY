import { NextRequest, NextResponse } from 'next/server';
import { dbPut } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/json-store';

/** Menerima laporan error dari browser (lihat components/ErrorReporter.tsx). */
export async function POST(req: NextRequest) {
  if (!rateLimit(`err:${clientIp(req)}`, 20, 60 * 1000)) return new NextResponse(null, { status: 204 });

  const b = await req.json().catch(() => null);
  if (!b || typeof b.message !== 'string') return new NextResponse(null, { status: 204 });

  await dbPut('error-logs', {
    id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    source: 'client',
    message: b.message.slice(0, 500),
    stack: typeof b.stack === 'string' ? b.stack.slice(0, 2000) : undefined,
    url: typeof b.url === 'string' ? b.url.slice(0, 300) : undefined,
    userAgent: req.headers.get('user-agent')?.slice(0, 200),
    created_at: new Date().toISOString(),
  }).catch(() => undefined);

  return new NextResponse(null, { status: 204 });
}
