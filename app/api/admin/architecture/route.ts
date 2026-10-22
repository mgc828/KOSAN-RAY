import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAdminSessionFromReq } from '@/lib/admin-session';
import { runGenerator } from '@/scripts/generate-architecture.mjs';

const rootDir = process.cwd();
const ARTIFACTS_DIR = path.join(rootDir, 'app', 'admin', 'arsitektur', 'artifacts');

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
      const htmlPath = path.join(ARTIFACTS_DIR, 'system-architecture.html');
      if (!fs.existsSync(htmlPath)) {
        return new NextResponse('<html><body>Diagram arsitektur belum dikompilasi. Silakan refresh atau tekan tombol perbarui.</body></html>', {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      const html = fs.readFileSync(htmlPath, 'utf-8');
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Frame-Options': 'SAMEORIGIN',
        }
      });
    }

    if (view === 'userflow') {
      const htmlPath = path.join(ARTIFACTS_DIR, 'user-flow.html');
      if (!fs.existsSync(htmlPath)) {
        return new NextResponse('<html><body>Diagram alur pengguna belum dikompilasi. Silakan refresh atau tekan tombol perbarui.</body></html>', {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      const html = fs.readFileSync(htmlPath, 'utf-8');
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Frame-Options': 'SAMEORIGIN',
        }
      });
    }

    // Default: Return metadata JSON
    const metaPath = path.join(ARTIFACTS_DIR, 'metadata.json');
    if (!fs.existsSync(metaPath)) {
      return NextResponse.json({
        lastGenerated: null,
        status: 'pending',
        artifacts: { architecture: 'missing', userFlow: 'missing' }
      });
    }

    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    return NextResponse.json({ success: true, ...metadata });
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
    const updatedMeta = runGenerator();
    return NextResponse.json({
      success: true,
      message: 'Diagram arsitektur dan alur sistem berhasil diperbarui.',
      metadata: updatedMeta
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memperbarui diagram arsitektur.' }, { status: 500 });
  }
}
