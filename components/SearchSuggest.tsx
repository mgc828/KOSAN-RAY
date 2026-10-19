'use client';

import React, { useId, useMemo, useRef, useState } from 'react';
import { Building2, MapPin, GraduationCap, TrainFront, Sparkles } from 'lucide-react';
import { Kost } from '@/lib/types';
import { buildSuggestions, KIND_LABEL, Suggestion, SuggestionKind } from '@/lib/suggestions';
import './search-suggest.css';

const ICON: Record<SuggestionKind, React.ComponentType<{ className?: string }>> = {
  kost: Building2,
  area: MapPin,
  kampus: GraduationCap,
  stasiun: TrainFront,
  fasilitas: Sparkles,
};

interface SearchSuggestProps {
  value: string;
  onChange: (v: string) => void;
  /** Enter tanpa memilih saran. */
  onSubmit: (v: string) => void;
  /** Saran dipilih. */
  onPick: (s: Suggestion) => void;
  kosts: Kost[];
  placeholder?: string;
  ariaLabel?: string;
  /** Kelas untuk <input> (supaya bisa dipakai di gaya yang berbeda). */
  inputClassName?: string;
  /** Kelas untuk pembungkus yang menampung input + tombol di dalam. */
  className?: string;
  /** Elemen tambahan di kanan input (mis. tombol cari). */
  children?: React.ReactNode;
}

/** Kolom pencarian dengan saran saat mengetik (pola ARIA combobox, bisa dipakai dengan keyboard). */
export default function SearchSuggest({
  value,
  onChange,
  onSubmit,
  onPick,
  kosts,
  placeholder,
  ariaLabel = 'Cari kost',
  inputClassName,
  className,
  children,
}: SearchSuggestProps) {
  const uid = useId();
  const listId = `${uid}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const blurTimer = useRef<number | undefined>(undefined);

  const items = useMemo(() => buildSuggestions(value, kosts), [value, kosts]);
  const show = open && items.length > 0;

  const pick = (s: Suggestion) => {
    setOpen(false);
    setActive(-1);
    onPick(s);
  };

  return (
    <div className={`sugg ${className ?? ''}`}>
      <input
        type="text"
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={show && active >= 0 ? `${uid}-opt-${active}` : undefined}
        aria-label={ariaLabel}
        autoComplete="off"
        suppressHydrationWarning
        className={inputClassName}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Beri waktu agar klik pada saran tetap terbaca sebelum daftar ditutup.
          blurTimer.current = window.setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setActive((a) => (items.length ? (a + 1) % items.length : -1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => (items.length ? (a <= 0 ? items.length - 1 : a - 1) : -1));
          } else if (e.key === 'Enter') {
            if (show && active >= 0) {
              e.preventDefault();
              pick(items[active]);
            } else {
              setOpen(false);
              onSubmit(value);
            }
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {children}

      {show && (
        <ul id={listId} role="listbox" aria-label="Saran pencarian" className="sugg-list">
          {items.map((s, i) => {
            const Icon = ICON[s.kind];
            return (
              <li
                key={`${s.kind}-${s.value}`}
                id={`${uid}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                className={`sugg-item${i === active ? ' is-active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault(); // jangan hilangkan fokus dari input
                  window.clearTimeout(blurTimer.current);
                  pick(s);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <Icon className="sugg-icon" />
                <span className="sugg-text">
                  <span className="sugg-label">{s.label}</span>
                  {s.sub && <span className="sugg-sub">{s.sub}</span>}
                </span>
                <span className="sugg-kind">{KIND_LABEL[s.kind]}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
