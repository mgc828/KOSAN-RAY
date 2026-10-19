'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Flag, X } from 'lucide-react';
import { toast } from '@/lib/toast';

const REASONS = [
  { value: 'tidak_sesuai_foto', label: 'Kost tidak sesuai foto/video' },
  { value: 'kost_tidak_ada', label: 'Kost tidak ada / sudah tutup' },
  { value: 'harga_berbeda', label: 'Harga berbeda dengan yang tertera' },
  { value: 'nomor_tidak_aktif', label: 'Nomor pemilik tidak aktif / salah' },
  { value: 'lainnya', label: 'Lainnya' },
];

interface ReportDialogProps {
  slug: string;
  kostName: string;
  open: boolean;
  onClose: () => void;
}

export default function ReportDialog({ slug, kostName, open, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const firstRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (!open) return;
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!reason) return setError('Pilih alasan laporan.');
    setLoading(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, reason, detail, contact }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('Laporan terkirim. Kami akan verifikasi ulang kost ini. Terima kasih!', 'success');
        setReason('');
        setDetail('');
        setContact('');
        onClose();
      } else {
        setError(data.error || 'Laporan gagal dikirim. Coba lagi.');
      }
    } catch {
      setError('Terjadi gangguan jaringan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <button type="button" aria-label="Tutup" className="absolute inset-0 bg-[#0F2A43]/50 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="report-title" className="flex items-center gap-2 text-lg font-extrabold text-[#0F2A43]">
              <Flag className="w-5 h-5 text-[#F97316]" /> Laporkan Kost
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{kostName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="report-reason" className="block text-xs font-bold text-slate-800">Apa masalahnya?</label>
          <select
            id="report-reason"
            ref={firstRef}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            <option value="">Pilih alasan...</option>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="report-detail" className="block text-xs font-bold text-slate-800">
            Ceritakan lebih lanjut {reason === 'lainnya' ? '' : '(opsional)'}
          </label>
          <textarea
            id="report-detail"
            rows={4}
            maxLength={1000}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Contoh: kamar yang saya lihat tidak ber-AC padahal di foto ada AC."
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="report-contact" className="block text-xs font-bold text-slate-800">Kontak kamu (opsional)</label>
          <input
            id="report-contact"
            type="text"
            maxLength={120}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email atau nomor WhatsApp, kalau mau kami kabari"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium" role="alert">{error}</p>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
            Batal
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#F97316] hover:bg-[#EA580C] disabled:bg-neutral-300 transition-colors">
            {loading ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
        </div>
      </form>
    </div>
  );
}
