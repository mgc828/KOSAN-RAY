'use client';

import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Workflow, 
  RefreshCw, 
  Maximize2, 
  ShieldCheck, 
  Layers, 
  Database, 
  CreditCard, 
  Clock, 
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ArchitectureMeta {
  name: string;
  version: string;
  nextVersion: string;
  reactVersion: string;
  pageCount: number;
  apiCount: number;
  totalRoutes: number;
  lastGenerated: string;
  status: string;
  artifacts?: {
    architecture: string;
    userFlow: string;
  };
}

export default function AdminArsitekturPage() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'userflow'>('architecture');
  const [meta, setMeta] = useState<ArchitectureMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/architecture?view=meta');
      if (res.ok) {
        const data = await res.json();
        setMeta(data);
      }
    } catch (err) {
      console.error('Gagal mengambil metadata arsitektur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      setFeedback('Sedang memindai codebase dan mengompilasi diagram...');
      const res = await fetch('/api/admin/architecture', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMeta(data.metadata);
        setIframeKey(Date.now());
        setFeedback('✓ Diagram arsitektur berhasil diperbarui ke kondisi source code terkini.');
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback(`⚠️ Gagal: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch (err: any) {
      setFeedback(`⚠️ Terjadi kesalahan: ${err.message}`);
    } finally {
      setRegenerating(false);
    }
  };

  const iframeSrc = activeTab === 'architecture'
    ? `/api/admin/architecture?view=architecture&t=${iframeKey}`
    : `/api/admin/architecture?view=userflow&t=${iframeKey}`;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Live Architecture Sync
              </span>
              <span className="text-xs text-slate-400">
                Auto-update saat build & git commit
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Peta Arsitektur & Alur Sistem
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Visualisasi interaktif topologi komponen, boundary keamanan Sentinel WAF, integrasi Midtrans, dan siklus lengkap sewa RAY KOSAN.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Memindai Codebase...' : 'Perbarui Arsitektur'}
            </button>
            <a
              href={iframeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Buka Tab Baru
            </a>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Total Halaman</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{meta?.pageCount || 33}</div>
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-xs font-medium text-slate-500">API Handlers</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{meta?.apiCount || 30}</div>
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Next.js Framework</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">v15.4 App</div>
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Active Security</div>
            <div className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Sentinel WAF
            </div>
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Dual Database</div>
            <div className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1">
              <Database className="w-4 h-4 text-indigo-500" /> Supabase/JSON
            </div>
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Sinkronisasi Terakhir</div>
            <div className="text-xs font-semibold text-slate-700 mt-1.5 truncate">
              {meta?.lastGenerated ? new Date(meta.lastGenerated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Baru saja'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher & Viewer Canvas */}
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''}`}>
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-4 h-4" />
              Arsitektur Komponen & Servis
            </button>
            <button
              onClick={() => setActiveTab('userflow')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'userflow'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Workflow className="w-4 h-4" />
              Alur Pengguna (User Flow)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
              title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Iframe Viewer */}
        <div className="relative w-full bg-slate-950 flex-1" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : '750px' }}>
          <iframe
            key={iframeKey}
            src={iframeSrc}
            className="w-full h-full border-none"
            title="Archify Diagram Viewer"
          />
        </div>
      </div>

      {/* Architecture Deep Dive Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900">Next.js 15 App Architecture</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Menyatukan Server-Side Rendering (SSR) untuk SEO listing kosan dan Client Component interaktif untuk Leaflet Map, Autocomplete, dan Filter Faceted.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900">Sentinel WAF Protection</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Berjalan di Next.js Edge Middleware sebelum route diakses. Mendeteksi SQL Injection, Path Traversal, bot crawling, dan scanner vulnerability otomatis.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900">Midtrans & Vercel Cron</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Verifikasi pembayaran QRIS otomatis lewat webhook dengan hash SHA512. Siklus hidup sewa dipantau setiap hari oleh Vercel Cron untuk peringatan H-3.
          </p>
        </div>
      </div>
    </div>
  );
}
