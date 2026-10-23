'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  ShieldCheck,
  Globe,
  Save,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Sliders,
  MousePointerClick
} from 'lucide-react';
import { useAdmin } from '@/lib/admin-client';
import { toast as addToast } from '@/lib/toast';
import { AdminSettings, AdminAccount } from '@/lib/admin-types';

export default function AdminPengaturanPage() {
  const { admin } = useAdmin();

  const [activeTab, setActiveTab] = useState<'umum' | 'pembayaran' | 'admin' | 'branding' | 'tools'>('umum');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<AdminSettings>({
    general: {
      price: 15000,
      durationDays: 30,
      freePhotos: 3,
      freeVideos: 1,
    },
    payment: {
      midtransServerKey: 'SB-Mid-server-YOUR_SERVER_KEY_SANDBOX',
      midtransClientKey: 'SB-Mid-client-YOUR_CLIENT_KEY_SANDBOX',
      isProduction: false,
      webhookUrl: 'https://kosan-ray.vercel.app/api/payment/webhook',
    },
    branding: {
      siteName: 'Kost-Kostan',
      tagline: 'Cari kost terasa lebih mudah bersama Kost-Kostan',
      logoUrl: '/maskot-kost.svg',
    },
    tools: {
      enableUiCustomizer: false,
      enableElementInspector: false,
    },
  });

  // Toggle show keys
  const [showServerKey, setShowServerKey] = useState(false);
  const [showClientKey, setShowClientKey] = useState(false);

  // Admin accounts list
  const [admins, setAdmins] = useState<AdminAccount[]>([
    {
      id: 'adm-1',
      name: 'Super Admin',
      email: 'admin@kost-kostan.id',
      role: 'superadmin',
      created_at: '2026-01-01T00:00:00Z',
    },
  ]);

  // Form Tambah Admin
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'superadmin' | 'admin'>('admin');

  // Change Password Self
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data?type=settings');
      const data = await res.json();
      if (data.settings) {
        const loadedTools = data.settings.tools || {
          enableUiCustomizer: false,
          enableElementInspector: false,
        };
        setSettings({
          ...data.settings,
          tools: loadedTools,
        });
      }
    } catch {
      addToast('Gagal memuat pengaturan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Saklar alat bantu berlaku GLOBAL: langsung disimpan ke server sehingga semua pengunjung ikut berubah
  const handleToggleTool = async (tool: 'enableUiCustomizer' | 'enableElementInspector') => {
    const curVal = Boolean(settings.tools?.[tool]);
    const newVal = !curVal;
    const label = tool === 'enableUiCustomizer' ? 'UI' : 'Inspect';

    const updatedSettings = {
      ...settings,
      tools: {
        enableUiCustomizer: settings.tools?.enableUiCustomizer ?? false,
        enableElementInspector: settings.tools?.enableElementInspector ?? false,
        [tool]: newVal,
      },
    };

    setSettings(updatedSettings);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'settings_save', settings: updatedSettings }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || 'gagal');
      window.dispatchEvent(new Event('kk-tools-settings-changed'));
      addToast(`Tombol floating ${label} ${newVal ? 'diaktifkan (ON) 🟢' : 'dinonaktifkan (OFF) ⚪'} untuk semua pengguna`, 'info');
    } catch {
      setSettings(settings); // kembalikan tampilan saklar bila gagal disimpan
      addToast(`Gagal menyimpan saklar ${label}. Coba lagi.`, 'error');
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'settings_save',
          settings,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Pengaturan berhasil disimpan permanen ke database Supabase! ✅', 'success');
      } else {
        addToast(data.message || 'Gagal menyimpan pengaturan', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(settings.payment.webhookUrl);
    addToast('URL Webhook berhasil disalin! 📋', 'info');
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail || !newAdminPass) {
      addToast('Semua field admin baru wajib diisi', 'error');
      return;
    }

    const newAcc: AdminAccount = {
      id: 'adm-' + Date.now(),
      fullName: newAdminName,
      email: newAdminEmail,
      role: newAdminRole,
      created_at: new Date().toISOString(),
    };

    setAdmins([...admins, newAcc]);
    setShowAddAdminModal(false);
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPass('');
    addToast(`Admin ${newAdminName} berhasil ditambahkan! ✅`, 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast('Kata sandi saat ini dan kata sandi baru wajib diisi', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Konfirmasi kata sandi tidak cocok!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Kata sandi baru minimal 6 karakter', 'error');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    addToast('Kata sandi admin berhasil diperbarui! ✅', 'success');
  };

  // Reusable Component for Tool Toggle Cards
  const renderToolsToggles = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-orange-500" />
          Tombol Floating On/Off (UI Customizer & Element Inspector)
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur tombol melayang yang bisa digeser-geser di pojok layar pengguna pada tampilan publik:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Toggle UI Customizer */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shadow-xs">
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px] shrink-0 shadow-sm">
                UI
              </span>
              <span>Tombol Floating "UI"</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Tombol kuning draggable untuk edit live tema, warna, dan gaya visual.
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleToggleTool('enableUiCustomizer')}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.tools?.enableUiCustomizer ? 'bg-orange-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  settings.tools?.enableUiCustomizer ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-[10px] font-bold text-slate-600">
              {settings.tools?.enableUiCustomizer ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Toggle Element Inspector */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shadow-xs">
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-orange-400 flex items-center justify-center font-black text-[10px] shrink-0 shadow-sm">
                <MousePointerClick className="w-3.5 h-3.5" />
              </span>
              <span>Tombol Floating "Inspect"</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Tombol gelap draggable untuk inspeksi tag HTML dan copy selector elemen.
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleToggleTool('enableElementInspector')}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.tools?.enableElementInspector ? 'bg-orange-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  settings.tools?.enableElementInspector ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-[10px] font-bold text-slate-600">
              {settings.tools?.enableElementInspector ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pengaturan Sistem</h1>
          <p className="text-xs text-slate-500">
            Konfigurasi tarif unlock pass, kredensial payment gateway Midtrans, tombol UI & Inspect, dan branding
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-orange-500/20 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Menyimpan...' : 'Simpan Semua'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('umum')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'umum'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>1. Umum & Tarif</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'tools'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4 text-orange-400" />
          <span>2. Tombol UI & Inspect</span>
        </button>

        <button
          onClick={() => setActiveTab('pembayaran')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'pembayaran'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>3. Pembayaran (Midtrans)</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'admin'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>4. Akun Admin</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'branding'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>5. Branding & Teks</span>
        </button>
      </div>

      {/* Tab 1: Umum */}
      {activeTab === 'umum' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Konfigurasi Tarif Unlock Pass & Paywall
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Harga Pass Unlock (Rp)
              </label>
              <input
                type="number"
                value={settings.general.price}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, price: Number(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Default: Rp 15.000 (berlaku untuk semua metode pembayaran)
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Durasi Akses Unlock (Hari)
              </label>
              <input
                type="number"
                value={settings.general.durationDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, durationDays: Number(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default: 30 hari akses penuh</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Batas Konten Gratis Sebelum Paywall
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-slate-600 block mb-1">
                  Jumlah Foto Gratis yang Ditampilkan Publik
                </label>
                <input
                  type="number"
                  value={settings.general.freePhotos}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, freePhotos: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 font-medium text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">Default: 3 foto gratis</p>
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1">
                  Jumlah Video Gratis yang Ditampilkan Publik
                </label>
                <input
                  type="number"
                  value={settings.general.freeVideos}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, freeVideos: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 font-medium text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">Default: 1 video tour gratis</p>
              </div>
            </div>
          </div>

          {/* Quick Tools Section inside Tab Umum */}
          <div className="border-t border-slate-100 pt-5">
            {renderToolsToggles()}
          </div>
        </div>
      )}

      {/* Tab 2: Tombol UI & Inspect */}
      {activeTab === 'tools' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-orange-500" />
                Kontrol Tombol Floating UI & Inspect
              </h2>
              <p className="text-xs text-slate-500">
                Pilih apakah tombol mengambang yang bisa digeser ditampilkan atau disembunyikan dari layar publik
              </p>
            </div>
          </div>

          {renderToolsToggles()}

          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>💡 Petunjuk Penggunaan:</span>
            </p>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              - Jika diatur ke <strong>OFF</strong>, kedua tombol tersebut tidak akan muncul sama sekali di layar pengguna saat membuka web publik.<br />
              - Jika diatur ke <strong>ON</strong>, tombol akan muncul mengambang dan bisa digeser-geser sesuai kebutuhan.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Pembayaran Midtrans */}
      {activeTab === 'pembayaran' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Kredensial Gateway Midtrans Snap
            </h2>

            {/* Toggle Environment Switch */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">
                Mode: {settings.payment.isProduction ? 'Production 🚀' : 'Sandbox (Test) 🛠️'}
              </span>
              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    payment: { ...settings.payment, isProduction: !settings.payment.isProduction },
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.payment.isProduction ? 'bg-orange-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.payment.isProduction ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Server Key */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Midtrans Server Key
              </label>
              <div className="relative">
                <input
                  type={showServerKey ? 'text' : 'password'}
                  value={settings.payment.midtransServerKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, midtransServerKey: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowServerKey(!showServerKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showServerKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Client Key */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Midtrans Client Key
              </label>
              <div className="relative">
                <input
                  type={showClientKey ? 'text' : 'password'}
                  value={settings.payment.midtransClientKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      payment: { ...settings.payment, midtransClientKey: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowClientKey(!showClientKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showClientKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Webhook URL with Copy Button */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                URL Webhook / Notification URL Midtrans
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={settings.payment.webhookUrl}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-700"
                />
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  <span>Salin URL</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Masukkan URL ini ke dashboard Midtrans {`>`} Settings {`>`} Configuration {`>`} Payment Notification URL
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Akun Admin */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          {/* Daftar Admin */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Daftar Akun Administrator</h2>
                <p className="text-xs text-slate-500">Akses kontrol dan peran staf pengelola</p>
              </div>

              <button
                onClick={() => setShowAddAdminModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Admin</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {admins.map((adm) => (
                <div key={adm.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-bold flex items-center justify-center">
                      {(adm.fullName || adm.email).substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{adm.fullName || 'Admin'}</div>
                      <div className="text-[11px] text-slate-400">{adm.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        adm.role === 'superadmin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {adm.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(adm.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Ganti Password Akun Aktif */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Ubah Kata Sandi ({admin?.email || 'admin@kost-kostan.id'})
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Simpan Kata Sandi Baru
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 5: Branding & Teks */}
      {activeTab === 'branding' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Identitas Brand & Teks Hero Publik
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Nama Platform
              </label>
              <input
                type="text"
                value={settings.branding.siteName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, siteName: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Tagline Utama (Sinkron ke Hero Halaman Depan)
              </label>
              <input
                type="text"
                value={settings.branding.tagline}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, tagline: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Akan ditampilkan pada header pencarian dan title SEO
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                URL Logo / Maskot
              </label>
              <input
                type="text"
                value={settings.branding.logoUrl}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, logoUrl: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Admin */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddAdmin}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Tambah Administrator Baru</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="budi@kost-kostan.id"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kata Sandi</label>
                <input
                  type="password"
                  required
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Peran (Role)</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="admin">Admin (Kelola Kost & Media)</option>
                  <option value="superadmin">Super Admin (Akses Penuh)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddAdminModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold"
              >
                Tambah Admin
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
