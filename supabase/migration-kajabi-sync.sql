-- Kajabi 뉴스레터 전달 여부 기록 (기존 DB 용)
-- Supabase 대시보드 > SQL Editor 에서 1회 실행하세요.
-- 새로 구축하는 경우에는 schema.sql 에 이미 반영돼 있으므로 실행할 필요가 없습니다.

alter table race_scores
  add column if not exists kajabi_synced_at timestamptz;

comment on column race_scores.kajabi_synced_at is
  'Kajabi 뉴스레터 폼에 이 이메일을 넘긴 시각. 성공했을 때만 채운다. consent_marketing 이 true 인데 null 이면 아직 못 넘긴 것이라 다시 보내야 한다.';

-- 아직 못 넘긴 사람 뽑기:
--   select distinct email, nickname from race_scores
--   where consent_marketing and kajabi_synced_at is null;
