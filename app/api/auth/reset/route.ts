import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateAccountPassword } from '@/lib/account-store';
import { dbGet, dbRemove } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/json-store';
import type { ResetToken } from '@/lib/auth-types';

export async function POST(req: NextRequest) {
  if (!rateLimit(`reset:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (password.length < 6) {
    return NextResponse.json({ error: 'Kata sandi minimal 6 karakter' }, { status: 400 });
  }

  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const match = token ? await dbGet<ResetToken>('reset-tokens', hash) : undefined;
  if (!match || match.expires <= Date.now()) {
    return NextResponse.json({ error: 'Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru.' }, { status: 400 });
  }

  if (!(await updateAccountPassword(match.email, password))) {
    return NextResponse.json({ error: 'Akun tidak ditemukan.' }, { status: 404 });
  }
  await dbRemove('reset-tokens', hash);
  return NextResponse.json({ success: true, message: 'Kata sandi berhasil diubah. Silakan masuk.' });
}
