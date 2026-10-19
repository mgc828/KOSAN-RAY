import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorized } from '@/lib/api-auth';
import { getTransactionsByUser } from '@/lib/payment-store';

/** Riwayat transaksi milik pengguna yang sedang masuk (terbaru di atas). */
export async function GET(req: NextRequest) {
  const me = await getSessionUser(req);
  if (!me) return unauthorized();

  const list = await getTransactionsByUser(me.id);
  return NextResponse.json({
    transactions: list
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((t) => ({
        orderId: t.order_id,
        amount: t.amount,
        status: t.transaction_status,
        method: t.payment_method,
        createdAt: t.created_at,
        paidAt: t.paid_at ?? null,
        expiresAt: t.expires_at ?? null,
      })),
  });
}
