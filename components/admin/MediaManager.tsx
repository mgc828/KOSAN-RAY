'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Video,
  Upload,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Star,
  ArrowUp,
  ArrowDown,
  Trash2,
  AlertTriangle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { KostMedia } from '@/lib/types';
import { toast } from '@/lib/toast';
import { deleteStoredMedia, initUpload, putToStorage } from '@/lib/media-client';

interface MediaManagerProps {
  value: KostMedia[];
  onChange: (next: KostMedia[]) => void;
  /** ID kost bila sudah ada; kosong saat kost baru (diisi server ketika disimpan). */
  kostId?: string;
  /** Dipanggil saat berkas yang sudah tersimpan di database dihapus dari daftar; hapus file-nya setelah kost disimpan. */
  onStoredKeyRemoved?: (key: string) => void;
}

const isStored = (key: string) => key.startsWith('uploads/');

export default function MediaManager({ value, onChange, kostId = '', onStoredKeyRemoved }: MediaManagerProps) {
  const [activeTab, setActiveTab] = useState<'foto' | 'video'>('foto');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);

  const [newUrlInput, setNewUrlInput] = useState('');
  const [newAltInput, setNewAltInput] = useState('');
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);

  // Nilai terbaru untuk unggahan beruntun, dan berkas yang diunggah pada sesi ini (belum disimpan ke database)
  const latest = useRef<KostMedia[]>(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);
  const sessionKeys = useRef<Set<string>>(new Set());

  const photos = useMemo(() => value.filter((m) => m.tipe === 'foto_kamar' || m.tipe === 'foto_gedung'), [value]);
  const videos = useMemo(() => value.filter((m) => m.tipe === 'video'), [value]);

  const photoCountValid = photos.length >= 3;
  const videoCountValid = videos.length >= 1;
  const isReady = photoCountValid && videoCountValid;

  const commit = (next: KostMedia[]) => {
    const numbered = next.map((m, idx) => ({ ...m, urutan: idx + 1 }));
    latest.current = numbered;
    onChange(numbered);
  };

  const moveMedia = (id: string, direction: 'up' | 'down') => {
    const list = [...value];
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    commit(list);
  };

  const togglePreview = (id: string) => {
    commit(value.map((m) => (m.id === id ? { ...m, is_preview: !m.is_preview } : m)));
  };

  const setAsThumbnail = (id: string) => {
    const item = value.find((m) => m.id === id);
    if (!item) return;
    commit([{ ...item, is_preview: true }, ...value.filter((m) => m.id !== id)]);
    toast('Foto berhasil dijadikan gambar utama!', 'info');
  };

  const handleDelete = (id: string) => {
    const item = value.find((m) => m.id === id);
    if (!item) return;
    if (isStored(item.storage_key)) {
      if (sessionKeys.current.has(item.storage_key)) {
        // Belum pernah disimpan: aman dihapus sekarang
        sessionKeys.current.delete(item.storage_key);
        void deleteStoredMedia([item.storage_key]);
      } else {
        onStoredKeyRemoved?.(item.storage_key);
      }
    }
    commit(value.filter((m) => m.id !== id));
    toast('Media dihapus dari daftar', 'info');
  };

  // Aturan paywall otomatis: foto 1-3 dan video 1 gratis, selebihnya terkunci
  const applyAutoPaywallRules = () => {
    let photoSeq = 0;
    let videoSeq = 0;
    commit(
      value.map((m) => {
        if (m.tipe === 'video') {
          videoSeq++;
          return { ...m, is_preview: videoSeq <= 1 };
        }
        photoSeq++;
        return { ...m, is_preview: photoSeq <= 3 };
      })
    );
    toast('Aturan paywall otomatis diterapkan (Foto 1-3 & Video 1 Gratis)', 'success');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setIsUploading(true);
    let okCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressKey = `${i}-${file.name}`;
      try {
        setUploadProgress((p) => ({ ...p, [progressKey]: 0 }));
        const init = await initUpload(file);
        await putToStorage(init, file, (pct) => setUploadProgress((p) => ({ ...p, [progressKey]: pct })));

        const isVideo = init.kind === 'video';
        const current = latest.current;
        const sameKind = current.filter((m) => (m.tipe === 'video') === isVideo).length;
        const item: KostMedia = {
          id: 'm-' + Date.now() + '-' + i,
          kost_id: kostId,
          tipe: isVideo ? 'video' : 'foto_kamar',
          storage_key: init.key,
          url: init.publicUrl,
          urutan: current.length + 1,
          is_preview: isVideo ? sameKind < 1 : sameKind < 3,
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
        };
        sessionKeys.current.add(init.key);
        commit([...current, item]);
        okCount++;
      } catch (err) {
        toast(`${file.name}: ${err instanceof Error ? err.message : 'gagal diunggah'}`, 'error');
      } finally {
        setUploadProgress((p) => {
          const next = { ...p };
          delete next[progressKey];
          return next;
        });
      }
    }
    setIsUploading(false);
    if (okCount > 0) toast(`${okCount} berkas berhasil diunggah. Simpan untuk menyimpan permanen.`, 'success');
  };

  const handleAddUrl = () => {
    if (!newUrlInput.trim()) {
      toast('URL media wajib diisi', 'error');
      return;
    }
    try {
      const u = new URL(newUrlInput.trim());
      if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error('protocol');
    } catch {
      toast('URL tidak valid', 'error');
      return;
    }
    const isVideo = activeTab === 'video' || /\.(mp4|webm)(\?|$)/i.test(newUrlInput);
    const sameKind = value.filter((m) => (m.tipe === 'video') === isVideo).length;
    commit([
      ...value,
      {
        id: 'm-' + Date.now(),
        kost_id: kostId,
        tipe: isVideo ? 'video' : 'foto_kamar',
        storage_key: 'custom-url',
        url: newUrlInput.trim(),
        urutan: value.length + 1,
        is_preview: isVideo ? sameKind < 1 : sameKind < 3,
        alt_text: newAltInput.trim() || (isVideo ? 'Video Tour Kost' : 'Foto Kost'),
      },
    ]);
    setNewUrlInput('');
    setNewAltInput('');
    setShowAddUrlModal(false);
    toast('Media ditambahkan ke daftar', 'success');
  };

  const paywallPill = (item: KostMedia) => (
    <button
      type="button"
      onClick={() => togglePreview(item.id)}
      className={`absolute bottom-2 left-2 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm transition-all ${
        item.is_preview ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white' : 'bg-amber-600/90 hover:bg-amber-600 text-white'
      }`}
    >
      {item.is_preview ? (
        <>
          <Unlock className="w-3 h-3" />
          <span>Gratis</span>
        </>
      ) : (
        <>
          <Lock className="w-3 h-3" />
          <span>Terkunci</span>
        </>
      )}
    </button>
  );

  const actions = (item: KostMedia, index: number, total: number, label: string) => (
    <div className="p-3 bg-white flex items-center justify-between border-t border-slate-100">
      <span className="text-[11px] text-slate-500 truncate max-w-[140px]">{item.alt_text || label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => moveMedia(item.id, 'up')}
          disabled={index === 0}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20"
          title="Pindah ke depan"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => moveMedia(item.id, 'down')}
          disabled={index === total - 1}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20"
          title="Pindah ke belakang"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => handleDelete(item.id)}
          className="p-1 rounded-md text-rose-400 hover:text-rose-600 hover:bg-rose-50"
          title="Hapus"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-orange-500" />
          Foto & Video
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={applyAutoPaywallRules}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Otomatis kunci setelah foto ke-3 dan video ke-1"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Terapkan Aturan Paywall</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddUrlModal(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah via URL</span>
          </button>
        </div>
      </div>

      {/* Kelengkapan media */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
          isReady ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-2">
          {isReady ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div>
            <p className="font-bold">{isReady ? 'Kelengkapan Media Terpenuhi' : 'Media Belum Lengkap'}</p>
            <p className="text-[11px] opacity-80">Disarankan minimal 3 foto dan 1 video tour agar listing menarik.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            {photoCountValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
            <span>Foto ({photos.length}/3)</span>
          </div>
          <div className="flex items-center gap-1.5">
            {videoCountValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
            <span>Video ({videos.length}/1)</span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
        <span>
          💡 <strong>Aturan Paywall:</strong> Item berlabel <span className="text-emerald-700 font-semibold">Gratis</span> bisa dilihat semua
          pengunjung. Item <span className="text-amber-700 font-semibold">Terkunci</span> hanya bisa dibuka oleh pengguna unlock.
        </span>
        <span className="text-slate-400 hidden sm:inline shrink-0">Klik label untuk mengubah</span>
      </div>

      {/* Tab & unggah */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('foto')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'foto' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Foto ({photos.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'video' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Tour ({videos.length})</span>
          </button>
        </div>

        <label
          className={`px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
            isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'
          }`}
        >
          <Upload className="w-4 h-4 text-orange-500" />
          <span>{isUploading ? 'Mengunggah...' : 'Upload Berkas'}</span>
          <input
            type="file"
            multiple
            disabled={isUploading}
            accept={activeTab === 'foto' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/webm'}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
      <p className="text-[11px] text-slate-400 -mt-2">
        {activeTab === 'foto' ? 'JPG, PNG, atau WebP — maksimal 8 MB per foto.' : 'MP4 atau WebM — maksimal 50 MB per video.'}
      </p>

      {Object.keys(uploadProgress).length > 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <p className="text-xs font-bold text-slate-700">Mengunggah...</p>
          {Object.entries(uploadProgress).map(([key, progress]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-[240px]">{key.replace(/^\d+-/, '')}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'foto' && (
        <div>
          {photos.length === 0 ? (
            <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Belum ada foto</p>
              <p className="text-xs text-slate-400 mt-1">Unggah foto kamar & gedung. Foto pertama menjadi gambar utama.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((item, index) => (
                <div key={item.id} className="group relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                  <div className="relative aspect-video w-full bg-slate-200">
                    {item.url ? (
                      <Image src={item.url} alt={item.alt_text || 'Foto Kost'} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold tracking-wide backdrop-blur-sm">
                      Foto {index + 1}
                    </div>
                    {index === 0 ? (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-orange-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Utama</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAsThumbnail(item.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-900/60 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-all"
                        title="Jadikan foto utama (thumbnail)"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {paywallPill(item)}
                  </div>
                  {actions(item, index, photos.length, 'Foto')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'video' && (
        <div>
          {videos.length === 0 ? (
            <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <Video className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Belum ada video tour</p>
              <p className="text-xs text-slate-400 mt-1">Unggah video kamar agar calon penyewa melihat kondisi nyata.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((item, index) => (
                <div key={item.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                  <div className="relative aspect-video w-full bg-slate-900">
                    <video src={item.url} controls className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                      Video {index + 1}
                    </div>
                    {paywallPill(item)}
                  </div>
                  {actions(item, index, videos.length, 'Video Tour')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddUrlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Tambah Media via URL</h3>
            <p className="text-xs text-slate-500">Masukkan URL gambar atau video publik (Cloudinary, tautan MP4, dll.)</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  URL Media <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  placeholder="https://contoh.com/foto-kamar.jpg"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Keterangan (Alt Text)</label>
                <input
                  type="text"
                  value={newAltInput}
                  onChange={(e) => setNewAltInput(e.target.value)}
                  placeholder="Contoh: Kamar Tidur Utama & Meja Kerja"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddUrlModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold"
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
