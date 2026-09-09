-- 완주 수 익명 집계 테이블 추가 (기존 DB 용)
-- Supabase 대시보드 > SQL Editor 에서 1회 실행하세요.
-- 새로 구축하는 경우에는 schema.sql 에 이미 반영돼 있으므로 실행할 필요가 없습니다.

create table if not exists race_finishes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

comment on table race_finishes is
  '완주 한 번당 한 행. 기록을 저장하지 않은 사람까지 세기 위한 익명 집계로, 개인 식별 정보를 담지 않는다.';

alter table race_finishes enable row level security;
revoke all on race_finishes from anon, authenticated;
