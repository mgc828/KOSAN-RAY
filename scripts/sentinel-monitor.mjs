import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const LOGS_DIR = path.join(ROOT_DIR, 'logs');
const SECURITY_JSON_FILE = path.join(LOGS_DIR, 'security.jsonl');

// ANSI Color Palette
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  
  // Foreground Colors
  red: '\x1b[38;5;196m',
  brightRed: '\x1b[38;5;203m',
  green: '\x1b[38;5;48m',
  brightGreen: '\x1b[38;5;46m',
  yellow: '\x1b[38;5;220m',
  orange: '\x1b[38;5;208m',
  cyan: '\x1b[38;5;51m',
  blue: '\x1b[38;5;39m',
  purple: '\x1b[38;5;141m',
  magenta: '\x1b[38;5;200m',
  white: '\x1b[97m',
  gray: '\x1b[90m',
  darkGray: '\x1b[38;5;238m',

  // Background Colors
  bgRed: '\x1b[48;5;196m\x1b[97m\x1b[1m',
  bgOrange: '\x1b[48;5;208m\x1b[30m\x1b[1m',
  bgYellow: '\x1b[48;5;220m\x1b[30m\x1b[1m',
  bgGreen: '\x1b[48;5;48m\x1b[30m\x1b[1m',
  bgCyan: '\x1b[48;5;51m\x1b[30m\x1b[1m',
  bgDark: '\x1b[48;5;235m\x1b[97m',
};

// Filter mode state: 'ALL' | 'ATTACKS' | 'VISITORS'
let currentFilter = 'ALL';

// Aggregated In-Memory Statistics
const stats = {
  total: 0,
  visitors: 0,
  attacks: 0,
  unauthorized: 0,
  suspicious: 0,
  productionHits: 0,
  localHits: 0,
  ipCounts: new Map(),
  attackerIps: new Map(),
  threatTypes: new Map(),
  targetPaths: new Map(),
};

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[3J\x1b[H');
}

function printHeader() {
  const filterLabel =
    currentFilter === 'ATTACKS'
      ? `${C.bgRed} MODE: HANYA SERANGAN (ATTACKS ONLY) ${C.reset}`
      : currentFilter === 'VISITORS'
      ? `${C.bgGreen} MODE: HANYA PENGUNJUNG (VISITORS ONLY) ${C.reset}`
      : `${C.bgCyan} MODE: SEMUA LALU LINTAS (ALL TRAFFIC) ${C.reset}`;

  console.log(`${C.orange}╔══════════════════════════════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.orange}║${C.reset}  ${C.bold}${C.white}🛡️  KOST-KOSTAN SECURITY SENTINEL & TRAFFIC MONITOR (LIVE REALTIME)${C.reset}       ${C.orange}║${C.reset}`);
  console.log(`${C.orange}║${C.reset}  ${C.gray}Memantau Akses Produksi (Cloudflare / Vercel) & Akses Lokal (Localhost)${C.reset}       ${C.orange}║${C.reset}`);
  console.log(`${C.orange}╠══════════════════════════════════════════════════════════════════════════════════════╣${C.reset}`);
  console.log(`${C.orange}║${C.reset}  ${filterLabel}  ${C.gray}Status:${C.reset} ${C.green}● LIVE MONITORING AKTIF${C.reset}                    ${C.orange}║${C.reset}`);
  console.log(`${C.orange}║${C.reset}  ${C.gray}Perintah Cepat: [${C.white}a${C.gray}] Hanya Serangan | [${C.white}v${C.gray}] Pengunjung | [${C.white}0${C.gray}] Semua | [${C.white}s${C.gray}] Ringkasan Stat   ${C.orange}║${C.reset}`);
  console.log(`${C.orange}║${C.reset}                  [${C.white}t${C.gray}] Uji Simulasi Serangan | [${C.white}c${C.gray}] Bersihkan Layar | [${C.white}q${C.gray}] Keluar     ${C.orange}║${C.reset}`);
  console.log(`${C.orange}╚══════════════════════════════════════════════════════════════════════════════════════╝${C.reset}\n`);
}

function updateStats(item) {
  stats.total++;
  const env = item.environment || 'LOCAL';
  if (env === 'PRODUCTION') stats.productionHits++;
  else stats.localHits++;

  const ip = item.ip || '127.0.0.1';
  stats.ipCounts.set(ip, (stats.ipCounts.get(ip) || 0) + 1);

  const path = item.pathname || '/';
  stats.targetPaths.set(path, (stats.targetPaths.get(path) || 0) + 1);

  if (item.threatLevel === 'ATTACK') {
    stats.attacks++;
    stats.attackerIps.set(ip, (stats.attackerIps.get(ip) || 0) + 1);
    const type = item.threatType || 'UNKNOWN_ATTACK';
    stats.threatTypes.set(type, (stats.threatTypes.get(type) || 0) + 1);
  } else if (item.threatLevel === 'UNAUTHORIZED') {
    stats.unauthorized++;
    stats.attackerIps.set(ip, (stats.attackerIps.get(ip) || 0) + 1);
  } else if (item.threatLevel === 'SUSPICIOUS') {
    stats.suspicious++;
  } else {
    stats.visitors++;
  }
}

function parseDevice(ua = '') {
  const lower = ua.toLowerCase();
  if (lower.includes('bot') || lower.includes('spider') || lower.includes('curl')) return '🤖 Bot/Crawler';
  if (lower.includes('iphone') || lower.includes('mobile')) return '📱 Smartphone (Mobile)';
  if (lower.includes('ipad') || lower.includes('tablet')) return '📲 Tablet';
  return '💻 Desktop / Laptop';
}

function formatCard(item) {
  const envBadge =
    item.environment === 'PRODUCTION'
      ? `${C.bgCyan} 🌐 PRODUKSI ${C.reset}`
      : `${C.bgDark} 💻 LOKAL ${C.reset}`;

  const countryFlag = item.country === 'ID' ? '🇮🇩 ID' : `🌐 ${item.country || 'Global'}`;
  const time = item.timestampWib || 'Baru saja';
  const target = `${item.method || 'GET'} ${item.pathname || '/'}${item.search || ''}`;

  // 1. ATTACK / BREACH ATTEMPT CARD
  if (item.threatLevel === 'ATTACK') {
    return [
      `${C.red}╔══════════════════════════════════════════════════════════════════════════════╗${C.reset}`,
      `${C.red}║${C.reset} ${C.bgRed} 🚨 DETEKSI SERANGAN DITANGKAL (ATTACK BLOCKED) ${C.reset}  ${envBadge}  ${C.gray}${time} WIB${C.reset}`,
      `${C.red}╠──────────────────────────────────────────────────────────────────────────────╢${C.reset}`,
      `${C.red}║${C.reset}  ${C.bold}${C.white}Tipe Ancaman${C.reset}  : ${C.bold}${C.brightRed}${item.threatType}${C.reset} - ${C.yellow}${item.description}${C.reset}`,
      `${C.red}║${C.reset}  ${C.cyan}IP Penyerang${C.reset}  : ${C.bold}${C.white}${item.ip}${C.reset} (${countryFlag}) ${item.isCloudflare ? `${C.green}[Via Cloudflare]${C.reset}` : ''}`,
      `${C.red}║${C.reset}  ${C.magenta}Target URL${C.reset}    : ${C.bold}${target}${C.reset}`,
      item.matchedPayload
        ? `${C.red}║${C.reset}  ${C.yellow}Muatan Bahaya${C.reset} : ${C.bold}${C.red}"${item.matchedPayload}"${C.reset}`
        : '',
      `${C.red}║${C.reset}  ${C.gray}User-Agent    : ${item.userAgent || 'Unknown'}${C.reset}`,
      `${C.red}║${C.reset}  ${C.green}Tindakan      : 🛡️ DIBLOKIR OTOMATIS (Status HTTP 403 Forbidden)${C.reset}`,
      `${C.red}╚══════════════════════════════════════════════════════════════════════════════╝${C.reset}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  // 2. UNAUTHORIZED ATTEMPT CARD
  if (item.threatLevel === 'UNAUTHORIZED') {
    return [
      `${C.orange}┌────────────────────────────────────────────────────────────────────────┐${C.reset}`,
      `${C.orange}│${C.reset} ${C.bgOrange} ⛔ UPAYA MASUK ILEGAL (UNAUTHORIZED PROBE) ${C.reset} ${envBadge} ${C.gray}${time} WIB${C.reset}`,
      `${C.orange}├────────────────────────────────────────────────────────────────────────┤${C.reset}`,
      `${C.orange}│${C.reset}  ${C.bold}${C.yellow}Keterangan${C.reset}    : ${item.description}`,
      `${C.orange}│${C.reset}  ${C.cyan}IP Asal       ${C.reset}: ${C.bold}${item.ip}${C.reset} (${countryFlag})`,
      `${C.orange}│${C.reset}  ${C.magenta}Target Route  ${C.reset}: ${C.bold}${target}${C.reset}`,
      item.matchedPayload ? `${C.orange}│${C.reset}  ${C.yellow}Detail Target ${C.reset}: ${item.matchedPayload}` : '',
      `${C.orange}│${C.reset}  ${C.gray}User-Agent    : ${item.userAgent || '-'}${C.reset}`,
      `${C.orange}└────────────────────────────────────────────────────────────────────────┘${C.reset}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  // 3. SUSPICIOUS CARD
  if (item.threatLevel === 'SUSPICIOUS') {
    return [
      `${C.yellow}┌────────────────────────────────────────────────────────────────────────┐${C.reset}`,
      `${C.yellow}│${C.reset} ${C.bgYellow} ⚠️ AKTIVITAS MENCURIGAKAN (SUSPICIOUS) ${C.reset} ${envBadge} ${C.gray}${time} WIB${C.reset}`,
      `${C.yellow}├────────────────────────────────────────────────────────────────────────┤${C.reset}`,
      `${C.yellow}│${C.reset}  ${C.yellow}Info${C.reset}          : ${item.description}`,
      `${C.yellow}│${C.reset}  ${C.cyan}IP Asal       ${C.reset}: ${C.bold}${item.ip}${C.reset} (${countryFlag})`,
      `${C.yellow}│${C.reset}  ${C.magenta}Target        ${C.reset}: ${target}`,
      `${C.yellow}└────────────────────────────────────────────────────────────────────────┘${C.reset}`,
    ].join('\n');
  }

  // 4. NORMAL VISITOR CARD
  const device = item.deviceType || parseDevice(item.userAgent);
  return [
    `${C.darkGray}────────────────────────────────────────────────────────────────────────${C.reset}`,
    `${C.bold}${C.green}🟢 [VISITOR]${C.reset} ${envBadge}  ${C.bold}${C.white}${time}${C.reset} WIB`,
    `  ${C.cyan}🌐 IP Pengunjung${C.reset} : ${C.bold}${item.ip}${C.reset} (${countryFlag}) ${item.isCloudflare ? `${C.green}[Cloudflare]${C.reset}` : ''}`,
    `  ${C.yellow}📱 Perangkat    ${C.reset} : ${device} ${item.browser ? `• ${item.browser}` : ''} ${item.os ? `• ${item.os}` : ''}`,
    `  ${C.purple}📍 Halaman      ${C.reset} : ${C.bold}${item.pathname || '/'}${item.search || ''}${C.reset}`,
    item.referer && item.referer !== 'Direct' ? `  ${C.gray}🔗 Rujukan      : ${item.referer}${C.reset}` : '',
    `${C.darkGray}────────────────────────────────────────────────────────────────────────${C.reset}`,
  ]
    .filter(Boolean)
    .join('\n');
}

function printStatsSummary() {
  console.log(`\n${C.bold}${C.cyan}══════════════════════════════════════════════════════════════════════${C.reset}`);
  console.log(`${C.bold}${C.white}📊 RINGKASAN STATISTIK KEAMANAN SISTEM${C.reset}`);
  console.log(`${C.cyan}══════════════════════════════════════════════════════════════════════${C.reset}`);
  console.log(`  Total Lalu Lintas Dipantau  : ${C.bold}${stats.total}${C.reset} permintaan`);
  console.log(`  • Akses Link Produksi      : ${C.bold}${C.cyan}${stats.productionHits}${C.reset}`);
  console.log(`  • Akses Link Lokal         : ${C.bold}${C.blue}${stats.localHits}${C.reset}`);
  console.log(`  • Pengunjung Normal        : ${C.bold}${C.green}${stats.visitors}${C.reset}`);
  console.log(`  • Upaya Serangan Ditangkal : ${C.bold}${C.red}${stats.attacks}${C.reset}`);
  console.log(`  • Upaya Masuk Ilegal       : ${C.bold}${C.orange}${stats.unauthorized}${C.reset}`);
  console.log(`  • Aktivitas Mencurigakan   : ${C.bold}${C.yellow}${stats.suspicious}${C.reset}`);

  // Top Attacker IPs
  if (stats.attackerIps.size > 0) {
    console.log(`\n  ${C.bold}${C.red}🚨 Top IP Penyerang Terbanyak:${C.reset}`);
    const sortedAttackers = [...stats.attackerIps.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [ip, count] of sortedAttackers) {
      console.log(`    - ${C.bold}${ip}${C.reset}: ${C.red}${count} kali serangan${C.reset}`);
    }
  }

  // Threat Types Breakdown
  if (stats.threatTypes.size > 0) {
    console.log(`\n  ${C.bold}${C.yellow}🛡️ Distribusi Kategori Serangan:${C.reset}`);
    for (const [type, count] of stats.threatTypes.entries()) {
      console.log(`    - ${type}: ${count} insiden`);
    }
  }

  // Top Targeted Paths
  if (stats.targetPaths.size > 0) {
    console.log(`\n  ${C.bold}${C.magenta}📍 Halaman Paling Sering Diakses / Ditarget:${C.reset}`);
    const sortedPaths = [...stats.targetPaths.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [p, count] of sortedPaths) {
      console.log(`    - ${p}: ${count} hit`);
    }
  }

  console.log(`${C.cyan}══════════════════════════════════════════════════════════════════════${C.reset}\n`);
}

// Function to simulate a local attack test
async function runSimulatedAttackTest() {
  console.log(`\n${C.yellow}⚡ Menjalankan simulasi serangan uji coba untuk memverifikasi Sentinel...${C.reset}`);
  try {
    const testPayloads = [
      {
        path: '/.env',
        threatType: 'SENSITIVE_FILE_SCAN',
        threatLevel: 'ATTACK',
        desc: '[SIMULASI UJI COBA] Percobaan pemindaian file .env rahasia',
        payload: '/.env',
      },
      {
        path: '/cari-kost?id=1%20UNION%20SELECT%20*%20FROM%20users--',
        threatType: 'SQL_INJECTION',
        threatLevel: 'ATTACK',
        desc: '[SIMULASI UJI COBA] Percobaan injeksi SQL UNION SELECT',
        payload: '1 UNION SELECT * FROM users--',
      },
      {
        path: '/api/admin/data',
        threatType: 'UNAUTHORIZED_ADMIN_ACCESS',
        threatLevel: 'UNAUTHORIZED',
        desc: '[SIMULASI UJI COBA] Upaya akses API admin tanpa sesi resmi',
        payload: 'GET /api/admin/data',
      },
    ];

    for (const t of testPayloads) {
      const simulatedEvent = {
        id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        timestampWib: new Date().toLocaleTimeString('id-ID', { hour12: false }),
        environment: 'LOCAL',
        host: 'localhost:3000',
        ip: '192.168.1.105',
        country: 'ID',
        isCloudflare: false,
        method: 'GET',
        pathname: t.path.split('?')[0],
        search: t.path.includes('?') ? '?' + t.path.split('?')[1] : '',
        threatLevel: t.threatLevel,
        threatType: t.threatType,
        description: t.desc,
        matchedPayload: t.payload,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Kali-Security-Probe/2.0',
      };

      if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
      fs.appendFileSync(SECURITY_JSON_FILE, JSON.stringify(simulatedEvent) + '\n', 'utf-8');
    }
    console.log(`${C.green}✓ 3 sampel uji coba berhasil diinjeksikan ke log! Lihat kartu merah di atas!${C.reset}\n`);
  } catch (err) {
    console.error('Gagal menjalankan simulasi:', err);
  }
}

// Setup Keyboard Listener
function setupKeyboardListener() {
  if (process.stdin.isTTY) {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    process.stdin.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'c') {
        console.log(`\n${C.yellow}Keluar dari Sentinel Monitor. Sampai jumpa!${C.reset}\n`);
        process.exit();
      }

      if (key.name === 'q') {
        console.log(`\n${C.yellow}Keluar dari Sentinel Monitor. Sampai jumpa!${C.reset}\n`);
        process.exit();
      } else if (key.name === 'a') {
        currentFilter = 'ATTACKS';
        clearScreen();
        printHeader();
        console.log(`${C.bold}${C.red}Menampilkan HANYA Serangan dan Upaya Masuk Ilegal...${C.reset}\n`);
      } else if (key.name === 'v') {
        currentFilter = 'VISITORS';
        clearScreen();
        printHeader();
        console.log(`${C.bold}${C.green}Menampilkan HANYA Pengunjung Biasa...${C.reset}\n`);
      } else if (key.name === '0') {
        currentFilter = 'ALL';
        clearScreen();
        printHeader();
        console.log(`${C.bold}${C.cyan}Menampilkan SEMUA Aktivitas Lalu Lintas...${C.reset}\n`);
      } else if (key.name === 's') {
        printStatsSummary();
      } else if (key.name === 'c') {
        clearScreen();
        printHeader();
      } else if (key.name === 't') {
        runSimulatedAttackTest();
      }
    });
  }
}

// Main Runner
function start() {
  clearScreen();
  printHeader();

  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }

  // Seed existing audit/security log into stats and show recent history
  let lastSize = 0;
  if (fs.existsSync(SECURITY_JSON_FILE)) {
    try {
      const statsObj = fs.statSync(SECURITY_JSON_FILE);
      lastSize = statsObj.size;

      const content = fs.readFileSync(SECURITY_JSON_FILE, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          updateStats(data);
        } catch {}
      }

      if (lines.length > 0) {
        console.log(`${C.bold}${C.yellow}📜 Memuat ${Math.min(lines.length, 6)} Aktivitas Terakhir:${C.reset}\n`);
        const recent = lines.slice(-6);
        for (const line of recent) {
          try {
            const data = JSON.parse(line);
            console.log(formatCard(data));
          } catch {}
        }
        console.log(`\n${C.bold}${C.green}✓ Menunggu aktivitas baru secara realtime...${C.reset}\n`);
      }
    } catch (e) {
      console.error('Error membaca log awal:', e);
    }
  } else {
    // If security.jsonl doesn't exist yet, check audit.jsonl to import previous visitor history!
    if (fs.existsSync(path.join(LOGS_DIR, 'audit.jsonl'))) {
      try {
        const auditLines = fs.readFileSync(path.join(LOGS_DIR, 'audit.jsonl'), 'utf-8').trim().split('\n').filter(Boolean);
        for (const l of auditLines) {
          try {
            const parsed = JSON.parse(l);
            parsed.threatLevel = parsed.threatLevel || 'INFO';
            parsed.threatType = parsed.threatType || 'NORMAL_VISIT';
            parsed.environment = parsed.environment || (parsed.referer?.includes('trycloudflare') ? 'PRODUCTION' : 'LOCAL');
            fs.appendFileSync(SECURITY_JSON_FILE, JSON.stringify(parsed) + '\n');
            updateStats(parsed);
          } catch {}
        }
      } catch {}
    } else {
      fs.writeFileSync(SECURITY_JSON_FILE, '', 'utf-8');
    }
  }

  setupKeyboardListener();

  // Watch security.jsonl for new entries
  setInterval(() => {
    try {
      if (!fs.existsSync(SECURITY_JSON_FILE)) return;
      const statsObj = fs.statSync(SECURITY_JSON_FILE);
      if (statsObj.size > lastSize) {
        const stream = fs.createReadStream(SECURITY_JSON_FILE, {
          start: lastSize,
          end: statsObj.size,
          encoding: 'utf-8',
        });

        let chunk = '';
        stream.on('data', (d) => {
          chunk += d;
        });

        stream.on('end', () => {
          lastSize = statsObj.size;
          const newLines = chunk.trim().split('\n').filter(Boolean);
          for (const line of newLines) {
            try {
              const data = JSON.parse(line);
              updateStats(data);

              // Apply Filter
              if (currentFilter === 'ATTACKS' && data.threatLevel !== 'ATTACK' && data.threatLevel !== 'UNAUTHORIZED') {
                continue;
              }
              if (currentFilter === 'VISITORS' && data.threatLevel !== 'INFO') {
                continue;
              }

              // Terminal Audio Bell for attacks
              if (data.threatLevel === 'ATTACK' || data.threatLevel === 'UNAUTHORIZED') {
                process.stdout.write('\x07\x07'); // Dual beep on attack!
              } else {
                process.stdout.write('\x07'); // Single beep on visitor
              }

              console.log(formatCard(data));
            } catch {}
          }
        });
      } else if (statsObj.size < lastSize) {
        lastSize = statsObj.size;
      }
    } catch {}
  }, 350);
}

start();
