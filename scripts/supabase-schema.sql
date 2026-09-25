-- HistoAR · Skema database penelitian (Supabase Postgres, free tier)
-- Cara pakai: Supabase Dashboard > SQL Editor > New query > paste seluruh
-- file ini > Run. Aman dijalankan ulang (idempotent: IF NOT EXISTS).
--
-- 3 tabel: students, quiz_attempts, chat_messages.
-- RLS dinyalakan TANPA policy publik: baca/tulis hanya via service_role
-- dari server aplikasi. Prof membaca via Table Editor dashboard.

-- 1. Identitas siswa (tanpa login; UUID dibuat server saat daftar) --------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  kelas text not null,
  sekolah text not null,
  consent_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- 2. Hasil quiz per percobaan (jawaban per-butir sebagai JSONB) ------------
-- Penelitian Prof. Wawan: SATU quiz akhir (materi_id = 'final', total = 10).
-- Kolom materi_id dipertahankan (tanpa migrasi destruktif): data lama
-- per-materi tetap tersimpan sebagai arsip, attempt baru selalu 'final'.
-- Arsipkan dulu via Table Editor > Export CSV sebelum pengambilan data baru.
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  materi_id text not null,
  score int not null,
  total int not null,
  -- Contoh baru: [{"soal_id":"final-q1","dipilih":1,"benar":true}]
  -- Contoh lama (arsip): [{"soal_id":"m1-praaksaraq1","dipilih":1,"benar":true}]
  answers jsonb not null default '[]'::jsonb,
  started_at timestamptz,
  finished_at timestamptz not null default now()
);
create index if not exists quiz_attempts_student_idx
  on public.quiz_attempts (student_id);
create index if not exists quiz_attempts_materi_idx
  on public.quiz_attempts (materi_id);

-- 3. Log percakapan chatbot (landing + post-quiz) --------------------------
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  -- Boleh NULL: chat landing anonim sebelum siswa mengisi identitas.
  student_id uuid references public.students (id) on delete set null,
  -- NULL = chat landing umum (tidak terikat materi spesifik).
  materi_id text,
  -- 'landing' | 'post_quiz'
  sumber text not null,
  -- 'user' | 'assistant'
  role text not null,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_student_idx
  on public.chat_messages (student_id);
create index if not exists chat_messages_materi_idx
  on public.chat_messages (materi_id);

-- 4. Kunci Row Level Security (tanpa policy = hanya service_role bisa akses)
alter table public.students enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.chat_messages enable row level security;
