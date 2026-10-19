import crypto from 'crypto';
import { TransactionStatus } from './payment-store';

/**
 * Integrasi Midtrans (QRIS via Core API).
 * Aktif hanya kalau MIDTRANS_SERVER_KEY terisi nilai asli. Sandbox: MIDTRANS_IS_PRODUCTION="false".
 */

export function midtransConfigured(): boolean {
  const k = process.env.MIDTRANS_SERVER_KEY;
  return Boolean(k && !/your-|placeholder|changeme|demo/i.test(k));
}

function serverKey(): string {
  return process.env.MIDTRANS_SERVER_KEY as string;
}

function apiBase(): string {
  return process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com';
}

function authHeader(): string {
  return `Basic ${Buffer.from(`${serverKey()}:`).toString('base64')}`;
}

/** Midtrans memakai jam WIB (UTC+7) tanpa zona waktu di string-nya. */
function parseMidtransTime(t: string | undefined): string | undefined {
  if (!t) return undefined;
  const d = new Date(`${t.replace(' ', 'T')}+07:00`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export interface QrisCharge {
  transactionId: string;
  qrUrl: string;
  expiresAt?: string;
}

export async function chargeQris(p: { orderId: string; amount: number; email: string; name?: string }): Promise<QrisCharge> {
  const res = await fetch(`${apiBase()}/v2/charge`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      payment_type: 'qris',
      transaction_details: { order_id: p.orderId, gross_amount: p.amount },
      qris: { acquirer: 'gopay' },
      customer_details: { first_name: p.name || 'Pengguna', email: p.email },
      item_details: [{ id: 'akses-30-hari', price: p.amount, quantity: 1, name: 'Akses penuh 30 hari' }],
    }),
  });
  const data = await res.json().catch(() => ({}));
  const okCode = String(data.status_code || '');
  if (!res.ok || !(okCode === '201' || okCode === '200')) {
    throw new Error(`Midtrans menolak pembuatan QRIS (${data.status_message || res.status})`);
  }
  const action = (data.actions || []).find((a: { name: string; url: string }) => a.name === 'generate-qr-code') || (data.actions || [])[0];
  if (!action?.url) throw new Error('Midtrans tidak mengembalikan QR');
  return { transactionId: data.transaction_id, qrUrl: action.url, expiresAt: parseMidtransTime(data.expiry_time) };
}

export interface MidtransStatus {
  status: TransactionStatus;
  grossAmount: number;
  transactionId?: string;
  paymentType?: string;
}

export function mapStatus(transactionStatus: string, fraudStatus?: string): TransactionStatus {
  switch (transactionStatus) {
    case 'settlement':
      return 'settlement';
    case 'capture':
      return fraudStatus === 'challenge' ? 'pending' : 'settlement';
    case 'pending':
      return 'pending';
    case 'expire':
      return 'expire';
    case 'cancel':
      return 'cancel';
    case 'deny':
      return 'deny';
    default:
      return 'failure';
  }
}

export async function getMidtransStatus(orderId: string): Promise<MidtransStatus | null> {
  const res = await fetch(`${apiBase()}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: { Authorization: authHeader(), Accept: 'application/json' },
  });
  const data = await res.json().catch(() => null);
  if (!data || data.status_code === '404') return null;
  return {
    status: mapStatus(String(data.transaction_status || ''), data.fraud_status),
    grossAmount: Math.round(Number(data.gross_amount) || 0),
    transactionId: data.transaction_id,
    paymentType: data.payment_type,
  };
}

/** signature_key = SHA512(order_id + status_code + gross_amount + server_key) */
export function verifyMidtransSignature(n: { order_id?: string; status_code?: string; gross_amount?: string; signature_key?: string }): boolean {
  if (!n.order_id || !n.status_code || !n.gross_amount || !n.signature_key) return false;
  const expected = crypto
    .createHash('sha512')
    .update(`${n.order_id}${n.status_code}${n.gross_amount}${serverKey()}`)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(n.signature_key);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
