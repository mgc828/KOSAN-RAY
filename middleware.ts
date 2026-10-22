import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';
import { inspectRequest } from '@/lib/security-detector';

// Static asset extensions that do not need security audit unless malicious characters are present
const STATIC_EXT_RE = /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff|woff2|ttf|eot)$/i;

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname, search } = req.nextUrl;

  // 1. Skip internal logging endpoint to avoid recursion
  if (pathname === '/api/security/log' || pathname === '/api/audit') {
    return NextResponse.next();
  }

  // 2. Skip Next.js internal files unless they look like probe / traversal attempts
  const isNextInternal = pathname.startsWith('/_next');
  const isStaticAsset = STATIC_EXT_RE.test(pathname);
  const hasSuspiciousChars = pathname.includes('..') || pathname.includes('%') || search.length > 0;

  if ((isNextInternal || isStaticAsset) && !hasSuspiciousChars) {
    return NextResponse.next();
  }

  // 3. Extract request metadata
  const cfIp = req.headers.get('cf-connecting-ip');
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const clientIp = cfIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || realIp || '127.0.0.1';

  const country = req.headers.get('cf-ipcountry') || 'ID';
  const host = req.headers.get('host') || 'localhost:3000';
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  const referer = req.headers.get('referer') || 'Direct';
  const isCloudflare = Boolean(cfIp);
  const hasAdminCookie = req.cookies.has('kk_admin_session');

  // 4. Run Security Inspection Engine
  const inspection = inspectRequest({
    pathname,
    search,
    method: req.method,
    host,
    clientIp,
    country,
    userAgent,
    isCloudflare,
    hasAdminCookie,
  });

  // 5. Asynchronously log the event without delaying the user response
  const logUrl = req.nextUrl.clone();
  logUrl.pathname = '/api/security/log';
  logUrl.search = '';

  const logPayload = {
    environment: inspection.environment,
    host: inspection.host,
    ip: inspection.clientIp,
    country: inspection.country,
    isCloudflare: inspection.isCloudflare,
    method: req.method,
    pathname,
    search,
    threatLevel: inspection.threatLevel,
    threatType: inspection.threatType,
    description: inspection.description,
    matchedRule: inspection.matchedRule,
    matchedPayload: inspection.matchedPayload,
    userAgent,
    referer,
  };

  event.waitUntil(
    fetch(logUrl.toString(), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-internal-security-call': '1',
      },
      body: JSON.stringify(logPayload),
    }).catch(() => {})
  );

  // 6. Action based on threat level
  if (inspection.threatLevel === 'ATTACK') {
    // Return honeypot block / 403 Forbidden to neutralize the breach attempt
    return new NextResponse(
      JSON.stringify({
        status: 403,
        error: 'Forbidden',
        message: 'Security Alert: Akses diblokir oleh Security Sentinel (Upaya eksploitasi terdeteksi).',
        incident_id: `block-${Date.now()}`,
        client_ip: inspection.clientIp,
        environment: inspection.environment,
      }),
      {
        status: 403,
        headers: {
          'content-type': 'application/json',
          'x-sentinel-blocked': '1',
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  // Match all requests except static chunks that are completely standard
  matcher: [
    '/((?!_next/static|_next/image).*)',
  ],
};
