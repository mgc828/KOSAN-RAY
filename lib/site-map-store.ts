import { dbList, dbPut, dbRemove } from './db';
import type { PageNode, Scan } from './site-crawler';

const COLLECTION = 'site_scans';
const HISTORY_MAX = 15;
const LIST_CAP = 120;

export interface ScanDiff {
  added: string[];
  removed: string[];
  changed: { path: string; what: string }[];
}

export interface HistoryItem {
  at: string;
  durationMs: number;
  stats: Scan['stats'];
  diff: ScanDiff;
  truncated: boolean;
}

export interface SiteDoc {
  id: string;
  origin: string;
  /** Dipindai ulang otomatis oleh cron harian. */
  auto: boolean;
  latest: Scan;
  history: HistoryItem[];
}

export interface SiteSummary {
  id: string;
  origin: string;
  auto: boolean;
  scannedAt: string;
  pages: number;
  errors: number;
  lastChange: { at: string; added: number; removed: number; changed: number } | null;
  changedSinceFirst: boolean;
}

export const siteId = (origin: string) => 'site-' + origin.toLowerCase().replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const isEmpty = (d: ScanDiff) => d.added.length + d.removed.length + d.changed.length === 0;

/** Bandingkan dua pemindaian: halaman baru, hilang, dan yang berubah (status / judul / pengalihan). */
export function diffScans(prev: Scan | null, next: Scan): ScanDiff {
  if (!prev) return { added: [], removed: [], changed: [] };
  const a = new Map(prev.pages.map((p) => [p.path, p]));
  const b = new Map(next.pages.map((p) => [p.path, p]));
  const added: string[] = [];
  const removed: string[] = [];
  const changed: ScanDiff['changed'] = [];

  // Halaman yang tidak lagi dibaca karena batas (bukan benar-benar hilang) jangan dihitung hilang
  const comparable = (p: PageNode) => p.kind !== 'unvisited';
  for (const [path, p] of b) {
    const old = a.get(path);
    if (!old) { added.push(path); continue; }
    if (!comparable(p) || !comparable(old)) continue;
    if (old.status !== p.status) changed.push({ path, what: `status ${old.status || '-'} → ${p.status || '-'}` });
    else if ((old.title || '') !== (p.title || '') && p.title) changed.push({ path, what: 'judul halaman berubah' });
    else if ((old.redirectTo || '') !== (p.redirectTo || '')) changed.push({ path, what: 'tujuan pengalihan berubah' });
  }
  for (const [path, p] of a) {
    if (!b.has(path) && comparable(p)) removed.push(path);
  }
  const cap = <T,>(x: T[]) => x.slice(0, LIST_CAP);
  return { added: cap(added), removed: cap(removed), changed: cap(changed) };
}

export async function getSite(id: string): Promise<SiteDoc | undefined> {
  return (await dbList<SiteDoc>(COLLECTION)).find((d) => d.id === id);
}

export async function listSites(): Promise<SiteDoc[]> {
  return (await dbList<SiteDoc>(COLLECTION)).filter((d) => d.id && d.id !== '__seeded__');
}

/** Simpan hasil pindai terbaru + riwayat perubahan. Mengembalikan dokumen dan selisih dibanding pindai sebelumnya. */
export async function saveScan(scan: Scan, auto?: boolean): Promise<{ doc: SiteDoc; diff: ScanDiff; first: boolean }> {
  const id = siteId(scan.origin);
  const prev = await getSite(id);
  const diff = diffScans(prev?.latest ?? null, scan);
  const history: HistoryItem[] = [
    { at: scan.finishedAt, durationMs: scan.durationMs, stats: scan.stats, diff, truncated: scan.truncated },
    ...(prev?.history ?? []),
  ].slice(0, HISTORY_MAX);
  const doc: SiteDoc = { id, origin: scan.origin, auto: auto ?? prev?.auto ?? false, latest: scan, history };
  await dbPut<SiteDoc>(COLLECTION, doc);
  return { doc, diff, first: !prev };
}

export async function setAuto(id: string, auto: boolean): Promise<SiteDoc | undefined> {
  const doc = await getSite(id);
  if (!doc) return undefined;
  const next = { ...doc, auto };
  await dbPut<SiteDoc>(COLLECTION, next);
  return next;
}

export async function removeSite(id: string): Promise<boolean> {
  return dbRemove(COLLECTION, id);
}

export function summarize(d: SiteDoc): SiteSummary {
  const lastWithChange = d.history.find((h, i) => i < d.history.length - 1 && !isEmpty(h.diff));
  return {
    id: d.id,
    origin: d.origin,
    auto: d.auto,
    scannedAt: d.latest.finishedAt,
    pages: d.latest.stats.pages,
    errors: d.latest.stats.errors,
    lastChange: lastWithChange ? { at: lastWithChange.at, added: lastWithChange.diff.added.length, removed: lastWithChange.diff.removed.length, changed: lastWithChange.diff.changed.length } : null,
    changedSinceFirst: !!lastWithChange,
  };
}

export { isEmpty as isDiffEmpty };
