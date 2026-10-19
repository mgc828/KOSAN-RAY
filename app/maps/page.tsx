import { getPublicKosts } from '@/lib/public-kosts';
import MapsClient from './MapsClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Peta Kost di Jakarta - kost-kostan',
  description: 'Jelajahi kost di Jakarta langsung dari peta interaktif.',
};

export default async function Page() {
  const kosts = await getPublicKosts();
  return <MapsClient kosts={kosts} />;
}
