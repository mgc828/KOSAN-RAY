import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSubscription, unauthorized } from '@/lib/api-auth';
import { getUser, patchUser } from '@/lib/payment-store';
import { unreadCount } from '@/lib/notifications';

/** Pengguna yang sedang masuk + status langganan dari server. */
export async function GET(req: NextRequest) {
  const me = await getSessionUser(req);
  // Belum masuk: jawab 200 dengan user null (bukan 401) supaya konsol browser pengunjung tidak penuh error merah.
  if (!me) {
    return NextResponse.json({ user: null, subscription: { status: 'none', expiresAt: null, daysRemaining: 0 }, settings: { remindersOff: false }, unreadNotifications: 0 });
  }

  const [sub, user, unread] = await Promise.all([getSubscription(me.id), getUser(me.id), unreadCount(me.id)]);
  return NextResponse.json({
    user: { id: me.id, email: me.email, fullName: me.fullName },
    subscription: {
      status: sub.active ? 'active' : user?.subscription_status === 'expired' ? 'expired' : 'none',
      expiresAt: sub.expiresAt,
      daysRemaining: sub.daysRemaining,
    },
    settings: { remindersOff: Boolean(user?.reminders_off) },
    unreadNotifications: unread,
  });
}

/** Ubah pengaturan akun (saat ini: email pengingat). */
export async function PATCH(req: NextRequest) {
  const me = await getSessionUser(req);
  if (!me) return unauthorized();
  const body = await req.json().catch(() => null);
  if (typeof body?.remindersOff !== 'boolean') {
    return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
  }
  const user = await getUser(me.id);
  if (!user) return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
  await patchUser(user.id, { reminders_off: body.remindersOff });
  return NextResponse.json({ success: true, settings: { remindersOff: body.remindersOff } });
}
