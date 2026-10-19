import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { findAccountByEmail } from '@/lib/account-store';
import { dbList, dbPut, dbRemove } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/json-store';
import { sendEmail, resetPasswordEmail } from '@/lib/email';
import { baseUrl } from '@/lib/config';
import type { ResetToken } from '@/lib/auth-types';

const TTL_MS = 30 * 60 * 1000;

export async function POST(req: NextRequest) {
  if (!rateLimit(`forgot:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Masukkan alamat email yang valid.' }, { status: 400 });
  }

  // Respons selalu sama agar tidak membocorkan email mana yang terdaftar.
  const generic: Record<string, unknown> = {
    success: true,
    message: 'Jika email tersebut terdaftar, tautan untuk mengatur ulang kata sandi telah dikirim.',
  };

  if (await findAccountByEmail(email)) {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const now = Date.now();

    // Hapus token lama milik email ini (dan yang sudah kedaluwarsa), lalu simpan token baru.
    for (const t of await dbList<ResetToken>('reset-tokens')) {
      if (t.email === email || t.expires <= now) await dbRemove('reset-tokens', t.id);
    }
    await dbPut<ResetToken>('reset-tokens', { id: hash, email, expires: now + TTL_MS });

    const link = `${baseUrl(req)}/reset-sandi?token=${token}`;
    const result = await sendEmail({ to: email, ...resetPasswordEmail(link) });
    if (!result.sent) {
      // Belum ada layanan email: tautan hanya terlihat di log server dan, saat pengembangan, di respons.
      console.log(`[reset-sandi] Tautan untuk ${email}: ${link}`);
      if (process.env.NODE_ENV !== 'production') generic.devLink = link;
    }
  }

  return NextResponse.json(generic);
}
