'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Building2,
  CheckCircle2,
  X,
  Compass
} from 'lucide-react';
import { useAdmin } from '@/lib/admin-client';
import { AreaItem } from '@/lib/admin-types';
import { Kost } from '@/lib/types';
import SingleSelectDropdown from '@/components/SingleSelectDropdown';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
      Memuat peta...
    </div>
  ),
});

const JAKARTA_CITIES = [
  'Jakarta Selatan',
  'Jakarta Pusat',
  'Jakarta Barat',
  'Jakarta Timur',
  'Jakarta Utara',
  'Kepulauan Seribu',
];

export default function AdminAreaPage() {
  const { addToast } = useAdmin();

  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [kosts, setKosts] = useState<Kost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaItem | null>(null);
  const [formNama, setFormNama] = useState('');
  const [formKota, setFormKota] = useState('Jakarta Selatan');
  const [formLat, setFormLat] = useState(-6.211);
  const [formLng, setFormLng] = useState(106.828);
  const [formUrutan, setFormUrutan] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Delete Alert
  const [deleteWarning, setDeleteWarning] = useState<{ area: AreaItem; count: number } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resArea, resKost] = await Promise.all([
        fetch('/api/admin/data?type=areas'),
        fetch('/api/admin/data?type=kosts'),
      ]);
      const dataArea = await resArea.json();
      const dataKost = await resKost.json();

      if (dataArea.areas) setAreas(dataArea.areas);
      if (dataKost.kosts) setKosts(dataKost.kosts);
    } catch {
      addToast('Gagal memuat data area', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingArea(null);
    setFormNama('');
    setFormKota('Jakarta Selatan');
    setFormLat(-6.211);
    setFormLng(106.828);
    setFormUrutan(areas.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (area: AreaItem) => {
    setEditingArea(area);
    setFormNama(area.nama);
    setFormKota(area.kota);
    setFormLat(area.lat);
    setFormLng(area.lng);
    setFormUrutan(area.urutan);
    setModalOpen(true);
  };

  const handleSaveArea = async () => {
    if (!formNama.trim()) {
      addToast('Nama area wajib diisi', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<AreaItem> = {
        nama: formNama.trim(),
        kota: formKota,
        lat: formLat,
        lng: formLng,
        urutan: Number(formUrutan) || 1,
      };

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingArea
            ? {
                action: 'area_update',
                id: editingArea.id,
                updates: payload,
              }
            : {
                action: 'area_create',
                area: payload,
              }
        ),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast(
          editingArea ? 'Area berhasil diperbarui ✅' : 'Area berhasil ditambahkan ✅',
          'success'
        );
        setModalOpen(false);
        fetchData();
      } else {
        addToast(data.error || 'Gagal menyimpan area', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (area: AreaItem) => {
    // Check if any kost is linked
    const linked = kosts.filter(
      (k) =>
        k.area?.toLowerCase() === area.nama.toLowerCase() ||
        (k.alamat && k.alamat.toLowerCase().includes(area.nama.toLowerCase()))
    );

    if (linked.length > 0) {
      setDeleteWarning({ area, count: linked.length });
    } else {
      // Safe to delete
      confirmDeleteArea(area.id, area.nama);
    }
  };

  const confirmDeleteArea = async (id: string, nama: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'area_delete',
          id,
          nama,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Area berhasil dihapus ✅', 'success');
        fetchData();
      } else {
        addToast(data.error || 'Gagal menghapus area', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan jaringan', 'error');
    }
  };

  const filteredAreas = areas.filter(
    (a) =>
      a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.kota.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Area & Zona DKI Jakarta</h1>
          <p className="text-xs text-slate-500">
            Kelola wilayah pencarian kost, koordinat titik tengah peta, dan urutan penayangan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
            title="Muat ulang data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-orange-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Area</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari area atau kota..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 font-medium"
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3 px-4 w-16 text-center">Urutan</th>
                <th className="py-3 px-4">Nama Area</th>
                <th className="py-3 px-4">Kota Administratif</th>
                <th className="py-3 px-4">Koordinat Pusat (Lat, Lng)</th>
                <th className="py-3 px-4 text-center">Jumlah Kost</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                    <span>Memuat daftar area...</span>
                  </td>
                </tr>
              ) : filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada area yang cocok
                  </td>
                </tr>
              ) : (
                filteredAreas.map((area) => {
                  const linkedCount = kosts.filter(
                    (k) =>
                      k.area?.toLowerCase() === area.nama.toLowerCase() ||
                      (k.alamat && k.alamat.toLowerCase().includes(area.nama.toLowerCase()))
                  ).length;

                  return (
                    <tr key={area.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                        {area.urutan}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{area.nama}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">{area.kota}</td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {area.lat.toFixed(4)}, {area.lng.toFixed(4)}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {linkedCount} kost
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(area)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all"
                            title="Edit Area"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(area)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-500 transition-all"
                            title="Hapus Area"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingArea ? 'Edit Area DKI Jakarta' : 'Tambah Area Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Area / Kawasan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Kuningan, Setiabudi"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kota Administratif
                  </label>
                  <SingleSelectDropdown
                    value={formKota}
                    onChange={(val) => setFormKota(val)}
                    options={JAKARTA_CITIES.map((c) => ({ value: c, label: c }))}
                    placeholder="Pilih Kota"
                    highlightSelected={false}
                    buttonClassName="!py-2 !px-3"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formUrutan}
                    onChange={(e) => setFormUrutan(Number(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Pin Koordinat on Map */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Koordinat Titik Tengah Area (Lat, Lng)
                </label>
                <div className="h-56 rounded-xl overflow-hidden border border-slate-200 mb-2">
                  <LocationPickerMap
                    initialLat={formLat}
                    initialLng={formLng}
                    onLocationChange={(newLat, newLng) => {
                      setFormLat(newLat);
                      setFormLng(newLng);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Lat: {formLat.toFixed(5)}</span>
                  <span>Lng: {formLng.toFixed(5)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleSaveArea}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan Area</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Warning Modal (Proteksi Hapus) */}
      {deleteWarning && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Tidak Dapat Menghapus Area
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Area <strong className="text-slate-900">"{deleteWarning.area.nama}"</strong> tidak
              dapat dihapus karena masih terhubung dengan{' '}
              <strong className="text-amber-700">{deleteWarning.count} kost aktif</strong>.
              Silakan pindahkan atau ubah area kost yang terkait terlebih dahulu.
            </p>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setDeleteWarning(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

