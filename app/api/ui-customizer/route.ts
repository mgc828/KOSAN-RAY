import { NextRequest, NextResponse } from 'next/server';
import {
  getCustomizationsForPage,
  getAllCustomizations,
  savePageCustomization,
  resetPageCustomization,
  UICustomizationItem,
} from '@/lib/ui-customizer-store';
import { getAdminSessionFromReq } from '@/lib/admin-session';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pagePath = searchParams.get('pagePath');

    if (pagePath !== null) {
      const items = await getCustomizationsForPage(pagePath);
      return NextResponse.json({ success: true, pagePath, items });
    }

    const allDocs = await getAllCustomizations();
    return NextResponse.json({ success: true, data: allDocs });
  } catch (error: any) {
    console.error('Error fetching UI customizations:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat kustomisasi tampilan' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Mengubah tampilan seluruh situs: hanya admin yang sudah login
  if (!getAdminSessionFromReq(req)) {
    return NextResponse.json({ success: false, error: 'Tidak diizinkan. Silakan login sebagai admin.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { pagePath, items } = body as {
      pagePath: string;
      items: UICustomizationItem[];
    };

    if (!pagePath || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Parameter pagePath dan items wajib diisi' },
        { status: 400 }
      );
    }

    const savedDoc = await savePageCustomization(pagePath, items);

    return NextResponse.json({
      success: true,
      message: 'Kustomisasi tampilan berhasil disimpan',
      data: savedDoc,
    });
  } catch (error: any) {
    console.error('Error saving UI customizations:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan kustomisasi tampilan' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) {
    return NextResponse.json({ success: false, error: 'Tidak diizinkan. Silakan login sebagai admin.' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const pagePath = searchParams.get('pagePath');

    if (!pagePath) {
      return NextResponse.json(
        { success: false, error: 'Parameter pagePath wajib diisi' },
        { status: 400 }
      );
    }

    const ok = await resetPageCustomization(pagePath);
    return NextResponse.json({
      success: ok,
      message: ok
        ? `Kustomisasi untuk halaman ${pagePath} berhasil di-reset`
        : 'Gagal mereset kustomisasi',
    });
  } catch (error: any) {
    console.error('Error deleting UI customizations:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mereset kustomisasi' },
      { status: 500 }
    );
  }
}

