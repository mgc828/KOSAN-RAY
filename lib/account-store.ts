import bcrypt from 'bcryptjs';
import { dbList, dbPut, dbUpdate } from './db';

export const BCRYPT_SALT_ROUNDS = process.env.NODE_ENV === 'test' ? 1 : 10;

export interface RegisteredAccount {
  id: string;
  email: string;
  passwordHash: string; // bcrypt hash ($2a$ / $2b$) atau warisan Base64
  fullName?: string;
  created_at: string;
}

// Akun demo berkata sandi publik hanya untuk pengembangan lokal; tidak pernah di-seed di production.
const DEMO_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'usr-101',
    email: 'budi.santoso@gmail.com',
    passwordHash: bcrypt.hashSync('password123', BCRYPT_SALT_ROUNDS),
    fullName: 'Budi Santoso',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'usr-102',
    email: 'pencari.kost@example.com',
    passwordHash: bcrypt.hashSync('password123', BCRYPT_SALT_ROUNDS),
    fullName: 'Pencari Kost Demo',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_ACCOUNTS: RegisteredAccount[] = process.env.NODE_ENV === 'production' ? [] : DEMO_ACCOUNTS;

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

  // Hash satu arah menggunakan bcryptjs dengan salt rounds 10
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const newAccount: RegisteredAccount = {
    id: `usr-${Date.now()}`,
    email: email.trim().toLowerCase(),
    passwordHash,
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

  let isValid = false;
  const storedHash = account.passwordHash;

  // 1. Verifikasi dengan bcrypt jika hash berawalan $2a$ atau $2b$
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    isValid = await bcrypt.compare(password, storedHash);
  } else {
    // 2. Fallback backward compatibility untuk akun lama yang masih menggunakan Base64
    const legacyBase64 = Buffer.from(password).toString('base64');
    if (storedHash === legacyBase64) {
      isValid = true;
      // Otomatis upgrade ke bcryptjs (salt round 10) saat login berhasil
      try {
        const upgradedHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        await dbUpdate<RegisteredAccount>(
          ACCOUNTS,
          account.id,
          (a) => ({ ...a, passwordHash: upgradedHash }),
          seed
        );
        account.passwordHash = upgradedHash;
      } catch (upgradeErr) {
        console.warn('Gagal migrasi otomatis hash sandi akun lama ke bcrypt:', upgradeErr);
      }
    }
  }

  if (!isValid) {
    return { success: false, error: 'Kata sandi yang Anda masukkan salah.' };
  }
  return { success: true, account };
}

/** Ganti kata sandi akun (dipakai alur "lupa kata sandi"). */
export async function updateAccountPassword(email: string, newPassword: string): Promise<boolean> {
  const acc = await findAccountByEmail(email);
  if (!acc) return false;
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
  await dbUpdate<RegisteredAccount>(
    ACCOUNTS,
    acc.id,
    (a) => ({ ...a, passwordHash }),
    seed
  );
  return true;
}

/** Cari akun berdasarkan email; kalau belum ada, buat akun baru tanpa kata sandi (login Google). */
export async function findOrCreateOAuthAccount(email: string, fullName?: string): Promise<RegisteredAccount> {
  const existing = await findAccountByEmail(email);
  if (existing) return existing;
  const randomSecret = `oauth-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  const passwordHash = await bcrypt.hash(randomSecret, BCRYPT_SALT_ROUNDS);
  const account: RegisteredAccount = {
    id: `usr-${Date.now()}`,
    email: email.trim().toLowerCase(),
    // Kata sandi acak di-hash dengan bcrypt: akun ini masuk lewat Google, bukan lewat kata sandi.
    passwordHash,
    fullName: fullName || email.split('@')[0],
    created_at: new Date().toISOString(),
  };
  return dbPut<RegisteredAccount>(ACCOUNTS, account, seed);
}
