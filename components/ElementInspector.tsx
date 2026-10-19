'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MousePointerClick, Check, Copy, X } from 'lucide-react';

export default function ElementInspector() {
  const [isActive, setIsActive] = useState(false);
  const [lastSelected, setLastSelected] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  // Posisi floating button (draggable)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });
  const hasMovedRef = useRef(false);

  // Inisialisasi posisi default di pojok kanan bawah
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 76,
        y: window.innerHeight - 76,
      });
    }
  }, []);

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!position) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !position) return;
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
    }

    const newX = Math.max(12, Math.min(window.innerWidth - 68, dragStartRef.current.startX + deltaX));
    const newY = Math.max(12, Math.min(window.innerHeight - 68, dragStartRef.current.startY + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    // Jika tidak di-drag (hanya klik), toggle inspect mode
    if (!hasMovedRef.current) {
      setIsActive((prev) => !prev);
    }
  };

  // Inspect DOM Logic
  useEffect(() => {
    if (!isActive) return;

    let hoveredEl: HTMLElement | null = null;
    const prevOutline = new Map<HTMLElement, string>();

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest('#dev-element-inspector-ui')) return;

      if (hoveredEl && hoveredEl !== target) {
        hoveredEl.style.outline = prevOutline.get(hoveredEl) || '';
        prevOutline.delete(hoveredEl);
      }

      hoveredEl = target;
      if (!prevOutline.has(target)) {
        prevOutline.set(target, target.style.outline);
      }
      target.style.outline = '2px dashed #F97316';
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('#dev-element-inspector-ui')) return;
      if (target && prevOutline.has(target)) {
        target.style.outline = prevOutline.get(target) || '';
        prevOutline.delete(target);
      }
    };

    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest('#dev-element-inspector-ui')) return;

      e.preventDefault();
      e.stopPropagation();

      const tagName = target.tagName.toLowerCase();
      const id = target.id ? `#${target.id}` : '';
      const className = target.className && typeof target.className === 'string' ? `.${target.className.trim().split(/\s+/).slice(0, 3).join('.')}` : '';
      const textContent = (target.textContent || '').trim().slice(0, 80);
      const ariaLabel = target.getAttribute('aria-label') || '';
      
      const parentBlock = target.closest('section, nav, form, header, footer, div[class*="grid"], div[class*="flex"]');
      const parentInfo = parentBlock ? `${parentBlock.tagName.toLowerCase()}${parentBlock.id ? '#' + parentBlock.id : ''}` : '';

      const inspectData = {
        selector: `${tagName}${id}${className}`,
        tagName,
        id: target.id || null,
        className: typeof target.className === 'string' ? target.className : '',
        textSnippet: textContent,
        ariaLabel: ariaLabel || null,
        parentInfo,
        url: window.location.pathname,
        fullOuterHTML: target.outerHTML.slice(0, 300)
      };

      setLastSelected(inspectData);

      // Flash highlight
      target.style.outline = '3px solid #10B981';
      setTimeout(() => {
        if (target) target.style.outline = '2px dashed #F97316';
      }, 400);

      // Simpan ke API dev inspect
      try {
        await fetch('/api/dev-inspect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inspectData),
        });
      } catch (err) {
        console.error('Failed to report inspection:', err);
      }
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleClick, true);
      if (hoveredEl && prevOutline.has(hoveredEl)) {
        hoveredEl.style.outline = prevOutline.get(hoveredEl) || '';
      }
    };
  }, [isActive]);

  const copyPromptText = () => {
    if (!lastSelected) return;
    const info = `[Target Elemen: <${lastSelected.tagName}> "${lastSelected.textSnippet || lastSelected.selector}"] di halaman ${lastSelected.url}`;
    navigator.clipboard.writeText(info);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!position) return null;

  // Cek apakah popover harus muncul di kiri atau kanan tergantung posisi tombol di layar
  const isRightSide = position.x > (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);

  return (
    <div
      id="dev-element-inspector-ui"
      className="fixed z-[999999] font-sans select-none text-xs"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
      }}
    >
      {/* Popover Card Info Elemen Terpilih */}
      {lastSelected && isActive && (
        <div
          className={`absolute bottom-16 bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 w-72 space-y-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 ${
            isRightSide ? 'right-0' : 'left-0'
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Elemen Terpilih
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={copyPromptText}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] bg-slate-800 px-2 py-0.5 rounded-md hover:bg-slate-700 transition-colors"
                title="Salin ke clipboard"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
              <button
                onClick={() => setLastSelected(null)}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="font-mono text-[11px] text-amber-300 break-all font-semibold">
            &lt;{lastSelected.tagName}&gt; {lastSelected.id ? `#${lastSelected.id}` : ''}
          </p>
          {lastSelected.textSnippet && (
            <p className="text-slate-300 text-[11px] italic line-clamp-2 bg-slate-800/60 p-1.5 rounded-lg border border-slate-800">
              &quot;{lastSelected.textSnippet}&quot;
            </p>
          )}
          <p className="text-[10px] text-slate-400 pt-0.5">
            Tersimpan otomatis. Anda bisa langsung chat instruksi perubahannya!
          </p>
        </div>
      )}

      {/* Tombol Bulat Draggable */}
      <div className="relative group">
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          title={isActive ? 'Inspect Aktif (Klik/Drag)' : 'Klik untuk Inspect (Tahan untuk Pindah)'}
          className={`w-14 h-14 rounded-full shadow-2xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-colors focus:outline-none ${
            isActive
              ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/40 shadow-amber-500/30'
              : 'bg-slate-900/90 hover:bg-slate-900 text-white border-2 border-slate-700 hover:border-slate-500'
          }`}
        >
          <MousePointerClick className={`w-6 h-6 ${isActive ? 'animate-bounce text-slate-950' : 'text-amber-400'}`} />
          <span className="text-[9px] font-black tracking-tighter uppercase mt-0.5 scale-90">
            {isActive ? 'ON' : 'INSPECT'}
          </span>
        </button>

        {/* Tooltip hint saat hover */}
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-slate-200 text-[10px] py-1 px-2.5 rounded-lg whitespace-nowrap shadow-lg border border-slate-700">
          Tahan & Geser untuk Pindah
        </span>
      </div>
    </div>
  );
}
