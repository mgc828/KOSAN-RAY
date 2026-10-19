import { NextRequest, NextResponse } from 'next/server';
import { getAllKosts, addKost } from '@/lib/data-store';
import { Kost } from '@/lib/types';

export async function GET() {
  try {
    const kosts = await getAllKosts();
    return NextResponse.json(kosts);
  } catch (error) {
    console.error('Error fetching kosts:', error);
    return NextResponse.json({ error: 'Gagal mengambil data kost' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

