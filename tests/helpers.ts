import fs from 'fs';
import os from 'os';
import path from 'path';
import { vi } from 'vitest';

/**
 * Siapkan lingkungan bersih untuk satu tes: folder kerja sementara (jadi data/ terpisah),
 * tanpa Supabase / Midtrans / Resend, dan modul dimuat ulang.
 */
export function freshEnv(extra: Record<string, string | undefined> = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kk-test-'));
  process.chdir(dir);
  for (const k of ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'MIDTRANS_SERVER_KEY', 'RESEND_API_KEY', 'EMAIL_FROM', 'VERCEL', 'ALLOW_PAYMENT_SIMULATION']) {
    delete process.env[k];
  }
  (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
  process.env.SESSION_SECRET = 'test-secret-0123456789abcdef';
  for (const [k, v] of Object.entries(extra)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  vi.resetModules();
  return dir;
}

export function jsonReq(url: string, body?: unknown, init: RequestInit = {}) {
  return new Request(`http://localhost${url}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...init,
  });
}

/** Ambil nilai cookie sesi dari header Set-Cookie sebuah Response. */
export function sessionCookieFrom(res: Response): string {
  const raw = res.headers.get('set-cookie') ?? '';
  const m = raw.match(/kk_session=[^;]+/);
  return m ? m[0] : '';
}
