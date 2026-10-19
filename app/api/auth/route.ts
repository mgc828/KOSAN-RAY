import { NextRequest, NextResponse } from 'next/server';
import { createAccount, verifyAccountPassword } from '@/lib/account-store';
import { saveUser } from '@/lib/payment-store';
import { createSessionToken, sessionCookie, clearedSessionCookie } from '@/lib/session';
import { rateLimit, clientIp } from '@/lib/json-store';

function withSession(req: NextRequest, body: Record<string, unknown>, user: { id: string; email: string; fullName?: string }) {
  const res = NextResponse.json({ ...body, user: { id: user.id, email: user.email, fullName: user.fullName } });
  res.headers.append('Set-Cookie', sessionCookie(req, createSessionToken(user)));
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, fullName } = body;

    if (action === 'logout') {
      const res = NextResponse.json({ success: true });
      res.headers.append('Set-Cookie', clearedSessionCookie(req));
      return res;
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan kata sandi wajib diisi' }, { status: 400 });
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Kata sandi minimal 6 karakter' }, { status: 400 });
    }

    if (action === 'register') {
      if (!rateLimit(`register:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
        return NextResponse.json({ error: 'Terlalu banyak pendaftaran. Coba lagi nanti.' }, { status: 429 });
      }
      const res = await createAccount(email, password, fullName);
      if (!res.success || !res.account) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      await saveUser({
        id: res.account.id,
        email: res.account.email,
        fullName: res.account.fullName,
        subscription_status: 'none',
        expires_at: null,
        days_remaining: 0,
        total_paid: 0,
        created_at: res.account.created_at,
      });

      return withSession(req, { success: true, message: 'Registrasi berhasil!' }, res.account);
    }

    if (action === 'login') {
      // Batasi percobaan salah supaya kata sandi tidak bisa ditebak berulang-ulang.
      if (!rateLimit(`login:${clientIp(req)}:${email.toLowerCase()}`, 8, 15 * 60 * 1000)) {
        return NextResponse.json({ error: 'Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.' }, { status: 429 });
      }
      const res = await verifyAccountPassword(email, password);
      if (!res.success || !res.account) {
        return NextResponse.json({ error: res.error }, { status: 401 });
      }
      return withSession(req, { success: true, message: 'Login berhasil!' }, res.account);
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Error in auth API:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
