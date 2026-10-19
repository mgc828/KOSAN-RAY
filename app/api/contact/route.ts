import { NextRequest, NextResponse } from 'next/server';
import { dbPut } from '@/lib/db';
import { rateLimit, clientIp } from '@/lib/json-store';
import { sendEmail, contactAckEmail, contactForwardEmail } from '@/lib/email';
import { SUPPORT_EMAIL, CONTACT_TOPICS } from '@/lib/config';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!rateLimit(`contact:${clientIp(req)}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Terlalu banyak pesan dalam waktu singkat. Coba lagi nanti.' }, { status: 429 });
  }

  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });

  // Kolom jebakan untuk bot (disembunyikan dari manusia). Pura-pura sukses supaya bot tidak mencoba lagi.
  if (typeof b.website === 'string' && b.website.trim() !== '') return NextResponse.json({ success: true });

  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 80) : '';
  const email = typeof b.email === 'string' ? b.email.trim().slice(0, 120) : '';
  const topic = CONTACT_TOPICS.includes(b.topic) ? b.topic : 'Lainnya';
  const message = typeof b.message === 'string' ? b.message.trim().slice(0, 3000) : '';

  if (name.length < 2) return NextResponse.json({ error: 'Isi nama kamu.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Alamat email tidak valid.' }, { status: 400 });
  if (message.length < 10) return NextResponse.json({ error: 'Pesan minimal 10 karakter.' }, { status: 400 });

  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  try {
    await dbPut('contact-messages', { id, name, email, topic, message, status: 'baru', created_at: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Pesan gagal disimpan. Coba lagi.' }, { status: 500 });
  }

  // Email ke tim + tanda terima ke pengirim. Kegagalan email tidak membatalkan pesan yang sudah tersimpan.
  sendEmail({ to: SUPPORT_EMAIL, replyTo: email, ...contactForwardEmail({ name, email, topic, message }) }).catch(() => undefined);
  sendEmail({ to: email, ...contactAckEmail(name) }).catch(() => undefined);

  return NextResponse.json({ success: true, id });
}
