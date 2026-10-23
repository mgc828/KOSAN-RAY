import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.APP_URL || 'https://kost-kostan.id').replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/masuk',
        '/lupa-sandi',
        '/reset-sandi',
        '/wishlist',
        '/bandingkan',
        '/daftar',
        '/checkout',
        '/dashboard',
        '/profil',
        '/admin',
        '/api/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
