import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL || 'https://kosthunt.id';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/login',
        '/register',
        '/checkout',
        '/dashboard',
        '/admin',
        '/api/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
