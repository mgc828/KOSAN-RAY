import { describe, it, expect } from 'vitest';
import { inspectRequest } from '@/lib/security-detector';

describe('Security Detector Engine', () => {
  it('mendeteksi kunjungan biasa sebagai NORMAL_VISIT', () => {
    const res = inspectRequest({
      pathname: '/cari-kost',
      search: '?area=kuningan',
      method: 'GET',
      host: 'localhost:3000',
      clientIp: '127.0.0.1',
      country: 'ID',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      isCloudflare: false,
      hasAdminCookie: false,
    });

    expect(res.isThreat).toBe(false);
    expect(res.threatLevel).toBe('INFO');
    expect(res.threatType).toBe('NORMAL_VISIT');
    expect(res.environment).toBe('LOCAL');
  });

  it('mendeteksi environment PRODUKSI saat diakses via Cloudflare / domain publik', () => {
    const res = inspectRequest({
      pathname: '/',
      search: '',
      method: 'GET',
      host: 'bon-fellowship-strengthening-ronald.trycloudflare.com',
      clientIp: '180.252.164.21',
      country: 'ID',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)',
      isCloudflare: true,
      hasAdminCookie: false,
    });

    expect(res.environment).toBe('PRODUCTION');
    expect(res.threatLevel).toBe('INFO');
  });

  it('mendeteksi pemindaian file rahasia (.env scan) sebagai ATTACK', () => {
    const res = inspectRequest({
      pathname: '/.env',
      search: '',
      method: 'GET',
      host: 'localhost:3000',
      clientIp: '45.134.20.10',
      country: 'RU',
      userAgent: 'curl/7.68.0',
      isCloudflare: false,
      hasAdminCookie: false,
    });

    expect(res.isThreat).toBe(true);
    expect(res.threatLevel).toBe('ATTACK');
    expect(res.threatType).toBe('SENSITIVE_FILE_SCAN');
  });

  it('mendeteksi serangan SQL Injection dalam URL / query param', () => {
    const res = inspectRequest({
      pathname: '/cari-kost',
      search: '?id=1%20UNION%20SELECT%20username,password%20FROM%20users--',
      method: 'GET',
      host: 'localhost:3000',
      clientIp: '192.168.1.50',
      country: 'ID',
      userAgent: 'Mozilla/5.0',
      isCloudflare: false,
      hasAdminCookie: false,
    });

    expect(res.isThreat).toBe(true);
    expect(res.threatLevel).toBe('ATTACK');
    expect(res.threatType).toBe('SQL_INJECTION');
  });

  it('mendeteksi Path Traversal (../etc/passwd)', () => {
    const res = inspectRequest({
      pathname: '/api/media',
      search: '?file=../../../../etc/passwd',
      method: 'GET',
      host: 'localhost:3000',
      clientIp: '103.20.15.2',
      country: 'SG',
      userAgent: 'Mozilla/5.0',
      isCloudflare: false,
      hasAdminCookie: false,
    });

    expect(res.isThreat).toBe(true);
    expect(res.threatLevel).toBe('ATTACK');
    expect(res.threatType).toBe('PATH_TRAVERSAL');
  });

  it('mendeteksi bot / peretas otomatis (sqlmap / nikto)', () => {
    const res = inspectRequest({
      pathname: '/',
      search: '',
      method: 'GET',
      host: 'localhost:3000',
      clientIp: '185.220.101.5',
      country: 'NL',
      userAgent: 'sqlmap/1.5.2#stable (http://sqlmap.org)',
      isCloudflare: false,
      hasAdminCookie: false,
    });

    expect(res.isThreat).toBe(true);
    expect(res.threatLevel).toBe('ATTACK');
    expect(res.threatType).toBe('EXPLOIT_SCANNER_BOT');
  });

  it('mendeteksi upaya akses route admin tanpa izin sebagai UNAUTHORIZED', () => {
    const res = inspectRequest({
      pathname: '/admin/pengaturan',
      search: '',
      method: 'GET',
      host: 'localhost:3000',
      clientIp: '114.122.50.10',
      country: 'ID',
      userAgent: 'Mozilla/5.0',
      isCloudflare: false,
      hasAdminCookie: false,
    });

    expect(res.isThreat).toBe(true);
    expect(res.threatLevel).toBe('UNAUTHORIZED');
    expect(res.threatType).toBe('UNAUTHORIZED_ADMIN_ACCESS');
  });
});
