import { describe, it, expect } from 'vitest';
import { haversine, formatDistance, nearestLandmarks, getLandmark } from '@/lib/geo';
import { summarize, maskName, validateReview } from '@/lib/reviews-shared';
import { buildSuggestions } from '@/lib/suggestions';
import { reminderStage } from '@/lib/reminders';
import { mapStatus, verifyMidtransSignature } from '@/lib/midtrans';
import { createSessionToken, verifySessionToken } from '@/lib/session';
import crypto from 'crypto';
import { INITIAL_KOSTS } from '@/lib/mock-data';

describe('geo', () => {
  it('menghitung jarak haversine dengan benar', () => {
    // Satu derajat lintang di khatulistiwa = sekitar 111,2 km
    expect(haversine(0, 0, 1, 0)).toBeGreaterThan(111000);
    expect(haversine(0, 0, 1, 0)).toBeLessThan(111500);
    expect(haversine(-6.2, 106.8, -6.2, 106.8)).toBe(0);
  });

  it('jarak dua tempat acuan di Jakarta masuk akal', () => {
    const a = getLandmark('mrt-dukuh-atas')!;
    const b = getLandmark('mrt-benhil')!;
    const d = haversine(a.lat, a.lng, b.lat, b.lng);
    expect(d).toBeGreaterThan(1500);
    expect(d).toBeLessThan(3500);
  });

  it('memformat jarak', () => {
    expect(formatDistance(640)).toBe('640 m');
    expect(formatDistance(1250)).toBe('1,3 km');
    expect(formatDistance(12400)).toBe('12 km');
  });

  it('mencari tempat acuan terdekat sesuai jenis', () => {
    const [near] = nearestLandmarks(-6.2264, 106.8584, { type: 'stasiun' });
    expect(near.landmark.id).toBe('stasiun-tebet');
    expect(near.distance).toBeLessThan(50);
  });
});

describe('ulasan', () => {
  it('menghitung rata-rata dan sebaran', () => {
    const s = summarize([{ rating: 5 }, { rating: 4 }, { rating: 4 }, { rating: 1 }]);
    expect(s.count).toBe(4);
    expect(s.avg).toBe(3.5);
    expect(s.dist).toEqual([1, 0, 0, 2, 1]);
  });

  it('tanpa ulasan -> rata-rata 0', () => {
    expect(summarize([])).toEqual({ avg: 0, count: 0, dist: [0, 0, 0, 0, 0] });
  });

  it('menyamarkan nama', () => {
    expect(maskName('Rani Susanti', 'r@x.com')).toBe('Rani S.');
    expect(maskName(undefined, 'budi.santoso@gmail.com')).toBe('Budi.santoso');
  });

  it('memvalidasi isi ulasan', () => {
    expect(validateReview({ rating: 0, body: 'cukup panjang kok' }).ok).toBe(false);
    expect(validateReview({ rating: 6, body: 'cukup panjang kok' }).ok).toBe(false);
    expect(validateReview({ rating: 4, body: 'pendek' }).ok).toBe(false);
    expect(validateReview({ rating: 4, body: 'x'.repeat(1001) }).ok).toBe(false);
    expect(validateReview({ rating: 4, body: '  kamar bersih dan aman  ' })).toEqual({ ok: true, rating: 4, body: 'kamar bersih dan aman' });
  });
});

describe('saran pencarian', () => {
  it('kurang dari 2 huruf -> kosong', () => {
    expect(buildSuggestions('a', INITIAL_KOSTS)).toEqual([]);
  });

  it('menemukan kampus, area, dan fasilitas', () => {
    const bin = buildSuggestions('binus', INITIAL_KOSTS);
    expect(bin.some((s) => s.kind === 'kampus' && s.value === 'binus-kemanggisan')).toBe(true);
    const tebet = buildSuggestions('tebet', INITIAL_KOSTS);
    expect(tebet.some((s) => s.kind === 'area' && s.value === 'Tebet')).toBe(true);
    expect(tebet.some((s) => s.kind === 'stasiun' && s.value === 'stasiun-tebet')).toBe(true);
    const wifi = buildSuggestions('wifi', INITIAL_KOSTS);
    expect(wifi.some((s) => s.kind === 'fasilitas' && s.value === 'WiFi')).toBe(true);
  });

  it('membatasi jumlah saran', () => {
    expect(buildSuggestions('kost', INITIAL_KOSTS, 5).length).toBeLessThanOrEqual(5);
  });
});

describe('pengingat langganan', () => {
  const now = new Date('2026-06-10T00:00:00Z').getTime();
  const day = 24 * 3600 * 1000;
  it('3 hari atau kurang sebelum berakhir', () => {
    expect(reminderStage(new Date(now + 2.5 * day).toISOString(), now)).toEqual({ stage: '3d', daysLeft: 3 });
    expect(reminderStage(new Date(now + 0.5 * day).toISOString(), now)?.stage).toBe('3d');
  });
  it('masih lama -> tidak ada pengingat', () => {
    expect(reminderStage(new Date(now + 10 * day).toISOString(), now)).toBeNull();
  });
  it('baru berakhir (maks. 2 hari) -> pengingat habis', () => {
    expect(reminderStage(new Date(now - 1 * day).toISOString(), now)?.stage).toBe('exp');
    expect(reminderStage(new Date(now - 5 * day).toISOString(), now)).toBeNull();
  });
  it('tanpa tanggal -> tidak ada', () => {
    expect(reminderStage(null, now)).toBeNull();
  });
});

describe('Midtrans', () => {
  it('memetakan status', () => {
    expect(mapStatus('settlement')).toBe('settlement');
    expect(mapStatus('capture', 'accept')).toBe('settlement');
    expect(mapStatus('capture', 'challenge')).toBe('pending');
    expect(mapStatus('expire')).toBe('expire');
    expect(mapStatus('whatever')).toBe('failure');
  });

  it('memverifikasi signature', () => {
    process.env.MIDTRANS_SERVER_KEY = 'SB-Mid-server-realkey123';
    const n = { order_id: 'KK-1', status_code: '200', gross_amount: '15000.00' };
    const good = crypto.createHash('sha512').update(`${n.order_id}${n.status_code}${n.gross_amount}SB-Mid-server-realkey123`).digest('hex');
    expect(verifyMidtransSignature({ ...n, signature_key: good })).toBe(true);
    expect(verifyMidtransSignature({ ...n, signature_key: 'salah' })).toBe(false);
    expect(verifyMidtransSignature({ ...n })).toBe(false);
    expect(verifyMidtransSignature({ ...n, gross_amount: '1.00', signature_key: good })).toBe(false);
  });
});

describe('sesi login', () => {
  const user = { id: 'usr-1', email: 'a@b.com', fullName: 'Aa Bb' };
  it('token valid bisa dibaca kembali', () => {
    const s = verifySessionToken(createSessionToken(user));
    expect(s?.uid).toBe('usr-1');
    expect(s?.email).toBe('a@b.com');
  });
  it('token yang diubah ditolak', () => {
    const t = createSessionToken(user);
    const [body, sig] = t.split('.');
    const forged = Buffer.from(JSON.stringify({ uid: 'usr-admin', email: 'x', exp: 9999999999 })).toString('base64url');
    expect(verifySessionToken(`${forged}.${sig}`)).toBeNull();
    expect(verifySessionToken(`${body}.${sig}x`)).toBeNull();
    expect(verifySessionToken('sampah')).toBeNull();
    expect(verifySessionToken(undefined)).toBeNull();
  });
  it('token kedaluwarsa ditolak', () => {
    const body = Buffer.from(JSON.stringify({ uid: 'u', email: 'e', exp: 1 })).toString('base64url');
    const sig = crypto.createHmac('sha256', process.env.SESSION_SECRET as string).update(body).digest('base64url');
    expect(verifySessionToken(`${body}.${sig}`)).toBeNull();
  });
});
