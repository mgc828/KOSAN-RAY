import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSubscription, unauthorized } from '@/lib/api-auth';
import { getTransactionByOrderId } from '@/lib/payment-store';
import { getMidtransStatus, midtransConfigured } from '@/lib/midtrans';
import { settleTransaction, updatePendingStatus } from '@/lib/payments';
import { baseUrl } from '@/lib/config';

/** Cek status satu tagihan milik pengguna. Dipanggil berkala oleh halaman pembayaran. */
export async function GET(req: NextRequest) {
  const me = await getSessionUser(req);
  if (!me) return unauthorized();

  const orderId = req.nextUrl.searchParams.get('orderId') || '';
  let tx = await getTransactionByOrderId(orderId);
  if (!tx || tx.user_id !== me.id) {
    return NextResponse.json({ error: 'Tagihan tidak ditemukan.' }, { status: 404 });
  }

  if (tx.transaction_status === 'pending') {
    if (tx.gateway === 'midtrans' && midtransConfigured()) {
      // Sumber kebenaran: Midtrans. Berguna kalau webhook terlambat / belum sampai.
      const remote = await getMidtransStatus(tx.order_id).catch(() => null);
      if (remote && remote.grossAmount === tx.amount) {
        if (remote.status === 'settlement') {
          tx = (await settleTransaction(tx.order_id, { siteUrl: baseUrl(req), midtransTransactionId: remote.transactionId })).tx ?? tx;
        } else if (remote.status !== 'pending') {
          tx = (await updatePendingStatus(tx.order_id, remote.status)) ?? tx;
        }
      }
    }
    if (tx.transaction_status === 'pending' && tx.expires_at && new Date(tx.expires_at).getTime() < Date.now()) {
      tx = (await updatePendingStatus(tx.order_id, 'expire')) ?? tx;
    }
  }

  const sub = await getSubscription(me.id);
  return NextResponse.json({
    orderId: tx.order_id,
    status: tx.transaction_status,
    paidAt: tx.paid_at ?? null,
    expiresAt: tx.expires_at ?? null,
    subscription: { active: sub.active, expiresAt: sub.expiresAt, daysRemaining: sub.daysRemaining },
  });
}
