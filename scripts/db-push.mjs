// Salin semua data/*.json ke Supabase (sekali jalan, saat pindah dari file lokal ke database).
// Pemakaian:  node --env-file=.env.local scripts/db-push.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || /your-|mock-/.test(url + key)) {
  console.error('Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local dulu.');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });
const dir = path.join(process.cwd(), 'data');

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const collection = file.replace(/\.json$/, '');
  const docs = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
  if (!Array.isArray(docs)) continue;
  const rows = docs
    .filter((d) => d && d.id)
    .map((d, i) => ({ collection, id: d.id, seq: docs.length - i, data: d }));
  rows.push({ collection, id: '__seeded__', seq: 0, data: { id: '__seeded__' } });
  const { error } = await sb.from('app_documents').upsert(rows, { onConflict: 'collection,id' });
  console.log(error ? `GAGAL ${collection}: ${error.message}` : `OK   ${collection}: ${rows.length - 1} dokumen`);
}
