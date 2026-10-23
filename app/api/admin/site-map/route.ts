import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromReq } from '@/lib/admin-session';
import { getSite, listSites, removeSite, setAuto, summarize } from '@/lib/site-map-store';

export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ error: 'Tidak diizinkan. Silakan login sebagai admin.' }, { status: 401 });

/** Tanpa ?id: daftar situs yang tersimpan. Dengan ?id: hasil pindai terbaru + riwayat. */
export async function GET(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return unauthorized();
  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    const sites = (await listSites()).map(summarize).sort((a, b) => b.scannedAt.localeCompare(a.scannedAt));
    return NextResponse.json({ sites });
  }
  const doc = await getSite(id);
  if (!doc) return NextResponse.json({ error: 'Situs tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ scan: doc.latest, history: doc.history, auto: doc.auto, site: summarize(doc) });
}

/** Ubah pemantauan otomatis: { id, auto }. */
export async function PATCH(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return unauthorized();
  const body = await req.json().catch(() => null);
  if (typeof body?.id !== 'string' || typeof body?.auto !== 'boolean') return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
  const doc = await setAuto(body.id, body.auto);
  if (!doc) return NextResponse.json({ error: 'Situs tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true, auto: doc.auto });
}

export async function DELETE(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) return unauthorized();
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id wajib diisi.' }, { status: 400 });
  return NextResponse.json({ success: await removeSite(id) });
}
