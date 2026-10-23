'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from '@/lib/toast';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_DAYS } from '@/lib/config';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Clock,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
  XCircle,
  RefreshCw,
  MessageCircle,
  FileText,
} from 'lucide-react';

type Step = 'form' | 'qris' | 'success' | 'failed';

interface Order {
  orderId: string;
  amount: number;
  qrImageUrl: string;
  expiryTime: string;
  demo: boolean;
}

const FAIL_TEXT: Record<string, string> = {
  expire: 'Waktu pembayaran habis. Buat tagihan baru untuk mencoba lagi.',
  cancel: 'Pembayaran dibatalkan.',
  deny: 'Pembayaran ditolak oleh penyedia pembayaran.',
  failure: 'Pembayaran gagal diproses.',
};

const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

function useCountdown(target?: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!target) return;
    const tick = () => setLeft(Math.max(0, Math.floor((new Date(target).getTime() - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [target]);
  return left;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, subscription, ready, refresh } = useAuth();

  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [failReason, setFailReason] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [paidAt, setPaidAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const finished = useRef(false);

  const secondsLeft = useCountdown(step === 'qris' ? order?.expiryTime : undefined);
  const isAlreadyActive = subscription.status === 'active';

  const fail = useCallback((reason: string) => {
    if (finished.current) return;
    finished.current = true;
    setFailReason(reason);
    setStep('failed');
    toast('Pembayaran belum berhasil.', 'error');
  }, []);

  const succeed = useCallback(
    async (when: string | null) => {
      if (finished.current) return;
      finished.current = true;
      setPaidAt(when);
      await refresh();
      setStep('success');
      toast('Pembayaran berhasil! Akses sudah aktif.', 'success');
    },
    [refresh]
  );

  // Cek status tagihan ke server tiap 4 detik selama QR ditampilkan.
  useEffect(() => {
    if (step !== 'qris' || !order) return;
    let stop = false;
    const check = async () => {
      try {
        const res = await fetch(`/api/payment/status?orderId=${encodeURIComponent(order.orderId)}`, { credentials: 'same-origin', cache: 'no-store' });
        if (!res.ok || stop) return;
        const d = await res.json();
        if (d.status === 'settlement') await succeed(d.paidAt);
        else if (d.status !== 'pending') fail(FAIL_TEXT[d.status] || 'Pembayaran tidak berhasil.');
      } catch {
        /* jaringan sesaat putus: coba lagi di putaran berikutnya */
      }
    };
    const t = setInterval(check, 4000);
    check();
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [step, order, succeed, fail]);

  const createOrder = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) {
      router.push('/register?next=/checkout');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    finished.current = false;
    try {
      const res = await fetch('/api/payment/create-qris', { method: 'POST', credentials: 'same-origin' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setOrder(data);
        setStep('qris');
      } else if (res.status === 401) {
        router.push('/login?next=/checkout');
      } else {
        const msg = data?.error || 'QRIS gagal dibuat. Silakan coba lagi.';
        setErrorMsg(msg);
        toast(msg, 'error');
      }
    } catch {
      const msg = 'Tidak bisa terhubung ke server. Periksa koneksi internet Anda lalu coba lagi.';
      setErrorMsg(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Hanya tampil di mode demo (tanpa Midtrans) dan hanya saat pengembangan.
  const simulatePayment = async () => {
    if (!order) return;
    setSimulating(true);
    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ orderId: order.orderId }),
      });
      if (res.ok) await succeed(new Date().toISOString());
      else {
        const d = await res.json().catch(() => ({}));
        toast(d.error || 'Simulasi gagal.', 'error');
      }
    } finally {
      setSimulating(false);
    }
  };

  const copyOrderId = () => {
    if (order?.orderId) {
      navigator.clipboard.writeText(order.orderId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const mm = secondsLeft === null ? '' : String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = secondsLeft === null ? '' : String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-[#FFEDD5] text-[#0F2A43] px-3 py-1 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />
          <span>Paket Tunggal Akses Penuh</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
          Akses kost-kostan {rp(SUBSCRIPTION_PRICE)} / {SUBSCRIPTION_DAYS} Hari
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
          Buka semua foto resolusi tinggi, video walkthrough kamar, dan nomor WhatsApp pemilik langsung.
        </p>
      </div>

      {isAlreadyActive && step !== 'success' && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold">Langganan Anda masih aktif ({subscription.daysRemaining} hari tersisa).</p>
              <p className="text-emerald-700">Pembayaran baru otomatis memperpanjang masa aktif (+{SUBSCRIPTION_DAYS} hari dari tanggal berakhir lama).</p>
            </div>
          </div>
          <Link href="/profil" className="font-bold text-emerald-900 underline whitespace-nowrap">Lihat Profil</Link>
        </div>
      )}

      {/* LANGKAH 1: ringkasan */}
      {step === 'form' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-neutral-800">Paket Langganan {SUBSCRIPTION_DAYS} Hari</span>
                <span className="font-bold text-neutral-900">{rp(SUBSCRIPTION_PRICE)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Metode Pembayaran</span>
                <span className="font-medium text-emerald-700">QRIS (GoPay, OVO, ShopeePay, DANA, m-banking)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Biaya Admin</span>
                <span className="font-medium text-emerald-700">Rp 0 (Gratis)</span>
              </div>
              <div className="pt-3 border-t border-neutral-200 flex items-baseline justify-between">
                <span className="font-bold text-neutral-900 text-sm">Total Pembayaran:</span>
                <span className="text-2xl font-black text-emerald-700">{rp(SUBSCRIPTION_PRICE)}</span>
              </div>
            </div>

            {!ready ? (
              <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" aria-hidden />
            ) : user ? (
              <div className="bg-[#FFEDD5] border border-[#F97316] rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-[#F97316]/50 shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      Akun: <span className="text-[#0F2A43] font-mono">{user.email}</span>
                    </p>
                    <p className="text-slate-500 text-[11px]">Akses langsung aktif untuk akun ini setelah pembayaran terkonfirmasi.</p>
                  </div>
                </div>
                <button type="button" onClick={() => router.push('/login?next=/checkout')} className="text-[11px] font-bold text-[#0F2A43] hover:underline shrink-0">
                  Ganti Akun
                </button>
              </div>
            ) : (
              <div className="bg-[#FFEDD5] border border-[#F97316] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#0F2A43]">
                <div className="space-y-0.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-[#C2410C] shrink-0" />
                    <span>Anda belum masuk ke akun</span>
                  </p>
                  <p className="text-[11px] text-slate-600">Daftar atau masuk dulu agar akses {SUBSCRIPTION_DAYS} hari tersimpan di akun Anda.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href="/register?next=/checkout" className="bg-[#F97316] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#EA580C] transition-colors">Daftar Baru</Link>
                  <Link href="/login?next=/checkout" className="bg-white text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-[#F97316] hover:bg-[#FFEDD5] transition-colors">Masuk</Link>
                </div>
              </div>
            )}

            <form onSubmit={createOrder} className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-neutral-800">Yang langsung terbuka:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
                  {['Nomor WhatsApp semua pemilik kost', 'Semua foto kamar resolusi tinggi', 'Semua video walkthrough kamar', `Akses tanpa batas harian selama ${SUBSCRIPTION_DAYS} hari`].map((t) => (
                    <div key={t} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {ready && !user ? (
                <Link href="/register?next=/checkout" className="w-full mt-4 flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold py-3.5 px-6 rounded-xl text-sm shadow-md transition-all">
                  <span>Daftar atau Masuk untuk Lanjut Bayar</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !ready}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] disabled:bg-neutral-300 text-white font-extrabold py-3.5 px-6 rounded-xl text-sm shadow-md transition-all cursor-pointer"
                >
                  {loading ? (
                    <span>Menyiapkan QRIS...</span>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      <span>Lanjut Bayar QRIS {rp(SUBSCRIPTION_PRICE)}</span>
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* LANGKAH 2: QRIS */}
      {step === 'qris' && order && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-neutral-900">Scan QRIS untuk Menyelesaikan Pembayaran</h2>
            <p className="text-xs text-neutral-500">Gunakan GoPay, OVO, ShopeePay, DANA, atau aplikasi m-banking apa pun. Halaman ini otomatis berubah setelah pembayaran terdeteksi.</p>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 flex flex-col items-center space-y-4 max-w-sm mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={order.qrImageUrl} alt="Kode QRIS pembayaran" width={224} height={224} className="w-56 h-56 bg-white p-2 rounded-xl border border-neutral-300 object-contain" />

            <div className="text-center">
              <span className="text-xs text-neutral-500 font-medium">Nominal pas:</span>
              <p className="text-2xl font-black text-emerald-700">{rp(order.amount)}</p>
            </div>

            {secondsLeft !== null && (
              <p className={`inline-flex items-center gap-1.5 text-xs font-bold ${secondsLeft < 60 ? 'text-red-700' : 'text-slate-600'}`} role="timer">
                <Clock className="w-3.5 h-3.5" />
                Berlaku {mm}:{ss}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-neutral-600 bg-white px-3 py-1.5 rounded-lg border border-neutral-200">
              <span>Order ID: <strong>{order.orderId}</strong></span>
              <button onClick={copyOrderId} aria-label="Salin Order ID" className="text-neutral-500 hover:text-neutral-700">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin" /> Menunggu pembayaran...</p>
          </div>

          {order.demo && (
            <div className="bg-[#FFEDD5] border border-[#F97316]/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-[#0F2A43]">
                <Sparkles className="w-5 h-5 text-[#C2410C] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Mode demo (Midtrans belum dihubungkan)</p>
                  <p className="text-neutral-600 leading-relaxed">QR di atas hanya contoh. Untuk menguji alurnya, tekan tombol di bawah. Tombol ini tidak ada saat Midtrans aktif.</p>
                </div>
              </div>
              <button onClick={simulatePayment} disabled={simulating} className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] disabled:bg-neutral-300 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-sm transition-all">
                <CheckCircle2 className="w-4 h-4" />
                <span>{simulating ? 'Memproses...' : 'Simulasikan pembayaran berhasil'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAGAL */}
      {step === 'failed' && (
        <div className="bg-white rounded-3xl border border-red-300 shadow-lg p-6 sm:p-10 text-center space-y-6" role="alert">
          <div className="w-16 h-16 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <XCircle className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">Pembayaran Belum Berhasil</h2>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">{failReason}</p>
          </div>
          {order && <p className="text-xs text-neutral-500">Order ID: <strong className="font-mono text-neutral-700">{order.orderId}</strong></p>}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setOrder(null);
                setFailReason('');
                setStep('form');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Buat Tagihan Baru</span>
            </button>
            <Link href="/kontak" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-3 px-6 rounded-xl text-xs sm:text-sm transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi Bantuan</span>
            </Link>
          </div>
        </div>
      )}

      {/* BERHASIL */}
      {step === 'success' && (
        <div className="bg-white rounded-3xl border border-emerald-300 shadow-lg p-6 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm" role="status">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">Pembayaran Terverifikasi!</h2>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">Akun Anda sekarang punya akses penuh. Bukti pembayaran dikirim ke email Anda.</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 max-w-sm mx-auto text-left space-y-2 text-xs">
            <Row k="Status Langganan" v="AKTIF" />
            <Row k="Aktif Sampai" v={subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
            <Row k="Sisa Durasi" v={`${subscription.daysRemaining} Hari`} />
            {order && (
              <>
                <div className="border-t border-emerald-200 pt-2"><Row k="Order ID" v={order.orderId} mono /></div>
                <Row k="Total Dibayar" v={rp(order.amount)} />
              </>
            )}
            {paidAt && <Row k="Waktu Bayar" v={new Date(paidAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/cari-kost" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all">
              <span>Mulai Cari Kost & Buka WA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {order && (
              <Link href={`/invoice/${order.orderId}`} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-3 px-6 rounded-xl text-xs sm:text-sm transition-colors">
                <FileText className="w-4 h-4" />
                <span>Lihat Invoice</span>
              </Link>
            )}
            <Link href="/profil" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-3 px-6 rounded-xl text-xs sm:text-sm transition-colors">
              <span>Buka Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-emerald-900 font-semibold">
      <span>{k}:</span>
      <span className={`text-emerald-700 font-bold text-right ${mono ? 'font-mono text-[11px]' : ''}`}>{v}</span>
    </div>
  );
}
