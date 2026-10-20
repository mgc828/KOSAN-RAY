'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  Building2,
  AlertTriangle,
  Loader2,
  Save,
  Plus,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useAdmin } from '@/lib/admin-client';
import { Kost, KostMedia } from '@/lib/types';

export default function AdminMediaPage() {
  const { addToast } = useAdmin();

  const [kosts, setKosts] = useState<Kost[]>([]);
  const [selectedKostId, setSelectedKostId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('Semua');
  const [activeTab, setActiveTab] = useState<'foto' | 'video'>('foto');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Current active media being managed for the selected kost
  const [mediaList, setMediaList] = useState<KostMedia[]>([]);

  // Multi-upload mock/state
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);

  // New URL modal/prompt
  const [newUrlInput, setNewUrlInput] = useState('');
  const [newAltInput, setNewAltInput] = useState('');
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);

  const fetchKosts = async () => {
    try {
      const res = await fetch('/api/admin/data?type=kosts');
      const data = await res.json();
      if (data.kosts && data.kosts.length > 0) {
        setKosts(data.kosts);
        if (!selectedKostId) {
          setSelectedKostId(data.kosts[0].id);
        }
      }
    } catch {
      addToast('Gagal memuat daftar kost', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKosts();
  }, []);

  const selectedKost = useMemo(() => {
    return kosts.find((k) => k.id === selectedKostId) || kosts[0] || null;
  }, [kosts, selectedKostId]);

  useEffect(() => {
    if (selectedKost) {
      setMediaList(selectedKost.media || []);
    }
  }, [selectedKost]);

  // Grouped and filtered kosts for left panel
  const areasList = useMemo(() => {
    const set = new Set<string>();
    kosts.forEach((k) => {
      if (k.area) set.add(k.area);
    });
    return ['Semua', ...Array.from(set)];
  }, [kosts]);

  const filteredKosts = useMemo(() => {
    return kosts.filter((k) => {
      const matchesSearch =
        k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.alamat.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArea = selectedArea === 'Semua' || k.area === selectedArea;
      return matchesSearch && matchesArea;
    });
  }, [kosts, searchQuery, selectedArea]);

  // Filter media by tab
  const photos = useMemo(
    () => mediaList.filter((m) => m.tipe === 'foto_kamar' || m.tipe === 'foto_gedung'),
    [mediaList]
  );
  const videos = useMemo(() => mediaList.filter((m) => m.tipe === 'video'), [mediaList]);

  // Validation rules: min 3 photos + 1 video
  const photoCountValid = photos.length >= 3;
  const videoCountValid = videos.length >= 1;
  const isKostReady = photoCountValid && videoCountValid;

  // Move item up / down in order
  const moveMedia = (id: string, direction: 'up' | 'down') => {
    const list = [...mediaList];
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Re-assign sequence numbers
    const updated = list.map((m, idx) => ({ ...m, urutan: idx + 1 }));
    setMediaList(updated);
  };

  // Toggle free vs locked (is_preview)
  const togglePreview = (id: string) => {
    setMediaList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_preview: !m.is_preview } : m))
    );
  };

  // Set as primary photo (move to urutan 1 and set as foto_gedung)
  const setAsThumbnail = (id: string) => {
    const item = mediaList.find((m) => m.id === id);
    if (!item) return;

    const others = mediaList.filter((m) => m.id !== id);
    const updated = [
      { ...item, urutan: 1, is_preview: true },
      ...others.map((m, idx) => ({ ...m, urutan: idx + 2 })),
    ];
    setMediaList(updated);
    addToast('Foto berhasil dijadikan gambar utama!', 'info');
  };

  // Delete media item
  const handleDeleteMedia = (id: string) => {
    const updated = mediaList
      .filter((m) => m.id !== id)
      .map((m, idx) => ({ ...m, urutan: idx + 1 }));
    setMediaList(updated);
    addToast('Media berhasil dihapus dari daftar', 'info');
  };

  // Apply default auto paywall rule: Photo 1-3 + Video 1 are free, rest locked
  const applyAutoPaywallRules = () => {
    let photoSeq = 0;
    let videoSeq = 0;

    const updated = mediaList.map((m) => {
      if (m.tipe === 'video') {
        videoSeq++;
        return { ...m, is_preview: videoSeq <= 1 };
      } else {
        photoSeq++;
        return { ...m, is_preview: photoSeq <= 3 };
      }
    });

    setMediaList(updated);
    addToast('Aturan paywall otomatis berhasil diterapkan (Foto 1-3 & Video 1 Gratis)', 'success');
  };

  // Save changes to backend
  const handleSaveMedia = async () => {
    if (!selectedKost) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'media_save',
          kostId: selectedKost.id,
          mediaList,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Media kost berhasil disimpan permanen! ✅', 'success');
        // Update local kosts cache
        setKosts((prev) =>
          prev.map((k) => (k.id === selectedKost.id ? { ...k, media: mediaList } : k))
        );
      } else {
        addToast(data.message || 'Gagal menyimpan media', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan saat menyimpan media', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle client-side mock upload with progress
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newItems: KostMedia[] = [];

    Array.from(files).forEach((file, index) => {
      const isVideo = file.type.startsWith('video');
      const tempId = 'm-' + Date.now() + '-' + index;

      // Simulate client compression & progress
      setUploadProgress((prev) => ({ ...prev, [file.name]: 10 }));

      setTimeout(() => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 60 }));
      }, 300);

      setTimeout(() => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

        const fileUrl = URL.createObjectURL(file);
        const item: KostMedia = {
          id: tempId,
          kost_id: selectedKost?.id || '',
          tipe: isVideo ? 'video' : 'foto_kamar',
          storage_key: `kost/${tempId}-${file.name}`,
          url: fileUrl,
          urutan: mediaList.length + index + 1,
          is_preview: mediaList.length < 3,
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
        };
        newItems.push(item);

        if (index === files.length - 1) {
          setMediaList((prev) => [...prev, ...newItems]);
          setIsUploading(false);
          setUploadProgress({});
          addToast(`${files.length} berkas berhasil diunggah! Simpan untuk memperbarui.`, 'success');
        }
      }, 800 + index * 200);
    });
  };

  // Add custom URL item
  const handleAddUrl = () => {
    if (!newUrlInput.trim()) {
      addToast('URL media wajib diisi', 'error');
      return;
    }

    const isVideo = activeTab === 'video' || newUrlInput.endsWith('.mp4');
    const newItem: KostMedia = {
      id: 'm-' + Date.now(),
      kost_id: selectedKost?.id || '',
      tipe: isVideo ? 'video' : 'foto_kamar',
      storage_key: 'custom-url',
      url: newUrlInput.trim(),
      urutan: mediaList.length + 1,
      is_preview: mediaList.length < 3,
      alt_text: newAltInput.trim() || (isVideo ? 'Video Tour Kost' : 'Foto Kost'),
    };

    setMediaList([...mediaList, newItem]);
    setNewUrlInput('');
    setNewAltInput('');
    setShowAddUrlModal(false);
    addToast('Media berhasil ditambahkan ke daftar', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Media Manager</h1>
          <p className="text-xs text-slate-500">
            Kelola foto, video tour, urutan tayang, dan konfigurasi paywall per kost
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedKost?.slug && (
            <a
              href={`/kost/${(selectedKost.kota || 'jakarta').toLowerCase()}/${(selectedKost.area || 'jakarta').toLowerCase().replace(/\s+/g, '-')}/${selectedKost.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>Lihat Preview</span>
            </a>
          )}

          <button
            onClick={handleSaveMedia}
            disabled={saving || !selectedKost}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold flex items-center gap-2 shadow-sm shadow-orange-500/20 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Menyimpan...' : 'Simpan Media'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel (4 cols): Kost Selector */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" />
              Pilih Kost
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {filteredKosts.length} kost
            </span>
          </div>

          {/* Search Kost */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau alamat kost..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 font-medium"
            />
          </div>

          {/* Area Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {areasList.map((a) => (
              <button
                key={a}
                onClick={() => setSelectedArea(a)}
                className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                  selectedArea === a
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Kost List */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Memuat daftar kost...
              </div>
            ) : filteredKosts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada kost yang cocok
              </div>
            ) : (
              filteredKosts.map((kost) => {
                const isSelected = kost.id === selectedKostId;
                const mList = kost.media || [];
                const pCount = mList.filter(
                  (m) => m.tipe === 'foto_kamar' || m.tipe === 'foto_gedung'
                ).length;
                const vCount = mList.filter((m) => m.tipe === 'video').length;
                const isReady = pCount >= 3 && vCount >= 1;

                return (
                  <button
                    key={kost.id}
                    onClick={() => setSelectedKostId(kost.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-orange-50/50 border-orange-500 ring-2 ring-orange-500/10'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                      {kost.media && kost.media[0]?.url ? (
                        <Image
                          src={kost.media[0].url}
                          alt={kost.nama}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {kost.nama}
                        </p>
                        {isReady ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Media lengkap" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Media belum lengkap" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{kost.area}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <span>📷 {pCount} foto</span>
                        <span>•</span>
                        <span>🎬 {vCount} video</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel (8 cols): Media Gallery & Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Info Kost Terpilih & Validation Checklist */}
          {selectedKost && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedKost.nama}
                  </h2>
                  <p className="text-xs text-slate-500">{selectedKost.alamat}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={applyAutoPaywallRules}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    title="Otomatis kunci setelah foto ke-3 dan video ke-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Terapkan Aturan Paywall</span>
                  </button>

                  <button
                    onClick={() => setShowAddUrlModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah via URL</span>
                  </button>
                </div>
              </div>

              {/* Validation Banner: Min 3 Photos + 1 Video */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                  isKostReady
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isKostReady ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold">
                      {isKostReady
                        ? 'Kelayakan Media Terpenuhi'
                        : 'Syarat Media Belum Terpenuhi'}
                    </p>
                    <p className="text-[11px] opacity-80">
                      Minimal 3 foto dan 1 video tour sebelum kost dapat diaktifkan ke publik.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    {photoCountValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                    <span>Foto ({photos.length}/3)</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {videoCountValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                    <span>Video ({videos.length}/1)</span>
                  </div>
                </div>
              </div>

              {/* Paywall Info Banner */}
              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <span>
                  💡 <strong>Aturan Paywall:</strong> Item berlabel{' '}
                  <span className="text-emerald-700 font-semibold">Gratis</span> bisa dilihat
                  semua pengunjung. Item{' '}
                  <span className="text-amber-700 font-semibold">Terkunci</span> hanya bisa dibuka
                  oleh pengguna unlock.
                </span>
                <span className="text-slate-400">Klik ikon gembok untuk mengubah</span>
              </div>
            </div>
          )}

          {/* Media Tabs & Dropzone */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('foto')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'foto'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Foto ({photos.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('video')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'video'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Video Tour ({videos.length})</span>
                </button>
              </div>

              <label className="cursor-pointer px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm">
                <Upload className="w-4 h-4 text-orange-500" />
                <span>Upload Berkas</span>
                <input
                  type="file"
                  multiple
                  accept={activeTab === 'foto' ? 'image/*' : 'video/*'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Upload Progress Display */}
            {isUploading && Object.keys(uploadProgress).length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-700">Mengompresi & Mengunggah...</p>
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[240px]">{fileName}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-orange-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Foto Grid */}
            {activeTab === 'foto' && (
              <div>
                {photos.length === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Belum ada foto</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Unggah minimal 3 foto kamar & gedung untuk mengaktifkan kost.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((item, index) => {
                      const isMain = index === 0;

                      return (
                        <div
                          key={item.id}
                          className="group relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"
                        >
                          {/* Image Box */}
                          <div className="relative aspect-video w-full bg-slate-200">
                            {item.url ? (
                              <Image
                                src={item.url}
                                alt={item.alt_text || 'Foto Kost'}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}

                            {/* Badge Urutan */}
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold tracking-wide backdrop-blur-sm">
                              Foto {index + 1}
                            </div>

                            {/* Thumbnail Star Badge */}
                            {isMain ? (
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-orange-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 fill-current" />
                                <span>Utama</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAsThumbnail(item.id)}
                                className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-900/60 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-all"
                                title="Jadikan foto utama (thumbnail)"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Status Paywall Pill */}
                            <button
                              onClick={() => togglePreview(item.id)}
                              className={`absolute bottom-2 left-2 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm transition-all ${
                                item.is_preview
                                  ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white'
                                  : 'bg-amber-600/90 hover:bg-amber-600 text-white'
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
                          </div>

                          {/* Footer Actions */}
                          <div className="p-3 bg-white flex items-center justify-between border-t border-slate-100">
                            <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                              {item.alt_text || 'Foto'}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveMedia(item.id, 'up')}
                                disabled={index === 0}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20"
                                title="Pindah ke depan"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveMedia(item.id, 'down')}
                                disabled={index === photos.length - 1}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20"
                                title="Pindah ke belakang"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMedia(item.id)}
                                className="p-1 rounded-md text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Hapus foto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Video Grid */}
            {activeTab === 'video' && (
              <div>
                {videos.length === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <Video className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Belum ada video tour</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Unggah minimal 1 video kamar untuk mempermudah calon penyewa melihat kondisi nyata.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {videos.map((item, index) => {
                      return (
                        <div
                          key={item.id}
                          className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"
                        >
                          <div className="relative aspect-video w-full bg-slate-900">
                            <video
                              src={item.url}
                              controls
                              className="w-full h-full object-cover"
                            />

                            {/* Badge Urutan */}
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                              Video {index + 1}
                            </div>

                            {/* Status Paywall Pill */}
                            <button
                              onClick={() => togglePreview(item.id)}
                              className={`absolute bottom-2 left-2 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm transition-all ${
                                item.is_preview
                                  ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white'
                                  : 'bg-amber-600/90 hover:bg-amber-600 text-white'
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
                          </div>

                          <div className="p-3 bg-white flex items-center justify-between border-t border-slate-100">
                            <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
                              {item.alt_text || 'Video Tour'}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveMedia(item.id, 'up')}
                                disabled={index === 0}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveMedia(item.id, 'down')}
                                disabled={index === videos.length - 1}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMedia(item.id)}
                                className="p-1 rounded-md text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add via URL Modal */}
      {showAddUrlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Tambah Media via URL
            </h3>
            <p className="text-xs text-slate-500">
              Masukkan URL gambar atau video publik (Unsplash, Cloudinary, MP4 link, dll.)
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  URL Media <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Keterangan (Alt Text)
                </label>
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
                onClick={() => setShowAddUrlModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
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

