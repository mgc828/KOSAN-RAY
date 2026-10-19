import { jsonLdString } from '@/lib/seo';

/** Menyisipkan data terstruktur schema.org. Dirender di server supaya ada di HTML awal. */
export default function JsonLd({ graph }: { graph: unknown[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString({ '@context': 'https://schema.org', '@graph': graph }) }}
    />
  );
}

/** Blok FAQ yang terlihat pengunjung (isi harus sama dengan FAQPage di JSON-LD). */
export function FaqSection({ title, faqs }: { title: string; faqs: { q: string; a: string }[] }) {
  return (
    <section aria-labelledby="faq-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 id="faq-heading" className="text-xl font-extrabold text-[#0F2A43] mb-4">{title}</h2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="group bg-white border border-slate-200 rounded-2xl px-5 py-4">
            <summary className="cursor-pointer font-bold text-sm text-slate-900 list-none flex justify-between gap-3">
              <span>{f.q}</span>
              <span aria-hidden="true" className="text-slate-500 group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
