import { NextRequest, NextResponse } from 'next/server';
import { getKostBySlug } from '@/lib/data-store';
import { getSessionUser, unauthorized } from '@/lib/api-auth';
import { getReviews, summarize, validateReview, hasPaid, upsertReview, deleteReview, maskName } from '@/lib/reviews';
import { rateLimit } from '@/lib/json-store';

/** GET /api/reviews?slug=...  -> ringkasan rating + daftar ulasan (nama sudah disamarkan). */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || '';
  if (!(await getKostBySlug(slug))) return NextResponse.json({ error: 'Kost tidak ditemukan' }, { status: 404 });

  const [reviews, me] = await Promise.all([getReviews(slug), getSessionUser(req)]);
  const sorted = [...reviews].sort((a, b) => b.created_at.localeCompare(a.created_at));

  let canReview = { loggedIn: false, paid: false, hasReview: false };
  if (me) {
    canReview = { loggedIn: true, paid: await hasPaid(me.id), hasReview: reviews.some((r) => r.user_id === me.id) };
  }

  return NextResponse.json({
    summary: summarize(reviews),
    reviews: sorted.map((r) => ({
      id: r.id,
      name: r.user_name,
      rating: r.rating,
      body: r.body,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      mine: me ? r.user_id === me.id : false,
    })),
    canReview,
  });
}

/** Tulis atau ubah ulasan sendiri. Hanya untuk pengguna yang pernah membayar. */
export async function POST(req: NextRequest) {
  const me = await getSessionUser(req);
  if (!me) return unauthorized('Masuk dulu untuk menulis ulasan.');

  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === 'string' ? body.slug : '';
  if (!(await getKostBySlug(slug))) return NextResponse.json({ error: 'Kost tidak ditemukan' }, { status: 404 });

  if (!(await hasPaid(me.id))) {
    return NextResponse.json(
      { error: 'Ulasan hanya untuk pengguna yang pernah membuka akses penuh, supaya ulasannya dari penghuni/pencari sungguhan.', code: 'not_paid' },
      { status: 403 }
    );
  }
  if (!rateLimit(`review:${me.id}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Terlalu banyak ulasan dalam waktu singkat. Coba lagi nanti.' }, { status: 429 });
  }

  const v = validateReview({ rating: body?.rating, body: body?.body });
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const review = await upsertReview({
    slug,
    userId: me.id,
    userName: maskName(me.fullName, me.email),
    rating: v.rating,
    body: v.body,
  });
  return NextResponse.json({ success: true, id: review.id });
}

export async function DELETE(req: NextRequest) {
  const me = await getSessionUser(req);
  if (!me) return unauthorized();
  const slug = req.nextUrl.searchParams.get('slug') || '';
  const ok = await deleteReview(slug, me.id);
  if (!ok) return NextResponse.json({ error: 'Ulasan tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ success: true });
}
