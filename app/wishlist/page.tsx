import { getPublicKosts } from '@/lib/public-kosts';
import WishlistClient from './WishlistClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Kost Favorit - kost-kostan', robots: { index: false } };

export default async function Page() {
  const kosts = await getPublicKosts();
  return <WishlistClient kosts={kosts} />;
}
