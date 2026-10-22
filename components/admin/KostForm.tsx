'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Save,
  Eye,
  ArrowLeft,
  MapPin,
  Plus,
  Minus,
  CheckCircle2,
  Lock,
  Phone,
  Building2,
  Home,
  Sparkles,
  Zap,
} from 'lucide-react';
import { toast as addToast } from '@/lib/toast';
import { Kost, KostType } from '@/lib/types';
import { AreaItem } from '@/lib/admin-types';
import SingleSelectDropdown from '@/components/SingleSelectDropdown';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
      Memuat peta interaktif...
    </div>
  ),
});

const DEFAULT_FACILITIES = [
  'AC Inverter',
  'Kamar Mandi Dalam',
  'WiFi 100 Mbps',
  'Kasur Springbed',
  'Lemari Pakaian',
  'Meja Kerja',
  'Dapur Bersama',
  'Parkir Mobil',
  'Parkir Motor',
  'Listrik Gratis',
  'Water Heater',
  'CCTV 24 Jam',
];

interface KostFormProps {
  initialKost?: Kost;
  isEdit?: boolean;
}

export default function KostForm({ initialKost, isEdit = false }: KostFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [showMap, setShowMap] = useState(false);

  // Form states
  const [nama, setNama] = useState(initialKost?.nama || '');
  const [alamat, setAlamat] = useState(initialKost?.alamat || '');
  const [area, setArea] = useState(initialKost?.area || '');
  const [kota, setKota] = useState(initialKost?.kota || '');
  const [tipe, setTipe] = useState<KostType | ''>(initialKost?.tipe || '');
  const [harga, setHarga] = useState<number>(initialKost?.harga || 0);
  const [priceDisplay, setPriceDisplay] = useState<string>(
    initialKost?.harga ? `Rp ${initialKost.harga.toLocaleString('id-ID')}` : ''
  );
  const [totalKamar, setTotalKamar] = useState<number | ''>('');
  const [kamarTersedia, setKamarTersedia] = useState<number | ''>('');
  const [fasilitas, setFasilitas] = useState<string[]>(initialKost?.fasilitas || []);
  const [deskripsi, setDeskripsi] = useState(initialKost?.deskripsi || '');
  const [whatsapp, setWhatsapp] = useState(initialKost?.owner_whatsapp || '');
  const [status, setStatus] = useState<'tersedia' | 'penuh'>(
    initialKost?.status === 'penuh' ? 'penuh' : 'tersedia'
  );
  const [lat, setLat] = useState<number>(initialKost?.latitude || -6.211);
  const [lng, setLng] = useState<number>(initialKost?.longitude || 106.828);

  const [confirm, setConfirm] = useState<null | 'draft' | 'publish' | 'back'>(null);

  const [whatsappError, setWhatsappError] = useState('');

  // Load areas
  useEffect(() => {
    fetch('/api/admin/data?type=areas')
      .then((res) => res.json())
      .then((data) => {
        if (data.areas && data.areas.length > 0) {
          setAreas(data.areas);
        }
      })
      .catch(() => {});
  }, []);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = Number(raw) || 0;
    setHarga(num);
    setPriceDisplay(num > 0 ? `Rp ${num.toLocaleString('id-ID')}` : '');
  };

  const validateWhatsapp = (val: string) => {
    setWhatsapp(val);
    const cleaned = val.replace(/\s+/g, '');
    if (!cleaned.startsWith('08') && !cleaned.startsWith('628')) {
      setWhatsappError('Nomor WhatsApp harus diawali dengan 08... atau 628...');
    } else if (cleaned.length < 10 || cleaned.length > 14) {
      setWhatsappError('Nomor WhatsApp harus antara 10 - 14 digit');
    } else {
      setWhatsappError('');
    }
  };

  const toggleFacility = (item: string) => {
    if (fasilitas.includes(item)) {
      setFasilitas(fasilitas.filter((f) => f !== item));
    } else {
      setFasilitas([...fasilitas, item]);
    }
  };

  const waValid = (() => {
    const c = whatsapp.replace(/\s+/g, '');
    return (c.startsWith('08') || c.startsWith('628')) && c.length >= 10 && c.length <= 14;
  })();

  // Semua field bertanda * wajib terisi sebelum bisa dipublikasikan
  const canPublish =
    nama.trim().length > 0 &&
    tipe !== '' &&
    area !== '' &&
    alamat.trim().length > 0 &&
    harga > 0 &&
    waValid &&
    fasilitas.length > 0;

  const isDirty =
    nama.trim() !== '' ||
    alamat.trim() !== '' ||
    deskripsi.trim() !== '' ||
    whatsapp.trim() !== '' ||
    tipe !== '' ||
    area !== '' ||
    harga > 0 ||
    fasilitas.length > 0 ||
    totalKamar !== '' ||
    kamarTersedia !== '';

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/admin/kost');
  };

  const handleBackClick = () => {
    if (!isEdit && isDirty) setConfirm('back');
    else goBack();
  };

  const handleDraftClick = () => {
    if (!nama.trim()) {
      addToast('Isi Nama Kost terlebih dahulu untuk menyimpan draft', 'error');
      return;
    }
    setConfirm('draft');
  };

  const handleSubmit = async (mode: 'draft' | 'publish') => {
    const isDraft = mode === 'draft';
    const submitStatus: 'tersedia' | 'penuh' = isDraft ? 'penuh' : 'tersedia';
    if (!nama.trim()) {
      addToast('Nama kost wajib diisi!', 'error');
      setConfirm(null);
      return;
    }
    if (nama.length > 100) {
      addToast('Nama kost melebihi batas 100 karakter!', 'error');
      return;
    }
    if (!isDraft && !canPublish) {
      addToast('Lengkapi semua field bertanda * sebelum mempublikasikan', 'error');
      setConfirm(null);
      return;
    }
    if (whatsapp.trim() && whatsappError) {
      addToast(whatsappError, 'error');
      setConfirm(null);
      return;
    }

    setLoading(true);

    try {
      const selectedArea = areas.find((a) => a.nama === area);
      const computedKota = selectedArea?.kota || kota || 'Jakarta';

      const payload: Partial<Kost> = {
        nama: nama.trim(),
        alamat: alamat.trim(),
        area: area,
        kota: computedKota,
        tipe: tipe || 'campur',
        harga,
        fasilitas,
        deskripsi,
        peraturan: initialKost?.peraturan || [
          'Tidak boleh merokok di dalam kamar',
          'Tamu lawan jenis dilarang menginap',
          'Jam tenang pukul 23:00 - 06:00',
        ],
        owner_whatsapp: whatsapp.trim(),
        status: submitStatus,
        is_draft: isDraft,
        latitude: lat,
        longitude: lng,
        media: initialKost?.media || [
          {
            id: 'm-' + Date.now() + '-1',
            kost_id: initialKost?.id || 'temp',
            tipe: 'foto_gedung',
            storage_key: 'kost/sample-1.webp',
            url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
            urutan: 1,
            is_preview: true,
            alt_text: nama + ' Tampak Depan',
          },
          {
            id: 'm-' + Date.now() + '-2',
            kost_id: initialKost?.id || 'temp',
            tipe: 'foto_kamar',
            storage_key: 'kost/sample-2.webp',
            url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
            urutan: 2,
            is_preview: true,
            alt_text: nama + ' Kamar Tidur',
          },
          {
            id: 'm-' + Date.now() + '-3',
            kost_id: initialKost?.id || 'temp',
            tipe: 'foto_kamar',
            storage_key: 'kost/sample-3.webp',
            url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
            urutan: 3,
            is_preview: true,
            alt_text: nama + ' Kamar Mandi',
          },
          {
            id: 'm-' + Date.now() + '-4',
            kost_id: initialKost?.id || 'temp',
            tipe: 'video',
            storage_key: 'kost/sample-video.mp4',
            url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-4131-large.mp4',
            urutan: 4,
            is_preview: true,
            alt_text: nama + ' Video Tour Kamar',
          },
        ],
      };

      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEdit
            ? {
                action: 'kost_update',
                id: initialKost?.id,
                updates: payload,
              }
            : {
                action: 'kost_create',
                kost: payload,
              }
        ),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setIsRedirecting(true);
        setConfirm(null);
        addToast(
          isDraft
            ? 'Kost disimpan sebagai Draft ✅'
            : isEdit
              ? 'Kost berhasil diperbarui ✅'
              : 'Kost berhasil dipublikasikan ✅',
          'success'
        );
        goBack();
        return;
      } else {
        addToast(resData.error || resData.message || 'Gagal menyimpan data kost', 'error');
      }
    } catch {
      addToast('Terjadi kesalahan jaringan saat menyimpan kost', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <ConfirmDialog
        open={confirm === 'draft' || confirm === 'back'}
        title="Simpan sebagai Draft ?"
        description={
          confirm === 'back'
            ? 'Pilih "Tidak" untuk kembali tanpa menyimpan, atau tutup popup untuk tetap mengisi formulir.'
            : undefined
        }
        loading={loading}
        onCancel={() => setConfirm(null)}
        onDecline={() => {
          if (confirm === 'back') {
            setConfirm(null);
            goBack();
          } else {
            setConfirm(null);
          }
        }}
        onConfirm={() => handleSubmit('draft')}
      />
      <ConfirmDialog
        open={confirm === 'publish'}
        title="Publikasikan Data Kost ?"
        loading={loading}
        onCancel={() => setConfirm(null)}
        onConfirm={() => handleSubmit('publish')}
      />
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackClick}
            aria-label="Kembali"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEdit ? 'Edit Data Kost' : 'Tambah Kost Baru'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEdit ? `ID: ${initialKost?.id} • Slug: ${initialKost?.slug}` : 'Isi formulir lengkap kost DKI Jakarta'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isEdit && initialKost?.slug && (
            <a
              href={`/kost/${(initialKost.kota || 'jakarta').toLowerCase()}/${(initialKost.area || 'jakarta').toLowerCase().replace(/\s+/g, '-')}/${initialKost.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>Lihat Preview</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleDraftClick}
            disabled={loading || isRedirecting}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            Simpan Draft
          </button>

          <button
            type="button"
            onClick={() => setConfirm('publish')}
            disabled={loading || isRedirecting || !canPublish}
            title={canPublish ? undefined : 'Lengkapi semua field bertanda * untuk mempublikasikan'}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold flex items-center gap-2 shadow-sm shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isRedirecting ? 'Mengalihkan...' : loading ? 'Menyimpan...' : 'Publikasikan'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Informasi Dasar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-orange-500" />
              Informasi Umum
            </h2>

            {/* Nama Kost */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nama Kost <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    nama.length > 90 ? 'text-amber-500 font-bold' : 'text-slate-400'
                  }`}
                >
                  {nama.length}/100 karakter
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Kost Kuningan Executive Residence"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 font-medium transition-all"
              />
            </div>

            {/* Tipe Kost (Pill Radios) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Tipe Penghuni <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'campur', label: 'Campur' },
                  { id: 'putra', label: 'Putra' },
                  { id: 'putri', label: 'Putri' },
                ].map((item) => {
                  const isSelected = tipe === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTipe(item.id as KostType)}
                      className={`py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Area & Kecamatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Area / Kawasan <span className="text-rose-500">*</span>
                </label>
                <SingleSelectDropdown
                  value={area}
                  onChange={(sel) => {
                    setArea(sel);
                    const matched = areas.find((a) => a.nama === sel);
                    if (matched) {
                      setKota(matched.kota);
                      setLat(matched.lat);
                      setLng(matched.lng);
                    }
                  }}
                  options={areas.map((a) => ({
                    value: a.nama,
                    label: `${a.nama} (${a.kota})`,
                  }))}
                  placeholder="Pilih Area / Kawasan"
                  highlightSelected={false}
                  buttonClassName="!py-2.5 !px-4"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Kota Administratif
                </label>
                <input
                  type="text"
                  value={kota}
                  readOnly
                  placeholder="Otomatis sesuai area"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Alamat Lengkap & Pin Lokasi */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Alamat Lengkap <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{showMap ? 'Tutup Peta' : 'Pin Lokasi di Peta'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Jl. Prof. DR. Satrio No. Kav 18, RT.4/RW.4, Karet Kuningan, Setiabudi, Jakarta Selatan"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 font-medium"
              />

              {/* Pin Koordinat Preview */}
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Koordinat: <strong>{lat.toFixed(5)}</strong>, <strong>{lng.toFixed(5)}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400">Digunakan untuk fitur peta publik</span>
              </div>

              {/* Mini Map Accordion */}
              {showMap && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Geser pin atau klik lokasi kost yang tepat pada peta:
                  </p>
                  <div className="h-72 rounded-xl overflow-hidden border border-slate-200">
                    <LocationPickerMap
                      initialLat={lat}
                      initialLng={lng}
                      onLocationChange={(newLat, newLng, newAddr) => {
                        setLat(newLat);
                        setLng(newLng);
                        if (newAddr && !alamat) {
                          setAlamat(newAddr);
                        }
                      }}
                      searchAddress={alamat}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Deskripsi Kost
              </label>
              <textarea
                rows={5}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Kost nyaman, bersih, dan strategis dekat dengan pusat perkantoran dan transportasi umum. Lingkungan aman dan tenang dengan penjagaan 24 jam."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 font-medium"
              />
            </div>
          </div>

          {/* Section 2: Fasilitas Lengkap */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Fasilitas Kamar & Bersama <span className="text-rose-500">*</span>
            </h2>
            <p className="text-xs text-slate-500">
              Pilih fasilitas yang tersedia untuk mempermudah pencarian calon penyewa:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {DEFAULT_FACILITIES.map((facility) => {
                const checked = fasilitas.includes(facility);
                return (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => toggleFacility(facility)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      checked
                        ? 'bg-orange-50/80 border-orange-400 text-orange-950 ring-1 ring-orange-400/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>{facility}</span>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                        checked ? 'bg-orange-500 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Kamar, Harga, Kontak & Paywall */}
        <div className="space-y-6">
          {/* Harga & Kamar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Home className="w-5 h-5 text-orange-500" />
              Harga & Kapasitas
            </h2>

            {/* Harga Per Bulan */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Harga per Bulan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={priceDisplay}
                onChange={handlePriceChange}
                placeholder="Rp 1.850.000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              />
              {harga > 0 && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Nominal angka: Rp {harga.toLocaleString('id-ID')}
                </p>
              )}
            </div>

            {/* Total Kamar */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Total Kamar
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTotalKamar(Math.max(1, (totalKamar || 0) - 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={totalKamar}
                  placeholder="Contoh: 10"
                  onChange={(e) =>
                    setTotalKamar(e.target.value === '' ? '' : Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full text-center px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setTotalKamar((totalKamar || 0) + 1)}
                  className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Kamar Tersedia */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Kamar Tersedia
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setKamarTersedia(Math.max(0, (kamarTersedia || 0) - 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={0}
                  max={totalKamar || undefined}
                  value={kamarTersedia}
                  placeholder="Contoh: 3"
                  onChange={(e) =>
                    setKamarTersedia(
                      e.target.value === ''
                        ? ''
                        : Math.min(totalKamar || Infinity, Math.max(0, Number(e.target.value) || 0))
                    )
                  }
                  className="w-full text-center px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setKamarTersedia(Math.min(totalKamar || Infinity, (kamarTersedia || 0) + 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Status ketersediaan real-time yang dilihat pencari kost
              </p>
            </div>
          </div>

          {/* Kontak WhatsApp Pengelola (Paywall Protected) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Phone className="w-5 h-5 text-emerald-600" />
              Kontak Pengelola
            </h2>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => validateWhatsapp(e.target.value)}
                placeholder="081234567890"
                className={`w-full px-4 py-2.5 rounded-xl border text-slate-900 font-medium focus:outline-none focus:ring-2 ${
                  whatsappError
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200'
                    : 'border-slate-200 focus:ring-orange-500/30 focus:border-orange-500'
                }`}
              />
              {whatsappError ? (
                <p className="text-xs text-rose-500 mt-1.5 font-medium">{whatsappError}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">Format: 08xxxxxxxxxx</p>
              )}
            </div>

            {/* Paywall Protected Notice Alert */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-semibold">Perlindungan Paywall Akses</p>
                <p className="text-amber-800/80 leading-relaxed text-[11px]">
                  Nomor WhatsApp ini <strong>hanya dapat dilihat</strong> oleh pengguna yang telah
                  membeli pass unlock (Rp15.000 / 30 hari).
                </p>
              </div>
            </div>
          </div>

          {/* Status Kost */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Zap className="w-5 h-5 text-orange-500" />
              Status Publikasi
            </h2>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Tersedia (Aktif)</div>
                    <div className="text-[11px] text-slate-400">Tampil di hasil pencarian & peta</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="status"
                  value="tersedia"
                  checked={status === 'tersedia'}
                  onChange={() => setStatus('tersedia')}
                  className="accent-orange-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Draft / Penuh</div>
                    <div className="text-[11px] text-slate-400">Disimpan tanpa tampil di publik</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="status"
                  value="penuh"
                  checked={status === 'penuh'}
                  onChange={() => setStatus('penuh')}
                  className="accent-orange-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

