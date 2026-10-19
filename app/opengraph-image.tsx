import { ImageResponse } from 'next/og';

export const alt = 'kost-kostan - Cari kost? Lihat dulu semuanya.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0F2A43 0%, #16385A 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: '#F97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              color: '#0F2A43',
              fontWeight: 800,
            }}
          >
            K
          </div>
          <div style={{ fontSize: 64, fontWeight: 800 }}>kost-kostan</div>
        </div>
        <div style={{ marginTop: 56, fontSize: 76, fontWeight: 800, lineHeight: 1.1 }}>
          Cari kost? Lihat dulu semuanya.
        </div>
        <div style={{ marginTop: 28, fontSize: 38, color: '#F97316', fontWeight: 700 }}>
          Foto, video, langsung chat pemilik.
        </div>
      </div>
    ),
    size
  );
}
