'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BellRing, ExternalLink, GitCompare, History, Loader2, Network, RefreshCw, Search, Trash2, X } from 'lucide-react';
import SiteDiagram, { KIND_STYLE } from '@/components/admin/site-map/SiteDiagram';
import { ancestorsOf, buildTree, defaultCollapsed, type TreeNode } from '@/lib/site-tree';
import type { PageNode, Scan } from '@/lib/site-crawler';
import type { HistoryItem, SiteSummary } from '@/lib/site-map-store';

type Tab = 'diagram' | 'daftar' | 'delta';
type KindFilter = 'all' | 'ok' | 'problem' | 'redirect' | 'other';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const host = (o: string) => o.replace(/^https?:\/\//, '');

const matchesKind = (p: PageNode, f: KindFilter) =>
  f === 'all' ||
  (f === 'ok' && p.kind === 'ok') ||
  (f === 'redirect' && p.kind === 'redirect') ||
  (f === 'problem' && (p.kind === 'client-error' || p.kind === 'server-error' || p.kind === 'error')) ||
  (f === 'other' && (p.kind === 'blocked' || p.kind === 'unvisited' || p.kind === 'code-only'));

function KindBadge({ kind }: { kind: PageNode['kind'] }) {
  const s = KIND_STYLE[kind];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
      <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export default function PetaSitusPage() {
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scan, setScan] = useState<Scan | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [auto, setAuto] = useState(false);
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(80);
  const [maxDepth, setMaxDepth] = useState(4);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('daftar');
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    setUrl(window.location.origin);
    if (window.innerWidth >= 1024) setTab('diagram');
  }, []);

  const loadSites = useCallback(async () => {
    const r = await fetch('/api/admin/site-map', { cache: 'no-store' });
    if (r.ok) setSites((await r.json()).sites ?? []);
  }, []);

  const applyScan = useCallback((s: Scan, h: HistoryItem[], a: boolean) => {
    setScan(s);
    setHistory(h);
    setAuto(a);
    setSelected(null);
    setQuery('');
    setKindFilter('all');
    setCollapsed(defaultCollapsed(buildTree(s.pages)));
  }, []);

  const openSite = useCallback(
    async (id: string) => {
      setError('');
      const r = await fetch(`/api/admin/site-map?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setError(d.error || 'Gagal memuat data.');
      setActiveId(id);
      applyScan(d.scan, d.history, d.auto);
    },
    [applyScan],
  );

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  const runScan = async (target: string) => {
    if (!target.trim()) return setError('Isi alamat situs dulu.');
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/admin/site-map/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target.trim(), maxPages, maxDepth }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Pemindaian gagal.');
      setActiveId(d.site?.id ?? null);
      applyScan(d.scan, d.history, d.auto);
      if (!d.first) setTab('delta');
      loadSites();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pemindaian gagal.');
    } finally {
      setBusy(false);
    }
  };

  const toggleAuto = async () => {
    if (!activeId) return;
    const next = !auto;
    setAuto(next);
    const r = await fetch('/api/admin/site-map', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: activeId, auto: next }) });
    if (!r.ok) setAuto(!next);
    else loadSites();
  };

  const removeSite = async () => {
    if (!activeId || !window.confirm('Hapus data peta situs ini beserta riwayatnya?')) return;
    await fetch(`/api/admin/site-map?id=${encodeURIComponent(activeId)}`, { method: 'DELETE' });
    setActiveId(null);
    setScan(null);
    setHistory([]);
    loadSites();
  };

  const tree: TreeNode | null = useMemo(() => (scan ? buildTree(scan.pages) : null), [scan]);
  const pageMap = useMemo(() => new Map((scan?.pages ?? []).map((p) => [p.path, p])), [scan]);

  const filtering = query.trim() !== '' || kindFilter !== 'all';
  const matchedPaths = useMemo(() => {
    if (!scan || !filtering) return null;
    const q = query.trim().toLowerCase();
    return new Set(
      scan.pages
        .filter((p) => matchesKind(p, kindFilter) && (!q || `${p.path} ${p.title ?? ''} ${p.h1 ?? ''}`.toLowerCase().includes(q)))
        .map((p) => p.path),
    );
  }, [scan, query, kindFilter, filtering]);

  // Saat mencari, buka cabang yang berisi hasil
  const effectiveCollapsed = useMemo(() => {
    if (!matchedPaths) return collapsed;
    const c = new Set(collapsed);
    matchedPaths.forEach((p) => ancestorsOf(p).forEach((a) => c.delete(a)));
    return c;
  }, [collapsed, matchedPaths]);

  const related = useMemo(() => {
    const s = new Set<string>();
    const sel = selected ? pageMap.get(selected) : undefined;
    if (!sel || !scan) return s;
    sel.out.forEach((o) => s.add(o));
    scan.pages.forEach((p) => p.out.includes(sel.path) && s.add(p.path));
    return s;
  }, [selected, pageMap, scan]);

  const toggle = (id: string) =>
    setCollapsed((c) => {
      const n = new Set(c);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const sel = selected ? pageMap.get(selected) : undefined;
  const incoming = useMemo(() => (sel && scan ? scan.pages.filter((p) => p.out.includes(sel.path)).map((p) => p.path) : []), [sel, scan]);
  const listPages = useMemo(
    () => (scan ? [...scan.pages].filter((p) => !matchedPaths || matchedPaths.has(p.path)).sort((a, b) => a.path.localeCompare(b.path)) : []),
    [scan, matchedPaths],
  );
  const lastDiff = history[0]?.diff;
  const hasDelta = history.length > 1;

  const inputCls = 'w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F2A43]/20 focus:border-[#0F2A43]';

  return (
    <div className="space-y-5 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-[#0F2A43] flex items-center gap-2">
          <Network className="w-6 h-6 text-orange-500" /> Peta Situs
        </h1>
        <p className="text-sm text-slate-500 mt-1">Baca struktur halaman sebuah situs, lihat hubungan antar halaman, dan pantau perubahannya.</p>
      </div>

      {/* Form pemindaian */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runScan(url);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://contoh.com" inputMode="url" aria-label="Alamat situs" className={inputCls} />
          <button disabled={busy} className="h-11 px-5 rounded-xl bg-[#0F2A43] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shrink-0">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {busy ? 'Membaca…' : 'Baca Situs'}
          </button>
        </form>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Pintasan:</span>
          <button type="button" onClick={() => setUrl(origin)} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-semibold cursor-pointer">Situs ini</button>
          <button type="button" onClick={() => setUrl(origin + '/admin')} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-semibold cursor-pointer">Halaman admin</button>
          <label className="flex items-center gap-1.5 ml-auto text-slate-500">
            Maks. halaman
            <input type="number" min={5} max={80} value={maxPages} onChange={(e) => setMaxPages(Number(e.target.value))} className="w-20 h-9 rounded-lg border border-slate-200 px-2 text-slate-800" />
          </label>
          <label className="flex items-center gap-1.5 text-slate-500">
            Kedalaman
            <input type="number" min={1} max={8} value={maxDepth} onChange={(e) => setMaxDepth(Number(e.target.value))} className="w-16 h-9 rounded-lg border border-slate-200 px-2 text-slate-800" />
          </label>
        </div>
        {error && (
          <p role="alert" className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
          </p>
        )}
      </section>

      {/* Situs tersimpan */}
      {sites.length > 0 && (
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {sites.map((s) => (
            <button
              key={s.id}
              onClick={() => openSite(s.id)}
              className={`shrink-0 text-left rounded-xl border px-3.5 py-2.5 cursor-pointer transition-colors ${activeId === s.id ? 'border-[#0F2A43] bg-[#0F2A43] text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
            >
              <span className="block text-sm font-bold">{host(s.origin)}</span>
              <span className={`block text-[11px] mt-0.5 ${activeId === s.id ? 'text-white/70' : 'text-slate-400'}`}>
                {s.pages} halaman · {fmtDate(s.scannedAt)}
                {s.auto ? ' · dipantau' : ''}
                {s.lastChange ? ' · ada perubahan' : ''}
              </span>
            </button>
          ))}
        </div>
      )}

      {!scan && !busy && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Belum ada peta yang dibuka. Tekan <b>Baca Situs</b> untuk memindai, atau pilih situs tersimpan di atas.
        </div>
      )}

      {scan && tree && (
        <>
          {/* Ringkasan */}
          <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <a href={scan.origin} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-[#0F2A43] hover:underline flex items-center gap-1.5">
                {host(scan.origin)} <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-xs text-slate-400">dipindai {fmtDate(scan.finishedAt)} · {(scan.durationMs / 1000).toFixed(1)} dtk</span>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => runScan(scan.startUrl)} disabled={busy} className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
                  <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} /> Baca ulang
                </button>
                <button onClick={toggleAuto} aria-pressed={auto} className={`h-9 px-3 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${auto ? 'border-orange-300 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600'}`}>
                  <BellRing className="w-3.5 h-3.5" /> {auto ? 'Dipantau harian' : 'Pantau otomatis'}
                </button>
                <button onClick={removeSite} aria-label="Hapus situs tersimpan" className="h-9 w-9 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 flex items-center justify-center cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { l: 'Halaman', v: scan.stats.pages },
                { l: 'Normal', v: scan.stats.ok },
                { l: 'Error / gagal', v: scan.stats.errors },
                { l: 'Pengalihan', v: scan.stats.redirects },
              ].map((c) => (
                <div key={c.l} className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-xl font-bold text-[#0F2A43]">{c.v}</p>
                  <p className="text-[11px] text-slate-500">{c.l}</p>
                </div>
              ))}
            </div>
            {scan.truncated && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Pemindaian berhenti sebelum selesai ({scan.truncatedReason || 'batas tercapai'}). Naikkan batas halaman/kedalaman untuk hasil lebih lengkap.
              </p>
            )}
            {scan.externalDomains.length > 0 && (
              <p className="text-xs text-slate-500">
                Tautan keluar: {scan.externalDomains.slice(0, 6).map((d) => `${d.host} (${d.count})`).join(', ')}
                {scan.externalDomains.length > 6 ? ` +${scan.externalDomains.length - 6} lainnya` : ''}
              </p>
            )}
          </section>

          {/* Bilah alat */}
          <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
            <div role="tablist" className="grid grid-cols-3 bg-slate-100 rounded-xl p-1 lg:w-auto">
              {([
                ['diagram', 'Diagram', Network],
                ['daftar', 'Daftar', Search],
                ['delta', 'Perubahan', GitCompare],
              ] as const).map(([k, label, Icon]) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`h-9 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer ${tab === k ? 'bg-white text-[#0F2A43] shadow-sm' : 'text-slate-500'}`}>
                  <Icon className="w-4 h-4" /> {label}
                  {k === 'delta' && lastDiff && hasDelta && lastDiff.added.length + lastDiff.removed.length + lastDiff.changed.length > 0 && <span className="w-2 h-2 rounded-full bg-orange-500" />}
                </button>
              ))}
            </div>
            {tab !== 'delta' && (
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari path atau judul…" aria-label="Cari halaman" className={inputCls + ' pl-9'} />
                </div>
                <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value as KindFilter)} aria-label="Filter status" className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
                  <option value="all">Semua status</option>
                  <option value="ok">Normal</option>
                  <option value="problem">Bermasalah</option>
                  <option value="redirect">Pengalihan</option>
                  <option value="other">Belum dibaca / kode</option>
                </select>
              </div>
            )}
          </div>

          <div className={`grid gap-4 ${tab !== 'delta' && sel ? 'lg:grid-cols-[1fr_340px]' : ''}`}>
            <div className="min-w-0">
              {tab === 'diagram' && (
                <SiteDiagram
                  root={tree}
                  collapsed={effectiveCollapsed}
                  selected={selected}
                  matches={matchedPaths}
                  related={related}
                  onSelect={setSelected}
                  onToggle={toggle}
                  openHref={(p) => scan.origin + p}
                />
              )}

              {tab === 'daftar' && (
                <ul className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                  {listPages.length === 0 && <li className="p-6 text-sm text-slate-500 text-center">Tidak ada halaman yang cocok.</li>}
                  {listPages.map((p) => (
                    <li key={p.path}>
                      <button onClick={() => setSelected(p.path)} className={`w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 ${selected === p.path ? 'bg-orange-50' : ''}`}>
                        <span className="w-1.5 self-stretch rounded-full" style={{ background: KIND_STYLE[p.kind].color }} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-[#0F2A43] truncate">{p.path}</span>
                          <span className="block text-xs text-slate-500 truncate">{p.title || p.h1 || KIND_STYLE[p.kind].label}</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-400 shrink-0">{p.status || '—'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {tab === 'delta' && (
                <div className="space-y-4">
                  {!hasDelta ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                      Ini pemindaian pertama, jadi belum ada pembanding. Baca ulang nanti untuk melihat halaman baru, hilang, atau berubah.
                    </div>
                  ) : (
                    <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
                      <h2 className="text-sm font-bold text-[#0F2A43]">Dibanding pemindaian sebelumnya</h2>
                      {lastDiff && lastDiff.added.length + lastDiff.removed.length + lastDiff.changed.length === 0 && <p className="text-sm text-slate-500">Tidak ada perubahan struktur.</p>}
                      {lastDiff && lastDiff.added.length > 0 && (
                        <DiffGroup title="Halaman baru" color="#16A34A" items={lastDiff.added.map((p) => ({ path: p }))} onPick={setSelected} existing={pageMap} />
                      )}
                      {lastDiff && lastDiff.removed.length > 0 && <DiffGroup title="Halaman hilang" color="#DC2626" items={lastDiff.removed.map((p) => ({ path: p }))} onPick={setSelected} existing={pageMap} />}
                      {lastDiff && lastDiff.changed.length > 0 && <DiffGroup title="Berubah" color="#D97706" items={lastDiff.changed.map((c) => ({ path: c.path, note: c.what }))} onPick={setSelected} existing={pageMap} />}
                    </section>
                  )}
                  <section className="bg-white border border-slate-200 rounded-2xl p-4">
                    <h2 className="text-sm font-bold text-[#0F2A43] flex items-center gap-2 mb-3">
                      <History className="w-4 h-4" /> Riwayat pemindaian
                    </h2>
                    <ul className="divide-y divide-slate-100 text-sm">
                      {history.map((h, i) => (
                        <li key={h.at + i} className="py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-semibold text-slate-700">{fmtDate(h.at)}</span>
                          <span className="text-slate-500">{h.stats.pages} halaman</span>
                          <span className="text-xs text-slate-400 ml-auto">
                            +{h.diff.added.length} −{h.diff.removed.length} ~{h.diff.changed.length}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}
            </div>

            {tab !== 'delta' && sel && (
              <aside className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 self-start lg:sticky lg:top-4" aria-label="Detail halaman">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-[#0F2A43] break-all">{sel.path}</p>
                    <KindBadge kind={sel.kind} />
                  </div>
                  <button onClick={() => setSelected(null)} aria-label="Tutup detail" className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {sel.title && <p className="text-sm text-slate-700">{sel.title}</p>}
                {sel.description && <p className="text-xs text-slate-500">{sel.description}</p>}
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Status', sel.status || '—'],
                    ['Kedalaman', sel.depth],
                    ['Tautan masuk', sel.inCount],
                    ['Tautan keluar', sel.out.length],
                    ['Respons', sel.ms != null ? `${sel.ms} ms` : '—'],
                    ['Sumber', sel.source],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="rounded-lg bg-slate-50 px-2.5 py-2">
                      <dt className="text-slate-400">{k}</dt>
                      <dd className="font-bold text-slate-700">{v}</dd>
                    </div>
                  ))}
                </dl>
                {sel.redirectTo && <p className="text-xs text-slate-500">Dialihkan ke <b>{sel.redirectTo}</b></p>}
                {sel.dynamic && <p className="text-xs text-blue-600">Rute dinamis (parameter di URL).</p>}
                {sel.error && <p className="text-xs text-red-600">{sel.error}</p>}
                <a href={sel.url} target="_blank" rel="noopener noreferrer" className="h-10 rounded-xl bg-orange-500 text-white text-sm font-bold flex items-center justify-center gap-2">
                  Buka halaman <ExternalLink className="w-4 h-4" />
                </a>
                <LinkList title="Menaut ke" paths={sel.out} onPick={setSelected} existing={pageMap} />
                <LinkList title="Ditaut dari" paths={incoming} onPick={setSelected} existing={pageMap} />
              </aside>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function LinkList({ title, paths, onPick, existing }: { title: string; paths: string[]; onPick: (p: string) => void; existing: Map<string, PageNode> }) {
  if (paths.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">{title} ({paths.length})</p>
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
        {paths.slice(0, 40).map((p) => (
          <button key={p} onClick={() => existing.has(p) && onPick(p)} className="px-2 py-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer max-w-full truncate">
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function DiffGroup({ title, color, items, onPick, existing }: { title: string; color: string; items: { path: string; note?: string }[]; onPick: (p: string) => void; existing: Map<string, PageNode> }) {
  return (
    <div>
      <p className="text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color }}>
        <span className="w-2 h-2 rounded-full" style={{ background: color }} /> {title} ({items.length})
      </p>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.path}>
            <button disabled={!existing.has(it.path)} onClick={() => onPick(it.path)} className="w-full text-left text-sm rounded-lg px-3 py-2 bg-slate-50 hover:bg-slate-100 disabled:hover:bg-slate-50 cursor-pointer disabled:cursor-default flex flex-wrap gap-x-2">
              <span className="font-semibold text-slate-700 break-all">{it.path}</span>
              {it.note && <span className="text-xs text-slate-500">{it.note}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
