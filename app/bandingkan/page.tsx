import { getPublicKosts } from '@/lib/public-kosts';
import BandingkanClient from './BandingkanClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Bandingkan Kost - kost-kostan', robots: { index: false } };

export default async function Page() {
  const kosts = await getPublicKosts();
  return <BandingkanClient kosts={kosts} />;
}
