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
  const kosts = await getPublicKosts();
  const site = baseUrl();
  return (
    <>
      <JsonLd graph={[...organizationLd(site), faqLd(SITE_FAQS), itemListLd(site, 'Kost pilihan di Jakarta', kosts)]} />
      <HomeClient kosts={kosts} />
    </>
  );
}
