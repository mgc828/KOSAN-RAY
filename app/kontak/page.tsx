import React from 'react';
import { Mail, Phone, MapPin, MessageSquare, Clock } from 'lucide-react';
import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Kontak & Bantuan - kost-kostan',
  description: 'Hubungi tim operasional dan dukungan teknis kost-kostan.',
};

export default function KontakPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          Kontak & Bantuan
        </h1>
        <p className="text-sm text-neutral-600">
          Ada kendala saat bayar QRIS atau ingin mendaftarkan properti kost Anda? Kami siap membantu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info cards */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-neutral-900">Saluran Resmi</h2>

          <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">Email Bantuan & Kemitraan</p>
                <p className="text-neutral-500">support@kost-kostan.id</p>
                <p className="text-neutral-500">owner@kost-kostan.id (Khusus Pemilik Kost)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">Customer Service WhatsApp</p>
                <p className="text-neutral-500">+62 812-3456-7890</p>
                <p className="text-[11px] text-neutral-500">Senin - Minggu: 08:00 - 21:00 WIB</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">Kantor Operasional</p>
                <p className="text-neutral-500">Jl. Prof. Dr. Satrio No. 18, Setiabudi, Jakarta Selatan 12930</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Help Box */}
        <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Pertanyaan Cepat Pembayaran QRIS</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Jika QRIS telah berhasil dibayar namun status belum otomatis aktif dalam 1-2 menit, silakan kirim bukti transfer atau Order ID ke WhatsApp CS kami untuk aktivasi manual instan.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-800 text-xs text-neutral-500">
            Respon rata-rata di bawah 10 menit pada jam kerja.
          </div>
        </div>
      </div>

      <section className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-5" aria-labelledby="form-kontak">
        <div className="space-y-1">
          <h2 id="form-kontak" className="text-lg font-bold text-neutral-900">Kirim Pesan</h2>
          <p className="text-xs text-neutral-500">Isi formulir ini dan tim kami akan membalas lewat email.</p>
        </div>
        <ContactForm />
      </section>
    </div>
  );
}
