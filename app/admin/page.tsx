'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { INITIAL_KOSTS } from '@/lib/mock-data';
import { Kost, KostMedia, MediaType } from '@/lib/types';
import { 
  INDONESIA_REGIONS,
  getProvinces, 
  getCities, 
  getDistricts, 
  getSubDistricts,
  MatchedRegionResult
} from '@/lib/indonesia-regions';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold gap-2">
      <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
      <span>Memuat Google Maps...</span>
    </div>
  ),
});
import { 
  ShieldCheck, 
  Lock, 
  Plus, 
  Trash2, 
  Edit3,
  Image as ImageIcon, 
  Video, 
  Phone, 
  Check, 
  Eye, 
  UploadCloud, 
  Link as LinkIcon, 
  Sparkles, 
  Compass, 
  ExternalLink, 
  AlertCircle,
  X,
  RefreshCw,
  MapPin,
  CreditCard,
  Users,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  UserCheck,
  UserX,
  Search,
  ArrowUpRight,
  Key,
  EyeOff
} from 'lucide-react';

const COMMON_FACILITIES = [
  'AC Inverter',
  'WiFi Cepat',
  'Kamar Mandi Dalam',
  'Water Heater',
  'Kasur Springbed',
  'Lemari Pakaian',
  'Meja Kerja',
  'Smart TV',
  'Dapur Bersama',
  'Parkir Motor',
  'Parkir Mobil',
  'CCTV 24 Jam',
  'Akses 24 Jam',
  'Penjaga Kost',
];

export default function AdminPage() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const [kosts, setKosts] = useState<Kost[]>([]);
  const [selectedKost, setSelectedKost] = useState<Kost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // State for Add New Kost with Full Address Hierarchy
  const [newKost, setNewKost] = useState({
    nama: '',
    provinsi: 'DKI Jakarta',
    kota: 'Jakarta Selatan',
    kecamatan: 'Setiabudi',
    kelurahan: 'Karet Kuningan',
    kodepos: '12940',
    alamat_jalan: '',
    area: 'Kuningan',
    harga: 2500000,
    tipe: 'campur' as 'putra' | 'putri' | 'campur',
    deskripsi: '',
    owner_whatsapp: '6281288991122',
    latitude: -6.2110,
    longitude: 106.8280,
    fasilitas: ['AC Inverter', 'WiFi Cepat', 'Kamar Mandi Dalam', 'Kasur Springbed'],
  });
  const [newKostMediaList, setNewKostMediaList] = useState<KostMedia[]>([]);

  // State for Edit Kost
  const [editKostData, setEditKostData] = useState<Kost | null>(null);

  // URL input state
  const [urlInput, setUrlInput] = useState('');
  const [urlMediaType, setUrlMediaType] = useState<MediaType>('foto_kamar');
  const [urlIsPreview, setUrlIsPreview] = useState(true);

  // Active Admin View Tab: 'kosts' (Listing & Media) vs 'payments' (Monitoring Pembayaran & User)
  const [activeTab, setActiveTab] = useState<'kosts' | 'payments'>('kosts');

  // Payment Monitoring & User State
  const [paymentStats, setPaymentStats] = useState<{
    totalRevenue: number;
    activeUsers: number;
    totalUsers: number;
    totalTransactions: number;
    pendingTransactions: number;
  }>({
    totalRevenue: 0,
    activeUsers: 0,
    totalUsers: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
  });
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  
  // Classification Filter for Transactions List from Metrics: 'all' | 'revenue' | 'active_users' | 'pending'
  const [selectedMetricFilter, setSelectedMetricFilter] = useState<'all' | 'revenue' | 'active_users' | 'pending'>('all');

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // File input refs
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch Payment & User Monitoring Data
  const fetchPaymentMonitoringData = async () => {
    setIsPaymentLoading(true);
    try {
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPaymentStats(data.stats);
          setTransactionsList(data.transactions || []);
          setUsersList(data.users || []);
        }
      }
    } catch (e) {
      console.error('Failed to load payment data:', e);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleExtendUser = async (userId: string, days = 30) => {
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extend', userId, days }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        fetchPaymentMonitoringData();
      } else {
        showToast(data.error || 'Gagal menambah masa aktif');
      }
    } catch {
      showToast('Gagal menghubungi server');
    }
  };

  const handleRevokeUser = async (userId: string) => {
    if (!confirm('Yakin ingin mencabut status langganan user ini?')) return;
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        fetchPaymentMonitoringData();
      } else {
        showToast(data.error || 'Gagal mencabut langganan');
      }
    } catch {
      showToast('Gagal menghubungi server');
    }
  };

  // Fetch all kosts from server API
  const fetchKostsFromServer = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/kosts');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setKosts(data);
          setSelectedKost((prev) => {
            if (!prev) return data[0];
            const found = data.find(k => k.id === prev.id);
            return found || data[0];
          });
          return;
        }
      }
      setKosts(INITIAL_KOSTS);
      if (!selectedKost && INITIAL_KOSTS.length > 0) {
        setSelectedKost(INITIAL_KOSTS[0]);
      }
    } catch (e) {
      console.error('Failed to load kosts:', e);
      setKosts(INITIAL_KOSTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKostsFromServer();
    fetchPaymentMonitoringData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'kosthunt-admin-secret-2026' || passcode === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Kata sandi admin salah. Gunakan: admin123');
    }
  };

  // -------------------------------------------------------------
  // REGION CASCADING LOGIC FOR "ADD NEW KOST"
  // -------------------------------------------------------------
  const provincesList = useMemo(() => getProvinces(), []);
  const addCitiesList = useMemo(() => getCities(newKost.provinsi), [newKost.provinsi]);
  const addDistrictsList = useMemo(() => getDistricts(newKost.provinsi, newKost.kota), [newKost.provinsi, newKost.kota]);
  const addSubDistrictsList = useMemo(() => getSubDistricts(newKost.provinsi, newKost.kota, newKost.kecamatan), [newKost.provinsi, newKost.kota, newKost.kecamatan]);

  // Postal codes list for current district & subdistricts
  const addPostalCodesList = useMemo(() => {
    const set = new Set<string>();
    addSubDistrictsList.forEach(s => set.add(s.kodepos));
    const dist = addDistrictsList.find(d => d.nama === newKost.kecamatan);
    if (dist?.defaultKodepos) set.add(dist.defaultKodepos);
    return Array.from(set);
  }, [addSubDistrictsList, addDistrictsList, newKost.kecamatan]);

  const handleAddProvinceChange = (prov: string) => {
    const cities = getCities(prov);
    const firstCity = cities[0] || '';
    const districts = getDistricts(prov, firstCity);
    const firstDistrict = districts[0]?.nama || '';
    const subDistricts = getSubDistricts(prov, firstCity, firstDistrict);
    const firstSub = subDistricts[0]?.nama || '';
    const firstKodepos = subDistricts[0]?.kodepos || districts[0]?.defaultKodepos || '';
    const coords = { lat: districts[0]?.lat || -6.2110, lng: districts[0]?.lng || 106.8280 };

    setNewKost(prev => ({
      ...prev,
      provinsi: prov,
      kota: firstCity,
      kecamatan: firstDistrict,
      kelurahan: firstSub,
      kodepos: firstKodepos,
      area: firstDistrict,
      latitude: coords.lat,
      longitude: coords.lng,
    }));
  };

  const handleAddCityChange = (city: string) => {
    const districts = getDistricts(newKost.provinsi, city);
    const firstDistrict = districts[0]?.nama || '';
    const subDistricts = getSubDistricts(newKost.provinsi, city, firstDistrict);
    const firstSub = subDistricts[0]?.nama || '';
    const firstKodepos = subDistricts[0]?.kodepos || districts[0]?.defaultKodepos || '';
    const coords = { lat: districts[0]?.lat || -6.2110, lng: districts[0]?.lng || 106.8280 };

    setNewKost(prev => ({
      ...prev,
      kota: city,
      kecamatan: firstDistrict,
      kelurahan: firstSub,
      kodepos: firstKodepos,
      area: firstDistrict,
      latitude: coords.lat,
      longitude: coords.lng,
    }));
  };

  const handleAddDistrictChange = (distName: string) => {
    const subDistricts = getSubDistricts(newKost.provinsi, newKost.kota, distName);
    const firstSub = subDistricts[0]?.nama || '';
    const distObj = addDistrictsList.find(d => d.nama === distName);
    const firstKodepos = subDistricts[0]?.kodepos || distObj?.defaultKodepos || '';
    const coords = { lat: distObj?.lat || newKost.latitude, lng: distObj?.lng || newKost.longitude };

    setNewKost(prev => ({
      ...prev,
      kecamatan: distName,
      kelurahan: firstSub,
      kodepos: firstKodepos,
      area: distName,
      latitude: coords.lat,
      longitude: coords.lng,
    }));
  };

  const handleAddSubDistrictChange = (subName: string) => {
    const found = addSubDistrictsList.find(s => s.nama === subName);
    setNewKost(prev => ({
      ...prev,
      kelurahan: subName,
      kodepos: found ? found.kodepos : prev.kodepos,
    }));
  };

  // Auto-apply geocoded region (Provinsi, Kota, Kecamatan, Kelurahan, Kodepos) to Add Kost form
  const applyGeocodedRegionToAdd = (region: MatchedRegionResult, lat: number, lng: number, roadSuggestion?: string) => {
    setNewKost(prev => {
      const nextProv = region.provinsi || prev.provinsi || '';
      const validCities = getCities(nextProv);
      const nextCity = (region.kota && validCities.includes(region.kota))
        ? region.kota
        : (validCities.includes(prev.kota) ? prev.kota : validCities[0] || '');

      const validDistricts = getDistricts(nextProv, nextCity);
      const matchedDist = region.kecamatan ? validDistricts.find(d => d.nama.toLowerCase() === region.kecamatan?.toLowerCase()) : undefined;
      const nextDistrict = matchedDist?.nama || (validDistricts.find(d => d.nama === prev.kecamatan)?.nama || validDistricts[0]?.nama || '');

      const validSubDistricts = getSubDistricts(nextProv, nextCity, nextDistrict);
      const matchedSub = region.kelurahan ? validSubDistricts.find(s => s.nama.toLowerCase() === region.kelurahan?.toLowerCase()) : undefined;
      const nextSub = matchedSub?.nama || (validSubDistricts.find(s => s.nama === prev.kelurahan)?.nama || validSubDistricts[0]?.nama || '');

      let nextKodepos = region.kodepos || matchedSub?.kodepos || validSubDistricts.find(s => s.nama === nextSub)?.kodepos || matchedDist?.defaultKodepos || prev.kodepos;

      return {
        ...prev,
        latitude: lat,
        longitude: lng,
        provinsi: nextProv,
        kota: nextCity,
        kecamatan: nextDistrict,
        kelurahan: nextSub,
        kodepos: nextKodepos,
        area: nextDistrict,
        alamat_jalan: roadSuggestion || prev.alamat_jalan,
      };
    });
  };

  // -------------------------------------------------------------
  // REGION CASCADING LOGIC FOR "EDIT KOST"
  // -------------------------------------------------------------
  const editProvinsi = editKostData?.provinsi || 'DKI Jakarta';
  const editKota = editKostData?.kota || 'Jakarta Selatan';
  const editKecamatan = editKostData?.kecamatan || 'Setiabudi';

  const editCitiesList = useMemo(() => getCities(editProvinsi), [editProvinsi]);
  const editDistrictsList = useMemo(() => getDistricts(editProvinsi, editKota), [editProvinsi, editKota]);
  const editSubDistrictsList = useMemo(() => getSubDistricts(editProvinsi, editKota, editKecamatan), [editProvinsi, editKota, editKecamatan]);

  const editPostalCodesList = useMemo(() => {
    const set = new Set<string>();
    editSubDistrictsList.forEach(s => set.add(s.kodepos));
    const dist = editDistrictsList.find(d => d.nama === editKecamatan);
    if (dist?.defaultKodepos) set.add(dist.defaultKodepos);
    return Array.from(set);
  }, [editSubDistrictsList, editDistrictsList, editKecamatan]);

  const handleEditProvinceChange = (prov: string) => {
    if (!editKostData) return;
    const cities = getCities(prov);
    const firstCity = cities[0] || '';
    const districts = getDistricts(prov, firstCity);
    const firstDistrict = districts[0]?.nama || '';
    const subDistricts = getSubDistricts(prov, firstCity, firstDistrict);
    const firstSub = subDistricts[0]?.nama || '';
    const firstKodepos = subDistricts[0]?.kodepos || districts[0]?.defaultKodepos || '';
    const coords = { lat: districts[0]?.lat || -6.2110, lng: districts[0]?.lng || 106.8280 };

    setEditKostData({
      ...editKostData,
      provinsi: prov,
      kota: firstCity,
      kecamatan: firstDistrict,
      kelurahan: firstSub,
      kodepos: firstKodepos,
      area: firstDistrict,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  const handleEditCityChange = (city: string) => {
    if (!editKostData) return;
    const districts = getDistricts(editProvinsi, city);
    const firstDistrict = districts[0]?.nama || '';
    const subDistricts = getSubDistricts(editProvinsi, city, firstDistrict);
    const firstSub = subDistricts[0]?.nama || '';
    const firstKodepos = subDistricts[0]?.kodepos || districts[0]?.defaultKodepos || '';
    const coords = { lat: districts[0]?.lat || -6.2110, lng: districts[0]?.lng || 106.8280 };

    setEditKostData({
      ...editKostData,
      kota: city,
      kecamatan: firstDistrict,
      kelurahan: firstSub,
      kodepos: firstKodepos,
      area: firstDistrict,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  const handleEditDistrictChange = (distName: string) => {
    if (!editKostData) return;
    const subDistricts = getSubDistricts(editProvinsi, editKota, distName);
    const firstSub = subDistricts[0]?.nama || '';
    const distObj = editDistrictsList.find(d => d.nama === distName);
    const firstKodepos = subDistricts[0]?.kodepos || distObj?.defaultKodepos || '';
    const coords = { lat: distObj?.lat || editKostData.latitude, lng: distObj?.lng || editKostData.longitude };

    setEditKostData({
      ...editKostData,
      kecamatan: distName,
      kelurahan: firstSub,
      kodepos: firstKodepos,
      area: distName,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  const handleEditSubDistrictChange = (subName: string) => {
    if (!editKostData) return;
    const found = editSubDistrictsList.find(s => s.nama === subName);
    setEditKostData({
      ...editKostData,
      kelurahan: subName,
      kodepos: found ? found.kodepos : editKostData.kodepos,
    });
  };

  // Auto-apply geocoded region (Provinsi, Kota, Kecamatan, Kelurahan, Kodepos) to Edit Kost form
  const applyGeocodedRegionToEdit = (region: MatchedRegionResult, lat: number, lng: number, roadSuggestion?: string) => {
    setEditKostData(prev => {
      if (!prev) return null;
      const nextProv = region.provinsi || prev.provinsi || '';
      const validCities = getCities(nextProv);
      const nextCity = (region.kota && validCities.includes(region.kota))
        ? region.kota
        : (validCities.includes(prev.kota) ? prev.kota : validCities[0] || '');

      const validDistricts = getDistricts(nextProv, nextCity);
      const matchedDist = region.kecamatan ? validDistricts.find(d => d.nama.toLowerCase() === region.kecamatan?.toLowerCase()) : undefined;
      const nextDistrict = matchedDist?.nama || (validDistricts.find(d => d.nama === prev.kecamatan)?.nama || validDistricts[0]?.nama || '');

      const validSubDistricts = getSubDistricts(nextProv, nextCity, nextDistrict);
      const matchedSub = region.kelurahan ? validSubDistricts.find(s => s.nama.toLowerCase() === region.kelurahan?.toLowerCase()) : undefined;
      const nextSub = matchedSub?.nama || (validSubDistricts.find(s => s.nama === prev.kelurahan)?.nama || validSubDistricts[0]?.nama || '');

      let nextKodepos = region.kodepos || matchedSub?.kodepos || validSubDistricts.find(s => s.nama === nextSub)?.kodepos || matchedDist?.defaultKodepos || prev.kodepos;

      return {
        ...prev,
        latitude: lat,
        longitude: lng,
        provinsi: nextProv,
        kota: nextCity,
        kecamatan: nextDistrict,
        kelurahan: nextSub,
        kodepos: nextKodepos,
        area: nextDistrict,
        alamat_jalan: roadSuggestion || prev.alamat_jalan,
      };
    });
  };

  // Open Edit Modal with selected kost's current data
  const handleOpenEditModal = (kostToEdit: Kost) => {
    setEditKostData({
      ...kostToEdit,
      provinsi: kostToEdit.provinsi || 'DKI Jakarta',
      kota: kostToEdit.kota || 'Jakarta Selatan',
      kecamatan: kostToEdit.kecamatan || kostToEdit.area || 'Setiabudi',
      kelurahan: kostToEdit.kelurahan || 'Karet Kuningan',
      kodepos: kostToEdit.kodepos || '12940',
      alamat_jalan: kostToEdit.alamat_jalan || kostToEdit.alamat,
      media: kostToEdit.media ? [...kostToEdit.media] : [],
      fasilitas: [...kostToEdit.fasilitas],
    });
    setShowEditModal(true);
  };

  // File Upload handler for ADD modal
  const handleAddModalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();

      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        if (!resultUrl) return;

        const isFirst = newKostMediaList.length === 0 && !isVideo;
        const autoType: MediaType = isVideo ? 'video' : (isFirst ? 'foto_gedung' : 'foto_kamar');

        const newMedia: KostMedia = {
          id: `m-upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          kost_id: 'pending',
          tipe: autoType,
          storage_key: `uploads/${file.name}`,
          url: resultUrl,
          urutan: newKostMediaList.length + 1,
          is_preview: newKostMediaList.length < 3,
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
        };

        setNewKostMediaList((prev) => [...prev, newMedia]);
      };

      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
    showToast(`${files.length} file foto/video berhasil dipilih.`);
  };

  // File Upload handler for EDIT modal
  const handleEditModalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editKostData) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentMedia = editKostData.media || [];
    const newItems: KostMedia[] = [];

    Array.from(files).forEach((file, idx) => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();

      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        if (!resultUrl) return;

        const autoType: MediaType = isVideo ? 'video' : 'foto_kamar';
        const item: KostMedia = {
          id: `m-edit-upload-${Date.now()}-${idx}`,
          kost_id: editKostData.id,
          tipe: autoType,
          storage_key: `uploads/${file.name}`,
          url: resultUrl,
          urutan: currentMedia.length + newItems.length + 1,
          is_preview: true,
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
        };

        newItems.push(item);

        if (newItems.length === files.length) {
          setEditKostData({
            ...editKostData,
            media: [...currentMedia, ...newItems],
          });
          showToast(`${files.length} foto/video ditambahkan ke antrian edit.`);
        }
      };

      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Save NEW Kost (POST /api/kosts)
  const handleSaveNewKost = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newKost.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const kostId = `kost-${Date.now()}`;

    // Auto-compose full address from cascading fields
    const streetPart = newKost.alamat_jalan?.trim();
    const fullAlamat = `${streetPart ? streetPart + ', ' : ''}Kel. ${newKost.kelurahan}, Kec. ${newKost.kecamatan}, ${newKost.kota}, ${newKost.provinsi} ${newKost.kodepos}`;

    let finalMedia = newKostMediaList.map((m, idx) => ({
      ...m,
      kost_id: kostId,
      urutan: idx + 1,
    }));

    if (finalMedia.length === 0) {
      finalMedia = [
        {
          id: `m-${kostId}-1`,
          kost_id: kostId,
          tipe: 'foto_gedung',
          storage_key: 'default/gedung.webp',
          url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
          urutan: 1,
          is_preview: true,
          alt_text: `Foto tampak depan ${newKost.nama}`,
        },
      ];
    }

    const created: Kost = {
      id: kostId,
      slug: `${slug}-jakarta`,
      nama: newKost.nama,
      alamat: fullAlamat,
      alamat_jalan: newKost.alamat_jalan,
      kelurahan: newKost.kelurahan,
      kecamatan: newKost.kecamatan,
      kota: newKost.kota,
      provinsi: newKost.provinsi,
      kodepos: newKost.kodepos,
      area: newKost.area || newKost.kecamatan,
      harga: Number(newKost.harga),
      tipe: newKost.tipe,
      latitude: newKost.latitude,
      longitude: newKost.longitude,
      fasilitas: newKost.fasilitas,
      deskripsi: newKost.deskripsi,
      peraturan: ['Tertib dan menjaga kebersihan', 'Jam tenang pukul 23:00 - 06:00'],
      status: 'tersedia',
      owner_whatsapp: newKost.owner_whatsapp,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      media: finalMedia,
    };

    try {
      const res = await fetch('/api/kosts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });

      if (res.ok) {
        const saved = [created, ...kosts.filter(k => k.id !== created.id)];
        setKosts(saved);
        setSelectedKost(created);
        setShowAddModal(false);
        setNewKostMediaList([]);
        showToast(`Sukses! Kost "${created.nama}" berhasil disimpan ke server.`);
      } else {
        showToast('Gagal menyimpan kost ke server.');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan jaringan.');
    }
  };

  // Save EDIT Kost (PUT /api/kosts/[id])
  const handleSaveEditKost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editKostData) return;

    // Auto-compose full address
    const streetPart = editKostData.alamat_jalan?.trim();
    const fullAlamat = `${streetPart ? streetPart + ', ' : ''}Kel. ${editKostData.kelurahan || ''}, Kec. ${editKostData.kecamatan || ''}, ${editKostData.kota}, ${editKostData.provinsi || 'DKI Jakarta'} ${editKostData.kodepos || ''}`;

    const dataToSave: Kost = {
      ...editKostData,
      alamat: fullAlamat,
      area: editKostData.area || editKostData.kecamatan || 'Kuningan',
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/kosts/${editKostData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        const updatedList = kosts.map(k => k.id === editKostData.id ? dataToSave : k);
        setKosts(updatedList);
        setSelectedKost(dataToSave);
        setShowEditModal(false);
        showToast(`Perubahan kost "${dataToSave.nama}" berhasil disimpan!`);
      } else {
        showToast('Gagal memperbarui kost.');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan jaringan saat update.');
    }
  };

  // Delete Kost (DELETE /api/kosts/[id])
  const handleDeleteKost = async (kostId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus listing kost ini secara permanen?')) return;

    try {
      const res = await fetch(`/api/kosts/${kostId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const remaining = kosts.filter(k => k.id !== kostId);
        setKosts(remaining);
        if (selectedKost?.id === kostId) {
          setSelectedKost(remaining[0] || null);
        }
        showToast('Listing kost berhasil dihapus dari server.');
      } else {
        showToast('Gagal menghapus kost.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus kost.');
    }
  };

  // Toggle media preview on selected kost
  const handleTogglePreviewOnSelected = async (mediaId: string) => {
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

    try {
      await fetch(`/api/kosts/${selectedKost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedKost),
      });
      showToast('Status media diperbarui.');
    } catch (e) {
      console.error(e);
    }
  };

  // Delete media item from selected kost
  const handleDeleteMediaFromSelected = async (mediaId: string) => {
    if (!selectedKost) return;
    if (!confirm('Hapus media ini dari listing?')) return;

    const updatedMedia = (selectedKost.media || []).filter(m => m.id !== mediaId);
    const updatedKost = { ...selectedKost, media: updatedMedia };
    setSelectedKost(updatedKost);
    setKosts(kosts.map(k => k.id === updatedKost.id ? updatedKost : k));

    try {
      await fetch(`/api/kosts/${selectedKost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedKost),
      });
      showToast('Media berhasil dihapus.');
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-6">
        <style dangerouslySetInnerHTML={{ __html: 'header, footer, .site-footer, .footer-bottom-center { display: none !important; }' }} />
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6 text-[#F97316]" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900">Panel Pengelola Kost (Admin)</h1>
          <p className="text-xs text-neutral-500">
            Akses kurator kost & manajemen media platform kost-kostan.
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
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            <p className="text-[11px] text-neutral-400">
              Kode pengujian bawaan: <code className="text-[#0F2A43] font-mono font-bold bg-[#FFEDD5] px-1.5 py-0.5 rounded">admin123</code>
            </p>
          </div>

          {authError && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{authError}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#18181B] hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-colors"
          >
            Masuk Panel Admin
          </button>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1 font-semibold"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <style dangerouslySetInnerHTML={{ __html: 'header, footer, .site-footer, .footer-bottom-center { display: none !important; }' }} />
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-500 bg-[#18181B] text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-[#F97316]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F2A43]">
            <ShieldCheck className="w-4 h-4 text-[#EA580C]" />
            <span>Mode Admin Terverifikasi (Server Sync Aktif)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Manajemen Listing Kost & Media
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tambah, edit postingan dengan pemilihan alamat otomatis (Provinsi, Kota, Kecamatan, Kelurahan & Kode Pos).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (activeTab === 'kosts') fetchKostsFromServer();
              else fetchPaymentMonitoringData();
            }}
            title="Muat Ulang Data Server"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${(isLoading || isPaymentLoading) ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
          >
            <span>Lihat Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {activeTab === 'kosts' && (
            <button
              onClick={() => {
                setNewKostMediaList([]);
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-sm transition-transform hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kost Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tab Bar: Kosts vs Payments */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('kosts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'kosts'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Compass className="w-4 h-4 text-[#0F2A43]" />
          <span>Manajemen Listing Kost ({kosts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('payments');
            fetchPaymentMonitoringData();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'payments'
              ? 'bg-[#18181B] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <CreditCard className="w-4 h-4 text-[#F97316]" />
          <span>Monitoring Pembayaran & User</span>
          {paymentStats.pendingTransactions > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {paymentStats.pendingTransactions} baru
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: LISTING KOSTS & MEDIA MANAGEMENT */}
      {activeTab === 'kosts' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Daftar Kost */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-neutral-900">
              Daftar Listing Kost ({kosts.length})
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Klik untuk kelola / edit</span>
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto p-3">
            {kosts.map((k) => {
              const isSelected = selectedKost?.id === k.id;
              const photoCount = k.media?.filter(m => m.tipe !== 'video').length || 0;
              const videoCount = k.media?.filter(m => m.tipe === 'video').length || 0;

              return (
                <div
                  key={k.id}
                  onClick={() => setSelectedKost(k)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#FFEDD5] border-[#F97316] ring-2 ring-[#F97316]/50 shadow-xs'
                      : 'border-neutral-200 hover:border-slate-300 hover:bg-neutral-50/70'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-slate-100 text-slate-700">
                        {k.tipe}
                      </span>
                      <span className="text-[10px] font-bold text-[#0F2A43]">
                        {k.area}
                      </span>
                    </div>
                    <h3 className="text-xs font-extrabold text-neutral-900 truncate">
                      {k.nama}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold mt-1">
                      Rp {k.harga.toLocaleString('id-ID')} <span className="font-normal text-slate-400">/ bln</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-[#EA580C]" />
                        {photoCount} Foto
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3 text-emerald-600" />
                        {videoCount} Video
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(k);
                      }}
                      title="Edit Postingan Kost"
                      className="p-1.5 text-slate-500 hover:text-[#0F2A43] hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteKost(k.id);
                      }}
                      title="Hapus Kost"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2-Columns: Selected Kost Details & Edit Action */}
        {selectedKost ? (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Kost Basic Info Card with EDIT Button */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F2A43] mb-1">
                    <Compass className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>{selectedKost.area}, {selectedKost.kota || 'Jakarta'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="capitalize">{selectedKost.tipe}</span>
                  </div>
                  <h2 className="text-xl font-black text-neutral-900">{selectedKost.nama}</h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0F2A43] shrink-0 mt-0.5" />
                    <span>{selectedKost.alamat}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* EDIT POSTINGAN BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(selectedKost)}
                    className="inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-xs transition-transform hover:scale-102"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Postingan Kost</span>
                  </button>

                  <Link
                    href={`/kost/${(selectedKost.kota || 'jakarta').toLowerCase()}/${selectedKost.area.toLowerCase()}/${selectedKost.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl transition-colors"
                  >
                    <span>Buka Live</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Stats & Quick Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <span className="text-[10px] text-slate-400 font-bold block">HARGA SEWA</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">
                    Rp {selectedKost.harga.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <span className="text-[10px] text-slate-400 font-bold block">WHATSAPP PEMILIK</span>
                  <a
                    href={`https://wa.me/${selectedKost.owner_whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo pemilik ${selectedKost.nama}, ini pesan dari pengelola kost-kostan.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Buka WhatsApp langsung"
                    className="text-xs font-mono font-bold text-emerald-700 hover:text-emerald-800 hover:underline mt-0.5 flex items-center gap-1 truncate"
                  >
                    <span>+{selectedKost.owner_whatsapp}</span>
                    <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0" />
                  </a>
                </div>
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <span className="text-[10px] text-slate-400 font-bold block">STATUS LISTING</span>
                  <span className="text-xs font-bold text-emerald-700 capitalize mt-0.5 block">
                    ● {selectedKost.status}
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <span className="text-[10px] text-slate-400 font-bold block">KODE POS / KEL.</span>
                  <span className="text-[11px] font-mono text-slate-600 mt-0.5 block truncate">
                    {selectedKost.kodepos || '-'} / {selectedKost.kelurahan || '-'}
                  </span>
                </div>
              </div>

              {/* Fasilitas */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">Fasilitas Kost:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedKost.fasilitas.map((f, i) => (
                    <span key={i} className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Media Gallery Section */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#EA580C]" />
                    <span>Galeri Media Kost ({selectedKost.media?.length || 0} Media)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Klik toggle status untuk mengubah akses Preview Gratis vs Terkunci (Rp15rb).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedKost)}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Kelola Foto / Video</span>
                </button>
              </div>

              {/* Media Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(selectedKost.media || []).map((m) => (
                  <div
                    key={m.id}
                    className="border border-neutral-200 rounded-2xl p-3 flex items-start gap-3 bg-neutral-50/60 hover:bg-white hover:border-slate-300 transition-all shadow-xs"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                      {m.tipe === 'video' ? (
                        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-2">
                          <Video className="w-6 h-6 text-[#F97316]" />
                          <span className="text-[9px] font-bold mt-1 text-slate-300">Video</span>
                        </div>
                      ) : (
                        <Image
                          src={m.url || ''}
                          alt={m.alt_text || 'Foto Kost'}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      )}
                      <span className="absolute top-1 left-1 text-[8px] font-black px-1.5 py-0.5 rounded-full capitalize bg-black/70 text-white backdrop-blur-xs">
                        {m.tipe === 'foto_gedung' ? 'Gedung' : m.tipe === 'video' ? 'Video' : 'Kamar'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {m.alt_text || m.storage_key}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {m.url?.startsWith('data:') ? 'File terunggah (Local)' : m.url}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePreviewOnSelected(m.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
                            m.is_preview
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                          }`}
                        >
                          {m.is_preview ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-700" />
                              <span>Publik (Gratis)</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-amber-700" />
                              <span>Terkunci (Rp15rb)</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMediaFromSelected(m.id)}
                          title="Hapus media ini"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Compass className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Pilih salah satu kost di sebelah kiri untuk melihat dan mengedit.</p>
          </div>
        )}
      </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MONITORING PEMBAYARAN & USER LANGGANAN */}
      {/* ======================================================== */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          {/* STATS SUMMARY CARDS (CLICKABLE FILTER) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Pendapatan (Filter Settlement / Berhasil) */}
            <div 
              onClick={() => setSelectedMetricFilter(prev => prev === 'revenue' ? 'all' : 'revenue')}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                selectedMetricFilter === 'revenue'
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md scale-[1.02]'
                  : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pendapatan</p>
                  {selectedMetricFilter === 'revenue' && (
                    <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded-full">Aktif</span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  Rp {paymentStats.totalRevenue.toLocaleString('id-ID')}
                </h3>
                <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Klik untuk filter transaksi berhasil</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200 shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: User Aktif Langganan (Filter User Aktif) */}
            <div 
              onClick={() => setSelectedMetricFilter(prev => prev === 'active_users' ? 'all' : 'active_users')}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                selectedMetricFilter === 'active_users'
                  ? 'bg-[#FFEDD5] border-[#0F2A43] ring-2 ring-[#F97316] shadow-md scale-[1.02]'
                  : 'bg-white border-slate-200 hover:border-[#F97316] hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pelanggan Aktif</p>
                  {selectedMetricFilter === 'active_users' && (
                    <span className="text-[9px] bg-[#0F2A43] text-white font-black px-1.5 py-0.2 rounded-full">Aktif</span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {paymentStats.activeUsers} <span className="text-sm font-bold text-slate-400">/ {paymentStats.totalUsers} User</span>
                </h3>
                <p className="text-[11px] text-blue-600 font-bold mt-1 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Klik untuk filter transaksi user aktif</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-[#FFEDD5] text-[#0F2A43] rounded-2xl flex items-center justify-center border border-[#F97316]/50 shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Menunggu Pembayaran (Filter Pending) */}
            <div 
              onClick={() => setSelectedMetricFilter(prev => prev === 'pending' ? 'all' : 'pending')}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                selectedMetricFilter === 'pending'
                  ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/50 shadow-md scale-[1.02]'
                  : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Transaksi Menunggu</p>
                  {selectedMetricFilter === 'pending' && (
                    <span className="text-[9px] bg-amber-600 text-white font-black px-1.5 py-0.2 rounded-full">Aktif</span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {paymentStats.pendingTransactions}
                </h3>
                <p className="text-[11px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Klik untuk filter transaksi pending</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Paket Standar (Reset / Tampilkan Semua) */}
            <div 
              onClick={() => setSelectedMetricFilter('all')}
              className={`rounded-3xl p-5 shadow-sm flex items-center justify-between cursor-pointer transition-all select-none ${
                selectedMetricFilter === 'all'
                  ? 'bg-gradient-to-br from-[#18181B] to-slate-800 text-white ring-2 ring-[#F97316]'
                  : 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tampilkan Semua</p>
                <h3 className="text-xl font-black text-white mt-1">Semua Riwayat</h3>
                <p className="text-[11px] text-[#F97316] font-medium mt-1">Klik untuk reset filter</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                <CreditCard className="w-6 h-6 text-[#F97316]" />
              </div>
            </div>
          </div>

          {/* TWO COLUMNS: LEFT TRANSACTIONS TABLE, RIGHT USERS MANAGEMENT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUMN 1: LIVE TRANSACTIONS MONITORING */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#0F2A43]" />
                      <span>
                        Riwayat Transaksi Masuk (
                        {
                          transactionsList.filter(t => {
                            if (selectedMetricFilter === 'revenue') return t.transaction_status === 'settlement';
                            if (selectedMetricFilter === 'pending') return t.transaction_status === 'pending';
                            if (selectedMetricFilter === 'active_users') {
                              const activeEmails = usersList.filter(u => u.subscription_status === 'active').map(u => u.email.toLowerCase());
                              return activeEmails.includes(t.user_email?.toLowerCase());
                            }
                            return true;
                          }).length
                        }
                        )
                      </span>
                    </h3>

                    {/* Active Classification Filter Pill */}
                    {selectedMetricFilter !== 'all' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 bg-slate-900 text-white">
                        <span>
                          {selectedMetricFilter === 'revenue' && 'Filter: Transaksi Berhasil'}
                          {selectedMetricFilter === 'active_users' && 'Filter: Pelanggan Aktif'}
                          {selectedMetricFilter === 'pending' && 'Filter: Pending'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedMetricFilter('all')}
                          className="hover:text-rose-400 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {selectedMetricFilter === 'revenue' && 'Menampilkan transaksi pembayaran yang berstatus lunas / berhasil.'}
                    {selectedMetricFilter === 'active_users' && 'Menampilkan transaksi yang dimiliki oleh pelanggan dengan masa aktif yang berjalan.'}
                    {selectedMetricFilter === 'pending' && 'Menampilkan transaksi QRIS yang masih menunggu pembayaran pelanggan.'}
                    {selectedMetricFilter === 'all' && 'Semua tagihan QRIS yang dibuat dan dibayar.'}
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    placeholder="Cari order ID atau email..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full sm:w-52 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                {transactionsList
                  .filter(t => {
                    // 1. Metric Classification Filter
                    if (selectedMetricFilter === 'revenue' && t.transaction_status !== 'settlement') {
                      return false;
                    }
                    if (selectedMetricFilter === 'pending' && t.transaction_status !== 'pending') {
                      return false;
                    }
                    if (selectedMetricFilter === 'active_users') {
                      const activeEmails = usersList.filter(u => u.subscription_status === 'active').map(u => u.email.toLowerCase());
                      if (!activeEmails.includes(t.user_email?.toLowerCase())) {
                        return false;
                      }
                    }

                    // 2. Search query filter
                    if (paymentSearch) {
                      const q = paymentSearch.toLowerCase();
                      const matchOrder = t.order_id.toLowerCase().includes(q);
                      const matchEmail = t.user_email?.toLowerCase().includes(q);
                      if (!matchOrder && !matchEmail) return false;
                    }
                    return true;
                  })
                  .map((tx) => {
                    const isSettled = tx.transaction_status === 'settlement';
                    return (
                      <div
                        key={tx.order_id}
                        className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-xs truncate">
                              {tx.order_id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              isSettled
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {isSettled ? 'Berhasil' : 'Menunggu'}
                            </span>
                          </div>

                          <p className="text-slate-600 text-[11px] font-medium truncate">
                            {tx.user_email || 'user@kost-kostan.id'}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                            <span>{tx.payment_method || 'QRIS'}</span>
                            <span>•</span>
                            <span>
                              {new Date(tx.created_at).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-slate-900 block">
                            Rp {(tx.amount || 15000).toLocaleString('id-ID')}
                          </span>
                          {isSettled && (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 justify-end mt-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Lunas</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {transactionsList.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Belum ada transaksi pembayaran.
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: USER SUBSCRIPTION MANAGEMENT */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0F2A43]" />
                    <span>Daftar User & Hak Akses ({usersList.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Atur masa aktif, tambah hari, atau cabut akses user.</p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Cari email user..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>
              </div>

              {/* Users List with Action Controls */}
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {usersList
                  .filter(u => !userSearch || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((usr) => {
                    const isActive = usr.subscription_status === 'active';
                    return (
                      <div
                        key={usr.id}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-xs truncate">
                                {usr.email}
                              </h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : usr.subscription_status === 'expired'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {isActive ? 'Aktif' : usr.subscription_status === 'expired' ? 'Kedaluwarsa' : 'Gratis'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400 mt-1">
                              ID: <code className="text-slate-600 font-mono text-[10px]">{usr.id}</code>
                            </p>

                            {/* Password Viewer for Admin */}
                            <div className="mt-2 flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 w-fit">
                              <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="text-[11px] font-bold text-slate-600">Password:</span>
                              <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 tracking-wider">
                                {visiblePasswords[usr.id] ? (usr.password || 'password123') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(usr.id)}
                                title={visiblePasswords[usr.id] ? 'Sembunyikan password' : 'Lihat password'}
                                className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                              >
                                {visiblePasswords[usr.id] ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {isActive ? (
                              <div>
                                <span className="text-xs font-black text-emerald-600 block">
                                  {usr.days_remaining} Hari Lagi
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  s/d {new Date(usr.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] font-bold text-slate-400">Tidak Aktif</span>
                            )}
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <div className="text-[11px] text-slate-500">
                            Total Bayar: <strong className="text-slate-800">Rp {(usr.total_paid || 0).toLocaleString('id-ID')}</strong>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Extend +30 Days */}
                            <button
                              type="button"
                              onClick={() => handleExtendUser(usr.id, 30)}
                              title="Tambah Masa Aktif 30 Hari"
                              className="px-2.5 py-1 bg-[#FFEDD5] hover:bg-[#e0f2fe] text-[#0F2A43] border border-[#F97316]/60 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+30 Hari</span>
                            </button>

                            {/* Revoke */}
                            {isActive && (
                              <button
                                type="button"
                                onClick={() => handleRevokeUser(usr.id)}
                                title="Cabut Akses Langganan"
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                              >
                                <UserX className="w-3 h-3" />
                                <span>Cabut</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {usersList.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Belum ada data user terdaftar.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: EDIT POSTINGAN KOST */}
      {/* ======================================================== */}
      {showEditModal && editKostData && (
        <div className="fixed inset-0 z-500 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="font-black text-xl text-neutral-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#0F2A43]" />
                  <span>Edit Postingan Kost</span>
                </h3>
                <p className="text-xs text-slate-500">Perbarui informasi, alamat bertingkat, harga, maupun foto & video kost.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditKost} className="space-y-5 text-xs">
              
              {/* Form Input Data */}
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-800">Nama Kost *</label>
                  <input
                    type="text"
                    required
                    value={editKostData.nama}
                    onChange={(e) => setEditKostData({ ...editKostData, nama: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs font-semibold"
                  />
                </div>

                {/* ALAMAT BERTINGKAT: PROVINSI & KOTA */}
                <div className="p-4 bg-[#FFEDD5] border border-[#F97316]/50 rounded-2xl space-y-3">
                  <h5 className="font-black text-slate-900 text-xs flex items-center gap-1.5 text-[#0F2A43]">
                    <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Lokasi & Alamat Lengkap (Dapat Dipilih):</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">1. Provinsi (Dipilih) *</label>
                      <select
                        value={editProvinsi}
                        onChange={(e) => handleEditProvinceChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-medium"
                      >
                        {provincesList.map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">2. Kota / Kabupaten (Dipilih) *</label>
                      <select
                        value={editKota}
                        onChange={(e) => handleEditCityChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-medium"
                      >
                        {editCitiesList.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* KECAMATAN, KELURAHAN & KODE POS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">3. Kecamatan (Dipilih) *</label>
                      <select
                        value={editKecamatan}
                        onChange={(e) => handleEditDistrictChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-medium"
                      >
                        {editDistrictsList.map(d => (
                          <option key={d.nama} value={d.nama}>{d.nama}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">4. Kelurahan (Dipilih) *</label>
                      <select
                        value={editKostData.kelurahan || editSubDistrictsList[0]?.nama || ''}
                        onChange={(e) => handleEditSubDistrictChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-medium"
                      >
                        {editSubDistrictsList.map(s => (
                          <option key={s.nama} value={s.nama}>{s.nama}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">5. Kode Pos (Dipilih) *</label>
                      <select
                        value={editKostData.kodepos || editPostalCodesList[0] || ''}
                        onChange={(e) => setEditKostData({ ...editKostData, kodepos: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-bold text-[#0F2A43]"
                      >
                        {editPostalCodesList.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* DETAIL JALAN */}
                  <div className="space-y-1 pt-1">
                    <label className="font-bold text-slate-700">Detail Jalan & Nomor Rumah / Patokan:</label>
                    <input
                      type="text"
                      value={editKostData.alamat_jalan || ''}
                      onChange={(e) => setEditKostData({ ...editKostData, alamat_jalan: e.target.value })}
                      placeholder="Contoh: Jl. Karet Pedurenan No. 28, RT 02 / RW 04"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-medium"
                    />
                  </div>

                  {/* GOOGLE MAPS PIN PICKER & AUTO-GENERATE LOCATION */}
                  <div className="pt-2 border-t border-[#F97316]/30">
                    <LocationPickerMap
                      initialLat={editKostData.latitude || -6.2110}
                      initialLng={editKostData.longitude || 106.8280}
                      searchAddress={`${editKostData.alamat_jalan ? editKostData.alamat_jalan + ', ' : ''}${editKostData.kelurahan || ''}, ${editKostData.kecamatan || ''}, ${editKostData.kota || ''}`}
                      onLocationChange={(lat, lng, roadSuggestion, regionDetails) => {
                        if (regionDetails && Object.keys(regionDetails).length > 0) {
                          applyGeocodedRegionToEdit(regionDetails, lat, lng, roadSuggestion);
                        } else {
                          setEditKostData(prev => prev ? ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                            alamat_jalan: roadSuggestion || prev.alamat_jalan,
                          }) : null);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-800">Tipe Kost *</label>
                    <select
                      value={editKostData.tipe}
                      onChange={(e) => setEditKostData({ ...editKostData, tipe: e.target.value as 'putra' | 'putri' | 'campur' })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-medium"
                    >
                      <option value="campur">Campur</option>
                      <option value="putri">Khusus Putri</option>
                      <option value="putra">Khusus Putra</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-800">Status Listing *</label>
                    <select
                      value={editKostData.status}
                      onChange={(e) => setEditKostData({ ...editKostData, status: e.target.value as 'tersedia' | 'penuh' })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-medium"
                    >
                      <option value="tersedia">Tersedia (Buka)</option>
                      <option value="penuh">Penuh (Kamar Habis)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-800">Harga Sewa / Bulan (Rp) *</label>
                    <input
                      type="number"
                      required
                      min={500000}
                      step={50000}
                      value={editKostData.harga}
                      onChange={(e) => setEditKostData({ ...editKostData, harga: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-800">Nomor WhatsApp Pemilik *</label>
                    <input
                      type="text"
                      required
                      value={editKostData.owner_whatsapp}
                      onChange={(e) => setEditKostData({ ...editKostData, owner_whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-800">Deskripsi Kost *</label>
                  <textarea
                    rows={2}
                    required
                    value={editKostData.deskripsi}
                    onChange={(e) => setEditKostData({ ...editKostData, deskripsi: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs"
                  />
                </div>
              </div>

              {/* Fasilitas */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-black text-slate-900 text-xs uppercase tracking-wider text-[#0F2A43]">
                  Fasilitas Kost
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {COMMON_FACILITIES.map((fac) => {
                    const isChecked = editKostData.fasilitas.includes(fac);
                    return (
                      <button
                        type="button"
                        key={fac}
                        onClick={() => {
                          const updated = isChecked
                            ? editKostData.fasilitas.filter(f => f !== fac)
                            : [...editKostData.fasilitas, fac];
                          setEditKostData({ ...editKostData, fasilitas: updated });
                        }}
                        className={`px-3 py-2 rounded-xl text-left text-[11px] font-bold border transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-[#FFEDD5] border-[#F97316] text-[#0F2A43]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate">{fac}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-[#0F2A43] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kelola Foto & Video di Modal Edit */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider text-[#0F2A43]">
                    Foto & Video ({editKostData.media?.length || 0} Media)
                  </h4>

                  <input
                    type="file"
                    ref={editFileInputRef}
                    multiple
                    accept="image/*,video/*"
                    onChange={handleEditModalFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-slate-950 px-3 py-1.5 rounded-xl text-[11px] font-black shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Foto/Video Baru</span>
                  </button>
                </div>

                {/* Media Grid di Modal Edit */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {(editKostData.media || []).map((m) => (
                    <div
                      key={m.id}
                      className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-1.5 flex flex-col justify-between"
                    >
                      <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-900">
                        {m.tipe === 'video' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white">
                            <Video className="w-6 h-6 text-[#F97316]" />
                            <span className="text-[9px] font-bold text-slate-300">Video</span>
                          </div>
                        ) : (
                          <Image
                            src={m.url || ''}
                            alt={m.alt_text}
                            fill
                            sizes="120px"
                            className="object-cover"
                            unoptimized
                          />
                        )}

                        <span className="absolute top-1 left-1 text-[8px] font-black px-1.5 py-0.5 rounded-full capitalize bg-black/75 text-white">
                          {m.tipe.replace('_', ' ')}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setEditKostData({
                              ...editKostData,
                              media: editKostData.media?.filter(item => item.id !== m.id),
                            });
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="mt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editKostData.media?.map(item => item.id === m.id ? { ...item, is_preview: !item.is_preview } : item);
                            setEditKostData({ ...editKostData, media: updated });
                          }}
                          className={`w-full py-1 rounded-lg text-[9px] font-extrabold transition-colors ${
                            m.is_preview
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {m.is_preview ? '👁️ Preview Gratis' : '🔒 Khusus Rp15rb'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-slate-950 rounded-xl font-black shadow-md transition-transform hover:scale-102 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: TAMBAH LISTING KOST BARU (ALAMAT DROPDOWN BERTINGKAT) */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-500 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="font-black text-xl text-neutral-900">Posting Listing Kost Baru</h3>
                <p className="text-xs text-slate-500">Pilih wilayah bertingkat (Provinsi, Kota, Kecamatan, Kelurahan & Kode Pos otomatis).</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewKost} className="space-y-5 text-xs">
              
              {/* Form Input Data */}
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-800">Nama Kost *</label>
                  <input
                    type="text"
                    required
                    value={newKost.nama}
                    onChange={(e) => setNewKost({ ...newKost, nama: e.target.value })}
                    placeholder="Contoh: Kost Kuningan Prime Suites"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs font-semibold"
                  />
                </div>

                {/* ALAMAT BERTINGKAT: PROVINSI, KOTA, KECAMATAN, KELURAHAN & KODE POS */}
                <div className="p-4 bg-[#FFEDD5] border border-[#F97316]/50 rounded-2xl space-y-3">
                  <h5 className="font-black text-slate-900 text-xs flex items-center gap-1.5 text-[#0F2A43]">
                    <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>Pilihan Wilayah & Alamat (Wajib Dipilih, Bukan Diketik):</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">1. Provinsi (Dipilih) *</label>
                      <select
                        value={newKost.provinsi}
                        onChange={(e) => handleAddProvinceChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-medium"
                      >
                        {provincesList.map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">2. Kota / Kabupaten (Dipilih) *</label>
                      <select
                        value={newKost.kota}
                        onChange={(e) => handleAddCityChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-medium"
                      >
                        {addCitiesList.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* KECAMATAN, KELURAHAN & KODE POS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">3. Kecamatan (Dipilih) *</label>
                      <select
                        value={newKost.kecamatan}
                        onChange={(e) => handleAddDistrictChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-medium"
                      >
                        {addDistrictsList.map(d => (
                          <option key={d.nama} value={d.nama}>{d.nama}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">4. Kelurahan (Dipilih) *</label>
                      <select
                        value={newKost.kelurahan}
                        onChange={(e) => handleAddSubDistrictChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-medium"
                      >
                        {addSubDistrictsList.map(s => (
                          <option key={s.nama} value={s.nama}>{s.nama}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">5. Kode Pos (Otomatis & Dipilih) *</label>
                      <select
                        value={newKost.kodepos}
                        onChange={(e) => setNewKost({ ...newKost, kodepos: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-bold text-[#0F2A43]"
                      >
                        {addPostalCodesList.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* DETAIL JALAN */}
                  <div className="space-y-1 pt-1">
                    <label className="font-bold text-slate-700">Detail Jalan & Nomor Rumah / Patokan:</label>
                    <input
                      type="text"
                      value={newKost.alamat_jalan}
                      onChange={(e) => setNewKost({ ...newKost, alamat_jalan: e.target.value })}
                      placeholder="Contoh: Jl. Karet Pedurenan No. 12, RT 02 / RW 04"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white font-medium"
                    />
                  </div>

                  {/* GOOGLE MAPS PIN PICKER & AUTO-GENERATE LOCATION */}
                  <div className="pt-2 border-t border-[#F97316]/30">
                    <LocationPickerMap
                      initialLat={newKost.latitude}
                      initialLng={newKost.longitude}
                      searchAddress={`${newKost.alamat_jalan ? newKost.alamat_jalan + ', ' : ''}${newKost.kelurahan}, ${newKost.kecamatan}, ${newKost.kota}`}
                      onLocationChange={(lat, lng, roadSuggestion, regionDetails) => {
                        if (regionDetails && Object.keys(regionDetails).length > 0) {
                          applyGeocodedRegionToAdd(regionDetails, lat, lng, roadSuggestion);
                        } else {
                          setNewKost(prev => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                            alamat_jalan: roadSuggestion || prev.alamat_jalan,
                          }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-800">Tipe Kost *</label>
                    <select
                      value={newKost.tipe}
                      onChange={(e) => setNewKost({ ...newKost, tipe: e.target.value as 'putra' | 'putri' | 'campur' })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs bg-white"
                    >
                      <option value="campur">Campur</option>
                      <option value="putri">Khusus Putri</option>
                      <option value="putra">Khusus Putra</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-800">Harga Sewa / Bulan (Rp) *</label>
                    <input
                      type="number"
                      required
                      min={500000}
                      step={50000}
                      value={newKost.harga}
                      onChange={(e) => setNewKost({ ...newKost, harga: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-800">Nomor WhatsApp Pemilik *</label>
                    <input
                      type="text"
                      required
                      value={newKost.owner_whatsapp}
                      onChange={(e) => setNewKost({ ...newKost, owner_whatsapp: e.target.value })}
                      placeholder="6281234567890"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-800">Area Pencarian (Filter & Navigasi):</label>
                    <input
                      type="text"
                      value={newKost.area}
                      readOnly
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-100 font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-800">Deskripsi Kost *</label>
                  <textarea
                    rows={2}
                    required
                    value={newKost.deskripsi}
                    onChange={(e) => setNewKost({ ...newKost, deskripsi: e.target.value })}
                    placeholder="Ceritakan kelebihan lokasi, akses jalan, keamanan..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F97316] text-xs"
                  />
                </div>
              </div>

              {/* Fasilitas */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-black text-slate-900 text-xs uppercase tracking-wider text-[#0F2A43]">
                  Fasilitas Tersedia
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {COMMON_FACILITIES.map((fac) => {
                    const isChecked = newKost.fasilitas.includes(fac);
                    return (
                      <button
                        type="button"
                        key={fac}
                        onClick={() => {
                          const updated = isChecked
                            ? newKost.fasilitas.filter(f => f !== fac)
                            : [...newKost.fasilitas, fac];
                          setNewKost({ ...newKost, fasilitas: updated });
                        }}
                        className={`px-3 py-2 rounded-xl text-left text-[11px] font-bold border transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-[#FFEDD5] border-[#F97316] text-[#0F2A43]'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate">{fac}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-[#0F2A43] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Foto & Video */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider text-[#0F2A43]">
                    Foto & Video Kost ({newKostMediaList.length} Ditambahkan)
                  </h4>

                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded-full font-bold">
                    JPG, PNG, WEBP, MP4
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3 hover:border-[#F97316] transition-colors">
                  <input
                    type="file"
                    ref={addFileInputRef}
                    multiple
                    accept="image/*,video/*"
                    onChange={handleAddModalFileUpload}
                    className="hidden"
                  />
                  <div className="w-10 h-10 bg-[#FFEDD5] text-[#0F2A43] rounded-2xl flex items-center justify-center mx-auto border border-[#F97316]/40">
                    <UploadCloud className="w-5 h-5 text-[#EA580C]" />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-xs transition-all hover:scale-102"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pilih Foto & Video dari Perangkat</span>
                    </button>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Bisa pilih beberapa foto sekaligus dari komputer / galeri HP.
                    </p>
                  </div>
                </div>

                {/* Alternatively Add via URL */}
                <div className="p-3 bg-[#FFEDD5] border border-[#F97316]/40 rounded-2xl space-y-2">
                  <span className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-[#0F2A43]" />
                    <span>Atau Tambahkan dari URL Link:</span>
                  </span>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... atau URL Video MP4"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F97316]"
                    />
                    <select
                      value={urlMediaType}
                      onChange={(e) => setUrlMediaType(e.target.value as MediaType)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="foto_kamar">Foto Kamar</option>
                      <option value="foto_gedung">Foto Gedung Depan</option>
                      <option value="video">Video Tour</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!urlInput.trim()) return;
                        const newMedia: KostMedia = {
                          id: `media-url-${Date.now()}`,
                          kost_id: 'pending',
                          tipe: urlMediaType,
                          storage_key: `url/${urlMediaType}-${Date.now()}`,
                          url: urlInput.trim(),
                          urutan: newKostMediaList.length + 1,
                          is_preview: urlIsPreview,
                          alt_text: `Media Kost (${urlMediaType})`,
                        };
                        setNewKostMediaList([...newKostMediaList, newMedia]);
                        setUrlInput('');
                        showToast('Media dari link URL ditambahkan.');
                      }}
                      disabled={!urlInput.trim()}
                      className="bg-[#18181B] hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-3 py-2 rounded-xl text-xs whitespace-nowrap"
                    >
                      + Tambah URL
                    </button>
                  </div>
                </div>

                {/* Media Preview Grid */}
                {newKostMediaList.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Daftar Media Terpilih ({newKostMediaList.length}):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                      {newKostMediaList.map((m, idx) => (
                        <div
                          key={m.id}
                          className="relative group border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-1.5 flex flex-col justify-between"
                        >
                          <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-900">
                            {m.tipe === 'video' ? (
                              <div className="w-full h-full flex flex-col items-center justify-center text-white">
                                <Video className="w-6 h-6 text-[#F97316]" />
                                <span className="text-[9px] font-bold text-slate-300">Video</span>
                              </div>
                            ) : (
                              <Image
                                src={m.url || ''}
                                alt={m.alt_text}
                                fill
                                sizes="120px"
                                className="object-cover"
                                unoptimized
                              />
                            )}

                            <span className="absolute top-1 left-1 text-[8px] font-black px-1.5 py-0.5 rounded-full capitalize bg-black/75 text-white">
                              {idx === 0 && m.tipe !== 'video' ? 'Sampul' : m.tipe.replace('_', ' ')}
                            </span>

                            <button
                              type="button"
                              onClick={() => setNewKostMediaList(newKostMediaList.filter(item => item.id !== m.id))}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 shadow-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setNewKostMediaList(
                                  newKostMediaList.map(item => item.id === m.id ? { ...item, is_preview: !item.is_preview } : item)
                                );
                              }}
                              className={`w-full py-1 rounded-lg text-[9px] font-extrabold transition-colors ${
                                m.is_preview
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {m.is_preview ? '👁️ Preview Gratis' : '🔒 Khusus Rp15rb'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-center gap-2 text-[11px]">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Belum ada foto/video yang diunggah. Jika dilewati, sistem akan menggunakan 1 foto sampul standar.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-slate-950 rounded-xl font-black shadow-md transition-transform hover:scale-102 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan & Posting Kost</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
