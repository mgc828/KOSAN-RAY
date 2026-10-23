'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Home, 
  MapPin, 
  Users, 
  CreditCard, 
  Unlock, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Search, 
  LogOut, 
  ExternalLink,
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Menu
} from 'lucide-react';
import { useAdmin } from '@/lib/admin-client';
import { AdminNotification } from '@/lib/admin-types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Data Kost', href: '/admin/kost', icon: Home },
  { name: 'Area & Zona', href: '/admin/area', icon: MapPin },
  { name: 'Pengguna', href: '/admin/pengguna', icon: Users },
  { name: 'Transaksi', href: '/admin/transaksi', icon: CreditCard },
  { name: 'Akses Unlock', href: '/admin/unlock', icon: Unlock },
  { name: 'Laporan', href: '/admin/laporan', icon: BarChart3 },
  { name: 'Arsitektur & Alur', href: '/admin/arsitektur', icon: Compass },
  { name: 'Pengaturan', href: '/admin/pengaturan', icon: Settings },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout, isAuthenticated, isLoading } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ kosts: any[]; users: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState<AdminNotification[]>([
    {
      id: 'notif-1',
      type: 'transaction',
      title: 'Transaksi QRIS Berhasil',
      message: 'User rizki.pratama@gmail.com berhasil bayar Rp 15.000.',
      time: '5 menit lalu',
      read: false,
      link: '/admin/transaksi',
    },
    {
      id: 'notif-2',
      type: 'kost',
      title: 'Kost Baru Menunggu Aktivasi',
      message: 'Kost Tebet Barat Asri (Draft) perlu diverifikasi.',
      time: '25 menit lalu',
      read: false,
      link: '/admin/kost',
    },
    {
      id: 'notif-3',
      type: 'user',
      title: 'User Baru Terdaftar',
      message: 'melati.kusuma@outlook.com baru bergabung.',
      time: '1 jam lalu',
      read: true,
      link: '/admin/pengguna',
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search handler
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }

    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [resKosts, resUsers] = await Promise.all([
          fetch('/api/admin/data?type=kosts').then(r => r.json()).catch(() => ({ kosts: [] })),
          fetch('/api/admin/data?type=users').then(r => r.json()).catch(() => ({ users: [] })),
        ]);

        const q = searchQuery.toLowerCase();
        const matchedKosts = (resKosts.kosts || []).filter((k: any) => 
          k.nama?.toLowerCase().includes(q) || k.area?.toLowerCase().includes(q)
        ).slice(0, 4);

        const matchedUsers = (resUsers.users || []).filter((u: any) => 
          u.email?.toLowerCase().includes(q) || u.fullName?.toLowerCase().includes(q)
        ).slice(0, 4);

        setSearchResults({ kosts: matchedKosts, users: matchedUsers });
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [searchQuery]);

  // If on login page, render children directly
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Page title generator
  const currentNav = NAV_ITEMS.find(item => item.href === pathname || (item.href !== '/admin' && pathname.startsWith(item.href)));
  const pageTitle = currentNav ? currentNav.name : 'Admin Panel';

  // Breadcrumbs
  const pathParts = pathname.split('/').filter(Boolean).slice(1); // skip 'admin'
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800 antialiased">
      {/* 1. SIDEBAR (Collapsible, Navy #0F2A43) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-[#0F2A43] text-white flex flex-col justify-between transition-all duration-300 shadow-xl ${
          collapsed ? 'w-16' : 'w-72'
        } max-md:hidden`}
      >
        <div>
          {/* Brand & Collapse Header */}
          <div className={`h-20 flex items-center border-b border-white/10 transition-all ${
            collapsed ? 'px-0 justify-center' : 'px-5 justify-between'
          }`}>
            {!collapsed && (
              <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px] rounded-xl bg-[#F97316] flex items-center justify-center shrink-0 shadow-md">
                  <Compass className="w-5 h-5 text-slate-900" />
                </div>
                <div className="truncate">
                  <span className="font-black text-2xl tracking-tight block leading-tight text-white">Kost-Kostan</span>
                  <span className="text-[10px] text-[#F97316] font-extrabold uppercase tracking-widest">Admin Portal</span>
                </div>
              </Link>
            )}

            {collapsed && (
              <Link href="/admin" title="Kost-Kostan Admin" className="flex justify-center items-center">
                <div className="w-9 h-9 min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px] rounded-xl bg-[#F97316] flex items-center justify-center shrink-0 shadow-md">
                  <Compass className="w-5 h-5 text-slate-900" />
                </div>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
              className={`p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ${
                collapsed ? 'hidden' : 'block'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-3.5 space-y-3 overflow-y-auto max-h-[calc(100vh-160px)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold border transition-all duration-200 ${
                    isActive
                      ? 'bg-[#F97316] text-white border-[#F97316] shadow-md shadow-[#F97316]/25'
                      : 'border-transparent text-white/80 hover:border-[#F97316] hover:bg-orange-50/15 hover:text-white'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Toggle when collapsed & User Profile at Bottom */}
        <div className="p-3 border-t border-white/10">
          {collapsed && (
            <div className="mb-2 flex justify-center">
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Perluas Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className={`flex items-center gap-3 rounded-xl p-2 bg-white/5 ${collapsed ? 'justify-center p-1.5' : ''}`}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Admin Avatar"
              className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {admin?.name || 'Super Admin'}
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold block">Online • Superadmin</span>
              </div>
            )}
            <button
              type="button"
              onClick={logout}
              title="Keluar dari Admin"
              className="p-1.5 text-white/60 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WRAPPER */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'md:pl-16' : 'md:pl-72'
        }`}
      >
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 h-20 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs">
          {/* Left: Mobile hamburger & Title/Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Link href="/admin" className="hover:text-slate-700">Admin</Link>
                {pathParts.map((part, idx) => (
                  <React.Fragment key={part}>
                    <span>/</span>
                    <span className="capitalize text-slate-600">{part}</span>
                  </React.Fragment>
                ))}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Center/Right: Search, Notifications, Site Link */}
          <div className="flex items-center gap-3">
            {/* Global Search Bar */}
            <div ref={searchRef} className="relative hidden sm:block w-52 md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama kost atau user..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white transition-all"
              />

              {/* Search Result Dropdown */}
              {searchResults && (
                <div className="absolute right-0 left-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 p-2 text-xs divide-y divide-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">Kost</span>
                    {searchResults.kosts.length > 0 ? (
                      searchResults.kosts.map((k) => (
                        <Link
                          key={k.id}
                          href={`/admin/kost`}
                          onClick={() => setSearchResults(null)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <span className="font-bold text-slate-800 truncate">{k.nama}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{k.area}</span>
                        </Link>
                      ))
                    ) : (
                      <p className="px-2 py-1 text-slate-400 italic">Tidak ada kost cocok</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">Pengguna</span>
                    {searchResults.users.length > 0 ? (
                      searchResults.users.map((u) => (
                        <Link
                          key={u.id}
                          href="/admin/pengguna"
                          onClick={() => setSearchResults(null)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <span className="font-bold text-slate-800 truncate">{u.fullName || u.email}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">{u.subscription_status}</span>
                        </Link>
                      ))
                    ) : (
                      <p className="px-2 py-1 text-slate-400 italic">Tidak ada user cocok</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell with Dropdown */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
                title="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 bg-[#0F2A43] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#F97316]" />
                      <span className="font-bold text-xs">Pemberitahuan Sistem</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[11px] text-[#F97316] hover:underline font-semibold"
                      >
                        Tandai sudah dibaca
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.link || '#'}
                        onClick={() => setNotificationsOpen(false)}
                        className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors text-xs ${
                          !n.read ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-[#F97316]' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 leading-tight">{n.title}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="p-2.5 text-center bg-slate-50 border-t border-slate-100">
                    <Link
                      href="/admin/transaksi"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[11px] text-[#0F2A43] font-bold hover:underline"
                    >
                      Lihat semua riwayat aktivitas →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Link to Public Website */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#0F2A43] text-white hover:bg-[#163a5d] shadow-sm transition-all"
            >
              <span>Web Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative w-64 bg-[#0F2A43] text-white flex flex-col justify-between p-4 shadow-2xl z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center">
                    <Compass className="w-5 h-5 text-slate-900" />
                  </div>
                  <span className="font-black text-white">Kost-Kostan</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-[#F97316] text-white'
                          : 'text-white/75 hover:bg-white/10 text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/80 font-bold truncate">{admin?.name || 'Admin'}</span>
              <button
                type="button"
                onClick={logout}
                className="text-rose-400 p-2 hover:bg-white/10 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

