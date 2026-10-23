import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromReq } from '@/lib/admin-session';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) {
    return NextResponse.json({ success: false, error: 'Tidak diizinkan.' }, { status: 401 });
  }
  try {
    const data = await req.json();
    const logPath = path.join(process.cwd(), '.element-inspect.json');
    
    fs.writeFileSync(logPath, JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    }, null, 2));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!getAdminSessionFromReq(req)) {
    return NextResponse.json({ empty: true }, { status: 401 });
  }
  try {
    const logPath = path.join(process.cwd(), '.element-inspect.json');
    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ empty: true });
    }
    const content = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    return NextResponse.json(content);
  } catch (err: any) {
    return NextResponse.json({ empty: true, error: err.message });
  }
}

