import { NextResponse } from 'next/server';
import { readSession, Session } from './session';
import { getUser } from './payment-store';
import { findAccountById } from './account-store';

export function unauthorized(message = 'Silakan masuk terlebih dahulu.') {
  return NextResponse.json({ error: message, code: 'unauthorized' }, { status: 401 });
}

/** Pengguna yang sedang masuk (sesi valid dan akunnya masih ada), atau null. */
export async function getSessionUser(req: Request): Promise<{ session: Session; id: string; email: string; fullName?: string } | null> {
  const session = readSession(req);
  if (!session) return null;
  const account = await findAccountById(session.uid);
  if (!account) return null;
  return { session, id: account.id, email: account.email, fullName: account.fullName };
}

/** Status langganan dari server (bukan dari browser). */
export async function getSubscription(userId: string): Promise<{ active: boolean; expiresAt: string | null; daysRemaining: number }> {
  const u = await getUser(userId);
  return {
    active: u?.subscription_status === 'active',
    expiresAt: u?.expires_at ?? null,
    daysRemaining: u?.days_remaining ?? 0,
  };
}
