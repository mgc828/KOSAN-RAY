import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ARTIFACTS_DIR = path.join(rootDir, 'app', 'admin', 'arsitektur', 'artifacts');
const ARCHIFY_DIR = path.join(rootDir, '.archify');
const ARCHIFY_CLI = path.join(rootDir, '.agents', 'skills', 'archify', 'bin', 'archify.mjs');

// Ensure directories exist
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
fs.mkdirSync(ARCHIFY_DIR, { recursive: true });

export function scanProjectStats() {
  let pkg = { name: 'RAY KOSAN', version: '0.1.0' };
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  } catch {}
  
  let pageCount = 0;
  let apiCount = 0;
  
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        if (entry.name === 'page.tsx' || entry.name === 'page.jsx') pageCount++;
        if (entry.name === 'route.ts' || entry.name === 'route.js') apiCount++;
      }
    }
  }

  walk(path.join(rootDir, 'app'));

  return {
    name: 'RAY KOSAN',
    appId: pkg.name || 'ray-kosan',
    version: pkg.version || '0.1.0',
    nextVersion: pkg.dependencies?.next || '15.4.9',
    reactVersion: pkg.dependencies?.react || '19.2.1',
    pageCount,
    apiCount,
    totalRoutes: pageCount + apiCount,
    timestamp: new Date().toISOString(),
  };
}

export function generateArchitectureCandidate(stats) {
  return {
    schema_version: 1,
    diagram_type: 'architecture',
    meta: {
      title: `Arsitektur Sistem ${stats.name} (v${stats.version})`,
      output: 'app/admin/arsitektur/artifacts/system-architecture.html',
      quality_profile: 'showcase'
    },
    components: [
      { id: 'google_auth', type: 'external', label: 'Google OAuth', sublabel: 'Identity Provider', pos: [50, 110], size: [150, 65] },
      { id: 'client_web', type: 'frontend', label: 'Web Client (Next.js)', sublabel: `React 19, Leaflet (${stats.pageCount} Pages)`, pos: [50, 260], size: [160, 70] },
      { id: 'sentinel_sec', type: 'security', label: 'Sentinel WAF & Audit', sublabel: 'middleware.ts + detector', pos: [260, 260], size: [160, 70], tag: 'Active Defense' },
      { id: 'auth_service', type: 'security', label: 'Auth & Session', sublabel: 'Encrypted Cookie + Tokens', pos: [480, 110], size: [160, 65] },
      { id: 'next_app', type: 'backend', label: 'Next.js Core App', sublabel: `App Router (${stats.apiCount} APIs)`, pos: [480, 260], size: [160, 70] },
      { id: 'db_adapter', type: 'backend', label: 'Database Adapter', sublabel: 'lib/db.ts Dual Strategy', pos: [480, 400], size: [160, 65] },
      { id: 'payment_engine', type: 'backend', label: 'Payment Engine', sublabel: 'QRIS & Webhook Handler', pos: [480, 540], size: [160, 65] },
      { id: 'cron_worker', type: 'backend', label: 'Cron Reminders', sublabel: 'Vercel Cron H-3 & H-0', pos: [480, 670], size: [160, 65] },
      { id: 'supabase_db', type: 'database', label: 'Supabase PostgreSQL', sublabel: 'Table: app_documents', pos: [750, 350], size: [160, 65] },
      { id: 'local_store', type: 'database', label: 'Local JSON Store', sublabel: 'data/*.json Fallback', pos: [750, 450], size: [160, 65] },
      { id: 'midtrans', type: 'external', label: 'Midtrans Payment', sublabel: 'QRIS Gateway API', pos: [750, 560], size: [160, 65], tag: 'Payment Gateway' },
      { id: 'resend_mail', type: 'external', label: 'Resend Email API', sublabel: 'Invoice & Reminders', pos: [750, 670], size: [160, 65], tag: 'Transactional Mail' }
    ],
    boundaries: [
      { kind: 'region', label: 'Next.js 15 Application Server', wraps: ['sentinel_sec', 'next_app', 'auth_service', 'db_adapter', 'payment_engine', 'cron_worker'] },
      { kind: 'security-group', label: 'Data Persistence Layer', wraps: ['supabase_db', 'local_store'] }
    ],
    connections: [
      { id: 'client-to-sentinel', from: 'client_web', to: 'sentinel_sec', label: 'HTTP Request', variant: 'emphasis' },
      { id: 'client-to-google', from: 'client_web', to: 'google_auth', label: 'OAuth Login', variant: 'dashed' },
      { id: 'google-to-auth', from: 'google_auth', to: 'auth_service', label: 'ID Token Verification' },
      { id: 'sentinel-to-app', from: 'sentinel_sec', to: 'next_app', label: 'Sanitized Traffic' },
      { id: 'app-to-auth', from: 'next_app', to: 'auth_service', label: 'Verify Session' },
      { id: 'app-to-payment', from: 'next_app', to: 'payment_engine', label: 'Checkout Booking' },
      { id: 'payment-to-midtrans', from: 'payment_engine', to: 'midtrans', label: 'Create QRIS' },
      { id: 'midtrans-webhook', from: 'midtrans', to: 'payment_engine', label: 'Callback Webhook', variant: 'security' },
      { id: 'payment-to-mail', from: 'payment_engine', to: 'resend_mail', label: 'Send Invoice' },
      { id: 'cron-to-mail', from: 'cron_worker', to: 'resend_mail', label: 'Send Reminders' },
      { id: 'app-to-db', from: 'next_app', to: 'db_adapter', label: 'Query / Mutate' },
      { id: 'db-to-supabase', from: 'db_adapter', to: 'supabase_db', label: 'SQL (Production)' },
      { id: 'db-to-local', from: 'db_adapter', to: 'local_store', label: 'JSON (Dev Fallback)', variant: 'dashed' }
    ],
    cards: [
      { dot: 'cyan', title: 'Client & User Experience', items: [`Next.js ${stats.nextVersion} App Router + React 19`, `Total ${stats.totalRoutes} route handlers (${stats.pageCount} pages, ${stats.apiCount} APIs)`, 'Interactive Leaflet maps dengan clustering kosan'] },
      { dot: 'rose', title: 'Sentinel Security (WAF)', items: ['Inspeksi real-time di Next.js Edge Middleware', 'Mencegah Path Traversal, SQL Injection, XSS, dan Bot scanner', 'Asynchronous logging ke /api/security/log tanpa latency'] },
      { dot: 'emerald', title: 'Transaksi & Otomatisasi', items: ['Midtrans QRIS dengan dynamic QR dan verifikasi webhook', 'Cron job harian Vercel untuk pengingat sewa H-3 & H-0', 'Email notifikasi dan bukti pembayaran otomatis via Resend'] },
      { dot: 'amber', title: 'Data Persistence', items: ['Dual-mode: Supabase PostgreSQL untuk cloud production', 'Local JSON file storage (data/*.json) untuk development', 'Transparansi penuh tanpa dependency database yang berat'] }
    ]
  };
}

export function generateWorkflowCandidate(stats) {
  return {
    schema_version: 2,
    diagram_type: 'workflow',
    meta: {
      title: `Alur Pengguna (User Flow) ${stats.name}`,
      animation: 'trace',
      visual_preset: 'signal-flow',
      quality_profile: 'showcase',
      output: 'app/admin/arsitektur/artifacts/user-flow.html'
    },
    lanes: [
      { id: 'user_ui', label: 'Tampilan Pengguna (Web App)' },
      { id: 'app_logic', label: 'Backend & Validasi (Next.js)' },
      { id: 'finance', label: 'Pembayaran Midtrans Gateway' },
      { id: 'retention', label: 'Otomatisasi & Siklus Sewa' }
    ],
    phases: [
      { id: 'discovery', label: '1. Eksplorasi & Filter', fromCol: 0, toCol: 1 },
      { id: 'consideration', label: '2. Evaluasi & Akun', fromCol: 2, toCol: 3, variant: 'emphasis' },
      { id: 'checkout_post', label: '3. Booking & Pengingat', fromCol: 4, toCol: 5, variant: 'dashed' }
    ],
    mainPath: [
      'home_search',
      'search_engine',
      'detail_room',
      'user_auth',
      'sentinel_check',
      'checkout_page',
      'order_gen',
      'midtrans_qris',
      'scan_qris',
      'webhook_verify',
      'dashboard_user'
    ],
    nodes: [
      { id: 'home_search', lane: 'user_ui', col: 0, type: 'frontend', label: 'Cari / Filter Kosan', sublabel: 'Lokasi, Harga, Gender', width: 150 },
      { id: 'search_engine', lane: 'app_logic', col: 0, type: 'backend', label: 'Query Katalog & Map', sublabel: 'lib/db.ts + Geolocation', width: 150 },
      { id: 'detail_room', lane: 'user_ui', col: 1, type: 'frontend', label: 'Detail & Bandingkan', sublabel: 'Foto, Ulasan, dan Peta', width: 150 },
      { id: 'user_auth', lane: 'user_ui', col: 2, type: 'security', label: 'Login / Register', sublabel: 'Email Sandi / Google OAuth', width: 150 },
      { id: 'sentinel_check', lane: 'app_logic', col: 2, type: 'security', label: 'Sentinel Security', sublabel: 'WAF & Session Cookie', tag: 'Active WAF', width: 150 },
      { id: 'checkout_page', lane: 'user_ui', col: 3, type: 'frontend', label: 'Formulir Booking', sublabel: 'Pilih Durasi & Tanggal', width: 150 },
      { id: 'order_gen', lane: 'app_logic', col: 3, type: 'backend', label: 'Generate Invoice', sublabel: 'Hitung Tagihan Sewa', width: 150 },
      { id: 'midtrans_qris', lane: 'finance', col: 4, type: 'external', label: 'Midtrans QRIS API', sublabel: 'Dynamic QR Code', width: 150 },
      { id: 'scan_qris', lane: 'user_ui', col: 4, type: 'frontend', label: 'Bayar via QRIS', sublabel: 'BCA, GoPay, OVO, Dana', width: 150 },
      { id: 'webhook_verify', lane: 'finance', col: 5, type: 'backend', label: 'Verifikasi Webhook', sublabel: 'Cek Signature & Set Lunas', tag: 'Auto Settle', width: 150 },
      { id: 'dashboard_user', lane: 'user_ui', col: 5, type: 'frontend', label: 'Status Kosan Aktif', sublabel: 'Kwitansi & Profil Sewa', width: 150 },
      { id: 'cron_reminder', lane: 'retention', col: 4, type: 'backend', label: 'Vercel Cron Reminder', sublabel: 'Cek Jatuh Tempo H-3', width: 150 },
      { id: 'resend_notify', lane: 'retention', col: 5, type: 'external', label: 'Kirim Email Resend', sublabel: 'Bukti Bayar & Perpanjang', width: 150 }
    ],
    edges: [
      { id: 'search-to-catalog', from: 'home_search', to: 'search_engine', label: 'Filter', variant: 'default' },
      { id: 'catalog-to-detail', from: 'search_engine', to: 'detail_room', label: 'Pilih Kos', variant: 'emphasis' },
      { id: 'detail-to-auth', from: 'detail_room', to: 'user_auth', label: 'Booking Kos', variant: 'default' },
      { id: 'auth-to-sentinel', from: 'user_auth', to: 'sentinel_check', label: 'Cek Sesi', variant: 'security' },
      { id: 'sentinel-to-checkout', from: 'sentinel_check', to: 'checkout_page', label: 'Lolos WAF', variant: 'emphasis' },
      { id: 'checkout-to-order', from: 'checkout_page', to: 'order_gen', label: 'Submit', variant: 'default' },
      { id: 'order-to-midtrans', from: 'order_gen', to: 'midtrans_qris', label: 'Minta QRIS', variant: 'emphasis' },
      { id: 'midtrans-to-scan', from: 'midtrans_qris', to: 'scan_qris', label: 'Tampil QR', variant: 'default' },
      { id: 'scan-to-webhook', from: 'scan_qris', to: 'webhook_verify', label: 'Payment Done', variant: 'emphasis' },
      { id: 'webhook-to-dashboard', from: 'webhook_verify', to: 'dashboard_user', label: 'Sewa Aktif', variant: 'emphasis' },
      { id: 'webhook-to-resend', from: 'webhook_verify', to: 'resend_notify', label: 'Kirim Struk', variant: 'dashed' },
      { id: 'cron-to-resend', from: 'cron_reminder', to: 'resend_notify', label: 'Trigger Reminder', variant: 'dashed' }
    ],
    cards: [
      {
        dot: 'cyan',
        title: 'Alur Pencarian & Evaluasi',
        items: [
          'Pencarian instan berdasarkan kota, radius peta, harga, dan gender',
          'Komparasi 2-3 kosan head-to-head untuk mempermudah keputusan',
          'Galeri foto lengkap, review asli penghuni, dan transparansi fasilitas'
        ]
      },
      {
        dot: 'emerald',
        title: 'Alur Transaksi & Pembayaran',
        items: [
          'Checkout dengan pilihan durasi fleksibel (1, 3, 6, 12 bulan)',
          'Dynamic QRIS via Midtrans yang mendukung semua bank & e-wallet',
          'Otomatis lunas detik itu juga lewat callback webhook resmi'
        ]
      },
      {
        dot: 'rose',
        title: 'Alur Pengingat & Perpanjangan',
        items: [
          'Vercel Cron otomatis memeriksa tagihan tiap hari jam 01:00 UTC',
          'Email pengingat dikirim pada H-3 dan H-0 masa sewa berakhir',
          'Tombol perpanjang sewa 1-klik tanpa perlu memasukkan data ulang'
        ]
      }
    ]
  };
}

export function runGenerator() {
  console.log('[Architecture Generator] Memindai struktur codebase...');
  const stats = scanProjectStats();
  console.log(`[Architecture Generator] Terdeteksi: ${stats.pageCount} halaman, ${stats.apiCount} API endpoints.`);

  const archCandidatePath = path.join(ARCHIFY_DIR, 'architecture-candidate.json');
  const wfCandidatePath = path.join(ARCHIFY_DIR, 'workflow-candidate.json');

  const archCandidate = generateArchitectureCandidate(stats);
  const wfCandidate = generateWorkflowCandidate(stats);

  fs.writeFileSync(archCandidatePath, JSON.stringify(archCandidate, null, 2), 'utf-8');
  fs.writeFileSync(wfCandidatePath, JSON.stringify(wfCandidate, null, 2), 'utf-8');

  const archOutputHtml = path.join(ARTIFACTS_DIR, 'system-architecture.html');
  const wfOutputHtml = path.join(ARTIFACTS_DIR, 'user-flow.html');

  if (fs.existsSync(ARCHIFY_CLI)) {
    console.log('[Architecture Generator] Mengompilasi diagram arsitektur...');
    try {
      execSync(`node "${ARCHIFY_CLI}" render architecture "${archCandidatePath}" "${archOutputHtml}" --quality showcase`, {
        cwd: rootDir,
        stdio: 'inherit',
      });
      console.log('✓ Arsitektur sistem berhasil dikompilasi ke:', archOutputHtml);
    } catch (err) {
      console.error('Render arsitektur gagal:', err.message);
    }

    console.log('[Architecture Generator] Mengompilasi user flow...');
    try {
      execSync(`node "${ARCHIFY_CLI}" render workflow "${wfCandidatePath}" "${wfOutputHtml}" --quality showcase`, {
        cwd: rootDir,
        stdio: 'inherit',
      });
      console.log('✓ User flow berhasil dikompilasi ke:', wfOutputHtml);
    } catch (err) {
      console.error('Render user flow gagal:', err.message);
    }
  } else {
    console.warn('[Architecture Generator] Archify CLI tidak ditemukan. Mempertahankan artefak yang ada.');
  }

  // Save metadata
  const metadata = {
    ...stats,
    lastGenerated: new Date().toISOString(),
    status: 'success',
    artifacts: {
      architecture: fs.existsSync(archOutputHtml) ? 'available' : 'missing',
      userFlow: fs.existsSync(wfOutputHtml) ? 'available' : 'missing',
    }
  };

  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf-8');
  console.log('[Architecture Generator] Metadata arsitektur diperbarui.');
  return metadata;
}

// Run directly if called as a script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runGenerator();
}
