import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Halaman Media sudah digabung ke Data Kost (form tambah/edit kost)
  async redirects() {
    return [
      { source: '/admin/media', destination: '/admin/kost', permanent: true },
      // Halaman Dashboard digabung ke Profil
      { source: '/dashboard', destination: '/profil', permanent: true },
    ];
  },
  outputFileTracingRoot: path.resolve(__dirname),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore Next.js 15 dev origin config
  allowedDevOrigins: ['*.trycloudflare.com', '*.loca.lt', '*.ngrok-free.app', '*.ngrok-free.dev', 'localhost:3005'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['motion'],
};

export default nextConfig;
