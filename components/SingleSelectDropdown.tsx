'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SingleSelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SingleSelectDropdownProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: SingleSelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  highlightSelected?: boolean;
}

export default function SingleSelectDropdown({
  id,
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  label,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  highlightSelected = true,
}: SingleSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasGroups = options.some((o) => Boolean(o.group));
  const isCustomActive = highlightSelected && Boolean(value && value !== '' && value !== 'semua' && value !== 'ALL');

  // Kelompokkan opsi jika ada field group
  const groupedContent = () => {
    if (!hasGroups) {
      return options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onChange(opt.value);
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
              isSelected
                ? 'bg-[#FFEDD5] text-[#0F2A43] font-bold'
                : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            <span className="truncate">{opt.label}</span>
            {isSelected && <Check className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />}
          </button>
        );
      });
    }

    // Ada group
    const ungrouped = options.filter((o) => !o.group);
    const groups: Record<string, SingleSelectOption[]> = {};
    options.forEach((o) => {
      if (o.group) {
        if (!groups[o.group]) groups[o.group] = [];
        groups[o.group].push(o);
      }
    });

    return (
      <>
        {ungrouped.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                isSelected
                  ? 'bg-[#FFEDD5] text-[#0F2A43] font-bold'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />}
            </button>
          );
        })}

        {Object.entries(groups).map(([groupName, groupOpts]) => (
          <div key={groupName} className="pt-1">
            <p className="px-3 pt-2 pb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {groupName}
            </p>
            {groupOpts.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-[#FFEDD5] text-[#0F2A43] font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />}
                </button>
              );
            })}
          </div>
        ))}
      </>
    );
  };

  return (
    <div ref={containerRef} className={`relative text-xs ${className}`}>
      {label && <label className="font-bold text-slate-700 mb-1.5 block">{label}</label>}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex justify-between items-center py-2.5 px-3.5 bg-white rounded-xl border transition-all text-xs disabled:opacity-50 disabled:bg-slate-50 ${
          isCustomActive
            ? 'border-[#F97316] ring-2 ring-[#F97316]/20 font-semibold text-slate-900'
            : 'border-slate-300 text-slate-600 hover:border-slate-400'
        } ${buttonClassName}`}
      >
        <span className="truncate font-medium">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-auto p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
        >
          {groupedContent()}
        </div>
      )}
    </div>
  );
}

