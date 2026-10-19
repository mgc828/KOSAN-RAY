import { MetadataRoute } from 'next';
import { getAllKosts } from '@/lib/data-store';
import { baseUrl } from '@/lib/config';

// Dibuat saat diminta (bukan saat build) supaya kost yang baru ditambahkan langsung masuk sitemap.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = baseUrl();
  const now = new Date();
  const kosts = await getAllKosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${site}/cari-kost`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${site}/maps`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${site}/kost/jakarta`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${site}/tentang`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${site}/kontak`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${site}/kebijakan-privasi`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${site}/syarat-ketentuan`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const areas = Array.from(new Set(kosts.map((k) => `${k.kota.toLowerCase()}/${k.area.toLowerCase()}`)));
  const areaRoutes: MetadataRoute.Sitemap = areas.map((path) => ({
    url: `${site}/kost/${path}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const kostRoutes: MetadataRoute.Sitemap = kosts.map((k) => ({
    url: `${site}/kost/${k.kota.toLowerCase()}/${k.area.toLowerCase()}/${k.slug}`,
    lastModified: new Date(k.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...areaRoutes, ...kostRoutes];
}
