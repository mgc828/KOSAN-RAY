import { crawlSite, type CrawlContext, type Scan, type ScanOptions } from './site-crawler';
import { saveScan, type ScanDiff, type SiteDoc } from './site-map-store';
import manifest from './route-manifest.generated.json';

/** Rute halaman dari kode (dibuat saat build) untuk melengkapi pemindaian situs sendiri. */
export const MANIFEST_ROUTES = (manifest.routes as { path: string; dynamic: boolean; type: string }[])
  .filter((r) => r.type === 'page')
  .map((r) => ({ path: r.path, dynamic: r.dynamic }));

/** Jalankan pemindaian + simpan hasilnya. trustOrigin = origin situs ini (boleh menerima cookie sesi admin). */
export async function runScan(
  url: string,
  options: Partial<ScanOptions>,
  ctx: { trustOrigin?: string; cookie?: string },
  auto?: boolean
): Promise<{ scan: Scan; diff: ScanDiff; first: boolean; doc: SiteDoc }> {
  const full: CrawlContext = { ...ctx, manifestRoutes: MANIFEST_ROUTES };
  const scan = await crawlSite(url, options, full);
  const { doc, diff, first } = await saveScan(scan, auto);
  return { scan, diff, first, doc };
}
