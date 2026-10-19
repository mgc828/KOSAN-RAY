import { getAllUsers, patchUser } from './payment-store';
import { createNotification } from './notifications';
import { sendEmail, reminderEmail } from './email';

const DAY = 24 * 3600 * 1000;

export type ReminderStage = '3d' | 'exp';

/** Tahap pengingat yang berlaku sekarang (atau null). Fungsi murni, dites di tests/reminders.test.ts. */
export function reminderStage(expiresAt: string | null, now: number): { stage: ReminderStage; daysLeft: number } | null {
  if (!expiresAt) return null;
  const exp = new Date(expiresAt).getTime();
  if (Number.isNaN(exp)) return null;
  const daysLeft = Math.ceil((exp - now) / DAY);
  if (exp > now && daysLeft <= 3) return { stage: '3d', daysLeft };
  if (exp <= now && now - exp <= 2 * DAY) return { stage: 'exp', daysLeft: 0 };
  return null;
}

/**
 * Kirim pengingat langganan hampir habis (<= 3 hari) dan sudah habis (maks. 2 hari lalu).
 * Tiap tahap dikirim sekali per tanggal berakhir. Dijalankan harian lewat /api/cron/reminders.
 */
export async function runReminders(siteUrl: string, now = Date.now()) {
  const users = await getAllUsers();
  let notified = 0;
  let emailed = 0;

  for (const u of users) {
    const due = reminderStage(u.expires_at, now);
    if (!due || !u.expires_at) continue;
    if (u.reminded?.[due.stage] === u.expires_at) continue; // sudah dikirim untuk masa aktif ini

    const renewUrl = `${siteUrl}/checkout`;
    const expired = due.stage === 'exp';
    await createNotification({
      user_id: u.id,
      type: 'reminder',
      title: expired ? 'Akses kamu sudah berakhir' : `Akses berakhir ${due.daysLeft} hari lagi`,
      body: expired ? 'Perpanjang untuk membuka kembali foto, video, dan nomor WhatsApp pemilik.' : 'Perpanjang sekarang supaya akses tidak terputus.',
      href: '/checkout',
    });
    notified++;

    if (!u.reminders_off) {
      const mail = reminderEmail({ daysLeft: due.daysLeft, expiresAt: u.expires_at, renewUrl });
      const r = await sendEmail({ to: u.email, ...mail });
      if (r.sent) emailed++;
    }
    await patchUser(u.id, { reminded: { ...(u.reminded ?? {}), [due.stage]: u.expires_at } });
  }
  return { checked: users.length, notified, emailed };
}
