'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSession } from './admin-session';
import { toast } from './toast';

interface AdminContextType {
  admin: AdminSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.admin) {
          setAdmin(data.admin);
          setIsLoading(false);
          return true;
        }
      }
      setAdmin(null);
      setIsLoading(false);
      return false;
    } catch {
      setAdmin(null);
      setIsLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    checkSession().then((isAuth) => {
      if (!isMounted) return;
      if (!isAuth && pathname.startsWith('/admin') && pathname !== '/admin/login') {
        toast('Sesi berakhir, silakan login ulang', 'error');
        router.push('/admin/login');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [checkSession, pathname, router]);

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'login', email, password, rememberMe }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdmin(data.admin);
        return { success: true };
      }
      return { success: false, error: data.error || 'Email atau password salah' };
    } catch {
      return { success: false, error: 'Gagal terhubung ke server autentikasi' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'logout' }),
      });
    } finally {
      setAdmin(null);
      toast('Berhasil keluar dari sesi admin', 'info');
      router.push('/admin/login');
    }
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an AdminAuthProvider');
  }
  return ctx;
}

