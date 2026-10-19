import { dbList, dbPut, dbRemove, dbUpdate } from './db';

export type TransactionStatus = 'settlement' | 'pending' | 'expire' | 'cancel' | 'deny' | 'failure';

export interface PaymentTransaction {
  id: string;
  order_id: string;
  user_id: string;
  user_email: string;
  amount: number;
  payment_method: string;
  transaction_status: TransactionStatus;
  created_at: string;
  paid_at?: string;
  /** Alamat gambar QR dari Midtrans (jika pembayaran asli). */
  qr_url?: string;
  /** Batas waktu pembayaran (ISO). */
  expires_at?: string;
  /** Pembayaran lewat Midtrans asli atau mode demo. */
  gateway?: 'midtrans' | 'demo';
  midtrans_transaction_id?: string;
}

export interface AppUser {
  id: string;
  email: string;
  password?: string;
  fullName?: string;
  subscription_status: 'active' | 'expired' | 'none';
  expires_at: string | null;
  days_remaining: number;
  total_paid: number;
  created_at: string;
  /** true = pengguna mematikan email pengingat. */
  reminders_off?: boolean;
  /** Penanda pengingat yang sudah dikirim untuk masa aktif tertentu (agar tidak dobel). */
  reminded?: Record<string, string>;
}

const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx-001',
    order_id: 'KH-10K-1718881230-A91B',
    user_id: 'usr-101',
    user_email: 'budi.santoso@gmail.com',
    amount: 10000,
    payment_method: 'QRIS (GoPay)',
    transaction_status: 'settlement',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 45000).toISOString(),
  },
  {
    id: 'tx-002',
    order_id: 'KH-10K-1718894100-F4C2',
    user_id: 'usr-102',
    user_email: 'siti.nurhaliza@yahoo.com',
    amount: 10000,
    payment_method: 'QRIS (ShopeePay)',
    transaction_status: 'settlement',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 32000).toISOString(),
  },
  {
    id: 'tx-003',
    order_id: 'KH-10K-1718910400-K8L9',
    user_id: 'usr-103',
    user_email: 'dimas.pratama@outlook.com',
    amount: 10000,
    payment_method: 'QRIS (DANA)',
    transaction_status: 'pending',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-101',
    email: 'budi.santoso@gmail.com',
    subscription_status: 'active',
    expires_at: new Date(Date.now() + 28 * 24 * 3600 * 1000).toISOString(),
    days_remaining: 28,
    total_paid: 10000,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'usr-102',
    email: 'siti.nurhaliza@yahoo.com',
    subscription_status: 'active',
    expires_at: new Date(Date.now() + 29 * 24 * 3600 * 1000).toISOString(),
    days_remaining: 29,
    total_paid: 10000,
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'usr-103',
    email: 'dimas.pratama@outlook.com',
    subscription_status: 'none',
    expires_at: null,
    days_remaining: 0,
    total_paid: 0,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'usr-104',
    email: 'pencari.kost@example.com',
    subscription_status: 'active',
    expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    days_remaining: 30,
    total_paid: 20000,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];


const TX = 'transactions';
const USERS = 'users';
const txSeed = () => INITIAL_TRANSACTIONS;
const userSeed = () => INITIAL_USERS;

function recalcRemaining(u: AppUser): AppUser {
  if (!u.expires_at) {
    return { ...u, subscription_status: 'none', days_remaining: 0 };
  }
  const exp = new Date(u.expires_at).getTime();
  const now = Date.now();
  if (exp > now) {
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return { ...u, subscription_status: 'active', days_remaining: diff };
  }
  return { ...u, subscription_status: 'expired', days_remaining: 0 };
}

// ---------------- TRANSACTIONS ----------------
export async function getAllTransactions(): Promise<PaymentTransaction[]> {
  return dbList<PaymentTransaction>(TX, txSeed);
}

export async function getTransactionByOrderId(orderId: string): Promise<PaymentTransaction | undefined> {
  return (await getAllTransactions()).find((t) => t.order_id === orderId);
}

export async function getTransactionsByUser(userId: string): Promise<PaymentTransaction[]> {
  return (await getAllTransactions()).filter((t) => t.user_id === userId);
}

/** Simpan transaksi baru, atau gabungkan ke transaksi dengan order_id yang sama. */
export async function saveTransaction(tx: PaymentTransaction): Promise<PaymentTransaction> {
  const existing = await getTransactionByOrderId(tx.order_id);
  const merged = existing ? { ...existing, ...tx, id: existing.id } : tx;
  return dbPut<PaymentTransaction>(TX, merged, txSeed);
}

// ---------------- USERS ----------------
export async function getAllUsers(): Promise<AppUser[]> {
  return (await dbList<AppUser>(USERS, userSeed)).map(recalcRemaining);
}

export async function getUser(idOrEmail: string): Promise<AppUser | undefined> {
  const key = idOrEmail.toLowerCase();
  const all = await getAllUsers();
  // Id selalu didahulukan; email hanya cadangan (jangan sampai rekaman lama beremail sama menimpa id yang tepat).
  return all.find((u) => u.id === idOrEmail) ?? all.find((u) => u.email.toLowerCase() === key);
}

export async function saveUser(user: AppUser): Promise<AppUser> {
  const all = await getAllUsers();
  const byId = all.find((u) => u.id === user.id);
  // Rekaman lama dengan email sama tetapi id berbeda (akun dibuat ulang): pindahkan ke id akun yang sekarang.
  const legacy = byId ? undefined : all.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
  const base = byId ?? legacy;
  const merged = recalcRemaining(base ? { ...base, ...user, id: user.id } : user);
  await dbPut<AppUser>(USERS, merged, userSeed);
  if (legacy && legacy.id !== user.id) await dbRemove(USERS, legacy.id, userSeed);
  return merged;
}

/** Perpanjang langganan. Kalau masih aktif, ditambahkan di belakang tanggal berakhir lama. */
export async function extendUserSubscription(userIdOrEmail: string, addDays: number): Promise<AppUser | null> {
  const user = await getUser(userIdOrEmail);
  if (!user) return null;

  const now = new Date();
  const base = user.expires_at && new Date(user.expires_at) > now ? new Date(user.expires_at) : now;
  const nextExpires = new Date(base.getTime() + addDays * 24 * 3600 * 1000);

  return saveUser({
    ...user,
    subscription_status: 'active',
    expires_at: nextExpires.toISOString(),
    days_remaining: Math.ceil((nextExpires.getTime() - now.getTime()) / (1000 * 3600 * 24)),
  });
}

export async function revokeUserSubscription(userIdOrEmail: string): Promise<AppUser | null> {
  const user = await getUser(userIdOrEmail);
  if (!user) return null;
  return saveUser({
    ...user,
    subscription_status: 'expired',
    expires_at: new Date(Date.now() - 1000).toISOString(),
    days_remaining: 0,
  });
}

/** Ubah sebagian field pengguna (mis. penanda pengingat). */
export async function patchUser(id: string, patch: Partial<AppUser>): Promise<AppUser | undefined> {
  return dbUpdate<AppUser>(USERS, id, (u) => ({ ...u, ...patch }), userSeed);
}
