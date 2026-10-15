'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase/client';

export interface UserSubscription {
  status: 'active' | 'expired' | 'none';
  expiresAt: string | null;
  daysRemaining: number;
}

interface AuthContextType {
  user: { id: string; email: string } | null;
  subscription: UserSubscription;
  isLoading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  activateSubscription: (days?: number) => void;
  resetSubscription: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('kosthunt_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    if (typeof window === 'undefined') {
      return { status: 'none', expiresAt: null, daysRemaining: 0 };
    }
    try {
      const stored = localStorage.getItem('kosthunt_sub');
      if (stored) {
        const subData = JSON.parse(stored);
        if (subData.expiresAt) {
          const expiresDate = new Date(subData.expiresAt).getTime();
          const now = Date.now();
          if (now < expiresDate) {
            const diffDays = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));
            return {
              status: 'active',
              expiresAt: subData.expiresAt,
              daysRemaining: diffDays,
            };
          } else {
            return {
              status: 'expired',
              expiresAt: subData.expiresAt,
              daysRemaining: 0,
            };
          }
        }
      }
    } catch {
      // ignore
    }
    return { status: 'none', expiresAt: null, daysRemaining: 0 };
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync with Supabase session if configured
  useEffect(() => {

    // Check if Supabase has an active session
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
        }
      });

      const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
        } else {
          // Keep local if not supabase
        }
      });

      return () => {
        authSub.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) return { success: false, error: error.message };
      }
      
      const dummyUser = { id: `usr-${Date.now()}`, email };
      setUser(dummyUser);
      localStorage.setItem('kosthunt_user', JSON.stringify(dummyUser));
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: (e as Error).message || 'Gagal login' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string) => {
    return login(email);
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('kosthunt_user');
  };

  const activateSubscription = (days = 30) => {
    const now = new Date();
    let newExpires: Date;

    // Perpanjangan: Jika masih aktif, tambahkan ke expires_at lama. Jika baru/kadaluarsa, dari now.
    if (subscription.status === 'active' && subscription.expiresAt) {
      const oldExpires = new Date(subscription.expiresAt);
      newExpires = new Date(oldExpires.getTime() + days * 24 * 60 * 60 * 1000);
    } else {
      newExpires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

    const isoStr = newExpires.toISOString();
    const diffDays = Math.ceil((newExpires.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    const newSub: UserSubscription = {
      status: 'active',
      expiresAt: isoStr,
      daysRemaining: diffDays,
    };

    setSubscription(newSub);
    localStorage.setItem('kosthunt_sub', JSON.stringify(newSub));

    // Pastikan user dummy ada jika belum login
    if (!user) {
      const defaultUser = { id: `usr-demo-${Date.now()}`, email: 'pencari.kost@example.com' };
      setUser(defaultUser);
      localStorage.setItem('kosthunt_user', JSON.stringify(defaultUser));
    }
  };

  const resetSubscription = () => {
    const expiredSub: UserSubscription = {
      status: 'none',
      expiresAt: null,
      daysRemaining: 0,
    };
    setSubscription(expiredSub);
    localStorage.removeItem('kosthunt_sub');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        isLoading,
        login,
        register,
        logout,
        activateSubscription,
        resetSubscription,
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
