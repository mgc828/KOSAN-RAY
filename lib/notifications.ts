import { dbList, dbPut, dbUpdate } from './db';

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'payment' | 'reminder' | 'review' | 'system';
  title: string;
  body: string;
  href?: string;
  created_at: string;
  read: boolean;
}

const C = 'notifications';

export async function createNotification(n: Omit<AppNotification, 'id' | 'created_at' | 'read'>): Promise<AppNotification> {
  const doc: AppNotification = {
    ...n,
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
    read: false,
  };
  return dbPut<AppNotification>(C, doc);
}

export async function listNotifications(userId: string, limit = 30): Promise<AppNotification[]> {
  return (await dbList<AppNotification>(C)).filter((n) => n.user_id === userId).slice(0, limit);
}

export async function unreadCount(userId: string): Promise<number> {
  return (await dbList<AppNotification>(C)).filter((n) => n.user_id === userId && !n.read).length;
}

/** Tandai satu notifikasi (atau semuanya) sudah dibaca. */
export async function markRead(userId: string, id: string | 'all'): Promise<void> {
  const mine = (await dbList<AppNotification>(C)).filter((n) => n.user_id === userId && !n.read && (id === 'all' || n.id === id));
  for (const n of mine) {
    await dbUpdate<AppNotification>(C, n.id, (cur) => ({ ...cur, read: true }));
  }
}
