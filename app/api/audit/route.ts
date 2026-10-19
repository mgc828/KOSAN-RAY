import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { dbPut } from '@/lib/db';

interface ParsedAgent {
  deviceType: 'Smartphone (Mobile)' | 'Tablet' | 'Desktop' | 'Bot / Crawler';
  os: string;
  browser: string;
}

function parseUserAgent(ua: string): ParsedAgent {
  const lower = ua.toLowerCase();

  // 1. Bot check
  if (
    lower.includes('bot') ||
    lower.includes('crawler') ||
    lower.includes('spider') ||
    lower.includes('curl') ||
    lower.includes('postman') ||
    lower.includes('python-requests') ||
    lower.includes('headlesschrome')
  ) {
    return { deviceType: 'Bot / Crawler', os: 'Bot/Server', browser: ua.slice(0, 30) };
  }

  // 2. Device Type
  let deviceType: ParsedAgent['deviceType'] = 'Desktop';
  if (lower.includes('ipad') || lower.includes('tablet') || (lower.includes('android') && !lower.includes('mobile'))) {
    deviceType = 'Tablet';
  } else if (
    lower.includes('mobile') ||
    lower.includes('iphone') ||
    lower.includes('android') ||
    lower.includes('ipod') ||
    lower.includes('blackberry')
  ) {
    deviceType = 'Smartphone (Mobile)';
  }

  // 3. Operating System
  let os = 'Unknown OS';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
  else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
  else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('iPhone')) {
    const match = ua.match(/OS\s+([0-9_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS (iPhone)';
  } else if (ua.includes('iPad')) {
    const match = ua.match(/OS\s+([0-9_]+)/);
    os = match ? `iPadOS ${match[1].replace(/_/g, '.')}` : 'iPadOS';
  } else if (ua.includes('Android')) {
    const match = ua.match(/Android\s+([0-9\.]+)/);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X\s+([0-9_]+)/);
    os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  }

  // 4. Browser & In-App Viewers
  let browser = 'Browser Lain';
  if (lower.includes('micromessenger')) browser = 'WeChat In-App';
  else if (lower.includes('fban') || lower.includes('fbav')) browser = 'Facebook In-App';
  else if (lower.includes('instagram')) browser = 'Instagram In-App';
  else if (lower.includes('tiktok')) browser = 'TikTok In-App';
  else if (lower.includes('whatsapp')) browser = 'WhatsApp In-App';
  else if (ua.includes('Edg/')) {
    const match = ua.match(/Edg\/([0-9\.]+)/);
    browser = match ? `Edge ${match[1].split('.')[0]}` : 'Microsoft Edge';
  } else if (ua.includes('SamsungBrowser/')) {
    const match = ua.match(/SamsungBrowser\/([0-9\.]+)/);
    browser = match ? `Samsung Internet ${match[1]}` : 'Samsung Internet';
  } else if (ua.includes('Chrome/') && !ua.includes('Chromium')) {
    const match = ua.match(/Chrome\/([0-9\.]+)/);
    browser = match ? `Chrome ${match[1].split('.')[0]}` : 'Google Chrome';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    const match = ua.match(/Version\/([0-9\.]+)/);
    browser = match ? `Safari ${match[1]}` : 'Safari';
  } else if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/([0-9\.]+)/);
    browser = match ? `Firefox ${match[1].split('.')[0]}` : 'Mozilla Firefox';
  } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
    browser = 'Opera';
  }

  return { deviceType, os, browser };
}

const LOGS_DIR = path.join(process.cwd(), 'logs');
const AUDIT_LOG_FILE = path.join(LOGS_DIR, 'audit.log');
const AUDIT_JSON_FILE = path.join(LOGS_DIR, 'audit.jsonl');

function appendToFile(filePath: string, text: string) {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
    fs.appendFileSync(filePath, text, 'utf-8');
  } catch (err) {
    console.error('[audit] Gagal menulis log file:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Header extraction (Cloudflare & Reverse Proxies)
    const cfIp = req.headers.get('cf-connecting-ip');
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = cfIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || realIp || '127.0.0.1';

    const country = req.headers.get('cf-ipcountry') || 'ID';
    const cfRay = req.headers.get('cf-ray') || '-';
    const userAgent = req.headers.get('user-agent') || body.userAgent || 'Unknown';
    const referer = req.headers.get('referer') || body.referrer || 'Langsung (Direct)';

    const pathname = body.path || '/';
    const search = body.search || '';
    const screen = body.screen || '-';
    const isTouch = body.isTouch ? 'Ya' : 'Tidak';

    const { deviceType, os, browser } = parseUserAgent(userAgent);

    const now = new Date();
    const timestampWib = now.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const isCloudflare = !!cfIp;

    // 1. Tampilkan di terminal lokal dengan format rapi dan berwarna (ANSI colors)
    const ansiOrange = '\x1b[38;5;208m';
    const ansiCyan = '\x1b[38;5;51m';
    const ansiGreen = '\x1b[38;5;48m';
    const ansiYellow = '\x1b[38;5;220m';
    const ansiPurple = '\x1b[38;5;141m';
    const ansiGray = '\x1b[90m';
    const ansiBold = '\x1b[1m';
    const ansiReset = '\x1b[0m';

    const borderLine = `${ansiOrange}┌────────────────────────────────────────────────────────────────────────┐${ansiReset}`;
    const midLine = `${ansiOrange}├────────────────────────────────────────────────────────────────────────┤${ansiReset}`;
    const bottomLine = `${ansiOrange}└────────────────────────────────────────────────────────────────────────┘${ansiReset}`;

    const terminalOutput = [
      borderLine,
      `${ansiOrange}│${ansiReset} ${ansiBold}${ansiGreen}🟢 [AUDIT TRAIL] PENGUNJUNG BARU${ansiReset} ${ansiGray}(${timestampWib} WIB)${ansiReset}`.padEnd(85) + `${ansiOrange}│${ansiReset}`,
      midLine,
      `${ansiOrange}│${ansiReset} ${ansiBold}${ansiCyan}🌐 IP Asli    ${ansiReset}: ${ansiBold}${ip}${ansiReset} ${ansiGray}[Negara: ${country}]${ansiReset} ${isCloudflare ? `${ansiGreen}✓ Via Cloudflare${ansiReset}` : ''}`.padEnd(95) + `${ansiOrange}│${ansiReset}`,
      `${ansiOrange}│${ansiReset} ${ansiBold}${ansiYellow}📱 Perangkat  ${ansiReset}: ${ansiBold}${deviceType}${ansiReset} • ${os} • ${browser}`.padEnd(85) + `${ansiOrange}│${ansiReset}`,
      `${ansiOrange}│${ansiReset} ${ansiBold}${ansiPurple}📍 Halaman    ${ansiReset}: ${ansiBold}${pathname}${search}${ansiReset}`.padEnd(85) + `${ansiOrange}│${ansiReset}`,
      `${ansiOrange}│${ansiReset} ${ansiGray}🖥️ Layar/Touch : ${screen} | Touch: ${isTouch} | CF-Ray: ${cfRay}${ansiReset}`.padEnd(85) + `${ansiOrange}│${ansiReset}`,
      `${ansiOrange}│${ansiReset} ${ansiGray}🔗 Rujukan    : ${referer}${ansiReset}`.padEnd(85) + `${ansiOrange}│${ansiReset}`,
      bottomLine,
    ].join('\n');

    console.log('\n' + terminalOutput + '\n');

    // 2. Simpan ke logs/audit.log (format baris teks yang mudah dibaca)
    const logLine = `[${timestampWib} WIB] IP: ${ip} (${country}) | Device: ${deviceType} | OS: ${os} | Browser: ${browser} | Screen: ${screen} | Page: ${pathname}${search} | Ref: ${referer}\n`;
    appendToFile(AUDIT_LOG_FILE, logLine);

    // 3. Simpan ke logs/audit.jsonl (format JSON Lines untuk monitoring live stream)
    const logJson = JSON.stringify({
      timestamp: now.toISOString(),
      timestampWib,
      ip,
      country,
      deviceType,
      os,
      browser,
      pathname,
      search,
      screen,
      isTouch,
      referer,
      userAgent,
      cfRay,
    }) + '\n';
    appendToFile(AUDIT_JSON_FILE, logJson);

    // 4. Simpan ke koleksi database internal
    await dbPut('audit-trail', {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now.toISOString(),
      timestamp_wib: timestampWib,
      ip,
      country,
      device_type: deviceType,
      os,
      browser,
      pathname,
      search,
      screen,
      referer,
      user_agent: userAgent,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[audit] Error memproses audit trail:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

