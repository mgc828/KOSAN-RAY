'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquareText, Trash2, BadgeCheck } from 'lucide-react';
import { Stars, StarInput } from '@/components/StarRating';
import { toast } from '@/lib/toast';
import { REVIEW_MIN_CHARS, REVIEW_MAX_CHARS } from '@/lib/reviews-shared';

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  mine: boolean;
}
interface Payload {
  summary: { avg: number; count: number; dist: number[] };
  reviews: ReviewItem[];
  canReview: { loggedIn: boolean; paid: boolean; hasReview: boolean };
}

export default function ReviewsSection({ slug, kostName }: { slug: string; kostName: string }) {
  const [data, setData] = useState<Payload | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`, { credentials: 'same-origin', cache: 'no-store' });
      if (!res.ok) throw new Error('gagal');
      const d: Payload = await res.json();
      setData(d);
      setLoadError(false);
      const mine = d.reviews.find((r) => r.mine);
      if (mine) {
        setRating(mine.rating);
        setBody(mine.body);
      }
    } catch {
      setLoadError(true);
    }
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!rating) return setError('Pilih rating bintang dulu.');
    setSaving(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ slug, rating, body }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        toast(data?.canReview.hasReview ? 'Ulasan diperbarui. Terima kasih!' : 'Ulasan terkirim. Terima kasih!', 'success');
        await load();
      } else setError(d.error || 'Ulasan gagal dikirim.');
    } catch {
      setError('Terjadi gangguan jaringan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Hapus ulasan kamu?')) return;
    const res = await fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`, { method: 'DELETE', credentials: 'same-origin' });
    if (res.ok) {
      setRating(0);
      setBody('');
      toast('Ulasan dihapus.', 'info');
      await load();
    } else toast('Gagal menghapus ulasan.', 'error');
  };

  const here = typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <section className="space-y-5" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="flex items-center gap-2 text-xl font-extrabold text-[#0F2A43]">
        <MessageSquareText className="w-5 h-5 text-[#F97316]" /> Ulasan Penghuni
      </h2>

      {loadError && (
        <p className="text-sm text-slate-500">
          Ulasan belum bisa dimuat.{' '}
          <button type="button" onClick={load} className="font-bold text-[#C2410C] underline">Coba lagi</button>
        </p>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Ringkasan */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3 self-start">
            {data.summary.count === 0 ? (
              <p className="text-sm text-slate-500">Belum ada ulasan untuk {kostName}. Jadilah yang pertama.</p>
            ) : (
              <>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-black text-[#0F2A43]" suppressHydrationWarning>
                    {data.summary.avg.toFixed(1).replace('.', ',')}
                  </span>
                  <div className="pb-1">
                    <Stars value={data.summary.avg} size={16} />
                    <p className="text-xs text-slate-500 mt-0.5">{data.summary.count} ulasan</p>
                  </div>
                </div>
                <ul className="space-y-1.5" aria-label="Sebaran rating">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const c = data.summary.dist[n - 1] ?? 0;
                    const pct = data.summary.count ? (c / data.summary.count) * 100 : 0;
                    return (
                      <li key={n} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="w-6">{n}★</span>
                        <span className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <span className="block h-full bg-[#F59E0B] rounded-full" style={{ width: `${pct}%` }} />
                        </span>
                        <span className="w-5 text-right tabular-nums">{c}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>

          <div className="space-y-5">
            {/* Formulir sesuai status pengguna */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              {!data.canReview.loggedIn ? (
                <p className="text-sm text-slate-600">
                  <Link href={`/masuk?next=${encodeURIComponent(here)}`} className="font-bold text-[#C2410C] hover:underline">Masuk</Link> untuk menulis ulasan.
                </p>
              ) : !data.canReview.paid ? (
                <p className="text-sm text-slate-600">
                  Ulasan hanya untuk pengguna yang pernah membuka akses penuh, supaya ulasan datang dari pencari kost sungguhan.{' '}
                  <Link href="/checkout" className="font-bold text-[#C2410C] hover:underline">Buka akses</Link>
                </p>
              ) : (
                <form onSubmit={submit} className="space-y-3">
                  <p className="text-sm font-bold text-[#0F2A43]">{data.canReview.hasReview ? 'Ulasan kamu' : 'Tulis ulasan'}</p>
                  <StarInput value={rating} onChange={setRating} />
                  <div>
                    <label htmlFor="review-body" className="sr-only">Isi ulasan</label>
                    <textarea
                      id="review-body"
                      rows={4}
                      maxLength={REVIEW_MAX_CHARS}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Ceritakan pengalamanmu: kebersihan, keamanan, kesesuaian dengan foto, pemilik/pengelola..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] resize-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1 text-right">{body.trim().length}/{REVIEW_MAX_CHARS} (min. {REVIEW_MIN_CHARS})</p>
                  </div>
                  {error && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium" role="alert">{error}</p>}
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#F97316] hover:bg-[#EA580C] disabled:bg-neutral-300 transition-colors">
                      {saving ? 'Menyimpan...' : data.canReview.hasReview ? 'Perbarui ulasan' : 'Kirim ulasan'}
                    </button>
                    {data.canReview.hasReview && (
                      <button type="button" onClick={remove} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-700 transition-colors">
                        <Trash2 className="w-4 h-4" /> Hapus
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Daftar ulasan */}
            <ul className="space-y-3">
              {data.reviews.map((r) => (
                <li key={r.id} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-sm text-[#0F2A43] truncate">{r.name}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#16A34A] bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                        <BadgeCheck className="w-3 h-3" /> Pengguna terverifikasi
                      </span>
                      {r.mine && <span className="text-[10px] font-bold text-[#C2410C] shrink-0">(kamu)</span>}
                    </div>
                    <Stars value={r.rating} size={14} />
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{r.body}</p>
                  <p className="text-[11px] text-slate-500" suppressHydrationWarning>
                    {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {r.updatedAt !== r.createdAt ? ' (diedit)' : ''}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
