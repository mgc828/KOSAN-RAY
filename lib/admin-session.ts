import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { AdminAccount, AdminRole } from './admin-types';

export const ADMIN_SESSION_COOKIE = 'kk_admin_session';

export interface AdminSession {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  exp: number; // seconds since epoch
}

function secret(): string {
  const s = process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 16) return s;
  return 'dev-admin-secret-kost-kostan-secure-2026';
}

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');

function sign(data: string): string {
  return crypto.createHmac('sha256', secret()).update(data).digest('base64url');
}

export function createAdminSessionToken(admin: { id: string; email: string; fullName: string; role?: AdminRole }, rememberMe = false): string {
  const maxAge = rememberMe ? 30 * 24 * 3600 : 24 * 3600; // 30 days vs 1 day
  const payload: AdminSession = {
    uid: admin.id,
    email: admin.email,
    name: admin.fullName,
    role: admin.role || 'superadmin',
    exp: Math.floor(Date.now() / 1000) + maxAge,
  };
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): AdminSession | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as AdminSession;
    if (!payload.uid || !payload.exp || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAdminSessionFromReq(req: NextRequest): AdminSession | null {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export function adminSessionCookie(req: NextRequest, token: string, rememberMe = false): string {
  const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
  const maxAge = rememberMe ? 30 * 24 * 3600 : 24 * 3600;
  const parts = [
    `${ADMIN_SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (isHttps) parts.push('Secure');
  return parts.join('; ');
}

export function clearedAdminSessionCookie(req: NextRequest): string {
  const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
  const parts = [
    `${ADMIN_SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ];
  if (isHttps) parts.push('Secure');
  return parts.join('; ');
}

