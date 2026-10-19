import crypto from 'crypto';

/**
 * Sesi login lewat cookie bertanda tangan (HMAC-SHA256).
 * Isi cookie: { uid, email, name, exp }. Cookie bersifat HttpOnly sehingga tidak bisa dibaca skrip di browser.
 */

export const SESSION_COOKIE = 'kk_session';
const MAX_AGE_SEC = 30 * 24 * 3600;

export interface Session {
  uid: string;
  email: string;
  name?: string;
  exp: number; // detik sejak epoch
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET wajib diisi (minimal 16 karakter) di lingkungan produksi.');
  }
  return 'dev-only-secret-ganti-di-produksi-0123456789';
}

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');

function sign(data: string): string {
  return crypto.createHmac('sha256', secret()).update(data).digest('base64url');
}

export function createSessionToken(user: { id: string; email: string; fullName?: string }): string {
  const payload: Session = {
    uid: user.id,
    email: user.email,
    name: user.fullName,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): Session | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as Session;
    if (!payload.uid || !payload.exp || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function readSession(req: Request): Session | null {
  return verifySessionToken(parseCookies(req.headers.get('cookie'))[SESSION_COOKIE]);
}

function isHttps(req: Request): boolean {
  const proto = req.headers.get('x-forwarded-proto');
  if (proto) return proto.split(',')[0].trim() === 'https';
  return new URL(req.url).protocol === 'https:';
}

export function sessionCookie(req: Request, token: string): string {
  return [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${MAX_AGE_SEC}`,
    isHttps(req) ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function clearedSessionCookie(req: Request): string {
  return [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0', isHttps(req) ? 'Secure' : '']
    .filter(Boolean)
    .join('; ');
}
