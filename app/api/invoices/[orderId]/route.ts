import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorized } from '@/lib/api-auth';
import { getTransactionByOrderId } from '@/lib/payment-store';
import { SUBSCRIPTION_DAYS, SITE_NAME, SUPPORT_EMAIL } from '@/lib/config';

/** Data invoice. Hanya pemilik transaksi yang sudah dibayar yang boleh melihatnya. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const me = await getSessionUser(req);
  if (!me) return unauthorized();

  const { orderId } = await params;
  const tx = await getTransactionByOrderId(orderId);
  // 404 (bukan 403) agar nomor order orang lain tidak bisa ditebak keberadaannya.
  if (!tx || tx.user_id !== me.id || tx.transaction_status !== 'settlement') {
    return NextResponse.json({ error: 'Invoice tidak ditemukan.' }, { status: 404 });
  }

  return NextResponse.json({
    invoice: {
      number: tx.order_id,
      issuedAt: tx.paid_at ?? tx.created_at,
      customer: { name: me.fullName ?? me.email.split('@')[0], email: tx.user_email },
      seller: { name: SITE_NAME, email: SUPPORT_EMAIL },
      item: { description: `Akses penuh ${SITE_NAME} (${SUBSCRIPTION_DAYS} hari)`, quantity: 1, price: tx.amount },
      total: tx.amount,
      method: tx.payment_method,
      status: 'LUNAS',
    },
  });
}
