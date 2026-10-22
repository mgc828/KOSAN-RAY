'use client';

import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Workflow, 
  RefreshCw, 
  Maximize2, 
  Minimize2,
  ShieldCheck, 
  Layers, 
  Database, 
  CreditCard, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronUp,
  ChevronDown,
  Sparkles
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
  const [viewMode, setViewMode] = useState<'fit' | 'clean' | 'original'>('fit');
  const [meta, setMeta] = useState<ArchitectureMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
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
        setFeedback('✓ Diagram arsitektur berhasil disinkronkan dengan rilis terbaru.');
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

  // Determine mode query parameters:
  // - fit: &present=1 (scales the entire diagram to fit inside the canvas without cutting off anything)
  // - clean: &embed=1 (removes all chrome, headers and cards, pure diagram only)
  // - original: raw 100% zoom with scroll
  const getModeParam = () => {
    if (viewMode === 'fit') return '&present=1';
    if (viewMode === 'clean') return '&embed=1';
    return '';
  };

  const iframeSrc = activeTab === 'architecture'
    ? `/api/admin/architecture?view=architecture${getModeParam()}&t=${iframeKey}`
    : `/api/admin/architecture?view=userflow${getModeParam()}&t=${iframeKey}`;

  return (
    <div className="space-y-5">
      {/* Header Info Panel (Collapsible to save vertical screen space) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Live Architecture Sync
              </span>
              <span className="text-xs text-slate-400">
                Otomatis update saat build & git commit
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Peta Arsitektur & Alur Sistem
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Visualisasi topologi komponen, Sentinel WAF, integrasi Midtrans, dan siklus lengkap sewa RAY KOSAN.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setHeaderCollapsed(!headerCollapsed)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-all"
              title={headerCollapsed ? 'Buka Ringkasan' : 'Lipat Ringkasan'}
            >
              {headerCollapsed ? (
                <>
                  <ChevronDown className="w-4 h-4" /> Buka Ringkasan
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4" /> Lipat Ringkasan
                </>
              )}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-medium shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Memindai...' : 'Perbarui Arsitektur'}
            </button>
            <a
              href={iframeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Tab Baru
            </a>
          </div>
        </div>

        {feedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Quick Stats Grid (Collapsible) */}
        {!headerCollapsed && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4 pt-4 border-t border-slate-100">
            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Total Halaman</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{meta?.pageCount || 34}</div>
            </div>
            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">API Handlers</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{meta?.apiCount || 31}</div>
            </div>
            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Next.js Framework</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">v15.4 App</div>
            </div>
            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Active Defense</div>
              <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1 truncate">
                <ShieldCheck className="w-3.5 h-3.5" /> Sentinel WAF
              </div>
            </div>
            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Dual Database</div>
              <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1 truncate">
                <Database className="w-3.5 h-3.5 text-indigo-500" /> Supabase / JSON
              </div>
            </div>
            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Terakhir Update</div>
              <div className="text-xs font-semibold text-slate-700 mt-1 truncate">
                {meta?.lastGenerated ? new Date(meta.lastGenerated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Tersinkron'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Diagram Viewer Container */}
      <div className={`bg-slate-950 rounded-2xl shadow-lg border border-slate-800 overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none shadow-none' : ''
      }`}>
        {/* Navigation & Display Mode Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Network className="w-4 h-4" />
              Arsitektur Komponen & Servis
            </button>
            <button
              onClick={() => setActiveTab('userflow')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'userflow'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Workflow className="w-4 h-4" />
              Alur Pengguna (User Flow)
            </button>
          </div>

          {/* Mode Controls & Fullscreen */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:inline-flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-400">
              <button
                onClick={() => setViewMode('fit')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'fit' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'hover:text-slate-200'
                }`}
                title="Tampilkan 100% utuh di dalam layar tanpa terpotong"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                Fit Utuh
              </button>
              <button
                onClick={() => setViewMode('clean')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'clean' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'hover:text-slate-200'
                }`}
                title="Diagram murni tanpa toolbar / kartu ringkasan"
              >
                Minimalis
              </button>
              <button
                onClick={() => setViewMode('original')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'original' ? 'bg-indigo-600 text-white shadow-xs font-semibold' : 'hover:text-slate-200'
                }`}
                title="Ukuran asli dengan scroll bebas"
              >
                Scroll Bebas
              </button>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              title={isFullscreen ? 'Keluar Fullscreen (Esc)' : 'Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Iframe Viewport: Responsive height that guarantees entire diagram fits */}
        <div 
          className="relative w-full bg-slate-950 flex-1 overflow-hidden" 
          style={{ 
            height: isFullscreen ? 'calc(100vh - 56px)' : (headerCollapsed ? '82vh' : '72vh'),
            minHeight: '560px'
          }}
        >
          <iframe
            key={`${iframeKey}-${viewMode}-${activeTab}`}
            src={iframeSrc}
            className="w-full h-full border-none block"
            title="Archify Diagram Viewer"
          />
        </div>
      </div>

      {/* Deep-dive summary cards below */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Next.js 15 Full-Stack App</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Menyatukan SSR untuk SEO listing kosan dan Client Component interaktif untuk Leaflet Map Clustering, Pencarian Cepat, dan Komparasi Kosan.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Sentinel WAF Protection</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Beroperasi di Edge Middleware sebelum route diakses. Mencegah SQL Injection, Path Traversal, bot crawler, dan honeypot probe otomatis.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CreditCard className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Midtrans & Vercel Cron</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Verifikasi pembayaran QRIS dinamis lewat webhook dengan validasi hash SHA512. Siklus sewa dipantau setiap hari untuk pengingat jatuh tempo H-3.
          </p>
        </div>
      </div>
    </div>
  );
}
