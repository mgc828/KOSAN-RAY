import { MetadataRoute } from 'next';
import { INITIAL_KOSTS } from '@/lib/mock-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL || 'https://kosthunt.id';
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/kost/jakarta`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kebijakan-privasi`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/syarat-ketentuan`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Dynamic area routes
  const areas = Array.from(new Set(INITIAL_KOSTS.map(k => `${k.kota.toLowerCase()}/${k.area.toLowerCase()}`)));
  const areaRoutes: MetadataRoute.Sitemap = areas.map(path => ({
    url: `${baseUrl}/kost/${path}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Dynamic kost routes (Hanya kost yang tersedia/aktif)
  const kostRoutes: MetadataRoute.Sitemap = INITIAL_KOSTS.map(kost => ({
    url: `${baseUrl}/kost/${kost.kota.toLowerCase()}/${kost.area.toLowerCase()}/${kost.slug}`,
    lastModified: new Date(kost.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...areaRoutes, ...kostRoutes];
}
