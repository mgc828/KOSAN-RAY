import type { Metadata } from 'next';
import { getPublicKosts } from '@/lib/public-kosts';
import { baseUrl } from '@/lib/config';
import { SITE_FAQS, faqLd, itemListLd, organizationLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function Page() {
  let kosts = [];
  try {
    kosts = await getPublicKosts();
  } catch (err) {
    console.error('getPublicKosts error, loading fallback:', err);
    const { INITIAL_KOSTS } = await import('@/lib/mock-data');
    kosts = INITIAL_KOSTS;
  }

  const site = baseUrl();
  let schemaGraph: unknown[] = [];
  try {
    schemaGraph = [...organizationLd(site), faqLd(SITE_FAQS), itemListLd(site, 'Kost pilihan di Jakarta', kosts)];
  } catch {
    schemaGraph = [];
  }

  return (
    <>
      {schemaGraph.length > 0 && <JsonLd graph={schemaGraph} />}
      <HomeClient kosts={kosts} />
    </>
  );
}
