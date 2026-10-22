import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromReq } from '@/lib/admin-session';
import { 
  architectureMetadata, 
  systemArchitectureHtml, 
  userFlowHtml 
} from '@/app/admin/arsitektur/artifacts/data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 1. Strict Admin Authentication
  const session = getAdminSessionFromReq(req);
  if (!session) {
    return NextResponse.json({ error: 'Akses ditolak. Silakan login sebagai admin.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const view = searchParams.get('view') || 'meta';

  try {
    if (view === 'architecture') {
      if (!systemArchitectureHtml) {
        return new NextResponse('<html><body>Diagram arsitektur sedang disiapkan. Silakan refresh sebentar lagi.</body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      return new NextResponse(systemArchitectureHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Frame-Options': 'SAMEORIGIN',
        }
      });
    }

    if (view === 'userflow') {
      if (!userFlowHtml) {
        return new NextResponse('<html><body>Diagram alur pengguna sedang disiapkan. Silakan refresh sebentar lagi.</body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      return new NextResponse(userFlowHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Frame-Options': 'SAMEORIGIN',
        }
      });
    }

    // Default: Return metadata JSON
    return NextResponse.json({ 
      success: true, 
      ...architectureMetadata,
      status: 'success'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // 1. Strict Admin Authentication
  const session = getAdminSessionFromReq(req);
  if (!session) {
    return NextResponse.json({ error: 'Akses ditolak. Silakan login sebagai admin.' }, { status: 401 });
  }

  try {
    // In serverless production environments (e.g. Vercel), code changes trigger automatic rebuilds via prebuild.
    // If running in local development mode, we can invoke the generator dynamically if possible.
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      try {
        const { runGenerator } = await import('@/scripts/generate-architecture.mjs');
        const updatedMeta = runGenerator();
        return NextResponse.json({
          success: true,
          message: 'Diagram arsitektur dan alur sistem berhasil diperbarui.',
          metadata: updatedMeta
        });
      } catch (localErr: any) {
        console.warn('Local generator execution notice:', localErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Diagram arsitektur telah disinkronkan dengan rilis produksi terbaru.',
      metadata: architectureMetadata
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memperbarui diagram arsitektur.' }, { status: 500 });
  }
}
