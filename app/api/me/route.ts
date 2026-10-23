import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSubscription, unauthorized } from '@/lib/api-auth';
import { getUser, patchUser } from '@/lib/payment-store';
import { unreadCount } from '@/lib/notifications';
import { renewSessionToken, sessionCookie } from '@/lib/session';
import { updateAccountName } from '@/lib/account-store';

/** Pengguna yang sedang masuk + status langganan dari server. */
export async function GET(req: NextRequest) {
  const me = await getSessionUser(req);
  // Belum masuk: jawab 200 dengan user null (bukan 401) supaya konsol browser pengunjung tidak penuh error merah.
  if (!me) {
    return NextResponse.json({ user: null, subscription: { status: 'none', expiresAt: null, daysRemaining: 0 }, settings: { remindersOff: false }, unreadNotifications: 0 });
  }

  const [sub, user, unread] = await Promise.all([getSubscription(me.id), getUser(me.id), unreadCount(me.id)]);
  const res = NextResponse.json({
    user: { id: me.id, email: me.email, fullName: me.fullName },
    subscription: {
      status: sub.active ? 'active' : user?.subscription_status === 'expired' ? 'expired' : 'none',
      expiresAt: sub.expiresAt,
      daysRemaining: sub.daysRemaining,
    },
    settings: { remindersOff: Boolean(user?.reminders_off) },
    profile: { createdAt: user?.created_at ?? null, totalPaid: user?.total_paid ?? 0 },
    unreadNotifications: unread,
  });
  // Setiap permintaan ini = pengguna masih aktif: perpanjang batas tidak-aktif sesi (batas mutlak tetap)
  res.headers.append('Set-Cookie', sessionCookie(req, renewSessionToken(me.session)));
  return res;
}

/** Ubah pengaturan akun: email pengingat dan/atau nama tampilan. */
export async function PATCH(req: NextRequest) {
  const me = await getSessionUser(req);
  if (!me) return unauthorized();
  const body = await req.json().catch(() => null);
  const hasReminder = typeof body?.remindersOff === 'boolean';
  const hasName = typeof body?.fullName === 'string';
  if (!hasReminder && !hasName) {
    return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
  }
  const user = await getUser(me.id);
  if (!user) return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });

  const patch: { reminders_off?: boolean; fullName?: string } = {};
  if (hasReminder) patch.reminders_off = body.remindersOff;
  if (hasName) {
    const name = String(body.fullName).trim().replace(/\s+/g, ' ');
    if (name.length < 2 || name.length > 60) {
      return NextResponse.json({ error: 'Nama harus 2-60 karakter.' }, { status: 400 });
    }
    patch.fullName = name;
    await updateAccountName(me.id, name);
  }
  await patchUser(user.id, patch);
  return NextResponse.json({ success: true, settings: { remindersOff: hasReminder ? body.remindersOff : Boolean(user.reminders_off) }, fullName: patch.fullName });
}
