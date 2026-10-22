import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { dbPut } from '@/lib/db';
import { ThreatLevel, ThreatType } from '@/lib/security-detector';

const LOGS_DIR = path.join(process.cwd(), 'logs');
const SECURITY_JSON_FILE = path.join(LOGS_DIR, 'security.jsonl');
const SECURITY_LOG_FILE = path.join(LOGS_DIR, 'security.log');
const AUDIT_JSON_FILE = path.join(LOGS_DIR, 'audit.jsonl');

function appendToFile(filePath: string, text: string) {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }
    fs.appendFileSync(filePath, text, 'utf-8');
  } catch (err) {
    console.error('[security-log] Gagal menulis file log:', err);
  }
}

export interface SecurityLogPayload {
  id?: string;
  timestamp?: string;
  timestampWib?: string;
  environment: 'PRODUCTION' | 'LOCAL';
  host: string;
  ip: string;
  country: string;
  isCloudflare: boolean;
  method: string;
  pathname: string;
  search: string;
  status?: number;
  threatLevel: ThreatLevel;
  threatType: ThreatType;
  description: string;
  matchedRule?: string;
  matchedPayload?: string;
  userAgent?: string;
  referer?: string;
  details?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const body: SecurityLogPayload = await req.json().catch(() => ({}));

    const now = new Date();
    const timestampWib =
      body.timestampWib ||
      now.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

    const eventRecord: SecurityLogPayload = {
      id: body.id || `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: body.timestamp || now.toISOString(),
      timestampWib,
      environment: body.environment || 'LOCAL',
      host: body.host || 'localhost',
      ip: body.ip || '127.0.0.1',
      country: body.country || 'ID',
      isCloudflare: Boolean(body.isCloudflare),
      method: body.method || 'GET',
      pathname: body.pathname || '/',
      search: body.search || '',
      status: body.status || 200,
      threatLevel: body.threatLevel || 'INFO',
      threatType: body.threatType || 'NORMAL_VISIT',
      description: body.description || 'Akses halaman',
      matchedRule: body.matchedRule,
      matchedPayload: body.matchedPayload,
      userAgent: body.userAgent || 'Unknown',
      referer: body.referer || 'Direct',
      details: body.details,
    };

    const jsonLine = JSON.stringify(eventRecord) + '\n';

    // 1. Simpan ke logs/security.jsonl (format JSON Lines untuk Sentinel Monitor)
    appendToFile(SECURITY_JSON_FILE, jsonLine);

    // 2. Jika merupakan kunjungan biasa, juga sinkronkan ke logs/audit.jsonl untuk kompatibilitas
    if (eventRecord.threatLevel === 'INFO') {
      appendToFile(AUDIT_JSON_FILE, jsonLine);
    }

    // 3. Simpan baris ringkasan teks ke logs/security.log
    const prefix =
      eventRecord.threatLevel === 'ATTACK'
        ? '[🚨 SERANGAN]'
        : eventRecord.threatLevel === 'UNAUTHORIZED'
        ? '[⛔ ILEGAL]'
        : eventRecord.threatLevel === 'SUSPICIOUS'
        ? '[⚠️ MENCURIGAKAN]'
        : '[🟢 AKSES]';

    const textLine = `${prefix} [${timestampWib} WIB] [${eventRecord.environment}] IP: ${eventRecord.ip} (${eventRecord.country}) | ${eventRecord.method} ${eventRecord.pathname}${eventRecord.search} | ${eventRecord.threatType}: ${eventRecord.description}${eventRecord.matchedPayload ? ` | Payload: ${eventRecord.matchedPayload}` : ''}\n`;
    appendToFile(SECURITY_LOG_FILE, textLine);

    // 4. Simpan ke database koleksi security-logs (async tanpa blocking)
    dbPut('security-logs', {
      id: eventRecord.id,
      timestamp: eventRecord.timestamp,
      timestamp_wib: eventRecord.timestampWib,
      environment: eventRecord.environment,
      host: eventRecord.host,
      ip: eventRecord.ip,
      country: eventRecord.country,
      method: eventRecord.method,
      pathname: eventRecord.pathname,
      search: eventRecord.search,
      status: eventRecord.status,
      threat_level: eventRecord.threatLevel,
      threat_type: eventRecord.threatType,
      description: eventRecord.description,
      matched_payload: eventRecord.matchedPayload,
      user_agent: eventRecord.userAgent,
    }).catch(() => {});

    return NextResponse.json({ success: true, id: eventRecord.id });
  } catch (err) {
    console.error('[security-log] Gagal memproses event:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
