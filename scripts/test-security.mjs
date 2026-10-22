/**
 * Skrip pengujian keamanan lokal / produksi.
 * Menjalankan uji coba serangan nyata ke server lokal (http://localhost:3000)
 * untuk memverifikasi bahwa Security Sentinel mendeteksi dan memblokir serangan secara live.
 */

const BASE_URL = process.env.TARGET_URL || 'http://localhost:3000';

const tests = [
  {
    name: '1. Kunjungan Normal (Halaman Depan)',
    url: `${BASE_URL}/`,
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0' },
    expectedStatus: 200,
  },
  {
    name: '2. Pemindaian File Rahasia (.env scan)',
    url: `${BASE_URL}/.env`,
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (Vulnerability-Scanner/1.0)' },
    expectedStatus: 403,
  },
  {
    name: '3. Serangan SQL Injection (UNION SELECT)',
    url: `${BASE_URL}/cari-kost?search=kost%27%20UNION%20SELECT%20username,password%20FROM%20users--`,
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0' },
    expectedStatus: 403,
  },
  {
    name: '4. Serangan Path Traversal (LFI /etc/passwd)',
    url: `${BASE_URL}/api/media?file=../../../../etc/passwd`,
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0' },
    expectedStatus: 403,
  },
  {
    name: '5. Pemindaian Celah Admin (wp-login.php)',
    url: `${BASE_URL}/wp-login.php`,
    method: 'GET',
    headers: { 'User-Agent': 'Nikto/2.1.6' },
    expectedStatus: 403,
  },
  {
    name: '6. Upaya Akses Tanpa Izin ke Admin API',
    url: `${BASE_URL}/api/admin/data`,
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0' },
    expectedStatus: 401,
  },
  {
    name: '7. Serangan Brute Force Login Admin',
    url: `${BASE_URL}/api/admin/auth`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', email: 'admin@kost-kostan.id', password: 'salah_password_bruteforce' }),
    expectedStatus: 401,
  },
];

async function run() {
  console.log(`\n=============================================================`);
  console.log(`🚀 MENJALANKAN UJI COBA KEAMANAN KE: ${BASE_URL}`);
  console.log(`=============================================================\n`);

  let successCount = 0;

  for (const test of tests) {
    try {
      const res = await fetch(test.url, {
        method: test.method,
        headers: test.headers,
        body: test.body,
      });

      const isBlockedOrProtected = res.status === test.expectedStatus || res.status === 403 || res.status === 401;
      const statusIcon = isBlockedOrProtected ? '✅ BERHASIL DITANGKAL' : '⚠️ PERHATIAN';

      console.log(`[${statusIcon}] ${test.name}`);
      console.log(`   URL    : ${test.url}`);
      console.log(`   Status : HTTP ${res.status} (Target: HTTP ${test.expectedStatus})`);
      if (res.status === 403) {
        console.log(`   Sentinel: Akses langsung DIBLOKIR dengan respon 403 Forbidden!`);
      }
      console.log(`-------------------------------------------------------------`);
      successCount++;
    } catch (err) {
      console.log(`❌ Gagal terhubung ke ${test.url}: ${err.message}`);
      console.log(`   (Pastikan server dev 'npm run dev' sedang berjalan di port yang sesuai)\n`);
    }
  }

  console.log(`\nSelesai! Buka terminal monitor (npm run monitor) untuk melihat kartu log realtime.`);
}

run();
