'use client';

import React, { useId, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Circle, Eye, EyeOff, Info, Loader2 } from 'lucide-react';

const INPUT =
  'w-full h-12 rounded-xl border bg-white px-3.5 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]';

interface BaseProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
  id?: string;
  /** Teks kecil di kanan label (mis. tautan "Lupa kata sandi?"). */
  aside?: React.ReactNode;
}

export function TextField({ label, value, onChange, error, hint, placeholder, autoComplete, id, aside, type = 'text', inputMode }: BaseProps & { type?: string; inputMode?: 'email' | 'text' }) {
  const auto = useId();
  const fid = id || auto;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <label htmlFor={fid} className="text-sm font-medium text-slate-700">{label}</label>
        {aside}
      </div>
      <input
        id={fid}
        type={type}
        inputMode={inputMode}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
        className={`${INPUT} ${error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'}`}
      />
      {error ? <p id={`${fid}-err`} className="mt-1.5 text-sm text-red-600">{error}</p> : hint ? <p id={`${fid}-hint`} className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

/** Kekuatan kata sandi sederhana: panjang + variasi karakter. Hanya panduan; aturan minimal tetap dari server. */
export function passwordScore(v: string): number {
  if (!v) return 0;
  let s = 0;
  if (v.length >= 6) s++;
  if (v.length >= 10) s++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
  if (/\d/.test(v) && /[^A-Za-z0-9]|[A-Za-z]/.test(v)) s++;
  return Math.min(4, s);
}

const STRENGTH = [
  { label: '', cls: 'bg-slate-200' },
  { label: 'Lemah', cls: 'bg-red-500' },
  { label: 'Cukup', cls: 'bg-amber-500' },
  { label: 'Bagus', cls: 'bg-lime-600' },
  { label: 'Kuat', cls: 'bg-green-600' },
];

export function PasswordField({ label, value, onChange, error, hint, placeholder, autoComplete, id, aside, showStrength }: BaseProps & { showStrength?: boolean }) {
  const auto = useId();
  const fid = id || auto;
  const [visible, setVisible] = useState(false);
  const score = passwordScore(value);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <label htmlFor={fid} className="text-sm font-medium text-slate-700">{label}</label>
        {aside}
      </div>
      <div className="relative">
        <input
          id={fid}
          type={visible ? 'text' : 'password'}
          required
          minLength={6}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
          className={`${INPUT} pr-12 ${error ? 'border-red-400' : 'border-slate-300 hover:border-slate-400'}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {showStrength && value && (
        <div className="mt-2 flex items-center gap-3" aria-live="polite">
          <div className="flex flex-1 gap-1" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={`h-1 flex-1 rounded-full ${i <= score ? STRENGTH[score].cls : 'bg-slate-200'}`} />
            ))}
          </div>
          <span className="text-xs font-medium text-slate-600 w-12 text-right">{STRENGTH[score].label}</span>
        </div>
      )}
      {error ? <p id={`${fid}-err`} className="mt-1.5 text-sm text-red-600">{error}</p> : hint ? <p id={`${fid}-hint`} className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function SubmitButton({ loading, children, loadingText }: { loading: boolean; children: React.ReactNode; loadingText: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-12 rounded-xl bg-[#F97316] hover:bg-[#EA580C] active:bg-[#C2410C] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-base font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
    >
      {loading ? (<><Loader2 className="w-5 h-5 animate-spin" aria-hidden />{loadingText}</>) : children}
    </button>
  );
}

export function Notice({ tone, children }: { tone: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const cfg = {
    error: { cls: 'bg-red-50 border-red-200 text-red-800', Icon: AlertCircle },
    success: { cls: 'bg-green-50 border-green-200 text-green-800', Icon: CheckCircle2 },
    info: { cls: 'bg-amber-50 border-amber-200 text-amber-900', Icon: Info },
  }[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${cfg.cls}`}>
      <cfg.Icon className="w-5 h-5 shrink-0 mt-px" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-400" role="separator">
      <span className="h-px flex-1 bg-slate-200" />atau<span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

/** Syarat kata sandi yang berubah langsung saat mengetik (✓ terpenuhi, ○ belum). */
export function PasswordChecklist({ password, confirm }: { password: string; confirm: string }) {
  const rules: { ok: boolean; text: string; strong?: boolean }[] = [
    { ok: password.length >= 6, text: 'Minimal 6 karakter' },
    { ok: /[A-Za-z]/.test(password), text: 'Mengandung huruf' },
    { ok: /\d/.test(password), text: 'Mengandung angka' },
    { ok: password.length > 0 && !/\s/.test(password), text: 'Tanpa spasi' },
    { ok: password.length > 0 && confirm === password, text: 'Konfirmasi sama dengan kata sandi' },
  ];
  return (
    <ul className="grid gap-1.5 text-sm" aria-label="Syarat kata sandi">
      {rules.map((r) => (
        <li key={r.text} className={`flex items-center gap-2 ${r.ok ? 'text-green-700' : 'text-slate-500'}`}>
          {r.ok ? <Check className="w-4 h-4 shrink-0" aria-label="Terpenuhi" /> : <Circle className="w-4 h-4 shrink-0 text-slate-300" aria-label="Belum" />}
          {r.text}
        </li>
      ))}
    </ul>
  );
}
