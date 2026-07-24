-- 레이스 스코어 저장 스키마
-- Supabase 대시보드 > SQL Editor 에서 1회 실행하세요.

create table race_scores (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nickname text not null,
  time_ms integer not null check (time_ms between 3000 and 3600000),
  accuracy integer not null check (accuracy between 0 and 100),
  created_at timestamptz not null default now()
);

create index race_scores_email_time_idx on race_scores (email, time_ms);

-- 클라이언트(anon) 직접 접근 차단: RLS 활성 + 정책 없음.
-- 서버(service role)만 접근한다.
alter table race_scores enable row level security;

-- 플레이어(email)별 최고 기록 뷰. security_invoker 로 기반 테이블 RLS 를 우회하지 못하게 한다.
create view race_best with (security_invoker = true) as
  select distinct on (email) email, nickname, time_ms
  from race_scores
  order by email, time_ms asc, created_at asc;

revoke all on race_scores from anon, authenticated;
revoke all on race_best from anon, authenticated;
