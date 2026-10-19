# Panduan setup kost-kostan

Dokumen ini menjelaskan cara menyalakan fitur yang butuh akun/kunci dari luar. Semua fitur tetap berjalan tanpa
kunci tersebut (mode lokal/demo), kecuali pembayaran asli.

## 1. Menjalankan secara lokal

```bash
npm install --legacy-peer-deps   # --legacy-peer-deps dibutuhkan karena eslint-config-next 16 vs next 15
cp .env.example .env.local        # lalu isi SESSION_SECRET (wajib di produksi)
npm run dev                       # pengembangan  -> http://localhost:3000
npm run build && npm start        # produksi
npm test                          # tes otomatis (vitest)
```

`SESSION_SECRET` = teks acak minimal 16 karakter. Contoh membuatnya: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.

## 2. Database (Supabase) — wajib untuk hosting seperti Vercel

Tanpa Supabase, data disimpan di file `data/*.json` (hanya cocok untuk laptop sendiri).

1. Buat proyek di supabase.com.
2. Buka **SQL Editor**, jalankan isi `supabase/migrations/001_app_documents.sql`.
3. Isi di `.env.local` (dan di pengaturan environment hosting):
   `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` (Project Settings -> API).
   Kunci `service_role` bersifat rahasia: jangan pernah dipakai di kode browser.
4. (Opsional) Pindahkan data yang sudah ada: `npm run db:push`.

> Lapisan data (`lib/db.ts`) sudah ditulis untuk Supabase, tapi belum pernah dijalankan terhadap database sungguhan
> oleh pembuatnya. Coba dulu di proyek Supabase percobaan sebelum dipakai untuk data asli.

## 3. Pembayaran (Midtrans)

1. Daftar di midtrans.com, ambil **Server Key Sandbox** (Settings -> Access Keys).
2. Isi `MIDTRANS_SERVER_KEY` dan `MIDTRANS_IS_PRODUCTION="false"`.
3. Di dashboard Midtrans -> Settings -> Configuration, isi **Payment Notification URL**:
   `https://DOMAIN-ANDA/api/payment/webhook`
4. Tes dengan simulator QRIS Midtrans (simulator.sandbox.midtrans.com).
5. Saat siap live: ganti ke Server Key produksi dan `MIDTRANS_IS_PRODUCTION="true"`.

Tanpa kunci Midtrans:
- di mode pengembangan (`npm run dev`) checkout memakai QR contoh dan tombol "Simulasikan pembayaran";
- di produksi checkout menolak dengan pesan "Pembayaran belum tersedia" (tidak ada jalan pintas gratis).
  Untuk mencoba alur di server produksi lokal saja, set `ALLOW_PAYMENT_SIMULATION="1"` (JANGAN di situs publik).

## 4. Email (Resend)

Dipakai untuk bukti bayar, pengingat langganan, "lupa kata sandi", dan formulir Kontak.

1. Daftar di resend.com, verifikasi domain pengirim.
2. Isi `RESEND_API_KEY`, `EMAIL_FROM` (mis. `kost-kostan <halo@domainanda.id>`), dan `SUPPORT_EMAIL` (penerima pesan Kontak).

Tanpa ini email tidak dikirim; isinya hanya dicatat di `data/outbox.json` dan log server.

## 5. Pengingat langganan (cron)

Endpoint `/api/cron/reminders` mengirim pengingat 3 hari sebelum berakhir dan saat sudah berakhir (sekali per masa aktif).
- Di **Vercel**: sudah diatur di `vercel.json` (tiap hari 01:00 UTC). Isi `CRON_SECRET`; Vercel mengirimnya otomatis.
- Di tempat lain: panggil harian, mis. `curl -H "Authorization: Bearer $CRON_SECRET" https://DOMAIN/api/cron/reminders`.

Perpanjangan **otomatis (auto-debit)** tidak tersedia: QRIS tidak mendukung tagihan berulang. Yang ada: pengingat +
tombol Perpanjang satu klik, dan perpanjangan selalu ditambahkan di belakang tanggal berakhir lama.

## 6. Login Google

1. Google Cloud Console -> APIs & Services -> Credentials -> OAuth client ID (Web application).
2. Tambahkan domain situs di **Authorized JavaScript origins**.
3. Isi `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. Tombol "Lanjutkan dengan Google" muncul otomatis.

## 7. Analitik & cookie

Isi `NEXT_PUBLIC_GA_ID` (Google Analytics 4, format `G-XXXXXXX`). Skrip analitik baru dimuat setelah pengunjung
menekan "Terima semua" di banner cookie. Tanpa ID ini tidak ada banner dan tidak ada pelacakan.

## 8. Pemantauan error

- Error di browser dikirim ke `/api/errors`; error di server dicatat otomatis oleh `instrumentation.ts`.
- Keduanya tersimpan di koleksi `error-logs` (file `data/error-logs.json` atau tabel `app_documents`).
- Ini pencatat sederhana. Untuk notifikasi/pengelompokan otomatis, pasang layanan seperti Sentry.

## 9. Deploy ke Vercel (ringkas)

1. Push proyek ke GitHub, impor di vercel.com.
2. Isi semua environment variable di atas (minimal: `APP_URL`, `SESSION_SECRET`, Supabase, Midtrans, `CRON_SECRET`).
3. Setelah deploy, isi URL webhook Midtrans dengan domain Vercel.

## 10. Hal yang sengaja belum ditangani

- Halaman/API admin belum memakai login sungguhan (kata sandi admin masih di kode browser; API admin terbuka).
- Kata sandi pengguna masih disimpan sebagai base64, bukan hash (bcrypt/argon2).
- Belum ada tampilan di panel admin untuk laporan kost, pesan kontak, dan error log (datanya sudah tersimpan).
