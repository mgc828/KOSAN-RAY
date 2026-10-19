import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const LOGS_DIR = path.join(ROOT_DIR, 'logs');
const AUDIT_JSON_FILE = path.join(LOGS_DIR, 'audit.jsonl');

// ANSI Color Helpers
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  orange: '\x1b[38;5;208m',
  orangeBg: '\x1b[48;5;208m\x1b[30m\x1b[1m',
  cyan: '\x1b[38;5;51m',
  green: '\x1b[38;5;48m',
  yellow: '\x1b[38;5;220m',
  purple: '\x1b[38;5;141m',
  red: '\x1b[38;5;196m',
  gray: '\x1b[90m',
  white: '\x1b[97m',
  blue: '\x1b[38;5;39m',
};

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[3J\x1b[H');
}

function printHeader() {
  console.log(`${C.orange}╔══════════════════════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.orange}║${C.reset}  ${C.bold}${C.white}📡 KOST-KOSTAN AUDIT TRAIL MONITOR (LIVE LOCAL TERMINAL)${C.reset}                   ${C.orange}║${C.reset}`);
  console.log(`${C.orange}║${C.reset}  ${C.gray}Domain Publik : ${C.cyan}https://bon-fellowship-strengthening-ronald.trycloudflare.com/${C.reset} ${C.orange}║${C.reset}`);
  console.log(`${C.orange}║${C.reset}  ${C.gray}Log File      : ${C.yellow}logs/audit.log & logs/audit.jsonl${C.reset}                             ${C.orange}║${C.reset}`);
  console.log(`${C.orange}║${C.reset}  ${C.gray}Status        : ${C.green}● LIVE STREAMING AKTIF (Tekan Ctrl+C untuk keluar)${C.reset}           ${C.orange}║${C.reset}`);
  console.log(`${C.orange}╚══════════════════════════════════════════════════════════════════════════════╝${C.reset}\n`);
}

function formatCard(item) {
  const isMobile = item.deviceType?.includes('Mobile') || item.deviceType?.includes('Smartphone');
  const isTablet = item.deviceType?.includes('Tablet');
  const deviceIcon = isMobile ? '📱' : isTablet ? '📲' : '💻';
  const deviceColor = isMobile ? C.green : isTablet ? C.yellow : C.blue;

  const countryFlag = item.country === 'ID' ? '🇮🇩 ID' : `🌐 ${item.country || 'Global'}`;

  const border = `${C.orange}────────────────────────────────────────────────────────────────────────${C.reset}`;

  return [
    border,
    `${C.bold}${C.green}🟢 [VISITOR]${C.reset} ${C.bold}${C.white}${item.timestampWib || 'Baru saja'}${C.reset} WIB`,
    `  ${C.cyan}🌐 IP Pengunjung${C.reset} : ${C.bold}${item.ip || '127.0.0.1'}${C.reset} (${countryFlag})`,
    `  ${deviceColor}${deviceIcon} Perangkat   ${C.reset} : ${C.bold}${item.deviceType || 'Desktop'}${C.reset} • ${item.os || '-'} • ${C.yellow}${item.browser || '-'}${C.reset}`,
    `  ${C.purple}📍 Halaman     ${C.reset} : ${C.bold}${item.pathname || '/'}${item.search || ''}${C.reset}`,
    `  ${C.gray}🖥️ Resolusi    : ${item.screen || '-'} | Touch: ${item.isTouch ? 'Ya' : 'Tidak'}${C.reset}`,
    `  ${C.gray}🔗 Rujukan     : ${item.referer || 'Langsung (Direct)'}${C.reset}`,
    border,
  ].join('\n');
}

// Main Runner
function start() {
  clearScreen();
  printHeader();

  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }

  let lastSize = 0;
  if (fs.existsSync(AUDIT_JSON_FILE)) {
    try {
      const stats = fs.statSync(AUDIT_JSON_FILE);
      lastSize = stats.size;

      // Print recent history (up to last 5 entries)
      const content = fs.readFileSync(AUDIT_JSON_FILE, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      if (lines.length > 0) {
        console.log(`${C.bold}${C.yellow}📜 Riwayat ${Math.min(lines.length, 5)} Kunjungan Terakhir:${C.reset}\n`);
        const recent = lines.slice(-5);
        for (const line of recent) {
          try {
            const data = JSON.parse(line);
            console.log(formatCard(data));
          } catch {}
        }
        console.log(`\n${C.bold}${C.green}✓ Menunggu pengunjung baru secara realtime...${C.reset}\n`);
      } else {
        console.log(`${C.dim}Belum ada log kunjungan. Buka web untuk melihat log muncul di sini...${C.reset}\n`);
      }
    } catch (e) {
      console.error('Error membaca log awal:', e);
    }
  } else {
    fs.writeFileSync(AUDIT_JSON_FILE, '', 'utf-8');
    console.log(`${C.dim}Menunggu pengunjung pertama masuk ke web...${C.reset}\n`);
  }

  // Polling file changes smoothly every 400ms
  setInterval(() => {
    try {
      if (!fs.existsSync(AUDIT_JSON_FILE)) return;
      const stats = fs.statSync(AUDIT_JSON_FILE);
      if (stats.size > lastSize) {
        const stream = fs.createReadStream(AUDIT_JSON_FILE, {
          start: lastSize,
          end: stats.size,
          encoding: 'utf-8',
        });

        let chunk = '';
        stream.on('data', (d) => {
          chunk += d;
        });

        stream.on('end', () => {
          lastSize = stats.size;
          const newLines = chunk.trim().split('\n').filter(Boolean);
          for (const line of newLines) {
            try {
              const data = JSON.parse(line);
              // Audio bell in terminal (ASCII bell)
              process.stdout.write('\x07');
              console.log(formatCard(data));
            } catch {}
          }
        });
      } else if (stats.size < lastSize) {
        // File was truncated/reset
        lastSize = stats.size;
      }
    } catch {}
  }, 400);
}

start();

