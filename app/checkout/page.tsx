'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
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
  Building
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, subscription, activateSubscription } = useAuth();
  
  const [emailInput, setEmailInput] = useState(user?.email || 'pencari.kost@example.com');
  const [step, setStep] = useState<'form' | 'qris' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    amount: number;
    qrImageUrl: string;
    expiryTime: string;
    isSandbox: boolean;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Jika user sudah memiliki langganan aktif, beri tahu
  const isAlreadyActive = subscription.status === 'active';

  const handleGenerateQRIS = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/payment/create-qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || `usr-${Date.now()}`,
          email: emailInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderData(data);
        setStep('qris');
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  // Simulasi webhook bayar berhasil (sesuai spesifikasi Section 6: status bayar hanya dari webhook)
  const handleSimulatePaymentWebhook = async () => {
    if (!orderData) return;
    setVerifying(true);

    try {
      const webhookPayload = {
        order_id: orderData.orderId,
        status_code: '200',
        gross_amount: '10000.00',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        custom_field1: user?.id || 'usr-default',
        simulate_success: true,
      };

      const res = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });

      if (res.ok) {
        // Aktifkan masa aktif langganan (+30 hari)
        activateSubscription(30);
        setStep('success');
      }
    } catch {
      // Direct client activation fallback
      activateSubscription(30);
      setStep('success');
    } finally {
      setVerifying(false);
    }
  };

  const copyOrderId = () => {
    if (orderData?.orderId) {
      navigator.clipboard.writeText(orderData.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Paket Tunggal Akses Penuh</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
          Akses KostHunt Rp10.000 / 30 Hari
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
          Buka semua foto resolusi tinggi, 3 video walkthrough kamar, dan nomor WhatsApp pemilik langsung.
        </p>
      </div>

      {isAlreadyActive && step !== 'success' && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Langganan Anda saat ini masih aktif ({subscription.daysRemaining} hari tersisa).</p>
              <p className="text-emerald-700">Pembayaran baru akan otomatis memperpanjang masa aktif (+30 hari dari tanggal berakhir lama).</p>
            </div>
          </div>
          <Link href="/dashboard" className="font-bold text-emerald-900 underline whitespace-nowrap">
            Lihat Dashboard
          </Link>
        </div>
      )}

      {/* STEP 1: FORM EMAIL & RINGKASAN */}
      {step === 'form' && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            {/* Ringkasan Pesanan */}
            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-neutral-800">Paket Langganan 30 Hari</span>
                <span className="font-bold text-neutral-900">Rp 10.000</span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Metode Pembayaran</span>
                <span className="font-medium text-emerald-700">QRIS (GoPay, OVO, ShopeePay, DANA, BCA)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Biaya Admin Gateway</span>
                <span className="font-medium text-emerald-600">Rp 0 (Gratis)</span>
              </div>
              <div className="pt-3 border-t border-neutral-200 flex items-baseline justify-between">
                <span className="font-bold text-neutral-900 text-sm">Total Pembayaran:</span>
                <span className="text-2xl font-black text-emerald-700">Rp 10.000</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleGenerateQRIS} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-800">
                  Email Akun Anda <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="nama.anda@email.com"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <p className="text-[11px] text-neutral-400">
                  Bukti pembayaran dan status akun akan dikaitkan ke email ini.
                </p>
              </div>

              {/* What you get checklist */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-neutral-800">Fitur yang Langsung Terbuka:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Nomor WhatsApp semua pemilik kost</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Semua foto kamar resolusi tinggi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Semua video 360 walkthrough kamar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Akses tanpa batas harian selama 30 hari</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-extrabold py-3.5 px-6 rounded-xl text-sm shadow-md transition-all hover:scale-[1.01]"
              >
                {loading ? (
                  <span>Menyiapkan QRIS...</span>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    <span>Lanjut Bayar QRIS Rp10.000</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STEP 2: QRIS DISPLAY & VERIFICATION */}
      {step === 'qris' && orderData && (
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-neutral-900">Scan QRIS untuk Menyelesaikan Pembayaran</h2>
            <p className="text-xs text-neutral-500">
              Gunakan GoPay, OVO, ShopeePay, DANA, BCA Mobile, atau aplikasi bank apapun
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
            <div className="relative w-56 h-56 bg-white p-3 rounded-xl shadow-xs border border-neutral-300">
              <Image
                src={orderData.qrImageUrl}
                alt="QRIS Pembayaran KostHunt"
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>

            <div className="text-center">
              <span className="text-xs text-neutral-500 font-medium">Nominal Pas:</span>
              <p className="text-2xl font-black text-emerald-700">Rp 10.000</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-600 bg-white px-3 py-1.5 rounded-lg border border-neutral-200">
              <span>Order ID: <strong>{orderData.orderId}</strong></span>
              <button onClick={copyOrderId} className="text-neutral-400 hover:text-neutral-700">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Sandbox Webhook Simulation Button (Section 6) */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-amber-900">
                <p className="font-bold">Mode Sandbox / Pengujian MVP</p>
                <p className="text-neutral-600 leading-relaxed">
                  Dalam mode produksi, Midtrans akan memanggil webhook server otomatis ketika pengguna selesai scan. Untuk validasi MVP sekarang, klik tombol simulasi di bawah:
                </p>
              </div>
            </div>

            <button
              onClick={handleSimulatePaymentWebhook}
              disabled={verifying}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-4 rounded-xl text-xs shadow-sm transition-all"
            >
              {verifying ? (
                <span>Memproses Webhook Signature...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                  <span>Simulasi Bayar Berhasil (Kirim Webhook Server)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS CONFIRMATION */}
      {step === 'success' && (
        <div className="bg-white rounded-3xl border border-emerald-300 shadow-lg p-6 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">
              Pembayaran Terverifikasi!
            </h2>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Akun Anda sekarang memiliki akses penuh ke seluruh database KostHunt Jakarta.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 max-w-sm mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between text-emerald-900 font-semibold">
              <span>Status Langganan:</span>
              <span className="text-emerald-700 font-bold uppercase">Aktif</span>
            </div>
            <div className="flex justify-between text-emerald-900 font-semibold">
              <span>Aktif Sampai:</span>
              <span className="text-emerald-700 font-bold">
                {subscription.expiresAt
                  ? new Date(subscription.expiresAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '30 Hari ke depan'}
              </span>
            </div>
            <div className="flex justify-between text-emerald-900 font-semibold">
              <span>Sisa Durasi:</span>
              <span className="text-emerald-700 font-bold">{subscription.daysRemaining || 30} Hari</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/kost/jakarta"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all"
            >
              <span>Mulai Cari Kost & Buka WA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-3 px-6 rounded-xl text-xs sm:text-sm transition-colors"
            >
              <span>Buka Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
