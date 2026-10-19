/**
 * Dipanggil Next.js setiap ada error saat memproses permintaan di server (halaman maupun API).
 * Error dicatat ke koleksi "error-logs" (data/error-logs.json atau tabel app_documents).
 */
export async function onRequestError(
  err: unknown,
  request: { path: string; method: string },
  context: { routePath?: string; routeType?: string }
) {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  try {
    const { dbPut } = await import('./lib/db');
    const e = err as { message?: string; stack?: string; digest?: string };
    await dbPut('error-logs', {
      id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      source: 'server',
      message: String(e?.message ?? err).slice(0, 500),
      stack: e?.stack?.slice(0, 2000),
      digest: e?.digest,
      url: `${request.method} ${request.path}`,
      route: context.routePath,
      created_at: new Date().toISOString(),
    });
  } catch {
    /* pencatat error tidak boleh membuat error baru */
  }
}
