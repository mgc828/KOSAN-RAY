import { getPublicKosts } from '@/lib/public-kosts';
import { baseUrl, SITE_NAME, SUBSCRIPTION_PRICE, SUBSCRIPTION_DAYS, formatRupiah } from '@/lib/config';
import { kostPath } from '@/lib/seo';

export const dynamic = 'force-dynamic';

/** Ringkasan situs untuk mesin pencari AI (konvensi llms.txt). */
export async function GET() {
  const site = baseUrl();
  const kosts = await getPublicKosts();
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> Situs pencarian kost di Jakarta (putra, putri, campur) dengan foto dan video asli. Harga, lokasi, fasilitas, dan 3 foto + 1 video gratis; nomor WhatsApp pemilik dan semua media terbuka dengan langganan ${formatRupiah(SUBSCRIPTION_PRICE)} untuk ${SUBSCRIPTION_DAYS} hari.`,
    '',
    '## Halaman utama',
    `- [Cari Kost](${site}/cari-kost): filter lokasi, kecamatan, fasilitas, harga, dan radius`,
    `- [Kost di Jakarta](${site}/kost/jakarta): daftar per area`,
    `- [Peta](${site}/maps): kost di peta`,
    '',
    '## Daftar kost',
    ...kosts.map((k) => `- [${k.nama}](${site}${kostPath(k)}): kost ${k.tipe} di ${k.area}, ${formatRupiah(k.harga)}/bulan`),
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
