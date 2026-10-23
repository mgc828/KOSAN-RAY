import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import type { AddressInfo } from 'net';
import {
  assertPublicHost,
  crawlSite,
  extractFromHtml,
  isPrivateIp,
  normalizePageUrl,
  parseRobots,
  parseSitemapXml,
  robotsAllows,
  type PageNode,
  type Scan,
} from '@/lib/site-crawler';
import { buildTree, defaultCollapsed, layoutTree } from '@/lib/site-tree';
import { diffScans } from '@/lib/site-map-store';

describe('normalisasi alamat', () => {
  it('membuang hash/query/trailing slash dan menolak protokol lain', () => {
    expect(normalizePageUrl('/kost/?q=1#x', 'https://a.com/')?.url).toBe('https://a.com/kost');
    expect(normalizePageUrl('https://A.com')?.path).toBe('/');
    expect(normalizePageUrl('//a.com//x//y/', 'https://b.com')?.url).toBe('https://a.com/x/y');
    expect(normalizePageUrl('mailto:a@b.com')).toBeNull();
    expect(normalizePageUrl('javascript:alert(1)')).toBeNull();
    expect(normalizePageUrl('ftp://a.com')).toBeNull();
  });
});

describe('perlindungan SSRF', () => {
  it('mendeteksi alamat IP privat/internal', () => {
    for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1']) {
      expect(isPrivateIp(ip), ip).toBe(true);
    }
    for (const ip of ['8.8.8.8', '1.1.1.1', '172.32.0.1', '2606:4700:4700::1111']) expect(isPrivateIp(ip), ip).toBe(false);
  });

  it('menolak host internal dan menerima IP publik', async () => {
    for (const h of ['localhost', 'app.localhost', 'printer.local', 'db.internal', '127.0.0.1', '10.0.0.5', '169.254.169.254', '[::1]']) {
      await expect(assertPublicHost(h, false), h).rejects.toThrow();
    }
    await expect(assertPublicHost('8.8.8.8', false)).resolves.toBeUndefined();
    // situs sendiri (trusted) boleh, mis. saat pengembangan lokal
    await expect(assertPublicHost('localhost:3000', true)).resolves.toBeUndefined();
  });
});

describe('robots.txt, sitemap, dan HTML', () => {
  it('membaca aturan robots untuk semua agen', () => {
    const r = parseRobots('User-agent: Googlebot\nDisallow: /g\n\nUser-agent: *\nDisallow: /admin\nAllow: /admin/publik\nDisallow: /*.pdf$\nSitemap: https://a.com/sitemap.xml');
    expect(r.sitemaps).toEqual(['https://a.com/sitemap.xml']);
    expect(robotsAllows(r, '/admin/x')).toBe(false);
    expect(robotsAllows(r, '/admin/publik/x')).toBe(true);
    expect(robotsAllows(r, '/kost')).toBe(true);
    expect(robotsAllows(r, '/g')).toBe(true);
    expect(robotsAllows(r, '/file.pdf')).toBe(false);
  });

  it('mengambil judul, h1, deskripsi, dan tautan dari HTML', () => {
    const html = `<html><head><title> Beranda &amp; Kost </title><meta name="description" content="Cari kost"></head>
      <body><h1>Halo <b>Dunia</b></h1><a href="/a">A</a><a class="x" href='b/c'>B</a><a href="mailto:x@y.z">m</a><a href="#top">t</a><a href=https://ext.com/z>E</a></body></html>`;
    const x = extractFromHtml(html);
    expect(x.title).toBe('Beranda & Kost');
    expect(x.h1).toBe('Halo Dunia');
    expect(x.description).toBe('Cari kost');
    expect(x.hrefs).toEqual(['/a', 'b/c', 'https://ext.com/z']);
  });

  it('membaca <loc> dari sitemap.xml', () => {
    expect(parseSitemapXml('<urlset><url><loc>https://a.com/</loc></url><url><loc> https://a.com/x </loc></url></urlset>')).toEqual(['https://a.com/', 'https://a.com/x']);
  });
});

describe('pemindaian situs (server uji lokal)', () => {
  let server: http.Server;
  let origin = '';

  beforeAll(async () => {
    const pages: Record<string, string> = {
      '/': '<title>Beranda</title><h1>Home</h1><a href="/a">A</a><a href="/b">B</a><a href="/hidden">H</a><a href="https://ext.example/x">E</a><a href="/logo.png">img</a><a href="mailto:x@y.z">m</a>',
      '/a': '<title>Halaman A</title><a href="/a/x">AX</a><a href="/">home</a><a href="/old">old</a>',
      '/a/x': '<title>A X</title><a href="/a/y">AY</a>',
      '/a/y': '<title>A Y</title>',
      '/b': '<title>B</title><a href="/missing">gone</a>',
      '/hidden': '<title>Dilarang robots</title>',
    };
    server = http.createServer((req, res) => {
      const path = (req.url || '/').split('?')[0];
      if (path === '/robots.txt') { res.setHeader('content-type', 'text/plain'); res.end('User-agent: *\nDisallow: /hidden\n'); return; }
      if (path === '/sitemap.xml') { res.setHeader('content-type', 'application/xml'); res.end(`<urlset><url><loc>${origin}/dari-sitemap</loc></url></urlset>`); return; }
      if (path === '/old') { res.statusCode = 301; res.setHeader('location', '/b'); res.end(); return; }
      if (pages[path]) { res.setHeader('content-type', 'text/html; charset=utf-8'); res.end(`<html><head>${pages[path]}</head></html>`); return; }
      res.statusCode = 404;
      res.setHeader('content-type', 'text/html');
      res.end('<title>404</title>tidak ada');
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => new Promise<void>((r) => server.close(() => r())));

  it('menolak memindai alamat internal bila bukan situs sendiri', async () => {
    await expect(crawlSite(origin, {})).rejects.toThrow(/internal|privat/i);
  });

  it('membangun struktur halaman, tautan masuk/keluar, status, dan domain eksternal', async () => {
    const scan = await crawlSite(origin, { maxPages: 20, maxDepth: 4 }, { trustOrigin: origin });
    const by = new Map(scan.pages.map((p) => [p.path, p]));

    expect(by.get('/')?.title).toBe('Beranda');
    expect(by.get('/')?.h1).toBe('Home');
    expect(by.get('/')?.out).toEqual(['/a', '/b', '/hidden']);
    expect(by.get('/a/x')?.depth).toBe(2);
    expect(by.get('/a/y')?.status).toBe(200);
    expect(by.get('/missing')?.status).toBe(404);
    expect(by.get('/missing')?.kind).toBe('client-error');
    expect(by.get('/old')?.kind).toBe('redirect'); // 301 ke /b dicatat sebagai pengalihan
    expect(by.get('/old')?.status).toBe(301);
    expect(by.get('/old')?.redirectTo).toBe('/b');
    expect(by.get('/a')?.inCount).toBeGreaterThanOrEqual(1);
    expect(by.get('/dari-sitemap')?.source).toBe('sitemap');
    expect(by.has('/logo.png')).toBe(false); // aset tidak dihitung halaman
    expect(scan.externalDomains).toEqual([{ host: 'ext.example', count: 1 }]);
    expect(scan.sitemap).toEqual({ found: true, urls: 1 });
    expect(scan.truncated).toBe(false);
    // situs sendiri: robots.txt diabaikan (tetap dibaca)
    expect(by.get('/hidden')?.status).toBe(200);
  });

  it('menghormati batas jumlah halaman dan kedalaman', async () => {
    const limited = await crawlSite(origin, { maxPages: 3, maxDepth: 4 }, { trustOrigin: origin });
    expect(limited.truncated).toBe(true);
    expect(limited.pages.filter((p) => p.kind !== 'unvisited' && p.kind !== 'code-only').length).toBeLessThanOrEqual(3);
    const shallow = await crawlSite(origin, { maxPages: 30, maxDepth: 1 }, { trustOrigin: origin });
    expect(shallow.pages.find((p) => p.path === '/a/x')?.status).toBe(0); // ditemukan tapi tidak dibaca
    expect(shallow.pages.find((p) => p.path === '/a/x')?.kind).toBe('unvisited');
  });
});

describe('pohon & tata letak diagram', () => {
  const page = (path: string, extra: Partial<PageNode> = {}): PageNode => ({ path, url: 'https://x.com' + path, status: 200, kind: 'ok', depth: 1, out: [], inCount: 0, source: 'crawl', ...extra });

  it('menyusun hierarki dari path dan menghitung jumlah halaman', () => {
    const t = buildTree([page('/'), page('/kost'), page('/kost/jakarta'), page('/kost/jakarta/tebet'), page('/maps')]);
    expect(t.children.map((c) => c.label)).toEqual(['kost', 'maps']);
    expect(t.count).toBe(5);
    expect(t.children[0].children[0].children[0].label).toBe('tebet');
  });

  it('simpul perantara tanpa halaman tetap muncul', () => {
    const t = buildTree([page('/'), page('/a/b/c')]);
    expect(t.children[0].page).toBeUndefined();
    expect(t.children[0].children[0].children[0].page?.path).toBe('/a/b/c');
  });

  it('menciutkan cabang besar dan menata posisi tanpa tumpang tindih', () => {
    const many = Array.from({ length: 12 }, (_, i) => page(`/kost/k${i}`));
    const t = buildTree([page('/'), page('/kost'), ...many, page('/maps')]);
    const collapsed = defaultCollapsed(t);
    expect(collapsed.has('/kost')).toBe(true);
    const lay = layoutTree(t, collapsed);
    expect(lay.items.length).toBe(3); // root, kost (diciutkan), maps
    const open = layoutTree(t, new Set());
    const ys = open.items.filter((i) => i.node.children.length === 0).map((i) => i.y).sort((a, b) => a - b);
    for (let i = 1; i < ys.length; i++) expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(48);
  });
});

describe('selisih antar pemindaian', () => {
  const mk = (pages: Partial<PageNode>[]): Scan => ({
    origin: 'https://x.com', startUrl: 'https://x.com', startedAt: '', finishedAt: '', durationMs: 1, options: { maxPages: 30, maxDepth: 3 }, truncated: false,
    pages: pages.map((p) => ({ url: '', status: 200, kind: 'ok', depth: 1, out: [], inCount: 0, source: 'crawl', path: '/', ...p }) as PageNode),
    externalDomains: [], stats: { pages: pages.length, ok: 0, redirects: 0, errors: 0, blocked: 0, unvisited: 0, codeOnly: 0, maxDepth: 1 }, robots: { found: false, disallow: 0 }, sitemap: { found: false, urls: 0 },
  });

  it('mendeteksi halaman baru, hilang, dan berubah', () => {
    const prev = mk([{ path: '/' }, { path: '/a', title: 'A' }, { path: '/b' }, { path: '/c', status: 200 }]);
    const next = mk([{ path: '/' }, { path: '/a', title: 'A baru' }, { path: '/c', status: 404, kind: 'client-error' }, { path: '/d' }]);
    const d = diffScans(prev, next);
    expect(d.added).toEqual(['/d']);
    expect(d.removed).toEqual(['/b']);
    expect(d.changed).toEqual(expect.arrayContaining([{ path: '/a', what: 'judul halaman berubah' }, { path: '/c', what: 'status 200 → 404' }]));
  });

  it('pemindaian pertama tidak menghasilkan selisih; halaman "belum dibaca" tidak dihitung hilang', () => {
    expect(diffScans(null, mk([{ path: '/' }]))).toEqual({ added: [], removed: [], changed: [] });
    const prev = mk([{ path: '/' }, { path: '/x', status: 0, kind: 'unvisited' }]);
    expect(diffScans(prev, mk([{ path: '/' }])).removed).toEqual([]);
  });
});
