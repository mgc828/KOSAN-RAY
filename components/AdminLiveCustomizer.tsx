'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from '@/lib/toast';
import {
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  X,
  Lock,
  Layers,
  Minus,
  Check,
  Sparkles,
  GripHorizontal,
  Minimize2,
  Maximize2,
  ArrowLeftToLine,
  ArrowRightToLine,
  SunMedium,
} from 'lucide-react';
import { UICustomizationItem, UICustomStyle } from '@/lib/ui-customizer-store';

const PRESET_COLORS = [
  { name: 'Abu Lembut', val: '#E2E8F0' },
  { name: 'Slate', val: '#64748B' },
  { name: 'Gelap', val: '#1E293B' },
  { name: 'Amber', val: '#F59E0B' },
  { name: 'Emerald', val: '#10B981' },
  { name: 'Biru', val: '#3B82F6' },
  { name: 'Merah', val: '#EF4444' },
];

export default function AdminLiveCustomizer() {
  const pathname = usePathname() || '/';

  // Toggle Visibility dari Pengaturan Admin
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      if (typeof window === 'undefined') return;
      if (window.location.pathname.startsWith('/admin')) {
        setIsVisible(false);
        return;
      }
      const local = localStorage.getItem('kk_show_ui_customizer');
      if (local !== null) {
        setIsVisible(local === 'true');
        return;
      }
      fetch('/api/admin/data?type=settings')
        .then((r) => r.json())
        .then((d) => {
          const enabled = Boolean(d?.settings?.tools?.enableUiCustomizer);
          setIsVisible(enabled);
        })
        .catch(() => {});
    };

    checkVisibility();
    window.addEventListener('kk-tools-settings-changed', checkVisibility);
    window.addEventListener('storage', checkVisibility);
    return () => {
      window.removeEventListener('kk-tools-settings-changed', checkVisibility);
      window.removeEventListener('storage', checkVisibility);
    };
  }, []);

  // Status State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Mode Edit Aktif
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [items, setItems] = useState<UICustomizationItem[]>([]);
  const [selectedSelector, setSelectedSelector] = useState<string | null>(null);
  const [selectedElementInfo, setSelectedElementInfo] = useState<{
    tagName: string;
    textSnippet: string;
    label: string;
  } | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'align' | 'order' | 'border' | 'nudge' | 'text'>('align');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Fitur Panel Bebas Hambatan (Minimize & Transparan)
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);

  // Posisi Tombol UI Trigger
  const [btnPos, setBtnPos] = useState({ x: 16, y: 120 });
  const isDraggingBtn = useRef(false);
  const dragStartBtn = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const hasDraggedBtn = useRef(false);

  // Posisi Panel Popup Konfigurasi (Bebas Digeser ke Mana Saja)
  const [panelPos, setPanelPos] = useState({ x: 20, y: 70 });
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Reference ke elemen DOM yang sedang dipilih
  const selectedDomEl = useRef<HTMLElement | null>(null);

  const showToast = (msg: string, kind: 'success' | 'error' | 'info' = 'info') => {
    toast(msg, kind);
  };

  // 1. Inisialisasi posisi awal dan cek status admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const unlocked = sessionStorage.getItem('admin_ui_customizer_unlocked');
      if (unlocked === 'true') {
        setIsAdminUnlocked(true);
      }

      setBtnPos({
        x: 16,
        y: Math.max(80, window.innerHeight - 150),
      });

      // Tempatkan panel di sisi kanan layar secara default
      const defaultX = Math.max(16, window.innerWidth - 360);
      setPanelPos({ x: defaultX, y: 70 });
    }
  }, []);

  // 2. Muat aturan kustomisasi dari server setiap kali halaman berpindah
  const fetchPageCustomizations = useCallback(async () => {
    try {
      const res = await fetch(`/api/ui-customizer?pagePath=${encodeURIComponent(pathname)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setItems(data.items);
        }
      }
    } catch (e) {
      console.error('[AdminCustomizer] Gagal memuat data:', e);
    }
  }, [pathname]);

  useEffect(() => {
    fetchPageCustomizations();
  }, [fetchPageCustomizations]);

  // 3. Inject CSS Dinamis ke DOM
  useEffect(() => {
    let styleTag = document.getElementById('admin-customizer-live-styles') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'admin-customizer-live-styles';
      document.head.appendChild(styleTag);
    }

    if (!items.length) {
      styleTag.innerHTML = '';
      return;
    }

    const cssRules = items
      .map((item) => {
        const s = item.styles;
        const decls: string[] = [];

        // Perataan Alignment (Horizontal)
        if (s.textAlign === 'center') {
          decls.push('text-align: center !important;');
          decls.push('margin-left: auto !important;');
          decls.push('margin-right: auto !important;');
          decls.push('justify-content: center !important;');
          decls.push('align-self: center !important;');
        } else if (s.textAlign === 'right') {
          decls.push('text-align: right !important;');
          decls.push('margin-left: auto !important;');
          decls.push('margin-right: 0px !important;');
          decls.push('justify-content: flex-end !important;');
          decls.push('align-self: flex-end !important;');
        } else if (s.textAlign === 'left') {
          decls.push('text-align: left !important;');
          decls.push('margin-left: 0px !important;');
          decls.push('margin-right: auto !important;');
          decls.push('justify-content: flex-start !important;');
          decls.push('align-self: flex-start !important;');
        }

        if (s.alignSelf && !s.textAlign) decls.push(`align-self: ${s.alignSelf} !important;`);
        if (s.justifyContent && !s.textAlign) decls.push(`justify-content: ${s.justifyContent} !important;`);
        if (typeof s.order === 'number') decls.push(`order: ${s.order} !important;`);

        // Nudge Offset Presisi (geser posisi relatif)
        if (typeof s.offsetX === 'number' || typeof s.offsetY === 'number') {
          const x = s.offsetX || 0;
          const y = s.offsetY || 0;
          decls.push('position: relative !important;');
          decls.push(`left: ${x}px !important;`);
          decls.push(`top: ${y}px !important;`);
        }

        // Margin spacing
        if (typeof s.marginTop === 'number') decls.push(`margin-top: ${s.marginTop}px !important;`);
        if (typeof s.marginBottom === 'number') decls.push(`margin-bottom: ${s.marginBottom}px !important;`);
        if (typeof s.marginLeft === 'number' && !s.textAlign) decls.push(`margin-left: ${s.marginLeft}px !important;`);
        if (typeof s.marginRight === 'number' && !s.textAlign) decls.push(`margin-right: ${s.marginRight}px !important;`);

        if (s.display) decls.push(`display: ${s.display} !important;`);
        if (typeof s.opacity === 'number') decls.push(`opacity: ${s.opacity} !important;`);
        if (typeof s.fontSize === 'number') decls.push(`font-size: ${s.fontSize}px !important;`);

        // Border / Lines
        if (s.borderStyle) {
          decls.push(`border-style: ${s.borderStyle} !important;`);
        }
        if (typeof s.borderWidth === 'number') {
          decls.push(`border-width: ${s.borderWidth}px !important;`);
        }
        if (typeof s.borderTopWidth === 'number') {
          decls.push(`border-top-width: ${s.borderTopWidth}px !important;`);
        }
        if (typeof s.borderBottomWidth === 'number') {
          decls.push(`border-bottom-width: ${s.borderBottomWidth}px !important;`);
        }
        if (s.borderColor) {
          decls.push(`border-color: ${s.borderColor} !important;`);
        }

        if (s.customCss) {
          decls.push(s.customCss);
        }

        return `${item.selector} {\n  ${decls.join('\n  ')}\n}`;
      })
      .join('\n\n');

    styleTag.innerHTML = cssRules;

    // Terapkan customText jika ada
    items.forEach((item) => {
      if (item.customText) {
        try {
          const el = document.querySelector(item.selector);
          if (el && el.textContent !== item.customText && el.children.length === 0) {
            el.textContent = item.customText;
          }
        } catch (_) {}
      }
    });
  }, [items]);

  // Helper untuk membuat selector CSS unik
  const generateSelector = (el: HTMLElement): string => {
    if (el.id && !/[:\.]/.test(el.id)) {
      return `#${el.id}`;
    }

    const path: string[] = [];
    let curr: HTMLElement | null = el;

    while (curr && curr.nodeType === Node.ELEMENT_NODE && curr !== document.body && curr !== document.documentElement) {
      if (curr.id && !/[:\.]/.test(curr.id)) {
        path.unshift(`#${curr.id}`);
        break;
      }

      let tag = curr.tagName.toLowerCase();
      let sibling = curr;
      let nth = 1;

      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling as HTMLElement;
        if (sibling.tagName === curr.tagName) {
          nth++;
        }
      }

      tag += `:nth-of-type(${nth})`;
      path.unshift(tag);
      curr = curr.parentElement;
    }

    return path.join(' > ');
  };

  // 4. Interaksi Hover & Klik Elemen saat Mode Desain Aktif
  useEffect(() => {
    if (!isDesignMode) return;

    let hoveredEl: HTMLElement | null = null;
    let originalOutline = '';

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest('[data-customizer-dock]')) return;

      if (hoveredEl && hoveredEl !== target) {
        hoveredEl.style.outline = originalOutline;
      }

      hoveredEl = target;
      originalOutline = target.style.outline;
      target.style.outline = '2px dashed #3B82F6';
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest('[data-customizer-dock]')) return;
      if (hoveredEl === target) {
        target.style.outline = originalOutline;
        hoveredEl = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest('[data-customizer-dock]')) return;

      e.preventDefault();
      e.stopPropagation();

      selectedDomEl.current = target;
      const selector = generateSelector(target);
      const tagName = target.tagName.toLowerCase();
      const text = (target.textContent || '').trim().slice(0, 60);

      let label = `<${tagName}>`;
      if (tagName === 'button' || target.closest('button')) label = 'Tombol';
      else if (tagName.startsWith('h')) label = `Judul (${tagName.toUpperCase()})`;
      else if (tagName === 'p') label = 'Paragraf Teks';
      else if (tagName === 'hr' || target.className.includes('border')) label = 'Garis / Pembatas';
      else if (tagName === 'img' || target.querySelector('img')) label = 'Gambar';
      else if (tagName === 'section') label = 'Blok Section';

      setSelectedSelector(selector);
      setSelectedElementInfo({
        tagName,
        textSnippet: text,
        label,
      });

      // Highlight seleksi aktif
      target.style.outline = '3px solid #10B981';
      setTimeout(() => {
        if (target) target.style.outline = '2px solid #3B82F6';
      }, 300);
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleClick, true);
      if (hoveredEl) {
        hoveredEl.style.outline = originalOutline;
      }
    };
  }, [isDesignMode]);

  // Current item style helper
  const currentItem = items.find((it) => it.selector === selectedSelector);
  const currentStyles: UICustomStyle = currentItem?.styles || {};

  // Update style dengan EFEK LANGSUNG (LIVE PREVIEW) ke elemen DOM
  const updateStyle = (key: keyof UICustomStyle, value: any) => {
    if (!selectedSelector) return;

    // 1. Terapkan LANGSUNG ke elemen DOM target di layar saat itu juga
    const el = selectedDomEl.current || (document.querySelector(selectedSelector) as HTMLElement | null);
    if (el) {
      if (key === 'textAlign') {
        if (value === 'center') {
          el.style.setProperty('text-align', 'center', 'important');
          el.style.setProperty('margin-left', 'auto', 'important');
          el.style.setProperty('margin-right', 'auto', 'important');
          el.style.setProperty('justify-content', 'center', 'important');
          el.style.setProperty('align-self', 'center', 'important');
        } else if (value === 'right') {
          el.style.setProperty('text-align', 'right', 'important');
          el.style.setProperty('margin-left', 'auto', 'important');
          el.style.setProperty('margin-right', '0px', 'important');
          el.style.setProperty('justify-content', 'flex-end', 'important');
          el.style.setProperty('align-self', 'flex-end', 'important');
        } else {
          el.style.setProperty('text-align', 'left', 'important');
          el.style.setProperty('margin-left', '0px', 'important');
          el.style.setProperty('margin-right', 'auto', 'important');
          el.style.setProperty('justify-content', 'flex-start', 'important');
          el.style.setProperty('align-self', 'flex-start', 'important');
        }
      } else if (key === 'alignSelf') {
        el.style.setProperty('align-self', value, 'important');
      } else if (key === 'display') {
        el.style.setProperty('display', value || '', 'important');
      } else if (key === 'offsetX') {
        el.style.setProperty('position', 'relative', 'important');
        el.style.setProperty('left', `${value}px`, 'important');
      } else if (key === 'offsetY') {
        el.style.setProperty('position', 'relative', 'important');
        el.style.setProperty('top', `${value}px`, 'important');
      } else if (key === 'borderStyle') {
        el.style.setProperty('border-style', value, 'important');
      } else if (key === 'borderTopWidth' || key === 'borderBottomWidth') {
        el.style.setProperty('border-top-width', `${value}px`, 'important');
        el.style.setProperty('border-bottom-width', `${value}px`, 'important');
      } else if (key === 'borderColor') {
        el.style.setProperty('border-color', value, 'important');
      } else if (key === 'fontSize') {
        el.style.setProperty('font-size', `${value}px`, 'important');
      }
    }

    // 2. Simpan ke state react agar disinkronkan ke CSS rules
    setItems((prev) => {
      const existingIdx = prev.findIndex((it) => it.selector === selectedSelector);
      const newStyles: UICustomStyle = {
        ...(existingIdx >= 0 ? prev[existingIdx].styles : {}),
        [key]: value,
      };

      const newItem: UICustomizationItem = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `item_${Date.now()}`,
        selector: selectedSelector,
        label: selectedElementInfo?.label,
        styles: newStyles,
        customText: existingIdx >= 0 ? prev[existingIdx].customText : undefined,
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newItem;
        return copy;
      }
      return [...prev, newItem];
    });
  };

  // Reorder elemen secara live di DOM
  const handleReorder = (direction: 'up' | 'down') => {
    if (!selectedSelector) return;
    const el = selectedDomEl.current || (document.querySelector(selectedSelector) as HTMLElement | null);

    if (el && el.parentElement) {
      if (direction === 'up' && el.previousElementSibling) {
        el.parentElement.insertBefore(el, el.previousElementSibling);
      } else if (direction === 'down' && el.nextElementSibling) {
        el.parentElement.insertBefore(el.nextElementSibling, el);
      }
    }

    const currentOrder = currentStyles.order || 0;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    updateStyle('order', newOrder);
  };

  // Nudge Geser Posisi Presisi
  const handleNudge = (dx: number, dy: number) => {
    const currentX = currentStyles.offsetX || 0;
    const currentY = currentStyles.offsetY || 0;
    const newX = currentX + dx;
    const newY = currentY + dy;

    const el = selectedDomEl.current || (document.querySelector(selectedSelector || '') as HTMLElement | null);
    if (el) {
      el.style.setProperty('position', 'relative', 'important');
      el.style.setProperty('left', `${newX}px`, 'important');
      el.style.setProperty('top', `${newY}px`, 'important');
    }

    setItems((prev) => {
      const existingIdx = prev.findIndex((it) => it.selector === selectedSelector);
      const newStyles: UICustomStyle = {
        ...(existingIdx >= 0 ? prev[existingIdx].styles : {}),
        offsetX: newX,
        offsetY: newY,
      };

      const newItem: UICustomizationItem = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `item_${Date.now()}`,
        selector: selectedSelector!,
        label: selectedElementInfo?.label,
        styles: newStyles,
        customText: existingIdx >= 0 ? prev[existingIdx].customText : undefined,
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newItem;
        return copy;
      }
      return [...prev, newItem];
    });
  };

  const updateText = (text: string) => {
    if (!selectedSelector) return;
    const el = selectedDomEl.current || (document.querySelector(selectedSelector) as HTMLElement | null);
    if (el && el.children.length === 0) {
      el.textContent = text;
    }

    setItems((prev) => {
      const existingIdx = prev.findIndex((it) => it.selector === selectedSelector);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          customText: text,
        };
        return copy;
      }
      return [
        ...prev,
        {
          id: `item_${Date.now()}`,
          selector: selectedSelector,
          label: selectedElementInfo?.label,
          styles: {},
          customText: text,
          updatedAt: new Date().toISOString(),
        },
      ];
    });
  };

  const resetCurrentElement = () => {
    if (!selectedSelector) return;
    const el = selectedDomEl.current || (document.querySelector(selectedSelector) as HTMLElement | null);
    if (el) {
      el.style.removeProperty('text-align');
      el.style.removeProperty('margin-left');
      el.style.removeProperty('margin-right');
      el.style.removeProperty('justify-content');
      el.style.removeProperty('align-self');
      el.style.removeProperty('position');
      el.style.removeProperty('left');
      el.style.removeProperty('top');
      el.style.removeProperty('border-style');
      el.style.removeProperty('border-top-width');
      el.style.removeProperty('border-bottom-width');
      el.style.removeProperty('border-color');
      el.style.removeProperty('display');
      el.style.removeProperty('font-size');
    }

    setItems((prev) => prev.filter((it) => it.selector !== selectedSelector));
    showToast('Kustomisasi elemen berhasil direset');
  };

  // Simpan permanen ke server
  const handleSaveToServer = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/ui-customizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagePath: pathname,
          items,
          passcode: 'admin123',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Tampilan berhasil disimpan permanen!');
      } else {
        showToast(data.error || 'Gagal menyimpan perubahan');
      }
    } catch {
      showToast('Gagal terhubung ke server');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset semua di halaman ini
  const handleResetPage = async () => {
    if (!confirm(`Yakin ingin mereset semua kustomisasi pada halaman "${pathname}"?`)) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/ui-customizer?pagePath=${encodeURIComponent(pathname)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems([]);
        setSelectedSelector(null);
        setSelectedElementInfo(null);
        window.location.reload();
      } else {
        showToast(data.error || 'Gagal mereset');
      }
    } catch {
      showToast('Gagal terhubung ke server');
    } finally {
      setIsSaving(false);
    }
  };

  // Auth unlock passcode
  const handleUnlockPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123' || passwordInput === 'kosthunt-admin-secret-2026') {
      setIsAdminUnlocked(true);
      sessionStorage.setItem('admin_ui_customizer_unlocked', 'true');
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
      setIsDesignMode(true);
      showToast('Mode Desain UI Diaktifkan');
    } else {
      setPasswordError('Kata sandi admin salah. Gunakan: admin123');
    }
  };

  // Dragging floating trigger button
  const handleBtnPointerDown = (e: React.PointerEvent) => {
    isDraggingBtn.current = true;
    hasDraggedBtn.current = false;
    dragStartBtn.current = {
      x: e.clientX,
      y: e.clientY,
      startX: btnPos.x,
      startY: btnPos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleBtnPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingBtn.current) return;
    const dx = e.clientX - dragStartBtn.current.x;
    const dy = e.clientY - dragStartBtn.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasDraggedBtn.current = true;
    }
    setBtnPos({
      x: Math.max(8, Math.min(window.innerWidth - 60, dragStartBtn.current.startX + dx)),
      y: Math.max(8, Math.min(window.innerHeight - 60, dragStartBtn.current.startY + dy)),
    });
  };

  const handleBtnPointerUp = (e: React.PointerEvent) => {
    isDraggingBtn.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (!hasDraggedBtn.current) {
      if (!isAdminUnlocked) {
        setShowPasswordModal(true);
      } else {
        setIsDesignMode((prev) => !prev);
      }
    }
  };

  // PURE WINDOW-LEVEL DRAGGING UNTUK PANEL POPUP (100% Bebas Slip & Sangat Halus)
  const handleStartDragPanel = (e: React.MouseEvent | React.TouchEvent) => {
    const isTouch = 'touches' in e;
    const clientX = isTouch ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const startMouseX = clientX;
    const startMouseY = clientY;
    const startPosX = panelPos.x;
    const startPosY = panelPos.y;

    const onMove = (moveEv: MouseEvent | TouchEvent) => {
      const curX = 'touches' in moveEv ? moveEv.touches[0].clientX : (moveEv as MouseEvent).clientX;
      const curY = 'touches' in moveEv ? moveEv.touches[0].clientY : (moveEv as MouseEvent).clientY;
      const dx = curX - startMouseX;
      const dy = curY - startMouseY;

      const newX = Math.max(8, Math.min(window.innerWidth - 300, startPosX + dx));
      const newY = Math.max(8, Math.min(window.innerHeight - 80, startPosY + dy));
      setPanelPos({ x: newX, y: newY });
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  // Quick Dock Buttons (Pindah Instan ke Kiri, Kanan, atau Bawah)
  const dockLeft = () => setPanelPos({ x: 16, y: 70 });
  const dockRight = () => setPanelPos({ x: Math.max(16, window.innerWidth - 360), y: 70 });
  const dockBottom = () => setPanelPos({ x: Math.max(16, (window.innerWidth - 350) / 2), y: Math.max(80, window.innerHeight - 380) });

  if (!isVisible) return null;

  return (
    <div data-customizer-dock className="select-none font-sans text-xs">

      {/* Modal Kata Sandi Admin */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Mode Desain Admin</h3>
                  <p className="text-[11px] text-slate-500">Ubah tata letak seluruh halaman</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUnlockPasscode} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Masukkan Kata Sandi Admin:
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="admin123"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900 text-sm"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-500 text-[11px] mt-1 font-medium">{passwordError}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-colors"
                >
                  Buka Mode Desain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div
        className="fixed z-[999999] touch-none"
        style={{ left: `${btnPos.x}px`, top: `${btnPos.y}px` }}
      >
        <button
          type="button"
          onPointerDown={handleBtnPointerDown}
          onPointerMove={handleBtnPointerMove}
          onPointerUp={handleBtnPointerUp}
          title={
            !isAdminUnlocked
              ? 'Klik untuk Buka Mode Desain (Khusus Admin)'
              : isDesignMode
              ? 'Mode Desain AKTIF - Klik elemen apa saja di halaman'
              : 'Klik untuk Aktifkan Mode Desain'
          }
          className={`w-13 h-13 rounded-2xl shadow-xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-all border ${
            isDesignMode
              ? 'bg-amber-500 text-slate-950 border-amber-400 ring-4 ring-amber-500/30 shadow-amber-500/20'
              : isAdminUnlocked
              ? 'bg-slate-900 text-amber-400 border-slate-700 hover:border-amber-400'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
          }`}
        >
          {isDesignMode ? (
            <Sliders className="w-5 h-5 animate-pulse" />
          ) : (
            <Layers className="w-5 h-5 text-amber-400" />
          )}
          <span className="text-[9px] font-black uppercase tracking-tighter mt-0.5">
            {isDesignMode ? 'DESAIN' : 'UI'}
          </span>
        </button>
      </div>

      {/* Banner Mode Desain Aktif di Atas Layar */}
      {isDesignMode && (
        <div className="fixed top-0 left-0 right-0 z-[999998] bg-amber-500 text-slate-950 px-4 py-2 flex items-center justify-between shadow-lg font-medium text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
            <span className="font-bold">MODE DESAIN AKTIF:</span>
            <span>Elemen langsung bergeser otomatis saat diklik. Panel pop-up bisa digeser bebas agar tidak menghalangi.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToServer}
              disabled={isSaving}
              className="bg-slate-950 text-white hover:bg-slate-800 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              {isSaving ? 'Menyimpan...' : 'Simpan Permanen'}
            </button>
            <button
              onClick={() => setIsDesignMode(false)}
              className="bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold px-2.5 py-1 rounded-lg"
            >
              Tutup Mode Desain
            </button>
          </div>
        </div>
      )}

      {/* DRAGGABLE CONFIGURATION POPUP PANEL (BEBAS DIGESER KE MANA SAJA) */}
      {isDesignMode && selectedSelector && selectedElementInfo && (
        <div
          ref={panelRef}
          className={`fixed z-[999999] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-opacity duration-150 ${
            isTransparent
              ? 'bg-white/80 backdrop-blur-md border-amber-400 shadow-amber-500/10'
              : 'bg-white border-slate-300'
          } ${isPanelMinimized ? 'w-72' : 'w-86'}`}
          style={{
            left: `${panelPos.x}px`,
            top: `${panelPos.y}px`,
            maxHeight: isPanelMinimized ? 'auto' : 'calc(100vh - 80px)',
          }}
        >
          {/* BAR DRAG UTAMA DI PALING ATAS (GRIP HANDLE JELAS & MUDAH DIGESER) */}
          <div
            onMouseDown={handleStartDragPanel}
            onTouchStart={handleStartDragPanel}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-amber-600/30 transition-colors select-none"
            title="Klik &amp; Tahan di sini untuk menggeser panel ini ke posisi mana pun di layar"
          >
            <div className="flex items-center gap-1.5 font-bold text-[10px] tracking-tight">
              <GripHorizontal className="w-4 h-4" />
              <span>TAHAN &amp; GESER PANEL</span>
            </div>
            
            {/* Tombol Cepat Pindah Kiri/Kanan/Bawah */}
            <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={dockLeft}
                className="bg-slate-900/10 hover:bg-slate-900/20 px-1.5 py-0.5 rounded text-[9px] font-semibold"
                title="Pindah ke Kiri Layar"
              >
                Kiri
              </button>
              <button
                type="button"
                onClick={dockRight}
                className="bg-slate-900/10 hover:bg-slate-900/20 px-1.5 py-0.5 rounded text-[9px] font-semibold"
                title="Pindah ke Kanan Layar"
              >
                Kanan
              </button>
              <button
                type="button"
                onClick={dockBottom}
                className="bg-slate-900/10 hover:bg-slate-900/20 px-1.5 py-0.5 rounded text-[9px] font-semibold"
                title="Pindah ke Bawah Layar"
              >
                Bawah
              </button>
            </div>
          </div>

          {/* Header Konten Panel */}
          <div
            onMouseDown={handleStartDragPanel}
            onTouchStart={handleStartDragPanel}
            className="bg-slate-900 text-white p-3 flex items-center justify-between border-b border-slate-800 cursor-grab active:cursor-grabbing select-none"
          >
            <div className="space-y-0.5 overflow-hidden pr-2">
              <div className="flex items-center gap-1.5">
                <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded text-[9px] uppercase shrink-0">
                  {selectedElementInfo.label}
                </span>
                <span className="font-mono text-[11px] text-slate-300 font-semibold truncate">
                  &lt;{selectedElementInfo.tagName}&gt;
                </span>
              </div>
              {selectedElementInfo.textSnippet && !isPanelMinimized && (
                <p className="text-slate-400 text-[10px] italic truncate max-w-[210px]">
                  &quot;{selectedElementInfo.textSnippet}&quot;
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
              {/* Tombol Tembus Pandang */}
              <button
                type="button"
                onClick={() => setIsTransparent((prev) => !prev)}
                className={`p-1.5 rounded transition-colors ${
                  isTransparent
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isTransparent ? 'Kembalikan Tampilan Padat' : 'Mode Tembus Pandang (Biar Bisa Lihat Halaman di Belakang)'}
              >
                <SunMedium className="w-3.5 h-3.5" />
              </button>

              {/* Tombol Minimize */}
              <button
                type="button"
                onClick={() => setIsPanelMinimized((prev) => !prev)}
                className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800"
                title={isPanelMinimized ? 'Buka Ukuran Penuh' : 'Perkecil Panel'}
              >
                {isPanelMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Tombol Tutup */}
              <button
                type="button"
                onClick={() => {
                  setSelectedSelector(null);
                  setSelectedElementInfo(null);
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800"
                title="Tutup Panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Jika Panel tidak diminimize, tampilkan seluruh kontrol */}
          {!isPanelMinimized && (
            <>
              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveTab('align')}
                  className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                    activeTab === 'align'
                      ? 'border-amber-500 text-amber-600 bg-white font-bold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  Posisi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('order')}
                  className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                    activeTab === 'order'
                      ? 'border-amber-500 text-amber-600 bg-white font-bold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  Urutan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('border')}
                  className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                    activeTab === 'border'
                      ? 'border-amber-500 text-amber-600 bg-white font-bold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  Garis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('nudge')}
                  className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                    activeTab === 'nudge'
                      ? 'border-amber-500 text-amber-600 bg-white font-bold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  Geser
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                    activeTab === 'text'
                      ? 'border-amber-500 text-amber-600 bg-white font-bold'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  Teks
                </button>
              </div>

              {/* Body Kontrol Tab */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
                {/* TAB 1: POSISI & PERATAAN */}
                {activeTab === 'align' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-bold text-slate-700 text-[11px]">
                          Perataan Horizontal (Kiri / Tengah / Kanan)
                        </label>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Langsung Tergeser
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateStyle('textAlign', 'left')}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-medium transition-all active:scale-95 ${
                            currentStyles.textAlign === 'left'
                              ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold shadow-sm ring-1 ring-amber-400'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <AlignLeft className="w-4 h-4 text-slate-700" />
                          <span>Rata Kiri</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStyle('textAlign', 'center')}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-medium transition-all active:scale-95 ${
                            currentStyles.textAlign === 'center'
                              ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold shadow-sm ring-1 ring-amber-400'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <AlignCenter className="w-4 h-4 text-slate-700" />
                          <span>Rata Tengah</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStyle('textAlign', 'right')}
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-medium transition-all active:scale-95 ${
                            currentStyles.textAlign === 'right'
                              ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold shadow-sm ring-1 ring-amber-400'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <AlignRight className="w-4 h-4 text-slate-700" />
                          <span>Rata Kanan</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5 text-[11px]">
                        Penempatan Vertikal (Atas / Tengah / Bawah)
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateStyle('alignSelf', 'flex-start')}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-medium active:scale-95 ${
                            currentStyles.alignSelf === 'flex-start'
                              ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold shadow-sm ring-1 ring-amber-400'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <ArrowUp className="w-4 h-4 text-slate-700" />
                          <span>Atas</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStyle('alignSelf', 'center')}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-medium active:scale-95 ${
                            currentStyles.alignSelf === 'center'
                              ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold shadow-sm ring-1 ring-amber-400'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <Minus className="w-4 h-4 rotate-90 text-slate-700" />
                          <span>Tengah</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStyle('alignSelf', 'flex-end')}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-medium active:scale-95 ${
                            currentStyles.alignSelf === 'flex-end'
                              ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold shadow-sm ring-1 ring-amber-400'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <ArrowDown className="w-4 h-4 text-slate-700" />
                          <span>Bawah</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5 text-[11px]">
                        Visibilitas Elemen
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateStyle('display', currentStyles.display === 'none' ? undefined : 'none')
                        }
                        className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-colors active:scale-95 ${
                          currentStyles.display === 'none'
                            ? 'bg-red-50 text-red-600 border-red-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                        }`}
                      >
                        {currentStyles.display === 'none' ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span>Elemen Disembunyikan (Klik untuk Tampilkan)</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 text-emerald-600" />
                            <span>Elemen Tampil (Klik untuk Sembunyikan)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: URUTAN BLOK (REORDER) */}
                {activeTab === 'order' && (
                  <div className="space-y-4">
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      Klik tombol di bawah: blok ini akan <strong>langsung bertukar posisi</strong> di layar secara live!
                    </p>

                    <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl">
                      <span className="font-semibold text-slate-700">Urutan Posisi (Order):</span>
                      <span className="font-mono text-sm font-bold bg-white px-3 py-1 rounded-lg border border-slate-300">
                        {currentStyles.order ?? 0}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleReorder('up')}
                        className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl font-bold flex flex-col items-center gap-1 transition-all active:scale-95 shadow-sm"
                      >
                        <ArrowUp className="w-5 h-5 text-amber-600" />
                        <span>Pindah ke Atas / Kiri</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder('down')}
                        className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl font-bold flex flex-col items-center gap-1 transition-all active:scale-95 shadow-sm"
                      >
                        <ArrowDown className="w-5 h-5 text-amber-600" />
                        <span>Pindah ke Bawah / Kanan</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateStyle('order', 0)}
                      className="w-full py-2 text-slate-500 hover:text-slate-800 text-[11px] font-semibold text-center"
                    >
                      Reset Urutan ke Default (0)
                    </button>
                  </div>
                )}

                {/* TAB 3: GARIS & PEMBATAS (DIVIDER / BORDER) */}
                {activeTab === 'border' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5 text-[11px]">
                        Ketebalan Garis / Border
                      </label>
                      <div className="grid grid-cols-5 gap-1">
                        {[0, 1, 2, 3, 4].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => {
                              updateStyle('borderTopWidth', w);
                              updateStyle('borderBottomWidth', w);
                              if (w > 0 && !currentStyles.borderStyle) {
                                updateStyle('borderStyle', 'solid');
                              }
                            }}
                            className={`py-2 rounded-lg border text-center font-bold transition-all active:scale-95 ${
                              currentStyles.borderTopWidth === w
                                ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-400'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {w === 0 ? 'Off' : `${w}px`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5 text-[11px]">
                        Gaya Garis
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { key: 'solid', label: 'Lurus (Solid)' },
                          { key: 'dashed', label: 'Putus (Dashed)' },
                          { key: 'dotted', label: 'Titik (Dotted)' },
                        ].map((g) => (
                          <button
                            key={g.key}
                            type="button"
                            onClick={() => updateStyle('borderStyle', g.key)}
                            className={`p-2 rounded-xl border text-center font-semibold text-[11px] transition-all active:scale-95 ${
                              currentStyles.borderStyle === g.key
                                ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold shadow-sm ring-1 ring-amber-400'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5 text-[11px]">
                        Pilihan Warna Garis
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c.val}
                            type="button"
                            onClick={() => updateStyle('borderColor', c.val)}
                            className={`p-1.5 rounded-lg border flex items-center gap-1.5 text-[10px] font-medium transition-all active:scale-95 ${
                              currentStyles.borderColor === c.val
                                ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-400'
                                : 'border-slate-200'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                              style={{ backgroundColor: c.val }}
                            />
                            <span className="truncate">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: GESER PRESISI (NUDGE OFFSET / INTERAKTIF) */}
                {activeTab === 'nudge' && (
                  <div className="space-y-4">
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      Klik tombol arah di bawah: elemen akan <strong>langsung bergeser per-5 piksel</strong> di layar!
                    </p>

                    {/* D-Pad Geser Posisi */}
                    <div className="flex flex-col items-center space-y-2 py-1">
                      <button
                        type="button"
                        onClick={() => handleNudge(0, -5)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-300 rounded-xl font-bold flex items-center gap-1 shadow-sm"
                        title="Geser ke Atas (-5px)"
                      >
                        <ArrowUp className="w-4 h-4 text-slate-700" />
                        <span>Geser Atas (-5px)</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleNudge(-5, 0)}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-300 rounded-xl font-bold flex items-center gap-1 shadow-sm"
                          title="Geser ke Kiri (-5px)"
                        >
                          <ArrowLeft className="w-4 h-4 text-slate-700" />
                          <span>Kiri</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const el = selectedDomEl.current || (document.querySelector(selectedSelector || '') as HTMLElement | null);
                            if (el) {
                              el.style.removeProperty('left');
                              el.style.removeProperty('top');
                              el.style.removeProperty('position');
                            }
                            updateStyle('offsetX', 0);
                            updateStyle('offsetY', 0);
                          }}
                          className="p-2 text-[10px] bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold active:scale-95"
                        >
                          Reset Posisi
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNudge(5, 0)}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-300 rounded-xl font-bold flex items-center gap-1 shadow-sm"
                          title="Geser ke Kanan (+5px)"
                        >
                          <span>Kanan</span>
                          <ArrowRight className="w-4 h-4 text-slate-700" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleNudge(0, 5)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-300 rounded-xl font-bold flex items-center gap-1 shadow-sm"
                        title="Geser ke Bawah (+5px)"
                      >
                        <ArrowDown className="w-4 h-4 text-slate-700" />
                        <span>Geser Bawah (+5px)</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div>Offset X (Kiri/Kanan): {currentStyles.offsetX ?? 0}px</div>
                      <div>Offset Y (Atas/Bawah): {currentStyles.offsetY ?? 0}px</div>
                    </div>
                  </div>
                )}

                {/* TAB 5: TEKS & UKURAN FONT */}
                {activeTab === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5 text-[11px]">
                        Ubah Teks Tulisan (Langsung Berubah di Layar):
                      </label>
                      <textarea
                        rows={3}
                        defaultValue={currentItem?.customText || selectedElementInfo.textSnippet}
                        onChange={(e) => updateText(e.target.value)}
                        placeholder="Ketik teks baru..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5 text-[11px]">
                        Ukuran Teks (Font Size)
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { size: 12, label: 'Kecil' },
                          { size: 14, label: 'Normal' },
                          { size: 18, label: 'Besar' },
                          { size: 24, label: 'Judul' },
                        ].map((f) => (
                          <button
                            key={f.size}
                            type="button"
                            onClick={() => updateStyle('fontSize', f.size)}
                            className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all active:scale-95 ${
                              currentStyles.fontSize === f.size
                                ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-400'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Panel Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetCurrentElement}
                    className="flex-1 py-2 px-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-center text-[11px] flex items-center justify-center gap-1 active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Elemen</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToServer}
                    disabled={isSaving}
                    className="flex-1 py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-[11px] flex items-center justify-center gap-1 shadow active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Live'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetPage}
                  className="w-full text-center text-[10px] text-red-500 hover:text-red-700 font-semibold py-1"
                >
                  Kembalikan Seluruh Halaman ke Default
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
