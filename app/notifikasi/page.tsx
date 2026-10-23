import { redirect } from 'next/navigation';

/** Notifikasi ditampilkan di halaman Profil. Halaman ini hanya pengalihan agar tautan lonceng tetap pendek. */
export default function NotifikasiPage() {
  redirect('/profil#notifikasi');
}
