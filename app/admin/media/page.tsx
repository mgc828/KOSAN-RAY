'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Search,
  Building2,
  Loader2,
  Save,
  Eye
} from 'lucide-react';
import { toast as addToast } from '@/lib/toast';
import MediaManager from '@/components/admin/MediaManager';
import { deleteStoredMedia } from '@/lib/media-client';
import { Kost, KostMedia } from '@/lib/types';

export default function AdminMediaPage() {
  const [kosts, setKosts] = useState<Kost[]>([]);
  const [selectedKostId, setSelectedKostId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Current active media being managed for the selected kost
  const [mediaList, setMediaList] = useState<KostMedia[]>([]);

  // Berkas tersimpan yang dihapus dari daftar; dihapus dari Storage setelah disimpan
  const removedStoredKeys = useRef<string[]>([]);

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
      removedStoredKeys.current = [];
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
        void deleteStoredMedia(removedStoredKeys.current);
        removedStoredKeys.current = [];
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
          {selectedKost && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">{selectedKost.nama}</h2>
              <p className="text-xs text-slate-500">{selectedKost.alamat}</p>
            </div>
          )}

          {selectedKost && (
            <MediaManager
              key={selectedKost.id}
              value={mediaList}
              onChange={setMediaList}
              kostId={selectedKost.id}
              onStoredKeyRemoved={(key) => removedStoredKeys.current.push(key)}
            />
          )}
        </div>
      </div>

    </div>
  );
}

