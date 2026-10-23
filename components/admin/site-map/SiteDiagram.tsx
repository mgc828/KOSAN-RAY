'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Maximize2, Minus, Plus } from 'lucide-react';
import { layoutTree, NODE_H, NODE_W, type TreeNode } from '@/lib/site-tree';
import type { PageNode } from '@/lib/site-crawler';

export const KIND_STYLE: Record<PageNode['kind'] | 'virtual', { color: string; label: string; dash?: boolean }> = {
  ok: { color: '#16A34A', label: 'OK' },
  redirect: { color: '#D97706', label: 'Pengalihan' },
  'client-error': { color: '#DC2626', label: 'Error 4xx' },
  'server-error': { color: '#991B1B', label: 'Error 5xx' },
  error: { color: '#BE123C', label: 'Gagal dibaca' },
  blocked: { color: '#64748B', label: 'Diblokir robots', dash: true },
  unvisited: { color: '#94A3B8', label: 'Belum dibaca', dash: true },
  'code-only': { color: '#2563EB', label: 'Hanya di kode', dash: true },
  virtual: { color: '#CBD5E1', label: 'Folder', dash: true },
};

interface Props {
  root: TreeNode;
  collapsed: Set<string>;
  selected: string | null;
  /** id simpul yang cocok dengan pencarian/filter (null = tanpa filter) */
  matches: Set<string> | null;
  /** id simpul yang terhubung dengan simpul terpilih (tautan masuk/keluar) */
  related: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  openHref: (path: string) => string;
}

const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** Diagram pohon struktur situs: geser untuk berpindah, gulir untuk zoom, klik simpul untuk melihat detail. */
export default function SiteDiagram({ root, collapsed, selected, matches, related, onSelect, onToggle, openHref }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 16, y: 16, k: 1 });
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const layout = useMemo(() => layoutTree(root, collapsed), [root, collapsed]);

  const fit = useCallback(() => {
    const el = wrap.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const k = Math.min(1, (w - 32) / (layout.width + 8), (h - 32) / (layout.height + 8));
    const kk = Math.max(0.25, k);
    setView({ k: kk, x: 16, y: Math.max(16, (h - layout.height * kk) / 2) });
  }, [layout.width, layout.height]);

  // Muat pas saat pertama kali dan saat jumlah simpul berubah banyak
  const itemCount = layout.items.length;
  useEffect(() => {
    fit();
  }, [fit, itemCount === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Zoom dengan gulir (listener non-pasif agar bisa mencegah gulir halaman)
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      setView((v) => {
        const k = Math.min(2, Math.max(0.2, v.k * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
        const f = k / v.k;
        return { k, x: px - (px - v.x) * f, y: py - (py - v.y) * f };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const zoomBy = (f: number) =>
    setView((v) => {
      const el = wrap.current;
      const cx = (el?.clientWidth ?? 600) / 2;
      const cy = (el?.clientHeight ?? 400) / 2;
      const k = Math.min(2, Math.max(0.2, v.k * f));
      const r = k / v.k;
      return { k, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r };
    });

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest('[data-node]')) return;
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-[radial-gradient(circle,#E2E8F0_1px,transparent_1px)] [background-size:20px_20px] bg-white overflow-hidden">
      <div
        ref={wrap}
        className="h-[60vh] min-h-[420px] cursor-grab active:cursor-grabbing touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="application"
        aria-label="Diagram struktur situs. Geser untuk berpindah, gulir untuk zoom."
      >
        <svg width="100%" height="100%" className="block">
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {layout.edges.map((e, i) => {
              const x1 = e.from.x + NODE_W;
              const y1 = e.from.y + NODE_H / 2;
              const x2 = e.to.x;
              const y2 = e.to.y + NODE_H / 2;
              const mx = (x1 + x2) / 2;
              const dim = matches && !(matches.has(e.to.node.id) || matches.has(e.from.node.id));
              return <path key={i} d={`M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`} fill="none" stroke="#CBD5E1" strokeWidth={1.5} opacity={dim ? 0.25 : 1} />;
            })}

            {layout.items.map((it) => {
              const n = it.node;
              const kind = n.page ? n.page.kind : 'virtual';
              const st = KIND_STYLE[kind];
              const isSel = selected === n.id;
              const isRel = related.has(n.id);
              const dim = matches ? !matches.has(n.id) : false;
              const hasKids = n.children.length > 0;
              return (
                <g key={n.id} data-node transform={`translate(${it.x} ${it.y})`} opacity={dim ? 0.3 : 1} className="cursor-pointer">
                  <title>{`${n.id}${n.page?.title ? ' — ' + n.page.title : ''}`}</title>
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={12}
                    fill={isSel ? '#FFF7ED' : '#FFFFFF'}
                    stroke={isSel ? '#F97316' : isRel ? '#0F2A43' : '#CBD5E1'}
                    strokeWidth={isSel || isRel ? 2 : 1.25}
                    strokeDasharray={st.dash && !isSel ? '5 3' : undefined}
                    onClick={() => onSelect(n.id)}
                  />
                  <rect x={0} y={0} width={5} height={NODE_H} rx={2.5} fill={st.color} onClick={() => onSelect(n.id)} />
                  <text x={16} y={20} fontSize={13} fontWeight={700} fill="#0F2A43" onClick={() => onSelect(n.id)}>
                    {trunc(n.id === '/' ? '/ (beranda)' : n.label, 22)}
                  </text>
                  <text x={16} y={37} fontSize={11} fill="#64748B" onClick={() => onSelect(n.id)}>
                    {trunc(n.page?.title || n.page?.h1 || (n.page ? st.label : hasKids ? `${n.count} halaman` : st.label), 28)}
                  </text>
                  {n.page && (
                    <a href={openHref(n.id)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      <title>Buka halaman di tab baru</title>
                      <rect x={NODE_W - 28} y={5} width={22} height={20} rx={6} fill="transparent" />
                      <g transform={`translate(${NODE_W - 24} 8)`} stroke="#94A3B8" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 2h5v5M14 2L7 9M12 10v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" />
                      </g>
                    </a>
                  )}
                  {hasKids && (
                    <g
                      transform={`translate(${NODE_W - 26} ${NODE_H - 22})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(n.id);
                      }}
                    >
                      <title>{it.collapsed ? 'Buka cabang' : 'Ciutkan cabang'}</title>
                      <rect width={22} height={18} rx={9} fill={it.collapsed ? '#0F2A43' : '#F1F5F9'} stroke="#CBD5E1" />
                      <text x={11} y={13} textAnchor="middle" fontSize={10} fontWeight={700} fill={it.collapsed ? '#FFFFFF' : '#475569'}>
                        {it.collapsed ? n.count : '−'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        {[
          { icon: Plus, label: 'Perbesar', on: () => zoomBy(1.2) },
          { icon: Minus, label: 'Perkecil', on: () => zoomBy(1 / 1.2) },
          { icon: Maximize2, label: 'Muat pas', on: fit },
        ].map((b) => (
          <button key={b.label} type="button" onClick={b.on} aria-label={b.label} title={b.label} className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer">
            <b.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      <p className="absolute left-3 bottom-2.5 text-[11px] text-slate-400 hidden sm:flex items-center gap-1">
        <ExternalLink className="w-3 h-3" /> klik simpul = detail · ikon panah = buka halaman · {Math.round(view.k * 100)}%
      </p>
    </div>
  );
}
