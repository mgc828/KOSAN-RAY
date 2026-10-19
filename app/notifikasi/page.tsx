import { redirect } from 'next/navigation';

/** Notifikasi ditampilkan di Dashboard. Halaman ini hanya pengalihan agar tautan lonceng tetap pendek. */
export default function NotifikasiPage() {
  redirect('/dashboard#notifikasi');
}
