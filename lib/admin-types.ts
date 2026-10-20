export type AdminRole = 'superadmin' | 'admin' | 'curator';

export interface AdminAccount {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  avatar?: string;
  created_at: string;
  last_login?: string;
}

export interface AdminNotification {
  id: string;
  type: 'transaction' | 'user' | 'kost' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export interface AreaItem {
  id: string;
  nama: string;
  kota: string;
  lat: number;
  lng: number;
  urutan: number;
  totalKosts?: number;
}

export interface AdminSettings {
  general: {
    price: number; // default Rp 15.000
    durationDays: number; // default 30
    freePhotos: number; // default 3
    freeVideos: number; // default 1
  };
  payment: {
    midtransServerKey: string;
    midtransClientKey: string;
    isProduction: boolean;
    webhookUrl: string;
  };
  branding: {
    logoUrl?: string;
    siteName: string;
    tagline: string;
  };
}

export interface UnlockMemberItem {
  id: string;
  user_id: string;
  email: string;
  fullName: string;
  phone?: string;
  started_at: string;
  expires_at: string;
  days_remaining: number;
  unlocks_used: number;
  status: 'active' | 'expired';
}

export interface UserManagementItem {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  created_at: string;
  subscription_status: 'active' | 'expired' | 'none';
  days_remaining: number;
  total_unlocks: number;
  total_paid: number;
  last_active: string;
  is_blocked?: boolean;
}

