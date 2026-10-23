import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const alt = 'kost-kostan - Cari kost? Lihat dulu semuanya.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), 'public', 'logo-horizontal-light.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={600} height={116} alt="kost-kostan" />
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
