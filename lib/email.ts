import { SITE_NAME, SUPPORT_EMAIL } from './config';
import { dbPut } from './db';

/**
 * Pengiriman email lewat Resend (RESEND_API_KEY + EMAIL_FROM).
 * Tanpa konfigurasi: email tidak dikirim, tapi dicatat di koleksi "outbox" dan log server
 * supaya alurnya tetap bisa diuji saat pengembangan.
 */

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendResult {
  sent: boolean;
  via: 'resend' | 'outbox';
  error?: string;
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function sendEmail(mail: OutgoingEmail): Promise<SendResult> {
  if (emailConfigured()) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: mail.to,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          reply_to: mail.replyTo,
        }),
      });
      if (res.ok) return { sent: true, via: 'resend' };
      const detail = await res.text().catch(() => '');
      console.error('[email] Resend menolak:', res.status, detail.slice(0, 200));
      return { sent: false, via: 'resend', error: `Resend ${res.status}` };
    } catch (e) {
      console.error('[email] gagal menghubungi Resend:', e);
      return { sent: false, via: 'resend', error: 'jaringan' };
    }
  }

  try {
    await dbPut('outbox', {
      id: `mail-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      to: mail.to,
      subject: mail.subject,
      text: mail.text ?? '',
      created_at: new Date().toISOString(),
    });
  } catch {
    /* outbox hanya alat bantu pengembangan */
  }
  console.log(`[email:outbox] ke=${mail.to} | ${mail.subject}`);
  return { sent: false, via: 'outbox' };
}

/* ------------------------------ templat ------------------------------ */

function layout(title: string, inner: string): string {
  return `<!doctype html><html lang="id"><body style="margin:0;background:#F8FAFC;font-family:Arial,Helvetica,sans-serif;color:#0F2A43">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
<tr><td style="background:#0F2A43;padding:18px 24px"><span style="font-size:20px;font-weight:800;color:#F97316">${SITE_NAME}</span></td></tr>
<tr><td style="padding:24px"><h1 style="font-size:20px;margin:0 0 12px">${esc(title)}</h1>${inner}</td></tr>
<tr><td style="padding:16px 24px;background:#F8FAFC;font-size:12px;color:#64748B">Email otomatis dari ${SITE_NAME}. Butuh bantuan? Balas email ini atau tulis ke ${SUPPORT_EMAIL}.</td></tr>
</table></td></tr></table></body></html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:20px 0"><a href="${esc(href)}" style="background:#F97316;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;display:inline-block">${esc(label)}</a></p>`;
}

export function resetPasswordEmail(link: string) {
  return {
    subject: `Atur ulang kata sandi ${SITE_NAME}`,
    html: layout(
      'Atur ulang kata sandi',
      `<p>Kami menerima permintaan untuk mengatur ulang kata sandi akunmu. Tautan ini berlaku 30 menit.</p>${button(link, 'Atur ulang kata sandi')}<p style="font-size:13px;color:#64748B">Kalau kamu tidak memintanya, abaikan saja email ini.</p>`
    ),
    text: `Atur ulang kata sandi (berlaku 30 menit): ${link}`,
  };
}

export interface ReceiptData {
  orderId: string;
  amount: number;
  paidAt: string;
  method: string;
  expiresAt: string | null;
  invoiceUrl: string;
}

export function receiptEmail(d: ReceiptData) {
  const rp = `Rp ${d.amount.toLocaleString('id-ID')}`;
  const paid = new Date(d.paidAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
  const until = d.expiresAt ? new Date(d.expiresAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-';
  return {
    subject: `Bukti pembayaran ${d.orderId}`,
    html: layout(
      'Pembayaran berhasil',
      `<p>Terima kasih! Akses penuh ${SITE_NAME} sudah aktif.</p>
<table cellpadding="6" style="font-size:14px;border-collapse:collapse;width:100%">
<tr><td style="color:#64748B">Order ID</td><td><b>${esc(d.orderId)}</b></td></tr>
<tr><td style="color:#64748B">Total</td><td><b>${rp}</b></td></tr>
<tr><td style="color:#64748B">Metode</td><td>${esc(d.method)}</td></tr>
<tr><td style="color:#64748B">Dibayar</td><td>${esc(paid)}</td></tr>
<tr><td style="color:#64748B">Aktif sampai</td><td><b>${esc(until)}</b></td></tr></table>
${button(d.invoiceUrl, 'Lihat / cetak invoice')}`
    ),
    text: `Pembayaran ${rp} berhasil (Order ${d.orderId}). Aktif sampai ${until}. Invoice: ${d.invoiceUrl}`,
  };
}

export function reminderEmail(opts: { daysLeft: number; expiresAt: string; renewUrl: string }) {
  const until = new Date(opts.expiresAt).toLocaleDateString('id-ID', { dateStyle: 'long' });
  const expired = opts.daysLeft <= 0;
  return {
    subject: expired ? 'Akses kost-kostan kamu sudah berakhir' : `Akses kost-kostan berakhir ${opts.daysLeft} hari lagi`,
    html: layout(
      expired ? 'Akses kamu sudah berakhir' : `Akses berakhir ${opts.daysLeft} hari lagi`,
      `<p>${
        expired
          ? `Masa aktif akses kamu berakhir pada ${esc(until)}. Foto, video, dan nomor WhatsApp pemilik kembali terkunci.`
          : `Masa aktif akses kamu berakhir pada <b>${esc(until)}</b>. Perpanjang sekarang supaya tidak terputus. Perpanjangan otomatis ditambahkan di belakang tanggal berakhir.`
      }</p>${button(opts.renewUrl, 'Perpanjang akses')}<p style="font-size:12px;color:#64748B">Tidak mau menerima pengingat? Matikan di halaman Dashboard.</p>`
    ),
    text: `${expired ? 'Akses sudah berakhir' : `Akses berakhir ${opts.daysLeft} hari lagi`} (${until}). Perpanjang: ${opts.renewUrl}`,
  };
}

export function contactAckEmail(name: string) {
  return {
    subject: 'Pesanmu sudah kami terima',
    html: layout('Pesanmu sudah kami terima', `<p>Halo ${esc(name)}, terima kasih sudah menghubungi kami. Tim kami akan membalas secepatnya, biasanya dalam 1x24 jam kerja.</p>`),
    text: `Halo ${name}, pesanmu sudah kami terima dan akan dibalas dalam 1x24 jam kerja.`,
  };
}

export function contactForwardEmail(m: { name: string; email: string; topic: string; message: string }) {
  return {
    subject: `[Kontak] ${m.topic} - ${m.name}`,
    html: layout(
      'Pesan baru dari formulir kontak',
      `<p><b>${esc(m.name)}</b> &lt;${esc(m.email)}&gt;<br>Topik: ${esc(m.topic)}</p><p style="white-space:pre-wrap;background:#F8FAFC;padding:12px;border-radius:8px">${esc(m.message)}</p>`
    ),
    text: `${m.name} <${m.email}> | ${m.topic}\n\n${m.message}`,
  };
}
