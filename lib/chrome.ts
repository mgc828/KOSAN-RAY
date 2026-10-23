/**
 * Halaman yang memakai tata letak sendiri (tanpa header & footer situs):
 * halaman akun (masuk/daftar/lupa & atur ulang sandi) dan dashboard pengguna (profil).
 */
const CHROMELESS = ['/masuk', '/daftar', '/lupa-sandi', '/reset-sandi', '/profil'];

export function isChromeless(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return CHROMELESS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Halaman akun (form masuk/daftar): bilah perbandingan & elemen melayang lain tidak perlu tampil. */
export function isAuthRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return ['/masuk', '/daftar', '/lupa-sandi', '/reset-sandi'].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
