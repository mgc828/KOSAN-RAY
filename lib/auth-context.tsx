'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface UserSubscription {
  status: 'active' | 'expired' | 'none';
  expiresAt: string | null;
  daysRemaining: number;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
}

type Result = { success: boolean; error?: string };

interface AuthContextType {
  user: AuthUser | null;
  subscription: UserSubscription;
  /** true setelah status login dari server selesai dimuat (supaya tampilan tidak berkedip). */
  ready: boolean;
  isLoading: boolean;
  settings: { remindersOff: boolean };
  unreadNotifications: number;
  login: (email: string, password?: string) => Promise<Result>;
  register: (email: string, password?: string, fullName?: string) => Promise<Result>;
  loginWithGoogle: (credential: string) => Promise<Result>;
  logout: () => Promise<void>;
  /** Muat ulang status login & langganan dari server (mis. setelah membayar). */
  refresh: () => Promise<void>;
  setRemindersOff: (off: boolean) => Promise<boolean>;
}

const NONE: UserSubscription = { status: 'none', expiresAt: null, daysRemaining: 0 };
const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function postAuth(body: Record<string, unknown>): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
    });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  } catch {
    return { ok: false, data: { error: 'Tidak bisa terhubung ke server. Periksa koneksi internet Anda.' } };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription>(NONE);
  const [settings, setSettings] = useState({ remindersOff: false });
  const [unreadNotifications, setUnread] = useState(0);
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        setUser(d.user ?? null);
        setSubscription(d.subscription ?? NONE);
        setSettings(d.settings ?? { remindersOff: false });
        setUnread(d.unreadNotifications ?? 0);
      } else if (res.status === 401) {
        setUser(null);
        setSubscription(NONE);
        setUnread(0);
      }
    } catch {
      /* offline: biarkan status terakhir */
    } finally {
      setReady(true);
    }
  }, []);

  // Muat status dari server saat dibuka, dan setiap tab kembali aktif (mis. setelah bayar di aplikasi lain).
  useEffect(() => {
    // Sisa data login versi lama (hanya disimpan di browser) tidak dipakai lagi.
    try {
      localStorage.removeItem('kosthunt_user');
      localStorage.removeItem('kosthunt_sub');
    } catch {
      /* diabaikan */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  const afterAuth = async (r: { ok: boolean; data: Record<string, unknown> }, fallback: string): Promise<Result> => {
    if (r.ok && r.data.success) {
      await refresh();
      return { success: true };
    }
    return { success: false, error: (r.data.error as string) || fallback };
  };

  const login = async (email: string, password = '') => {
    setIsLoading(true);
    try {
      return await afterAuth(await postAuth({ action: 'login', email, password }), 'Email atau kata sandi salah');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password = '', fullName?: string) => {
    setIsLoading(true);
    try {
      return await afterAuth(await postAuth({ action: 'register', email, password, fullName }), 'Gagal mendaftar');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ credential }),
      });
      return await afterAuth({ ok: res.ok, data: await res.json().catch(() => ({})) }, 'Login Google gagal');
    } catch {
      return { success: false, error: 'Terjadi gangguan jaringan saat login Google' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await postAuth({ action: 'logout' });
    setUser(null);
    setSubscription(NONE);
    setUnread(0);
    try {
      sessionStorage.clear();
    } catch {
      /* diabaikan */
    }
    window.location.href = '/login';
  };

  const setRemindersOff = async (off: boolean) => {
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ remindersOff: off }),
      });
      if (res.ok) {
        setSettings({ remindersOff: off });
        return true;
      }
    } catch {
      /* gagal: kembalikan false */
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        ready,
        isLoading,
        settings,
        unreadNotifications,
        login,
        register,
        loginWithGoogle,
        logout,
        refresh,
        setRemindersOff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
