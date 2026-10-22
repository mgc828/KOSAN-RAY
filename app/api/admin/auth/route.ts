import { NextRequest, NextResponse } from 'next/server';
import { 
  createAdminSessionToken, 
  verifyAdminSessionToken, 
  adminSessionCookie, 
  clearedAdminSessionCookie, 
  ADMIN_SESSION_COOKIE 
} from '@/lib/admin-session';
import { dbList, dbPut, dbUpdate } from '@/lib/db';
import { AdminAccount } from '@/lib/admin-types';

const ADMINS_COLLECTION = 'admin_accounts';

const DEFAULT_ADMINS: AdminAccount[] = [
  {
    id: 'adm-super-01',
    email: 'admin@kost-kostan.id',
    fullName: 'Super Administrator',
    role: 'superadmin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'adm-curator-02',
    email: 'kurator@kost-kostan.id',
    fullName: 'Budi Kurator Media',
    role: 'curator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-02-15T00:00:00.000Z',
  }
];

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = verifyAdminSessionToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false, admin: null }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, admin: session });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: 'Sesi tidak valid' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, rememberMe } = body;

    if (action === 'logout') {
      const res = NextResponse.json({ success: true, message: 'Berhasil keluar' });
      res.headers.append('Set-Cookie', clearedAdminSessionCookie(req));
      return res;
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email dan kata sandi wajib diisi' }, { status: 400 });
      }

      const emailTrim = String(email).trim().toLowerCase();
      const passwordTrim = String(password).trim();

      // 1. Cek admin default atau accounts di DB
      let matchedAdmin: AdminAccount | null = null;

      // Cek default admin
      if (
        (emailTrim === 'admin@kost-kostan.id' && (passwordTrim === 'admin123' || passwordTrim === 'kosthunt-admin-secret-2026')) ||
        (emailTrim === 'kurator@kost-kostan.id' && passwordTrim === 'kurator123')
      ) {
        matchedAdmin = DEFAULT_ADMINS.find(a => a.email.toLowerCase() === emailTrim) || DEFAULT_ADMINS[0];
      } else {
        // Cek database admin_accounts
        try {
          const admins = await dbList<AdminAccount>(ADMINS_COLLECTION, () => DEFAULT_ADMINS);
          const found = admins.find(a => a.email.toLowerCase() === emailTrim);
          if (found && (passwordTrim === 'admin123' || passwordTrim === 'kosthunt-admin-secret-2026')) {
            matchedAdmin = found;
          }
        } catch (e) {
          console.warn('[admin-auth] Error reading admin accounts:', e);
        }
      }

      if (!matchedAdmin) {
        // Log percobaan breach / login gagal ke Security Log
        const cfIp = req.headers.get('cf-connecting-ip');
        const forwardedFor = req.headers.get('x-forwarded-for');
        const realIp = req.headers.get('x-real-ip');
        const clientIp = cfIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || realIp || '127.0.0.1';
        const host = req.headers.get('host') || 'localhost:3000';
        const isProdHost = host.includes('trycloudflare') || host.includes('vercel') || (!host.includes('localhost') && !host.includes('127.0.0.1'));

        try {
          const logUrl = req.nextUrl.clone();
          logUrl.pathname = '/api/security/log';
          logUrl.search = '';
          fetch(logUrl.toString(), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              environment: isProdHost ? 'PRODUCTION' : 'LOCAL',
              host,
              ip: clientIp,
              country: req.headers.get('cf-ipcountry') || 'ID',
              isCloudflare: Boolean(cfIp),
              method: 'POST',
              pathname: '/api/admin/auth',
              search: '',
              status: 401,
              threatLevel: 'UNAUTHORIZED',
              threatType: 'BRUTE_FORCE_LOGIN',
              description: `Percobaan login admin GAGAL dengan email target: ${emailTrim}`,
              matchedPayload: `Email: ${emailTrim}`,
              userAgent: req.headers.get('user-agent') || 'Unknown',
            }),
          }).catch(() => {});
        } catch {}

        return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
      }

      const token = createAdminSessionToken(matchedAdmin, Boolean(rememberMe));
      const res = NextResponse.json({
        success: true,
        message: 'Login berhasil',
        admin: {
          id: matchedAdmin.id,
          email: matchedAdmin.email,
          fullName: matchedAdmin.fullName,
          role: matchedAdmin.role,
        }
      });

      res.headers.append('Set-Cookie', adminSessionCookie(req, token, Boolean(rememberMe)));
      return res;
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 });
  } catch (error) {
    console.error('[admin-auth] Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server internal' }, { status: 500 });
  }
}

