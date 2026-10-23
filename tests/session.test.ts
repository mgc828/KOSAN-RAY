import { describe, it, expect, vi, afterEach } from 'vitest';
import crypto from 'crypto';
import {
  createSessionToken,
  renewSessionToken,
  verifySessionToken,
  sessionCookie,
  SESSION_IDLE_SEC,
  SESSION_ABSOLUTE_SEC,
} from '@/lib/session';

const user = { id: 'usr-1', email: 'a@b.com', fullName: 'Aa Bb' };

function signed(payload: Record<string, unknown>) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', process.env.SESSION_SECRET as string).update(body).digest('base64url');
  return `${body}.${sig}`;
}

afterEach(() => vi.useRealTimers());

describe('sesi: batas tidak aktif 15 menit + batas mutlak', () => {
  it('token baru berumur 15 menit dengan batas mutlak 12 jam', () => {
    const s = verifySessionToken(createSessionToken(user))!;
    const now = Math.floor(Date.now() / 1000);
    expect(s.exp - now).toBeLessThanOrEqual(SESSION_IDLE_SEC);
    expect(s.exp - now).toBeGreaterThan(SESSION_IDLE_SEC - 5);
    expect(s.abs - now).toBeLessThanOrEqual(SESSION_ABSOLUTE_SEC);
  });

  it('tidak aktif lebih dari 15 menit -> sesi ditolak', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
    const token = createSessionToken(user);
    vi.setSystemTime(new Date('2026-01-01T10:14:00Z'));
    expect(verifySessionToken(token)).not.toBeNull();
    vi.setSystemTime(new Date('2026-01-01T10:16:00Z'));
    expect(verifySessionToken(token)).toBeNull();
  });

  it('aktivitas memperpanjang sesi, tetapi batas mutlak tidak bergeser', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
    let token = createSessionToken(user);
    const abs = verifySessionToken(token)!.abs;

    // aktif terus tiap 10 menit selama 11 jam: sesi tetap sah
    for (let i = 1; i <= 66; i++) {
      vi.setSystemTime(new Date(Date.parse('2026-01-01T10:00:00Z') + i * 10 * 60 * 1000));
      const s = verifySessionToken(token);
      expect(s).not.toBeNull();
      token = renewSessionToken(s!);
    }
    expect(verifySessionToken(token)!.abs).toBe(abs);

    // melewati 12 jam sejak login: ditolak walau terus diperpanjang
    vi.setSystemTime(new Date(Date.parse('2026-01-01T10:00:00Z') + 12 * 3600 * 1000 + 5000));
    expect(verifySessionToken(token)).toBeNull();
  });

  it('perpanjangan tidak pernah melampaui batas mutlak', () => {
    const now = Math.floor(Date.now() / 1000);
    const near = verifySessionToken(signed({ uid: 'u', email: 'e', exp: now + 600, abs: now + 120 }))!;
    const renewed = verifySessionToken(renewSessionToken(near))!;
    expect(renewed.exp).toBeLessThanOrEqual(near.abs);
  });

  it('token lama tanpa batas mutlak ditolak (wajib masuk ulang)', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(verifySessionToken(signed({ uid: 'u', email: 'e', exp: now + 30 * 24 * 3600 }))).toBeNull();
  });

  it('cookie sesi tanpa Max-Age/Expires (hilang saat browser ditutup)', () => {
    const req = new Request('https://kosan.test/api/auth', { headers: { 'x-forwarded-proto': 'https' } });
    const c = sessionCookie(req, 'abc');
    expect(c).toContain('HttpOnly');
    expect(c).toContain('SameSite=Lax');
    expect(c).toContain('Secure');
    expect(c).not.toMatch(/Max-Age|Expires/i);
  });
});
