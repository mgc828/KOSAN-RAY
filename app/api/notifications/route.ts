import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorized } from '@/lib/api-auth';
import { listNotifications, markRead, unreadCount } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  const me = await getSessionUser(req);
  if (!me) return unauthorized();
  const [items, unread] = await Promise.all([listNotifications(me.id), unreadCount(me.id)]);
  return NextResponse.json({ items, unread });
}

/** Body: { id: "<id notifikasi>" } atau { all: true } */
export async function POST(req: NextRequest) {
  const me = await getSessionUser(req);
  if (!me) return unauthorized();
  const body = await req.json().catch(() => null);
  if (body?.all === true) await markRead(me.id, 'all');
  else if (typeof body?.id === 'string') await markRead(me.id, body.id);
  else return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
  return NextResponse.json({ success: true, unread: await unreadCount(me.id) });
}
