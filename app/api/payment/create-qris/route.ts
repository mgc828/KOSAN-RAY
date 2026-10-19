import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorized } from '@/lib/api-auth';
import { getTransactionsByUser, saveTransaction, getUser, saveUser } from '@/lib/payment-store';
import { chargeQris, midtransConfigured } from '@/lib/midtrans';
import { SUBSCRIPTION_PRICE } from '@/lib/config';
import { rateLimit } from '@/lib/json-store';
import { paymentSimulationAllowed } from '@/lib/payments';

const DEMO_TTL_MS = 15 * 60 * 1000;

/** Buat (atau pakai ulang) tagihan QRIS untuk pengguna yang sedang masuk. */
export async function POST(req: NextRequest) {
  const me = await getSessionUser(req);
  if (!me) return unauthorized('Masuk atau daftar dulu sebelum membayar.');

  if (!midtransConfigured() && !paymentSimulationAllowed()) {
    return NextResponse.json(
      { error: 'Pembayaran belum tersedia. Hubungi kami lewat halaman Kontak.', code: 'payment_unavailable' },
      { status: 503 }
    );
  }
  if (!rateLimit(`qris:${me.id}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, { status: 429 });
  }

  const real = midtransConfigured();
  const gateway = real ? 'midtrans' : 'demo';
  const now = Date.now();

  // Tagihan yang masih berlaku dipakai ulang, supaya tidak menumpuk tagihan menggantung.
  const reusable = (await getTransactionsByUser(me.id)).find(
    (t) => t.transaction_status === 'pending' && t.gateway === gateway && t.expires_at && new Date(t.expires_at).getTime() > now + 60_000 && t.qr_url
  );
  if (reusable) {
    return NextResponse.json({
      success: true,
      orderId: reusable.order_id,
      amount: reusable.amount,
      qrImageUrl: reusable.qr_url,
      expiryTime: reusable.expires_at,
      demo: !real,
      isSandbox: !real || process.env.MIDTRANS_IS_PRODUCTION !== 'true',
    });
  }

  const orderId = `KK-15K-${now}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const amount = SUBSCRIPTION_PRICE;

  let qrUrl: string;
  let expiresAt: string;
  let midtransTransactionId: string | undefined;

  if (real) {
    try {
      const charge = await chargeQris({ orderId, amount, email: me.email, name: me.fullName });
      qrUrl = charge.qrUrl;
      expiresAt = charge.expiresAt ?? new Date(now + DEMO_TTL_MS).toISOString();
      midtransTransactionId = charge.transactionId;
    } catch (e) {
      console.error('[payment] Midtrans gagal membuat QRIS:', e);
      return NextResponse.json({ error: 'Gagal membuat QRIS. Coba lagi sebentar lagi.' }, { status: 502 });
    }
  } else {
    qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`DEMO-QRIS-${orderId}`)}`;
    expiresAt = new Date(now + DEMO_TTL_MS).toISOString();
  }

  // Pastikan pengguna ada di daftar pengguna (sumber status langganan).
  // (rekaman lama beremail sama dipindahkan ke id akun ini dengan status langganannya tetap utuh)
  const existing = await getUser(me.id);
  if (!existing || existing.id !== me.id) {
    await saveUser({
      subscription_status: 'none',
      expires_at: null,
      days_remaining: 0,
      total_paid: 0,
      created_at: new Date().toISOString(),
      ...existing,
      id: me.id,
      email: me.email,
      fullName: me.fullName,
    });
  }

  await saveTransaction({
    id: `tx-${now}-${Math.random().toString(36).slice(2, 6)}`,
    order_id: orderId,
    user_id: me.id,
    user_email: me.email,
    amount,
    payment_method: 'QRIS',
    transaction_status: 'pending',
    created_at: new Date(now).toISOString(),
    qr_url: qrUrl,
    expires_at: expiresAt,
    gateway,
    midtrans_transaction_id: midtransTransactionId,
  });

  return NextResponse.json({
    success: true,
    orderId,
    amount,
    qrImageUrl: qrUrl,
    expiryTime: expiresAt,
    demo: !real,
    isSandbox: !real || process.env.MIDTRANS_IS_PRODUCTION !== 'true',
  });
}
