import { NextRequest, NextResponse } from 'next/server';
import { updateKost, deleteKost, getKostById } from '@/lib/data-store';
import { Kost } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const kost = await getKostById(id);
  if (!kost) {
    return NextResponse.json({ error: 'Kost tidak ditemukan' }, { status: 404 });
  }
  return NextResponse.json(kost);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Partial<Kost> = await req.json();

    const updated = await updateKost(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Kost tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, kost: updated });
  } catch (error) {
    console.error('Error updating kost:', error);
    return NextResponse.json({ error: 'Gagal memperbarui kost' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteKost(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Kost tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting kost:', error);
    return NextResponse.json({ error: 'Gagal menghapus kost' }, { status: 500 });
  }
}

