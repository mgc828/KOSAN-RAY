'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { INITIAL_KOSTS } from '@/lib/mock-data';
import { Kost, KostMedia } from '@/lib/types';
import { 
  ShieldCheck, 
  Lock, 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Phone, 
  Check, 
  Eye, 
  ArrowLeft 
} from 'lucide-react';

export default function AdminPage() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [kosts, setKosts] = useState<Kost[]>(INITIAL_KOSTS);
  const [selectedKost, setSelectedKost] = useState<Kost | null>(INITIAL_KOSTS[0]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Simple form state for adding new kost
  const [newKost, setNewKost] = useState({
    nama: '',
    alamat: '',
    area: 'Kuningan',
    harga: 2200000,
    tipe: 'campur' as 'putra' | 'putri' | 'campur',
    deskripsi: '',
    owner_whatsapp: '6281288991122',
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'kosthunt-admin-secret-2026' || passcode === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Kata sandi admin tidak tepat');
    }
  };

  const handleTogglePreview = (mediaId: string) => {
    if (!selectedKost) return;

    const updatedMedia = (selectedKost.media || []).map(m => {
      if (m.id === mediaId) {
        return { ...m, is_preview: !m.is_preview };
      }
      return m;
    });

    const updatedKost = { ...selectedKost, media: updatedMedia };
    setSelectedKost(updatedKost);
    setKosts(kosts.map(k => k.id === updatedKost.id ? updatedKost : k));
  };

  const handleSaveNewKost = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newKost.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const created: Kost = {
      id: `kost-${Date.now()}`,
      slug: `${slug}-jakarta`,
      nama: newKost.nama,
      alamat: newKost.alamat,
      area: newKost.area,
      kota: 'Jakarta',
      harga: Number(newKost.harga),
      tipe: newKost.tipe,
      fasilitas: ['AC', 'WiFi Cepat', 'Kamar Mandi Dalam', 'Kasur Springbed'],
      deskripsi: newKost.deskripsi,
      peraturan: ['Tertib dan menjaga kebersihan'],
      status: 'tersedia',
      owner_whatsapp: newKost.owner_whatsapp,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      media: [
        {
          id: `m-new-1`,
          kost_id: `kost-${Date.now()}`,
          tipe: 'foto_gedung',
          storage_key: 'new/gedung.webp',
          url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
          urutan: 1,
          is_preview: true,
          alt_text: 'Foto Gedung Baru',
        },
      ],
    };

    setKosts([created, ...kosts]);
    setSelectedKost(created);
    setShowAddModal(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900">Panel Pengelola Kost (Admin)</h1>
          <p className="text-xs text-neutral-500">
            Akses khusus kurator kost dan pengelola platform KostHunt Surabaya.
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-700">Kode Akses Admin:</label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Masukkan kode admin..."
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-neutral-400">
              Kode bawaan pengujian MVP: <code className="text-emerald-700 font-mono">admin123</code>
            </p>
          </div>

          {authError && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">{authError}</p>
          )}

          <button
            type="submit"
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-colors"
          >
            Masuk Panel Admin
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            <span>Mode Admin Terverifikasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Manajemen Kost & Kurasi Media R2
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kost Baru</span>
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs text-neutral-500 hover:text-neutral-900 px-3 py-2"
          >
            Keluar Admin
          </button>
        </div>
      </div>

      {/* Main Admin Workspace: List on left, Media editor on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kost Selector Column */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3">
          <h2 className="text-sm font-bold text-neutral-900 px-2">Daftar Kost ({kosts.length})</h2>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {kosts.map(kost => (
              <button
                key={kost.id}
                onClick={() => setSelectedKost(kost)}
                className={`w-full text-left p-3 rounded-xl transition-colors border text-xs ${
                  selectedKost?.id === kost.id
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                    : 'bg-neutral-50 border-neutral-200/60 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <p className="line-clamp-1">{kost.nama}</p>
                <p className="text-[11px] text-neutral-400 font-normal mt-0.5">
                  {kost.area} • Rp {kost.harga.toLocaleString('id-ID')}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Kost Details & R2 Media Curator */}
        {selectedKost && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{selectedKost.nama}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{selectedKost.alamat}</p>
                </div>
                <Link
                  href={`/kost/surabaya/${selectedKost.area.toLowerCase()}/${selectedKost.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Halaman Publik</span>
                </Link>
              </div>

              {/* Secure WhatsApp Display */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-500">Nomor WhatsApp Pemilik (Terkunci untuk publik):</span>
                  <p className="font-mono font-bold text-neutral-900 text-sm mt-0.5">
                    +{selectedKost.owner_whatsapp}
                  </p>
                </div>
                <span className="text-[10px] bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded">
                  Server Restricted
                </span>
              </div>

              {/* Media Curator: Cloudflare R2 & Preview Flagging */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-900">
                    Kurasi Media Cloudflare R2 ({selectedKost.media?.length || 0} Media)
                  </h4>
                  <span className="text-[11px] text-neutral-500">
                    Klik tombol untuk mengubah status <strong>is_preview</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedKost.media || []).map((m) => (
                    <div
                      key={m.id}
                      className="border border-neutral-200 rounded-xl p-3 flex items-center gap-3 bg-neutral-50/50"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
                        {m.tipe === 'video' ? (
                          <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-white">
                            <Video className="w-6 h-6 text-emerald-400" />
                          </div>
                        ) : (
                          <Image
                            src={m.url || ''}
                            alt={m.alt_text}
                            fill
                            sizes="64px"
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-800 truncate">{m.alt_text || m.storage_key}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{m.storage_key}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePreview(m.id)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                              m.is_preview
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-neutral-200 text-neutral-700 border border-neutral-300'
                            }`}
                          >
                            {m.is_preview ? 'Preview (Publik)' : 'Premium (Terkunci)'}
                          </button>
                          <span className="text-[10px] text-neutral-400 capitalize">{m.tipe}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH KOST */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-bold text-lg text-neutral-900">Tambah Listing Kost Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-800">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewKost} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-neutral-800">Nama Kost:</label>
                <input
                  type="text"
                  required
                  value={newKost.nama}
                  onChange={(e) => setNewKost({ ...newKost, nama: e.target.value })}
                  placeholder="Contoh: Kost Griya Dharmawangsa"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-800">Area Jakarta:</label>
                  <select
                    value={newKost.area}
                    onChange={(e) => setNewKost({ ...newKost, area: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Kuningan">Kuningan</option>
                    <option value="Tebet">Tebet</option>
                    <option value="Benhil">Benhil (Sudirman)</option>
                    <option value="Palmerah">Palmerah (Binus)</option>
                    <option value="Grogol">Grogol (Trisakti/Untar)</option>
                    <option value="Salemba">Salemba (UI)</option>
                    <option value="Setiabudi">Setiabudi (LRT)</option>
                    <option value="Tanjung Duren">Tanjung Duren</option>
                    <option value="Kelapa Gading">Kelapa Gading</option>
                    <option value="Cilandak">Cilandak (Fatmawati)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-800">Tipe Kost:</label>
                  <select
                    value={newKost.tipe}
                    onChange={(e) => setNewKost({ ...newKost, tipe: e.target.value as 'putra' | 'putri' | 'campur' })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="campur">Campur</option>
                    <option value="putri">Khusus Putri</option>
                    <option value="putra">Khusus Putra</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-800">Alamat Lengkap:</label>
                <input
                  type="text"
                  required
                  value={newKost.alamat}
                  onChange={(e) => setNewKost({ ...newKost, alamat: e.target.value })}
                  placeholder="Jl. Kertajaya Indah..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-800">Harga Sewa per Bulan (Rp):</label>
                <input
                  type="number"
                  required
                  value={newKost.harga}
                  onChange={(e) => setNewKost({ ...newKost, harga: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-800">Nomor WhatsApp Pemilik (Dimask untuk non-member):</label>
                <input
                  type="text"
                  required
                  value={newKost.owner_whatsapp}
                  onChange={(e) => setNewKost({ ...newKost, owner_whatsapp: e.target.value })}
                  placeholder="6281234567890"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-800">Deskripsi Kost:</label>
                <textarea
                  rows={3}
                  required
                  value={newKost.deskripsi}
                  onChange={(e) => setNewKost({ ...newKost, deskripsi: e.target.value })}
                  placeholder="Deskripsi fasilitas dan keunggulan kost..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-neutral-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Simpan Kost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
