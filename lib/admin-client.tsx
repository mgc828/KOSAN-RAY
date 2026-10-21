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

  // 15 Minutes Idle Timeout: Auto logout if no activity for 15 minutes
  const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 menit
  const LAST_ACTIVITY_KEY = 'kk_admin_last_activity';

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

  useEffect(() => {
    if (!pathname.startsWith('/admin') || pathname === '/admin/login') return;

    // Reset timestamp on mount if not set
    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }

    let lastRecorded = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastRecorded > 3000) {
        lastRecorded = now;
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Check every 5 seconds if 15 minutes of inactivity have elapsed
    const checkInterval = setInterval(() => {
      const lastActiveStr = localStorage.getItem(LAST_ACTIVITY_KEY);
      const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : Date.now();
      const idleTime = Date.now() - lastActive;

      if (idleTime >= IDLE_TIMEOUT_MS) {
        clearInterval(checkInterval);
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        toast('Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan login kembali.', 'error');
        logout();
      }
    }, 5000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      clearInterval(checkInterval);
    };
  }, [pathname, logout]);

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

