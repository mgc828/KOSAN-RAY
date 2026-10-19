'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { CONTACT_TOPICS } from '@/lib/config';
import { toast } from '@/lib/toast';

export default function ContactForm() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(CONTACT_TOPICS[0]);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // kolom jebakan bot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);

  // Isi otomatis dari akun yang sedang masuk (hanya kalau kolomnya masih kosong).
  const shownName = name || user?.fullName || '';
  const shownEmail = email || user?.email || '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: shownName, email: shownEmail, topic, message, website }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setSentTo(shownEmail);
        setMessage('');
        toast('Pesan terkirim. Kami balas lewat email.', 'success');
      } else setError(d.error || 'Pesan gagal dikirim. Coba lagi.');
    } catch {
      setError('Terjadi gangguan jaringan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="flex items-start gap-3 bg-green-50 border border-[#16A34A]/30 text-[#166534] rounded-2xl p-5" role="status">
        <CheckCircle2 className="w-6 h-6 shrink-0" />
        <div className="space-y-2">
          <p className="font-bold">Pesanmu sudah kami terima.</p>
          <p className="text-sm">Tim kami membalas ke <b>{sentTo}</b>, biasanya dalam 1x24 jam kerja.</p>
          <button type="button" onClick={() => setSentTo(null)} className="text-sm font-bold underline">Kirim pesan lain</button>
        </div>
      </div>
    );
  }

  const field = 'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white';

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="c-name" className="block text-xs font-bold text-slate-800">Nama</label>
          <input id="c-name" type="text" required autoComplete="name" value={shownName} onChange={(e) => setName(e.target.value)} className={field} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="c-email" className="block text-xs font-bold text-slate-800">Email</label>
          <input id="c-email" type="email" required autoComplete="email" value={shownEmail} onChange={(e) => setEmail(e.target.value)} className={field} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="c-topic" className="block text-xs font-bold text-slate-800">Topik</label>
        <select id="c-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={field}>
          {CONTACT_TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="c-message" className="block text-xs font-bold text-slate-800">Pesan</label>
        <textarea
          id="c-message"
          rows={5}
          required
          maxLength={3000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ceritakan kendalamu. Kalau soal pembayaran, sertakan Order ID."
          className={`${field} resize-none`}
        />
      </div>

      {/* Kolom jebakan: tidak terlihat oleh manusia, sering diisi bot. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Jangan diisi<input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>

      {error && <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium" role="alert">{error}</p>}

      <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] disabled:bg-neutral-300 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition-all">
        <Send className="w-4 h-4" />
        <span>{loading ? 'Mengirim...' : 'Kirim Pesan'}</span>
      </button>
    </form>
  );
}
