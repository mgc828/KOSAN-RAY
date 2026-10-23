import { NextRequest, NextResponse } from 'next/server';
import { addKost } from '@/lib/data-store';
import { getPublicKosts } from '@/lib/public-kosts';
import { getAdminSessionFromReq } from '@/lib/admin-session';
import { Kost } from '@/lib/types';

/** Daftar kost PUBLIK: tanpa nomor WhatsApp, tanpa media terkunci, tanpa draft. */
export async function GET() {
  try {
    const kosts = await getPublicKosts();
    return NextResponse.json(kosts);
  } catch (error) {
    console.error('Error fetching kosts:', error);
    return NextResponse.json({ error: 'Gagal mengambil data kost' }, { status: 500 });
  }
}

/** Menambah kost lewat API: hanya admin yang sudah login. */
export async function POST(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) {
    return NextResponse.json({ error: 'Tidak diizinkan. Silakan login sebagai admin.' }, { status: 401 });
  }
  try {
    const body: Kost = await req.json();

    if (!body.nama || !body.area) {
      return NextResponse.json({ error: 'Nama dan area kost wajib diisi' }, { status: 400 });
    }

    const saved = await addKost(body);
    return NextResponse.json({ success: true, kost: saved }, { status: 201 });
  } catch (error) {
    console.error('Error creating kost:', error);
    return NextResponse.json({ error: 'Gagal menambahkan kost' }, { status: 500 });
  }
}

