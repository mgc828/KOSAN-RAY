import { NextRequest, NextResponse } from 'next/server';
import { getTransactionByOrderId } from '@/lib/payment-store';
import { mapStatus, midtransConfigured, verifyMidtransSignature } from '@/lib/midtrans';
import { settleTransaction, updatePendingStatus } from '@/lib/payments';
import { baseUrl } from '@/lib/config';

/**
 * Notifikasi HTTP dari Midtrans. Aturan:
 *  - tanpa signature_key yang valid -> ditolak (403);
 *  - nominal harus sama dengan tagihan kita;
 *  - pemilik tagihan diambil dari data kita, bukan dari isi notifikasi;
 *  - diproses sekali saja (idempoten), jadi kiriman ulang dari Midtrans aman.
 */
export async function POST(req: NextRequest) {
  if (!midtransConfigured()) {
    return NextResponse.json({ error: 'Gateway pembayaran belum dikonfigurasi.' }, { status: 503 });
  }

  const n = await req.json().catch(() => null);
  if (!n || typeof n !== 'object') return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 });

  if (!verifyMidtransSignature(n)) {
    return NextResponse.json({ error: 'Signature tidak valid' }, { status: 403 });
  }

  const orderId = String(n.order_id);
  const tx = await getTransactionByOrderId(orderId);
  if (!tx) {
    // Mis. tombol "Test notification" di dashboard Midtrans. 200 agar Midtrans tidak mengulang terus.
    return NextResponse.json({ ok: true, ignored: 'order tidak dikenal' });
  }

  if (Math.round(parseFloat(String(n.gross_amount))) !== tx.amount) {
    console.error(`[webhook] nominal tidak cocok untuk ${orderId}: ${n.gross_amount} != ${tx.amount}`);
    return NextResponse.json({ error: 'Nominal tidak cocok' }, { status: 400 });
  }

  const status = mapStatus(String(n.transaction_status || ''), n.fraud_status);
  if (status === 'settlement') {
    const result = await settleTransaction(orderId, { siteUrl: baseUrl(req), midtransTransactionId: n.transaction_id });
    return NextResponse.json({ ok: true, settled: result.transitioned });
  }
  if (status !== 'pending') await updatePendingStatus(orderId, status);
  return NextResponse.json({ ok: true, status });
}
