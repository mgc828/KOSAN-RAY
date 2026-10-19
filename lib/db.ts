import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Lapisan data sederhana berbasis "koleksi dokumen".
 *
 * - Tanpa konfigurasi: tiap koleksi disimpan sebagai file JSON di folder data/ (cocok untuk pengembangan lokal).
 * - Dengan SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL yang asli: semua koleksi disimpan di
 *   tabel Postgres `app_documents` (lihat supabase/migrations/001_app_documents.sql). Ini yang dipakai di hosting
 *   serverless seperti Vercel, karena file lokal tidak bisa ditulis di sana.
 *
 * Urutan: dokumen terbaru di paling depan (sama seperti perilaku lama), baik di JSON maupun Supabase.
 */

export interface DbDoc {
  id: string;
}

const COLLECTION_RE = /^[a-z0-9_-]+$/;
const DATA_DIR = path.join(process.cwd(), 'data');

function isPlaceholder(v: string | undefined) {
  return !v || /your-|mock-|placeholder|changeme/i.test(v);
}

export function dbMode(): 'supabase' | 'json' {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !isPlaceholder(url) && !isPlaceholder(key) ? 'supabase' : 'json';
}

function assertCollection(c: string) {
  if (!COLLECTION_RE.test(c)) throw new Error(`Nama koleksi tidak valid: ${c}`);
}

/* ------------------------------ driver JSON ------------------------------ */

const locks = new Map<string, Promise<unknown>>();

/** Jalankan operasi baca-ubah-tulis satu per satu per koleksi supaya tidak saling menimpa. */
function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(key, next.catch(() => undefined));
  return next;
}

function jsonFile(c: string) {
  return path.join(DATA_DIR, `${c}.json`);
}

function jsonRead<T>(c: string): T[] | null {
  try {
    const f = jsonFile(c);
    if (!fs.existsSync(f)) return null;
    const parsed = JSON.parse(fs.readFileSync(f, 'utf-8'));
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch (e) {
    console.error(`[db] gagal membaca ${c}.json:`, e);
    return null;
  }
}

function jsonWrite(c: string, docs: unknown[]) {
  if (process.env.VERCEL && dbMode() === 'json') {
    throw new Error(
      'Penyimpanan file JSON tidak bisa dipakai di Vercel. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const f = jsonFile(c);
  const tmp = `${f}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(docs, null, 2), 'utf-8');
  fs.renameSync(tmp, f); // tulis atomik: file tidak pernah setengah jadi
}

/* ----------------------------- driver Supabase ---------------------------- */

let sb: SupabaseClient | null = null;
function supabase(): SupabaseClient {
  if (!sb) {
    sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return sb;
}
const TABLE = 'app_documents';
const SEEDED = '__seeded__';

async function sbList<T>(c: string): Promise<{ docs: T[]; seeded: boolean }> {
  const docs: T[] = [];
  let seeded = false;
  const PAGE = 1000;
  try {
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase()
        .from(TABLE)
        .select('id,data')
        .eq('collection', c)
        .order('seq', { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) {
        console.warn(`[db] Supabase list ${c}: ${error.message}`);
        return { docs, seeded };
      }
      for (const row of data ?? []) {
        if (row.id === SEEDED) seeded = true;
        else docs.push(row.data as T);
      }
      if (!data || data.length < PAGE) break;
    }
  } catch (err) {
    console.warn(`[db] sbList error for ${c}:`, err);
  }
  return { docs, seeded };
}

async function sbNextSeq(c: string): Promise<number> {
  try {
    const { data, error } = await supabase()
      .from(TABLE)
      .select('seq')
      .eq('collection', c)
      .order('seq', { ascending: false })
      .limit(1);
    if (error) {
      console.warn(`[db] Supabase seq ${c}: ${error.message}`);
      return 1;
    }
    return ((data?.[0]?.seq as number | undefined) ?? 0) + 1;
  } catch {
    return 1;
  }
}

/* --------------------------------- API ---------------------------------- */

type Seed<T> = () => T[];

/** Isi koleksi dengan data awal sekali saja (kalau belum pernah dibuat). */
async function ensureSeeded<T extends DbDoc>(c: string, seed?: Seed<T>) {
  if (!seed) return;
  try {
    if (dbMode() === 'json') {
      try {
        if (jsonRead(c) === null) {
          await withLock(c, async () => {
            if (jsonRead(c) === null) jsonWrite(c, seed());
          });
        }
      } catch (e) {
        console.warn(`[db] JSON write fallback:`, e);
      }
      return;
    }
    const { seeded } = await sbList<T>(c);
    if (seeded) return;
    const items = seed();
    const rows = items.map((d, i) => ({ collection: c, id: d.id, seq: items.length - i, data: d }));
    rows.push({ collection: c, id: SEEDED, seq: 0, data: { id: SEEDED } as unknown as T });
    const { error } = await supabase().from(TABLE).upsert(rows, { onConflict: 'collection,id', ignoreDuplicates: true });
    if (error) console.warn(`[db] Supabase seed ${c}: ${error.message}`);
  } catch (err) {
    console.warn(`[db] ensureSeeded error for ${c}:`, err);
  }
}

export async function dbList<T extends DbDoc>(collection: string, seed?: Seed<T>): Promise<T[]> {
  assertCollection(collection);
  try {
    await ensureSeeded(collection, seed);
    if (dbMode() === 'json') {
      const local = jsonRead<T>(collection);
      return local && local.length > 0 ? local : (seed ? seed() : []);
    }
    const { docs } = await sbList<T>(collection);
    return docs && docs.length > 0 ? docs : (seed ? seed() : []);
  } catch (err) {
    console.warn(`[db] dbList error for ${collection}, using fallback:`, err);
    return seed ? seed() : [];
  }
}

export async function dbGet<T extends DbDoc>(collection: string, id: string, seed?: Seed<T>): Promise<T | undefined> {
  if (dbMode() === 'supabase') {
    assertCollection(collection);
    await ensureSeeded(collection, seed);
    const { data, error } = await supabase().from(TABLE).select('data').eq('collection', collection).eq('id', id).maybeSingle();
    if (error) throw new Error(`[db] Supabase get ${collection}: ${error.message}`);
    return (data?.data as T | undefined) ?? undefined;
  }
  return (await dbList<T>(collection, seed)).find((d) => d.id === id);
}

export async function dbFind<T extends DbDoc>(collection: string, pred: (d: T) => boolean, seed?: Seed<T>): Promise<T[]> {
  return (await dbList<T>(collection, seed)).filter(pred);
}

/** Simpan (buat baru di paling depan, atau timpa dokumen dengan id yang sama). */
export async function dbPut<T extends DbDoc>(collection: string, doc: T, seed?: Seed<T>): Promise<T> {
  assertCollection(collection);
  await ensureSeeded(collection, seed);
  if (dbMode() === 'json') {
    await withLock(collection, async () => {
      const docs = jsonRead<T>(collection) ?? [];
      const idx = docs.findIndex((d) => d.id === doc.id);
      if (idx === -1) docs.unshift(doc);
      else docs[idx] = doc;
      jsonWrite(collection, docs);
    });
    return doc;
  }
  const { data: existing, error: e1 } = await supabase().from(TABLE).select('seq').eq('collection', collection).eq('id', doc.id).maybeSingle();
  if (e1) throw new Error(`[db] Supabase put ${collection}: ${e1.message}`);
  const seq = (existing?.seq as number | undefined) ?? (await sbNextSeq(collection));
  const { error } = await supabase()
    .from(TABLE)
    .upsert({ collection, id: doc.id, seq, data: doc, updated_at: new Date().toISOString() }, { onConflict: 'collection,id' });
  if (error) throw new Error(`[db] Supabase put ${collection}: ${error.message}`);
  return doc;
}

export async function dbRemove(collection: string, id: string, seed?: Seed<DbDoc>): Promise<boolean> {
  assertCollection(collection);
  await ensureSeeded(collection, seed);
  if (dbMode() === 'json') {
    return withLock(collection, async () => {
      const docs = jsonRead<DbDoc>(collection) ?? [];
      const next = docs.filter((d) => d.id !== id);
      if (next.length === docs.length) return false;
      jsonWrite(collection, next);
      return true;
    });
  }
  const { data, error } = await supabase().from(TABLE).delete().eq('collection', collection).eq('id', id).select('id');
  if (error) throw new Error(`[db] Supabase remove ${collection}: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

/** Ubah dokumen secara atomik (JSON) / best-effort (Supabase). Mengembalikan hasil atau undefined kalau tidak ada. */
export async function dbUpdate<T extends DbDoc>(
  collection: string,
  id: string,
  fn: (current: T) => T,
  seed?: Seed<T>
): Promise<T | undefined> {
  assertCollection(collection);
  await ensureSeeded(collection, seed);
  if (dbMode() === 'json') {
    return withLock(collection, async () => {
      const docs = jsonRead<T>(collection) ?? [];
      const idx = docs.findIndex((d) => d.id === id);
      if (idx === -1) return undefined;
      docs[idx] = fn(docs[idx]);
      jsonWrite(collection, docs);
      return docs[idx];
    });
  }
  const cur = await dbGet<T>(collection, id);
  if (!cur) return undefined;
  return dbPut<T>(collection, fn(cur));
}
