import { NextRequest, NextResponse } from 'next/server';
import { getKostBySlug } from '@/lib/data-store';
import { dbPut } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/json-store';

const REASONS = ['tidak_sesuai_foto', 'kost_tidak_ada', 'harga_berbeda', 'nomor_tidak_aktif', 'lainnya'] as const;

interface KostReport {
  id: string;
  slug: string;
  kost_nama: string;
  reason: (typeof REASONS)[number];
  detail: string;
  contact?: string;
  status: 'baru' | 'diproses' | 'selesai';
  created_at: string;
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`report:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Terlalu banyak laporan. Coba lagi nanti.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === 'string' ? body.slug : '';
  const reason = body?.reason;
  const detail = typeof body?.detail === 'string' ? body.detail.trim().slice(0, 1000) : '';
  const contact = typeof body?.contact === 'string' ? body.contact.trim().slice(0, 120) : '';

  const kost = await getKostBySlug(slug);
  if (!kost) return NextResponse.json({ error: 'Kost tidak ditemukan.' }, { status: 404 });
  if (!REASONS.includes(reason)) return NextResponse.json({ error: 'Pilih alasan laporan.' }, { status: 400 });
  if (reason === 'lainnya' && detail.length < 10) {
    return NextResponse.json({ error: 'Jelaskan masalahnya minimal 10 karakter.' }, { status: 400 });
  }

  const report: KostReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    slug,
    kost_nama: kost.nama,
    reason,
    detail,
    contact: contact || undefined,
    status: 'baru',
    created_at: new Date().toISOString(),
  };
  try {
    await dbPut('reports', report);
  } catch {
    return NextResponse.json({ error: 'Laporan gagal disimpan. Coba lagi.' }, { status: 500 });
  }
  return NextResponse.json({ success: true, id: report.id });
}
