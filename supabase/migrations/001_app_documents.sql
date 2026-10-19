-- Penyimpanan dokumen untuk aplikasi kost-kostan (dipakai lib/db.ts saat Supabase dikonfigurasi).
-- Jalankan di Supabase: SQL Editor -> New query -> tempel -> Run.

create table if not exists public.app_documents (
  collection  text        not null,
  id          text        not null,
  seq         bigint      not null default 0,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  primary key (collection, id)
);

create index if not exists app_documents_collection_seq_idx
  on public.app_documents (collection, seq desc);

-- Aktifkan RLS TANPA kebijakan: browser (anon key) tidak bisa membaca/menulis apa pun.
-- Server memakai SUPABASE_SERVICE_ROLE_KEY yang melewati RLS.
alter table public.app_documents enable row level security;
