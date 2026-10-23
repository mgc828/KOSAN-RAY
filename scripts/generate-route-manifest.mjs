import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Membuat daftar rute halaman dari struktur folder app/ (dibaca halaman admin "Peta Situs" untuk melengkapi
 * halaman yang tidak terhubung lewat tautan atau dilindungi login). Dijalankan otomatis sebelum build.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appDir = path.join(root, 'app');
const out = path.join(root, 'lib', 'route-manifest.generated.json');

const rel = (full) => path.relative(root, full).split(path.sep).join('/');

const routes = [];
function walk(dir, segs) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith('_') || e.name.startsWith('@')) continue; // folder privat / slot paralel
      const isGroup = e.name.startsWith('(') && e.name.endsWith(')');
      walk(full, isGroup ? segs : [...segs, e.name]);
    } else if (/^page\.(tsx|ts|jsx|js)$/.test(e.name)) {
      routes.push({ path: '/' + segs.join('/'), dynamic: segs.some((s) => s.startsWith('[')), type: 'page', file: rel(full) });
    } else if (/^route\.(ts|js)$/.test(e.name)) {
      routes.push({ path: '/' + segs.join('/'), dynamic: segs.some((s) => s.startsWith('[')), type: 'api', file: rel(full) });
    }
  }
}
if (fs.existsSync(appDir)) walk(appDir, []);
routes.sort((a, b) => a.path.localeCompare(b.path));

// Tidak menulis ulang bila isi (selain waktu) sama, supaya tidak mengotori git
let prev = null;
try {
  prev = JSON.parse(fs.readFileSync(out, 'utf-8'));
} catch {}
if (!prev || JSON.stringify(prev.routes) !== JSON.stringify(routes)) {
  fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), routes }, null, 2) + '\n');
  console.log(`[route-manifest] ${routes.filter((r) => r.type === 'page').length} halaman, ${routes.filter((r) => r.type === 'api').length} API ditulis.`);
} else {
  console.log('[route-manifest] tidak ada perubahan.');
}
