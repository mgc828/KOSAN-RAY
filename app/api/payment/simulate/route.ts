import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorized } from '@/lib/api-auth';
import { getTransactionByOrderId } from '@/lib/payment-store';
import { settleTransaction, paymentSimulationAllowed } from '@/lib/payments';
import { baseUrl } from '@/lib/config';

/**
 * Simulasi "sudah bayar" — HANYA untuk mode demo (Midtrans belum dikonfigurasi) dan hanya di pengembangan,
 * kecuali ALLOW_PAYMENT_SIMULATION=1. Tidak pernah aktif kalau Midtrans sudah terhubung.
 */
export async function POST(req: NextRequest) {
  if (!paymentSimulationAllowed()) return NextResponse.json({ error: 'Simulasi pembayaran tidak tersedia.' }, { status: 404 });

  const me = await getSessionUser(req);
  if (!me) return unauthorized();

  const body = await req.json().catch(() => null);
  const orderId = typeof body?.orderId === 'string' ? body.orderId : '';
  const tx = await getTransactionByOrderId(orderId);
  if (!tx || tx.user_id !== me.id || tx.gateway !== 'demo') {
    return NextResponse.json({ error: 'Tagihan tidak ditemukan.' }, { status: 404 });
  }
  if (tx.transaction_status !== 'pending' && tx.transaction_status !== 'settlement') {
    return NextResponse.json({ error: 'Tagihan sudah tidak berlaku. Buat tagihan baru.' }, { status: 409 });
  }

  await settleTransaction(orderId, { siteUrl: baseUrl(req) });
  return NextResponse.json({ success: true });
}
