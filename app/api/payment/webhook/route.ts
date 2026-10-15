import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory set untuk idempotency checks pada order_id yang sudah diproses
const processedOrderIds = new Set<string>();

// Mock database subscriptions state untuk server-side session checks
const serverSubscriptions: Record<string, {
  userId: string;
  orderId: string;
  expiresAt: string;
  updatedAt: string;
}> = {};

export async function POST(req: NextRequest) {
  try {
    const rawBodyText = await req.text();
    let notification: Record<string, unknown>;

    try {
      notification = JSON.parse(rawBodyText);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const orderId = String(notification.order_id || '');
    const statusCode = String(notification.status_code || '');
    const grossAmount = String(notification.gross_amount || '');
    const signatureKey = String(notification.signature_key || '');
    const transactionStatus = String(notification.transaction_status || '');
    const fraudStatus = String(notification.fraud_status || '');
    const userId = String(notification.custom_field1 || notification.user_id || 'usr-default');

    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'demo-sandbox-key';

    // 1. Verifikasi Signature SHA512 (Jika signature_key dikirim dari Midtrans)
    if (signatureKey && serverKey && !serverKey.includes('your-key')) {
      const payloadToHash = `${orderId}${statusCode}${grossAmount}${serverKey}`;
      const expectedSignature = crypto
        .createHash('sha512')
        .update(payloadToHash)
        .digest('hex');

      if (signatureKey !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 403 });
      }
    }

    // 2. Idempotency Check: Pastikan order_id yang sama tidak diproses dua kali
    if (processedOrderIds.has(orderId)) {
      return NextResponse.json({
        message: 'Order already processed (idempotent)',
        orderId,
      });
    }

    // 3. Evaluasi Status Pembayaran
    const isSuccess = 
      transactionStatus === 'settlement' || 
      transactionStatus === 'capture' ||
      (transactionStatus === 'pending' && notification.simulate_success === true);

    if (isSuccess && (fraudStatus === 'accept' || !fraudStatus || fraudStatus === '')) {
      // Tandai order_id sebagai sudah diproses
      processedOrderIds.add(orderId);

      // 4. Hitung masa aktif langganan:
      // Beli saat masih aktif: expires_at = expires_at_lama + 30 hari
      // Beli pertama / sudah expired: expires_at = now + 30 hari
      const now = new Date();
      const existingSub = serverSubscriptions[userId];
      let expiresAt: Date;

      if (existingSub && new Date(existingSub.expiresAt) > now) {
        const oldExpires = new Date(existingSub.expiresAt);
        expiresAt = new Date(oldExpires.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else {
        expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }

      serverSubscriptions[userId] = {
        userId,
        orderId,
        expiresAt: expiresAt.toISOString(),
        updatedAt: now.toISOString(),
      };

      return NextResponse.json({
        success: true,
        message: 'Subscription successfully extended by 30 days',
        orderId,
        userId,
        expiresAt: expiresAt.toISOString(),
      });
    }

    return NextResponse.json({
      message: `Transaction status ${transactionStatus} received`,
      orderId,
    });
  } catch {
    return NextResponse.json({ error: 'Gagal memproses webhook' }, { status: 500 });
  }
}
