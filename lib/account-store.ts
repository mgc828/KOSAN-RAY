import { dbList, dbPut, dbUpdate } from './db';

export interface RegisteredAccount {
  id: string;
  email: string;
  passwordHash: string; // Base64 / hashed representation
  fullName?: string;
  created_at: string;
}

const INITIAL_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'usr-101',
    email: 'budi.santoso@gmail.com',
    passwordHash: Buffer.from('password123').toString('base64'),
    fullName: 'Budi Santoso',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'usr-102',
    email: 'pencari.kost@example.com',
    passwordHash: Buffer.from('password123').toString('base64'),
    fullName: 'Pencari Kost Demo',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];


const ACCOUNTS = 'accounts';
const seed = () => INITIAL_ACCOUNTS;

export async function getAllAccounts(): Promise<RegisteredAccount[]> {
  return dbList<RegisteredAccount>(ACCOUNTS, seed);
}

export async function findAccountByEmail(email: string): Promise<RegisteredAccount | undefined> {
  const key = email.trim().toLowerCase();
  return (await getAllAccounts()).find((a) => a.email.toLowerCase() === key);
}

export async function findAccountById(id: string): Promise<RegisteredAccount | undefined> {
  return (await getAllAccounts()).find((a) => a.id === id);
}

export async function createAccount(
  email: string,
  password: string,
  fullName?: string
): Promise<{ success: boolean; error?: string; account?: RegisteredAccount }> {
  if (await findAccountByEmail(email)) {
    return { success: false, error: 'Email ini sudah terdaftar. Silakan masuk (login).' };
  }

  const newAccount: RegisteredAccount = {
    id: `usr-${Date.now()}`,
    email: email.trim().toLowerCase(),
    passwordHash: Buffer.from(password).toString('base64'),
    fullName: fullName || email.split('@')[0],
    created_at: new Date().toISOString(),
  };
  await dbPut<RegisteredAccount>(ACCOUNTS, newAccount, seed);
  return { success: true, account: newAccount };
}

export async function verifyAccountPassword(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; account?: RegisteredAccount }> {
  const account = await findAccountByEmail(email);
  if (!account) {
    return { success: false, error: 'Akun dengan email ini belum terdaftar. Silakan daftar terlebih dahulu.' };
  }
  if (account.passwordHash !== Buffer.from(password).toString('base64')) {
    return { success: false, error: 'Kata sandi yang Anda masukkan salah.' };
  }
  return { success: true, account };
}

/** Ganti kata sandi akun (dipakai alur "lupa kata sandi"). */
export async function updateAccountPassword(email: string, newPassword: string): Promise<boolean> {
  const acc = await findAccountByEmail(email);
  if (!acc) return false;
  await dbUpdate<RegisteredAccount>(
    ACCOUNTS,
    acc.id,
    (a) => ({ ...a, passwordHash: Buffer.from(newPassword).toString('base64') }),
    seed
  );
  return true;
}

/** Cari akun berdasarkan email; kalau belum ada, buat akun baru tanpa kata sandi (login Google). */
export async function findOrCreateOAuthAccount(email: string, fullName?: string): Promise<RegisteredAccount> {
  const existing = await findAccountByEmail(email);
  if (existing) return existing;
  const account: RegisteredAccount = {
    id: `usr-${Date.now()}`,
    email: email.trim().toLowerCase(),
    // Kata sandi acak: akun ini masuk lewat Google, bukan lewat kata sandi.
    passwordHash: Buffer.from(`oauth-${Math.random().toString(36).slice(2)}-${Date.now()}`).toString('base64'),
    fullName: fullName || email.split('@')[0],
    created_at: new Date().toISOString(),
  };
  return dbPut<RegisteredAccount>(ACCOUNTS, account, seed);
}
