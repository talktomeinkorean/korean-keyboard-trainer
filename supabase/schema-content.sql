-- 연습 텍스트 콘텐츠 스키마 (스프레드시트 데이터)
-- Supabase 대시보드 > SQL Editor 에서 1회 실행하세요.

create table practice_texts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('consonant', 'vowel', 'syllable', 'vocabulary', 'sentence', 'long_text')),
  level integer,
  text_korean text not null,
  text_english text,
  source text,
  part_of_speech text,
  created_at timestamptz not null default now()
);

create index practice_texts_kind_idx on practice_texts (kind, level);

-- 클라이언트(anon) 직접 접근 차단 — 서버(service role)만 접근
alter table practice_texts enable row level security;
revoke all on practice_texts from anon, authenticated;
