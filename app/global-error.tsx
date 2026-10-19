'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '4rem 1rem', color: '#0F2A43' }}>
        <h1>Terjadi kesalahan</h1>
        <p>Situs gagal dimuat. Silakan coba lagi.</p>
        {error.digest && <p style={{ fontSize: 12, color: '#64748B' }}>Kode: {error.digest}</p>}
        <button onClick={reset} style={{ background: '#F97316', color: '#fff', border: 0, padding: '10px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
          Muat ulang
        </button>
      </body>
    </html>
  );
}
