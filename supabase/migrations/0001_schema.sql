-- منصة التدريب على الرخصة المهنية — الاختبار العام
-- الجداول ببادئة pl_ لعزلها عن بقية جداول المشروع

create table if not exists public.pl_sections (
  slug text primary key,
  title text not null,
  short_title text not null,
  description text not null default '',
  icon text not null default '',
  color text not null default 'emerald',
  sort integer not null default 0,
  exam_type text not null default 'general'
);

create table if not exists public.pl_topics (
  slug text primary key,
  section_slug text not null references public.pl_sections(slug) on delete cascade,
  title text not null,
  sort integer not null default 0,
  notes text not null default ''
);

create table if not exists public.pl_questions (
  id text primary key,
  topic_slug text not null references public.pl_topics(slug) on delete cascade,
  difficulty integer not null default 2 check (difficulty between 1 and 3),
  stem text not null,
  options jsonb not null,
  answer integer not null check (answer between 0 and 3),
  explanation text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists pl_questions_topic_idx on public.pl_questions(topic_slug);
create index if not exists pl_topics_section_idx on public.pl_topics(section_slug);

create table if not exists public.pl_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  mode text not null check (mode in ('practice','quiz','exam')),
  section_slug text,
  topic_slug text,
  total integer not null default 0,
  correct integer not null default 0,
  duration_seconds integer not null default 0,
  answers jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists pl_attempts_user_idx on public.pl_attempts(user_id, started_at desc);

-- تفعيل أمان مستوى الصفوف
alter table public.pl_sections enable row level security;
alter table public.pl_topics enable row level security;
alter table public.pl_questions enable row level security;
alter table public.pl_attempts enable row level security;

-- المحتوى: قراءة عامة فقط (لا كتابة إلا من لوحة Supabase)
create policy "pl_sections_public_read" on public.pl_sections for select using (true);
create policy "pl_topics_public_read" on public.pl_topics for select using (true);
create policy "pl_questions_public_read" on public.pl_questions for select using (is_active);

-- المحاولات: كل مستخدم يرى ويدير محاولاته فقط
create policy "pl_attempts_own_select" on public.pl_attempts for select using (auth.uid() = user_id);
create policy "pl_attempts_own_insert" on public.pl_attempts for insert with check (auth.uid() = user_id);
create policy "pl_attempts_own_update" on public.pl_attempts for update using (auth.uid() = user_id);
create policy "pl_attempts_own_delete" on public.pl_attempts for delete using (auth.uid() = user_id);
