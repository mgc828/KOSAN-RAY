import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { freshEnv, jsonReq, sessionCookieFrom } from './helpers';

const SERVER_KEY = 'SB-Mid-server-realkey123';

/** Daftar akun baru lewat API dan kembalikan cookie sesinya. */
async function registerUser(email: string, name = 'Tes User') {
  const { POST } = await import('@/app/api/auth/route');
  const res = await POST(new NextRequest(jsonReq('/api/auth', { action: 'register', email, password: 'rahasia123', fullName: name })));
  expect(res.status).toBe(200);
  const body = await res.json();
  return { cookie: sessionCookieFrom(res), id: body.user.id as string };
}

const authed = (url: string, cookie: string, body?: unknown, method?: string) =>
  new NextRequest(jsonReq(url, body, { headers: { cookie }, ...(method ? { method } : {}) }));

describe('lapisan data (JSON)', () => {
  beforeEach(() => void freshEnv());

  it('put / get / update / remove', async () => {
    const { dbPut, dbGet, dbList, dbUpdate, dbRemove, dbMode } = await import('@/lib/db');
    expect(dbMode()).toBe('json');
    await dbPut('uji', { id: 'a', n: 1 });
    await dbPut('uji', { id: 'b', n: 2 });
    expect((await dbList<{ id: string }>('uji')).map((d) => d.id)).toEqual(['b', 'a']); // terbaru di depan
    expect(await dbGet('uji', 'a')).toEqual({ id: 'a', n: 1 });
    await dbUpdate<{ id: string; n: number }>('uji', 'a', (d) => ({ ...d, n: 10 }));
    expect(await dbGet('uji', 'a')).toEqual({ id: 'a', n: 10 });
    expect(await dbRemove('uji', 'a')).toBe(true);
    expect(await dbRemove('uji', 'a')).toBe(false);
  });

  it('menolak nama koleksi berbahaya', async () => {
    const { dbList } = await import('@/lib/db');
    await expect(dbList('../rahasia')).rejects.toThrow();
  });

  it('tulis serentak tidak saling menimpa', async () => {
    const { dbPut, dbList } = await import('@/lib/db');
    await Promise.all(Array.from({ length: 25 }, (_, i) => dbPut('paralel', { id: `d${i}` })));
    expect((await dbList('paralel')).length).toBe(25);
  });
});

describe('login & sesi', () => {
  beforeEach(() => void freshEnv());

  it('daftar -> /api/me mengembalikan pengguna; tanpa cookie -> 401', async () => {
    const { cookie } = await registerUser('uji1@example.test', 'Uji Satu');
    expect(cookie).toContain('kk_session=');
    const { GET } = await import('@/app/api/me/route');
    const ok = await GET(authed('/api/me', cookie));
    expect(ok.status).toBe(200);
    expect((await ok.json()).user.email).toBe('uji1@example.test');
    const anon = await GET(new NextRequest(jsonReq('/api/me')));
    expect(anon.status).toBe(200);
    expect((await anon.json()).user).toBeNull();
    const forged = await GET(authed('/api/me', 'kk_session=palsu.palsu'));
    expect((await forged.json()).user).toBeNull();
    // endpoint yang butuh login tetap menolak
    const { GET: history } = await import('@/app/api/me/transactions/route');
    expect((await history(new NextRequest(jsonReq('/api/me/transactions')))).status).toBe(401);
  });

  it('login salah ditolak dan dibatasi setelah 8 kali', async () => {
    await registerUser('uji2@example.test');
    const { POST } = await import('@/app/api/auth/route');
    const bad = () => POST(new NextRequest(jsonReq('/api/auth', { action: 'login', email: 'uji2@example.test', password: 'salahsalah' })));
    for (let i = 0; i < 8; i++) expect((await bad()).status).toBe(401);
    expect((await bad()).status).toBe(429);
  });
});

describe('hak akses', () => {
  beforeEach(() => void freshEnv());

  it('WhatsApp pemilik: terkunci tanpa langganan, terbuka setelah langganan aktif (dari server)', async () => {
    const { cookie, id } = await registerUser('wa@example.test');
    const { getAllKosts } = await import('@/lib/data-store');
    const slug = (await getAllKosts())[0].slug;
    const { POST } = await import('@/app/api/kost/[slug]/whatsapp/route');
    const call = (c?: string) => POST(new NextRequest(jsonReq(`/api/kost/${slug}/whatsapp`, {}, c ? { headers: { cookie: c } } : {})), { params: Promise.resolve({ slug }) });

    expect((await call()).status).toBe(403); // belum masuk
    expect((await call(cookie)).status).toBe(403); // masuk tapi belum bayar
    // header palsu dari browser tidak berpengaruh
    const forged = await POST(
      new NextRequest(jsonReq(`/api/kost/${slug}/whatsapp`, { userId: id, subscriberStatus: 'active' }, { headers: { 'x-subscriber-status': 'active', cookie } })),
      { params: Promise.resolve({ slug }) }
    );
    expect(forged.status).toBe(403);

    const { extendUserSubscription, saveUser } = await import('@/lib/payment-store');
    await saveUser({ id, email: 'wa@example.test', subscription_status: 'none', expires_at: null, days_remaining: 0, total_paid: 0, created_at: new Date().toISOString() });
    await extendUserSubscription(id, 30);
    const ok = await call(cookie);
    expect(ok.status).toBe(200);
    expect((await ok.json()).whatsapp).toBeTruthy();
  });

  it('data kost publik tidak memuat nomor WhatsApp & media premium', async () => {
    const { getPublicKosts } = await import('@/lib/public-kosts');
    const list = await getPublicKosts();
    expect(list.length).toBeGreaterThan(0);
    for (const k of list) {
      expect(k.owner_whatsapp).toBeUndefined();
      expect((k.media ?? []).every((m) => m.is_preview)).toBe(true);
    }
  });
});

describe('pembayaran (Midtrans)', () => {
  beforeEach(() => void freshEnv({ MIDTRANS_SERVER_KEY: SERVER_KEY }));

  async function setupOrder() {
    const { cookie, id } = await registerUser('bayar@example.test');
    const { saveTransaction } = await import('@/lib/payment-store');
    await saveTransaction({
      id: 'tx-uji',
      order_id: 'KK-15K-UJI',
      user_id: id,
      user_email: 'bayar@example.test',
      amount: 15000,
      payment_method: 'QRIS',
      transaction_status: 'pending',
      created_at: new Date().toISOString(),
      gateway: 'midtrans',
    });
    return { cookie, id };
  }

  const signed = (over: Record<string, string> = {}) => {
    const n = { order_id: 'KK-15K-UJI', status_code: '200', gross_amount: '15000.00', transaction_status: 'settlement', fraud_status: 'accept', transaction_id: 'mt-1', ...over };
    const signature_key = crypto.createHash('sha512').update(`${n.order_id}${n.status_code}${n.gross_amount}${SERVER_KEY}`).digest('hex');
    return { ...n, signature_key };
  };
  const hook = async (payload: unknown) => {
    const { POST } = await import('@/app/api/payment/webhook/route');
    return POST(new NextRequest(jsonReq('/api/payment/webhook', payload)));
  };

  it('webhook tanpa/bersignature salah ditolak dan tidak mengaktifkan langganan', async () => {
    const { id } = await setupOrder();
    expect((await hook({ order_id: 'KK-15K-UJI', status_code: '200', gross_amount: '15000.00', transaction_status: 'settlement' })).status).toBe(403);
    expect((await hook({ ...signed(), signature_key: 'palsu' })).status).toBe(403);
    const { getUser } = await import('@/lib/payment-store');
    expect((await getUser(id))?.subscription_status).not.toBe('active');
  });

  it('nominal tidak cocok ditolak', async () => {
    await setupOrder();
    expect((await hook(signed({ gross_amount: '1000.00' }))).status).toBe(400);
  });

  it('settlement mengaktifkan langganan SEKALI walau webhook dikirim ulang; ada notifikasi, invoice, dan riwayat', async () => {
    const { cookie, id } = await setupOrder();
    expect((await hook(signed())).status).toBe(200);
    expect((await hook(signed())).status).toBe(200);
    expect((await hook(signed())).status).toBe(200);

    const { getUser, getAllTransactions } = await import('@/lib/payment-store');
    const user = await getUser(id);
    expect(user?.subscription_status).toBe('active');
    expect(user?.days_remaining).toBeGreaterThanOrEqual(29);
    expect(user?.days_remaining).toBeLessThanOrEqual(30); // bukan 90 hari
    expect(user?.total_paid).toBe(15000);
    expect((await getAllTransactions()).find((t) => t.order_id === 'KK-15K-UJI')?.transaction_status).toBe('settlement');

    // notifikasi + email bukti bayar (tercatat di outbox karena Resend tidak dikonfigurasi)
    const notif = await (await import('@/app/api/notifications/route')).GET(authed('/api/notifications', cookie));
    expect((await notif.json()).items.some((n: { type: string }) => n.type === 'payment')).toBe(true);
    const { dbList } = await import('@/lib/db');
    await new Promise((r) => setTimeout(r, 50));
    expect((await dbList<{ id: string; subject: string }>('outbox')).some((m) => m.subject.includes('KK-15K-UJI'))).toBe(true);

    // riwayat & invoice milik sendiri
    const hist = await (await import('@/app/api/me/transactions/route')).GET(authed('/api/me/transactions', cookie));
    expect((await hist.json()).transactions[0].status).toBe('settlement');
    const inv = await (await import('@/app/api/invoices/[orderId]/route')).GET(authed('/api/invoices/KK-15K-UJI', cookie), { params: Promise.resolve({ orderId: 'KK-15K-UJI' }) });
    expect(inv.status).toBe(200);
    expect((await inv.json()).invoice.total).toBe(15000);
  });

  it('pengguna lain tidak bisa melihat invoice / status tagihan orang lain', async () => {
    await setupOrder();
    await hook(signed());
    const other = await registerUser('lain@example.test');
    const inv = await (await import('@/app/api/invoices/[orderId]/route')).GET(authed('/api/invoices/KK-15K-UJI', other.cookie), { params: Promise.resolve({ orderId: 'KK-15K-UJI' }) });
    expect(inv.status).toBe(404);
    const st = await (await import('@/app/api/payment/status/route')).GET(authed('/api/payment/status?orderId=KK-15K-UJI', other.cookie));
    expect(st.status).toBe(404);
  });

  it('simulasi pembayaran tidak tersedia saat Midtrans aktif', async () => {
    const { cookie } = await setupOrder();
    const { POST } = await import('@/app/api/payment/simulate/route');
    expect((await POST(authed('/api/payment/simulate', cookie, { orderId: 'KK-15K-UJI' }))).status).toBe(404);
  });
});

describe('pembayaran (mode demo, tanpa Midtrans)', () => {
  beforeEach(() => void freshEnv({ ALLOW_PAYMENT_SIMULATION: '1' }));

  it('buat QRIS demo -> simulasikan -> langganan aktif; tagihan dipakai ulang', async () => {
    const { cookie, id } = await registerUser('demo@example.test');
    const { POST: create } = await import('@/app/api/payment/create-qris/route');
    const first = await (await create(authed('/api/payment/create-qris', cookie, {}))).json();
    expect(first.success).toBe(true);
    expect(first.demo).toBe(true);
    expect(first.amount).toBe(15000);
    const again = await (await create(authed('/api/payment/create-qris', cookie, {}))).json();
    expect(again.orderId).toBe(first.orderId); // tidak menumpuk tagihan

    const { POST: sim } = await import('@/app/api/payment/simulate/route');
    expect((await sim(authed('/api/payment/simulate', cookie, { orderId: first.orderId }))).status).toBe(200);
    const { getUser } = await import('@/lib/payment-store');
    expect((await getUser(id))?.subscription_status).toBe('active');
  });

  it('tanpa login tidak bisa membuat tagihan', async () => {
    const { POST: create } = await import('@/app/api/payment/create-qris/route');
    expect((await create(new NextRequest(jsonReq('/api/payment/create-qris', {})))).status).toBe(401);
  });
});

describe('pembayaran di produksi tanpa Midtrans', () => {
  beforeEach(() => void freshEnv({ NODE_ENV: 'production', ALLOW_PAYMENT_SIMULATION: undefined, SESSION_SECRET: 'test-secret-0123456789abcdef' }));

  it('tidak ada jalan pintas gratis', async () => {
    const { cookie } = await registerUser('prod@example.test');
    const { POST: create } = await import('@/app/api/payment/create-qris/route');
    expect((await create(authed('/api/payment/create-qris', cookie, {}))).status).toBe(503);
    const { POST: sim } = await import('@/app/api/payment/simulate/route');
    expect((await sim(authed('/api/payment/simulate', cookie, { orderId: 'x' }))).status).toBe(404);
  });
});

describe('ulasan', () => {
  beforeEach(() => void freshEnv());

  it('hanya pengguna yang pernah membayar yang boleh menulis; satu ulasan per kost; bisa diedit & dihapus', async () => {
    const { cookie, id } = await registerUser('ulas@example.test', 'Rani Susanti');
    const { getAllKosts } = await import('@/lib/data-store');
    const slug = (await getAllKosts())[0].slug;
    const reviews = await import('@/app/api/reviews/route');
    const body = { slug, rating: 5, body: 'Kamar bersih, pemilik ramah, sesuai foto.' };

    expect((await reviews.POST(new NextRequest(jsonReq('/api/reviews', body)))).status).toBe(401);
    expect((await reviews.POST(authed('/api/reviews', cookie, body))).status).toBe(403); // belum pernah bayar

    const { saveTransaction } = await import('@/lib/payment-store');
    await saveTransaction({ id: 't1', order_id: 'O1', user_id: id, user_email: 'ulas@example.test', amount: 15000, payment_method: 'QRIS', transaction_status: 'settlement', created_at: new Date().toISOString() });

    expect((await reviews.POST(authed('/api/reviews', cookie, { ...body, rating: 9 }))).status).toBe(400);
    expect((await reviews.POST(authed('/api/reviews', cookie, { ...body, body: 'pendek' }))).status).toBe(400);
    expect((await reviews.POST(authed('/api/reviews', cookie, body))).status).toBe(200);
    expect((await reviews.POST(authed('/api/reviews', cookie, { ...body, rating: 3 }))).status).toBe(200); // edit, bukan dobel

    const list = await (await reviews.GET(new NextRequest(jsonReq(`/api/reviews?slug=${slug}`)))).json();
    expect(list.summary.count).toBe(1);
    expect(list.summary.avg).toBe(3);
    expect(list.reviews[0].name).toBe('Rani S.'); // nama disamarkan
    expect(JSON.stringify(list)).not.toContain('ulas@example.test');

    const { getPublicKosts } = await import('@/lib/public-kosts');
    expect((await getPublicKosts()).find((k) => k.slug === slug)?.rating).toEqual({ avg: 3, count: 1 });

    expect((await reviews.DELETE(authed(`/api/reviews?slug=${slug}`, cookie, undefined, 'DELETE'))).status).toBe(200);
    expect((await (await reviews.GET(new NextRequest(jsonReq(`/api/reviews?slug=${slug}`)))).json()).summary.count).toBe(0);
  });
});

describe('pengingat langganan', () => {
  beforeEach(() => void freshEnv());

  it('mengirim sekali per masa aktif, menghormati pengaturan email, dan mencatat notifikasi', async () => {
    const { saveUser, patchUser, getUser } = await import('@/lib/payment-store');
    const soon = new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString();
    const base = { subscription_status: 'active' as const, days_remaining: 2, total_paid: 15000, created_at: new Date().toISOString() };
    await saveUser({ id: 'u-a', email: 'a@example.test', expires_at: soon, ...base });
    await saveUser({ id: 'u-b', email: 'b@example.test', expires_at: soon, ...base });
    await patchUser('u-b', { reminders_off: true });

    const { runReminders } = await import('@/lib/reminders');
    const r1 = await runReminders('http://localhost:3000');
    expect(r1.notified).toBeGreaterThanOrEqual(2);
    const { dbList } = await import('@/lib/db');
    const outbox = await dbList<{ id: string; to: string }>('outbox');
    expect(outbox.some((m) => m.to === 'a@example.test')).toBe(true);
    expect(outbox.some((m) => m.to === 'b@example.test')).toBe(false); // email dimatikan

    const before = (await dbList('notifications')).length;
    await runReminders('http://localhost:3000'); // jalan lagi -> tidak dobel
    expect((await dbList('notifications')).length).toBe(before);
    expect((await getUser('u-a'))?.reminded?.['3d']).toBe(soon);
  });

  it('endpoint cron meminta rahasia bila CRON_SECRET diisi', async () => {
    process.env.CRON_SECRET = 'rahasia-cron';
    const { GET } = await import('@/app/api/cron/reminders/route');
    expect((await GET(new NextRequest(jsonReq('/api/cron/reminders')))).status).toBe(401);
    const ok = await GET(new NextRequest(jsonReq('/api/cron/reminders', undefined, { headers: { authorization: 'Bearer rahasia-cron' } })));
    expect(ok.status).toBe(200);
    delete process.env.CRON_SECRET;
  });
});

describe('formulir kontak & laporan', () => {
  beforeEach(() => void freshEnv());

  it('kontak: validasi, tersimpan, email diteruskan; bot (honeypot) diabaikan', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const post = (b: unknown, ip = '1.1.1.1') => POST(new NextRequest(jsonReq('/api/contact', b, { headers: { 'x-forwarded-for': ip } })));
    expect((await post({ name: 'A', email: 'x', message: 'pendek' })).status).toBe(400);
    expect((await post({ name: 'Budi', email: 'budi@example.test', topic: 'Kendala pembayaran', message: 'QRIS sudah dibayar tapi belum aktif' })).status).toBe(200);
    await new Promise((r) => setTimeout(r, 50));
    const { dbList } = await import('@/lib/db');
    expect((await dbList('contact-messages')).length).toBe(1);
    expect((await dbList<{ id: string; subject: string }>('outbox')).some((m) => m.subject.includes('Kendala pembayaran'))).toBe(true);
    // bot: pura-pura sukses tapi tidak disimpan
    expect((await post({ name: 'Bot', email: 'bot@example.test', message: 'beli obat murah di sini', website: 'http://spam' }, '2.2.2.2')).status).toBe(200);
    expect((await dbList('contact-messages')).length).toBe(1);
  });

  it('kontak dibatasi 3 pesan per jam per alamat', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const msg = { name: 'Budi', email: 'budi@example.test', message: 'Halo, ini pesan uji yang cukup panjang.' };
    const post = () => POST(new NextRequest(jsonReq('/api/contact', msg, { headers: { 'x-forwarded-for': '9.9.9.9' } })));
    for (let i = 0; i < 3; i++) expect((await post()).status).toBe(200);
    expect((await post()).status).toBe(429);
  });

  it('laporan kost tersimpan dan divalidasi', async () => {
    const { getAllKosts } = await import('@/lib/data-store');
    const slug = (await getAllKosts())[0].slug;
    const { POST } = await import('@/app/api/report/route');
    const post = (b: unknown) => POST(new NextRequest(jsonReq('/api/report', b)));
    expect((await post({ slug: 'tidak-ada', reason: 'kost_tidak_ada' })).status).toBe(404);
    expect((await post({ slug, reason: 'ngawur' })).status).toBe(400);
    expect((await post({ slug, reason: 'lainnya', detail: 'x' })).status).toBe(400);
    expect((await post({ slug, reason: 'tidak_sesuai_foto', detail: 'AC tidak ada' })).status).toBe(200);
    const { dbList } = await import('@/lib/db');
    expect((await dbList('reports')).length).toBe(1);
  });
});

describe('lupa & atur ulang kata sandi', () => {
  beforeEach(() => void freshEnv());

  it('token sekali pakai mengganti sandi; sandi lama tidak berlaku', async () => {
    await registerUser('reset@example.test');
    const forgot = await (await import('@/app/api/auth/forgot/route')).POST(new NextRequest(jsonReq('/api/auth/forgot', { email: 'reset@example.test' }, { headers: { 'x-forwarded-for': '3.3.3.3' } })));
    const fj = await forgot.json();
    const token = new URL(fj.devLink).searchParams.get('token')!;
    expect(token).toHaveLength(64);

    const reset = (await import('@/app/api/auth/reset/route')).POST;
    const doReset = (t: string, password: string) => reset(new NextRequest(jsonReq('/api/auth/reset', { token: t, password }, { headers: { 'x-forwarded-for': '3.3.3.3' } })));
    expect((await doReset('salah', 'sandibaru1')).status).toBe(400);
    expect((await doReset(token, '123')).status).toBe(400);
    expect((await doReset(token, 'sandibaru1')).status).toBe(200);
    expect((await doReset(token, 'sandilain1')).status).toBe(400); // token sudah terpakai

    const login = (await import('@/app/api/auth/route')).POST;
    const tryLogin = (password: string) => login(new NextRequest(jsonReq('/api/auth', { action: 'login', email: 'reset@example.test', password })));
    expect((await tryLogin('rahasia123')).status).toBe(401);
    expect((await tryLogin('sandibaru1')).status).toBe(200);
  });

  it('email tidak terdaftar mendapat jawaban yang sama (tidak membocorkan)', async () => {
    const { POST } = await import('@/app/api/auth/forgot/route');
    const r = await POST(new NextRequest(jsonReq('/api/auth/forgot', { email: 'tidakada@example.test' }, { headers: { 'x-forwarded-for': '4.4.4.4' } })));
    const j = await r.json();
    expect(r.status).toBe(200);
    expect(j.devLink).toBeUndefined();
  });
});

describe('rekaman langganan lama beremail sama', () => {
  beforeEach(() => void freshEnv());
  it('dipindahkan ke id akun baru dan langganan tetap terbaca', async () => {
    const { saveUser, extendUserSubscription, getAllUsers, getUser } = await import('@/lib/payment-store');
    await saveUser({ id: 'usr-old', email: 'x@example.test', fullName: 'X', subscription_status: 'none', expires_at: null, days_remaining: 0, total_paid: 0, created_at: new Date().toISOString() });
    await saveUser({ id: 'usr-new', email: 'x@example.test', fullName: 'X', subscription_status: 'none', expires_at: null, days_remaining: 0, total_paid: 0, created_at: new Date().toISOString() });
    await extendUserSubscription('usr-new', 30);
    expect((await getUser('usr-new'))?.id).toBe('usr-new');
    expect((await getUser('usr-new'))?.subscription_status).toBe('active');
    expect((await getAllUsers()).filter((u) => u.email === 'x@example.test')).toHaveLength(1);
  });
});
