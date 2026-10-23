import dns from 'dns';
import net from 'net';

/**
 * Pemindai struktur situs: membaca halaman HTML, tautan internal, sitemap.xml & robots.txt, lalu menyusun daftar halaman
 * beserta hubungan tautannya. Dipakai halaman admin "Peta Situs". Dirancang aman dipakai di server:
 *  - hanya http/https, menolak alamat privat/loopback/metadata (SSRF) kecuali situs ini sendiri,
 *  - batas halaman, kedalaman, ukuran isi, dan total waktu,
 *  - menghormati robots.txt untuk situs lain.
 */

export interface PageNode {
  path: string;
  url: string;
  title?: string;
  h1?: string;
  description?: string;
  status: number; // 0 = gagal / belum dibaca
  kind: 'ok' | 'redirect' | 'client-error' | 'server-error' | 'error' | 'blocked' | 'unvisited' | 'code-only';
  ms?: number;
  contentType?: string;
  bytes?: number;
  depth: number;
  parent?: string;
  out: string[];
  inCount: number;
  redirectTo?: string;
  source: 'crawl' | 'sitemap' | 'kode';
  dynamic?: boolean;
  error?: string;
}

export interface ScanOptions {
  maxPages: number;
  maxDepth: number;
}

export interface Scan {
  origin: string;
  startUrl: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  options: ScanOptions;
  truncated: boolean;
  truncatedReason?: string;
  pages: PageNode[];
  externalDomains: { host: string; count: number }[];
  stats: { pages: number; ok: number; redirects: number; errors: number; blocked: number; unvisited: number; codeOnly: number; maxDepth: number };
  robots: { found: boolean; disallow: number };
  sitemap: { found: boolean; urls: number };
}

export interface CrawlContext {
  /** Origin situs ini sendiri (dari permintaan). Hanya origin ini yang boleh alamat privat & menerima cookie sesi. */
  trustOrigin?: string;
  /** Cookie sesi admin, diteruskan hanya ke trustOrigin. */
  cookie?: string;
  /** Rute dari kode (build) untuk melengkapi halaman yang tidak bisa dijangkau lewat tautan. */
  manifestRoutes?: { path: string; dynamic: boolean }[];
}

const UA = 'KostKostanSiteMapper/1.0 (alat admin pembaca struktur situs)';
const MAX_BODY = 1_500_000;
const FETCH_TIMEOUT_MS = 7000;
const TOTAL_BUDGET_MS = 40_000;
const NODE_CAP = 400;
const OUT_CAP = 80;
const SKIP_EXT = /\.(png|jpe?g|gif|webp|avif|svg|ico|css|js|mjs|map|json|xml|txt|pdf|zip|gz|rar|mp4|webm|mp3|woff2?|ttf|eot|csv|docx?|xlsx?|pptx?)$/i;

/* ----------------------------- URL & keamanan ----------------------------- */

export function normalizePageUrl(raw: string, base?: string): { url: string; origin: string; path: string; host: string } | null {
  let u: URL;
  try {
    u = new URL(raw.trim(), base);
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  u.hash = '';
  u.search = '';
  u.username = '';
  u.password = '';
  let path = u.pathname.replace(/\/{2,}/g, '/');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  if (!path) path = '/';
  const origin = u.origin.toLowerCase();
  return { url: `${origin}${path === '/' ? '' : path}`, origin, path, host: u.host.toLowerCase() };
}

function ipv4Private(ip: string): boolean {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

export function isPrivateIp(ip: string): boolean {
  const kind = net.isIP(ip);
  if (kind === 4) return ipv4Private(ip);
  if (kind === 6) {
    const l = ip.toLowerCase();
    if (l === '::' || l === '::1') return true;
    const mapped = l.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return ipv4Private(mapped[1]);
    return l.startsWith('fc') || l.startsWith('fd') || l.startsWith('fe8') || l.startsWith('fe9') || l.startsWith('fea') || l.startsWith('feb') || l.startsWith('ff');
  }
  return true;
}

/** Tolak host yang menunjuk ke jaringan internal. Situs sendiri (trusted) dikecualikan. */
export async function assertPublicHost(host: string, trusted: boolean): Promise<void> {
  if (trusted) return;
  const hostname = host.replace(/:\d+$/, '').replace(/^\[|\]$/g, '').toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new Error('Alamat internal tidak diizinkan');
  }
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error('Alamat IP privat tidak diizinkan');
    return;
  }
  const addrs = await dns.promises.lookup(hostname, { all: true, verbatim: true }).catch(() => []);
  if (addrs.length === 0) throw new Error('Domain tidak ditemukan');
  if (addrs.some((a) => isPrivateIp(a.address))) throw new Error('Domain mengarah ke jaringan internal');
}

/* --------------------------------- Parser --------------------------------- */

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/\s+/g, ' ')
    .trim();

export function extractFromHtml(html: string): { title?: string; h1?: string; description?: string; hrefs: string[] } {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1]?.replace(/<[^>]+>/g, ' ');
  const desc = /<meta\s[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i.exec(html)?.[1] ?? /<meta\s[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i.exec(html)?.[1];
  const hrefs: string[] = [];
  const re = /<a\s[^>]*?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const v = (m[1] ?? m[2] ?? m[3] ?? '').trim();
    if (v && !/^(javascript:|mailto:|tel:|#|data:)/i.test(v)) hrefs.push(decode(v));
    if (hrefs.length > 1500) break;
  }
  return { title: title ? decode(title).slice(0, 160) : undefined, h1: h1 ? decode(h1).slice(0, 160) : undefined, description: desc ? decode(desc).slice(0, 240) : undefined, hrefs };
}

export function parseRobots(text: string): { disallow: string[]; allow: string[]; sitemaps: string[] } {
  const out = { disallow: [] as string[], allow: [] as string[], sitemaps: [] as string[] };
  let applies = false;
  let sawAgent = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) continue;
    const i = line.indexOf(':');
    if (i < 0) continue;
    const key = line.slice(0, i).trim().toLowerCase();
    const val = line.slice(i + 1).trim();
    if (key === 'user-agent') {
      if (!sawAgent || !applies) applies = val === '*' || val.toLowerCase() === 'kostkostansitemapper';
      sawAgent = true;
      continue;
    }
    sawAgent = false;
    if (key === 'sitemap' && val) out.sitemaps.push(val);
    else if (applies && key === 'disallow' && val) out.disallow.push(val);
    else if (applies && key === 'allow' && val) out.allow.push(val);
  }
  return out;
}

export function robotsAllows(rules: { disallow: string[]; allow: string[] }, path: string): boolean {
  const match = (rule: string) => {
    const pattern = rule.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$/, '$');
    return new RegExp('^' + pattern).test(path);
  };
  let best = { len: -1, allow: true };
  for (const r of rules.disallow) if (match(r) && r.length > best.len) best = { len: r.length, allow: false };
  for (const r of rules.allow) if (match(r) && r.length >= best.len) best = { len: r.length, allow: true };
  return best.allow;
}

export function parseSitemapXml(xml: string): string[] {
  const urls: string[] = [];
  const re = /<loc>\s*([^<\s][^<]*?)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null && urls.length < 2000) urls.push(decode(m[1]));
  return urls;
}

/* --------------------------------- Fetch ---------------------------------- */

interface FetchResult {
  status: number;
  contentType: string;
  body: string;
  ms: number;
  bytes: number;
  location?: string;
  finalUrl: string;
}

async function readCapped(res: Response): Promise<{ text: string; bytes: number }> {
  if (!res.body) return { text: '', bytes: 0 };
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_BODY) {
      chunks.push(value.slice(0, value.length - (total - MAX_BODY)));
      await reader.cancel().catch(() => undefined);
      break;
    }
    chunks.push(value);
  }
  const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  return { text: buf.toString('utf-8'), bytes: total };
}

async function fetchOnce(url: string, ctx: CrawlContext, trustedOrigin: boolean): Promise<FetchResult> {
  const t0 = Date.now();
  const u = new URL(url);
  await assertPublicHost(u.host, trustedOrigin);
  const headers: Record<string, string> = { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5' };
  if (trustedOrigin && ctx.cookie) headers.cookie = ctx.cookie;
  const res = await fetch(url, { redirect: 'manual', headers, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: 'no-store' });
  const contentType = res.headers.get('content-type') || '';
  const location = res.headers.get('location') || undefined;
  let body = '';
  let bytes = 0;
  if (res.status >= 200 && res.status < 300 && /text\/|xml|html/i.test(contentType)) {
    const r = await readCapped(res);
    body = r.text;
    bytes = r.bytes;
  } else {
    await res.body?.cancel().catch(() => undefined);
  }
  return { status: res.status, contentType, body, ms: Date.now() - t0, bytes, location, finalUrl: url };
}

/** Ambil sebuah alamat; ikuti pengalihan di origin yang sama (maks 4 kali). */
async function fetchFollow(url: string, ctx: CrawlContext, origin: string): Promise<FetchResult & { redirectedTo?: string }> {
  const trusted = !!ctx.trustOrigin && origin === ctx.trustOrigin;
  let current = url;
  let first: FetchResult | null = null;
  for (let hop = 0; hop < 5; hop++) {
    const r = await fetchOnce(current, ctx, trusted);
    if (!first) first = r;
    if (r.status >= 300 && r.status < 400 && r.location) {
      const next = normalizePageUrl(r.location, current);
      if (!next) return { ...r, redirectedTo: r.location };
      if (next.origin !== origin) return { ...first, redirectedTo: next.url };
      if (next.url === current) return r;
      current = next.url;
      continue;
    }
    return hop === 0 ? r : { ...r, status: first.status, redirectedTo: current, finalUrl: current, ms: first.ms + r.ms };
  }
  return { ...(first as FetchResult), redirectedTo: current };
}

const kindOf = (status: number): PageNode['kind'] =>
  status >= 200 && status < 300 ? 'ok' : status >= 300 && status < 400 ? 'redirect' : status >= 400 && status < 500 ? 'client-error' : status >= 500 ? 'server-error' : 'error';

/* ---------------------------------- Crawl --------------------------------- */

export async function crawlSite(startUrlRaw: string, options: Partial<ScanOptions>, ctx: CrawlContext = {}): Promise<Scan> {
  const startedAt = Date.now();
  const opts: ScanOptions = {
    maxPages: Math.max(1, Math.min(80, Math.floor(options.maxPages ?? 30))),
    maxDepth: Math.max(0, Math.min(5, Math.floor(options.maxDepth ?? 3))),
  };
  const start = normalizePageUrl(startUrlRaw.includes('://') ? startUrlRaw : `https://${startUrlRaw}`);
  if (!start) throw new Error('Alamat tidak valid. Gunakan format https://contoh.com');
  const origin = start.origin;
  const trusted = !!ctx.trustOrigin && origin === ctx.trustOrigin;
  await assertPublicHost(new URL(origin).host, trusted);

  const nodes = new Map<string, PageNode>();
  const external = new Map<string, number>();
  const queue: { path: string; depth: number }[] = [];
  const deadline = startedAt + TOTAL_BUDGET_MS;
  let truncated = false;
  let truncatedReason: string | undefined;
  let fetched = 0;

  const ensure = (path: string, depth: number, parent: string | undefined, source: PageNode['source']): PageNode => {
    let n = nodes.get(path);
    if (!n) {
      n = { path, url: `${origin}${path === '/' ? '' : path}`, status: 0, kind: 'unvisited', depth, parent, out: [], inCount: 0, source };
      nodes.set(path, n);
    }
    return n;
  };

  // robots.txt (diabaikan untuk situs sendiri) & sitemap.xml
  let robots = { disallow: [] as string[], allow: [] as string[], sitemaps: [] as string[] };
  let robotsFound = false;
  try {
    const r = await fetchFollow(`${origin}/robots.txt`, ctx, origin);
    if (r.status === 200 && r.body) {
      robotsFound = true;
      robots = parseRobots(r.body);
    }
  } catch {
    /* tanpa robots.txt */
  }
  const allowed = (path: string) => trusted || robotsAllows(robots, path);

  let sitemapUrls: string[] = [];
  let sitemapFound = false;
  for (const sm of robots.sitemaps.length ? robots.sitemaps.slice(0, 2) : [`${origin}/sitemap.xml`]) {
    try {
      const smn = normalizePageUrl(sm);
      if (!smn || smn.origin !== origin) continue;
      const r = await fetchFollow(sm, ctx, origin);
      if (r.status === 200 && r.body) {
        sitemapFound = true;
        sitemapUrls = sitemapUrls.concat(parseSitemapXml(r.body));
      }
    } catch {
      /* lewati */
    }
  }

  ensure(start.path, 0, undefined, 'crawl');
  queue.push({ path: start.path, depth: 0 });

  const crawlOne = async (item: { path: string; depth: number }) => {
    const node = nodes.get(item.path)!;
    if (!allowed(item.path)) {
      node.kind = 'blocked';
      return;
    }
    fetched++;
    try {
      const r = await fetchFollow(node.url, ctx, origin);
      node.status = r.status;
      node.kind = kindOf(r.status);
      node.ms = r.ms;
      node.contentType = r.contentType.split(';')[0] || undefined;
      node.bytes = r.bytes || undefined;
      if (r.redirectedTo) node.redirectTo = r.redirectedTo.startsWith(origin) ? r.redirectedTo.slice(origin.length) || '/' : r.redirectedTo;
      if (r.status >= 200 && r.status < 300 && /html/i.test(r.contentType) && r.body) {
        const info = extractFromHtml(r.body);
        node.title = info.title;
        node.h1 = info.h1;
        node.description = info.description;
        const seen = new Set<string>();
        for (const href of info.hrefs) {
          const n = normalizePageUrl(href, node.url);
          if (!n) continue;
          if (n.origin !== origin) {
            external.set(n.host, (external.get(n.host) ?? 0) + 1);
            continue;
          }
          if (SKIP_EXT.test(n.path) || n.path.startsWith('/_next') || n.path.startsWith('/api/')) continue;
          if (n.path === node.path || seen.has(n.path)) continue;
          seen.add(n.path);
          if (node.out.length < OUT_CAP) node.out.push(n.path);
          if (nodes.size < NODE_CAP) {
            const existed = nodes.has(n.path);
            const child = ensure(n.path, item.depth + 1, node.path, 'crawl');
            child.inCount++;
            if (!existed && item.depth + 1 <= opts.maxDepth) queue.push({ path: n.path, depth: item.depth + 1 });
          } else {
            const existing = nodes.get(n.path);
            if (existing) existing.inCount++;
          }
        }
      }
    } catch (e) {
      node.kind = 'error';
      node.error = e instanceof Error ? e.message.slice(0, 120) : 'gagal';
    }
  };

  // BFS dengan beberapa pekerja paralel
  const worker = async () => {
    for (;;) {
      if (Date.now() > deadline) {
        if (queue.length > 0) { truncated = true; truncatedReason = 'Waktu pemindaian habis'; }
        return;
      }
      if (fetched >= opts.maxPages) {
        if (queue.length > 0) { truncated = true; truncatedReason = `Batas ${opts.maxPages} halaman tercapai`; }
        return;
      }
      const item = queue.shift();
      if (!item) {
        // tunggu sebentar: pekerja lain mungkin masih menambah antrean
        await new Promise((r) => setTimeout(r, 40));
        if (queue.length === 0 && active === 0) return;
        continue;
      }
      active++;
      try {
        await crawlOne(item);
      } finally {
        active--;
      }
    }
  };
  let active = 0;
  await Promise.all([worker(), worker(), worker(), worker(), worker()]);

  // Halaman dari sitemap.xml yang belum terjangkau
  for (const u of sitemapUrls) {
    const n = normalizePageUrl(u);
    if (!n || n.origin !== origin || SKIP_EXT.test(n.path)) continue;
    if (nodes.size >= NODE_CAP) break;
    if (!nodes.has(n.path)) ensure(n.path, 1, undefined, 'sitemap');
  }

  // Rute dari kode (khusus situs sendiri): halaman yang tidak terhubung lewat tautan / dilindungi login
  if (trusted && ctx.manifestRoutes) {
    for (const r of ctx.manifestRoutes) {
      if (nodes.size >= NODE_CAP + 80) break;
      const n = nodes.get(r.path);
      if (n) {
        if (r.dynamic) n.dynamic = true;
        continue;
      }
      const node = ensure(r.path, r.path.split('/').filter(Boolean).length, undefined, 'kode');
      node.kind = 'code-only';
      node.dynamic = r.dynamic;
    }
  }

  const pages = Array.from(nodes.values());
  const stats = {
    pages: pages.length,
    ok: pages.filter((p) => p.kind === 'ok').length,
    redirects: pages.filter((p) => p.kind === 'redirect').length,
    errors: pages.filter((p) => ['client-error', 'server-error', 'error'].includes(p.kind)).length,
    blocked: pages.filter((p) => p.kind === 'blocked').length,
    unvisited: pages.filter((p) => p.kind === 'unvisited').length,
    codeOnly: pages.filter((p) => p.kind === 'code-only').length,
    maxDepth: Math.max(0, ...pages.map((p) => p.depth)),
  };

  return {
    origin,
    startUrl: start.url,
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    options: opts,
    truncated,
    truncatedReason,
    pages,
    externalDomains: Array.from(external, ([host, count]) => ({ host, count })).sort((a, b) => b.count - a.count).slice(0, 20),
    stats,
    robots: { found: robotsFound, disallow: robots.disallow.length },
    sitemap: { found: sitemapFound, urls: sitemapUrls.length },
  };
}
