import { NextRequest, NextResponse } from 'next/server';
import { findAccountByEmail, findOrCreateOAuthAccount } from '@/lib/account-store';
import { saveUser } from '@/lib/payment-store';
import { createSessionToken, sessionCookie } from '@/lib/session';

interface TokenInfo {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  exp?: string;
}

export async function POST(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.json({ error: 'Login Google belum dikonfigurasi di server.' }, { status: 501 });
  }

  const body = await req.json().catch(() => null);
  const credential = typeof body?.credential === 'string' ? body.credential : '';
  if (!credential) return NextResponse.json({ error: 'Kredensial Google tidak ada.' }, { status: 400 });

  // Verifikasi ID token lewat endpoint resmi Google.
  let info: TokenInfo;
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!res.ok) throw new Error('invalid');
    info = (await res.json()) as TokenInfo;
  } catch {
    return NextResponse.json({ error: 'Token Google tidak valid.' }, { status: 401 });
  }

  const verified = info.email_verified === true || info.email_verified === 'true';
  if (info.aud !== clientId || !info.email || !verified || (info.exp && Number(info.exp) * 1000 < Date.now())) {
    return NextResponse.json({ error: 'Token Google tidak valid.' }, { status: 401 });
  }

  const isNew = !(await findAccountByEmail(info.email));
  const account = await findOrCreateOAuthAccount(info.email, info.name);
  if (isNew) {
    await saveUser({
      id: account.id,
      email: account.email,
      fullName: account.fullName,
      subscription_status: 'none',
      expires_at: null,
      days_remaining: 0,
      total_paid: 0,
      created_at: account.created_at,
    });
  }

  const res = NextResponse.json({
    success: true,
    message: 'Login berhasil!',
    user: { id: account.id, email: account.email, fullName: account.fullName },
  });
  res.headers.append('Set-Cookie', sessionCookie(req, createSessionToken(account)));
  return res;
}
