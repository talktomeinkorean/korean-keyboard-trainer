-- 완주 집계에 익명 세션 ID 추가 (기존 DB 용)
-- Supabase 대시보드 > SQL Editor 에서 1회 실행하세요.
-- 새로 구축하는 경우에는 schema.sql 에 이미 반영돼 있으므로 실행할 필요가 없습니다.

-- 브라우저마다 한 번 발급해 localStorage 에 보관하는 난수(UUID)다.
-- 개인 식별 정보가 아니고, 사용자가 지울 수 있다.
alter table race_finishes
  add column if not exists session_id text;

comment on column race_finishes.session_id is
  '브라우저별 익명 난수. count(*) = 완주 횟수, count(distinct session_id) = 참여자 수. 이 컬럼이 없던 시절의 행은 null 이라 참여자 수에서 빠진다.';

create index if not exists race_finishes_session_idx on race_finishes (session_id);

-- 완주 횟수와 참여자 수를 한 번에 읽는 집계 뷰.
-- security_invoker: 기반 테이블 RLS 를 우회하지 못하게 한다.
create or replace view race_finish_stats with (security_invoker = true) as
  select count(*)::int as finishes,
         count(distinct session_id)::int as participants
  from race_finishes;

revoke all on race_finish_stats from anon, authenticated;
