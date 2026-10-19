import fs from 'fs';
import path from 'path';

/** Penyimpanan JSON sederhana di folder data/ (sama dengan store lain di proyek ini). */
export function readJson<T>(file: string, fallback: T): T {
  try {
    const p = path.join(process.cwd(), 'data', file);
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;
  } catch (e) {
    console.error(`Gagal membaca ${file}:`, e);
  }
  return fallback;
}

export function writeJson(file: string, data: unknown): boolean {
  try {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error(`Gagal menulis ${file}:`, e);
    return false;
  }
}

/** Pembatas laju sederhana (in-memory) per kunci, mis. IP. */
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  return true;
}

export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}
