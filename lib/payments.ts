import { dbUpdate } from './db';
import { SUBSCRIPTION_DAYS } from './config';
import {
  PaymentTransaction,
  TransactionStatus,
  getTransactionByOrderId,
  extendUserSubscription,
  getUser,
  patchUser,
} from './payment-store';
import { createNotification } from './notifications';
import { sendEmail, receiptEmail } from './email';
import { midtransConfigured } from './midtrans';

/** Simulasi "sudah bayar" hanya untuk mode demo (tanpa Midtrans), dan hanya saat pengembangan kecuali ALLOW_PAYMENT_SIMULATION=1. */
export function paymentSimulationAllowed(): boolean {
  return !midtransConfigured() && (process.env.NODE_ENV !== 'production' || process.env.ALLOW_PAYMENT_SIMULATION === '1');
}

/** Perbarui status transaksi yang belum selesai (pending -> expire/cancel/dll). */
export async function updatePendingStatus(orderId: string, status: TransactionStatus): Promise<PaymentTransaction | undefined> {
  const tx = await getTransactionByOrderId(orderId);
  if (!tx || tx.transaction_status === 'settlement') return tx;
  return dbUpdate<PaymentTransaction>('transactions', tx.id, (cur) =>
    cur.transaction_status === 'settlement' ? cur : { ...cur, transaction_status: status }
  );
}

/**
 * Tandai pembayaran berhasil dan aktifkan langganan. Aman dipanggil berulang (webhook dikirim ulang):
 * langganan hanya ditambah sekali per transaksi.
 */
export async function settleTransaction(
  orderId: string,
  opts: { siteUrl: string; midtransTransactionId?: string }
): Promise<{ transitioned: boolean; tx?: PaymentTransaction }> {
  const tx = await getTransactionByOrderId(orderId);
  if (!tx) return { transitioned: false };

  let transitioned = false;
  const updated = await dbUpdate<PaymentTransaction>('transactions', tx.id, (cur) => {
    if (cur.transaction_status === 'settlement') return cur;
    transitioned = true;
    return {
      ...cur,
      transaction_status: 'settlement',
      paid_at: new Date().toISOString(),
      midtrans_transaction_id: opts.midtransTransactionId ?? cur.midtrans_transaction_id,
    };
  });
  if (!transitioned || !updated) return { transitioned: false, tx: updated ?? tx };

  const extended = await extendUserSubscription(updated.user_id, SUBSCRIPTION_DAYS);
  const user = await getUser(updated.user_id);
  if (user) await patchUser(user.id, { total_paid: (user.total_paid || 0) + updated.amount });

  const invoiceUrl = `${opts.siteUrl}/invoice/${encodeURIComponent(updated.order_id)}`;
  await createNotification({
    user_id: updated.user_id,
    type: 'payment',
    title: 'Pembayaran berhasil',
    body: `Akses penuh aktif ${SUBSCRIPTION_DAYS} hari. Order ${updated.order_id}.`,
    href: `/invoice/${updated.order_id}`,
  });

  const mail = receiptEmail({
    orderId: updated.order_id,
    amount: updated.amount,
    paidAt: updated.paid_at as string,
    method: updated.payment_method,
    expiresAt: extended?.expires_at ?? null,
    invoiceUrl,
  });
  // Email tidak boleh menggagalkan pembayaran.
  sendEmail({ to: updated.user_email, ...mail }).catch((e) => console.error('[payments] email bukti bayar gagal:', e));

  return { transitioned: true, tx: updated };
}
