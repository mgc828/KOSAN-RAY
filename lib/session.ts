import crypto from 'crypto';

/**
 * Sesi login lewat cookie bertanda tangan (HMAC-SHA256).
 * Isi cookie: { uid, email, name, exp }. Cookie bersifat HttpOnly sehingga tidak bisa dibaca skrip di browser.
 */

export const SESSION_COOKIE = 'kk_session';

/** Sesi berakhir bila pengguna tidak aktif selama ini (diperpanjang tiap ada aktivitas). */
export const SESSION_IDLE_SEC = 15 * 60;
/** Batas mutlak sejak login: sesi tidak bisa diperpanjang terus-menerus lebih lama dari ini. */
export const SESSION_ABSOLUTE_SEC = 12 * 3600;

export interface Session {
  uid: string;
  email: string;
  name?: string;
  exp: number; // batas tidak-aktif (detik sejak epoch), bergeser tiap aktivitas
  abs: number; // batas mutlak sejak login (detik sejak epoch), tidak pernah bergeser
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

function signPayload(payload: Session): string {
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function createSessionToken(user: { id: string; email: string; fullName?: string }): string {
  const now = Math.floor(Date.now() / 1000);
  const abs = now + SESSION_ABSOLUTE_SEC;
  return signPayload({ uid: user.id, email: user.email, name: user.fullName, exp: Math.min(now + SESSION_IDLE_SEC, abs), abs });
}

/** Perpanjang batas tidak-aktif sebuah sesi yang masih sah (batas mutlak tetap). */
export function renewSessionToken(session: Session): string {
  const now = Math.floor(Date.now() / 1000);
  return signPayload({ ...session, exp: Math.min(now + SESSION_IDLE_SEC, session.abs) });
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
    // Token lama (tanpa batas mutlak) tidak lagi diterima: pengguna cukup masuk ulang sekali.
    if (!payload.uid || !payload.exp || !payload.abs) return null;
    if (payload.exp * 1000 < Date.now() || payload.abs * 1000 < Date.now()) return null;
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

/** Cookie sesi (tanpa Max-Age/Expires): otomatis hilang saat browser ditutup. */
export function sessionCookie(req: Request, token: string): string {
  return [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
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
