-- 기록에 분당 타수 저장 (기존 DB 용)
-- Supabase 대시보드 > SQL Editor 에서 1회 실행하세요. 앱 배포(머지) 전에 먼저 실행해야 합니다 —
-- 컬럼 없이 새 코드가 배포되면 기록 저장이 실패합니다.
-- 새로 구축하는 경우에는 schema.sql 에 이미 반영돼 있으므로 실행할 필요가 없습니다.

alter table race_scores
  add column if not exists keys_per_min integer check (keys_per_min between 0 and 2000);

comment on column race_scores.keys_per_min is
  '분당 타수(오타 제외 자모 수 기준). 클라이언트 계산값이라 순위 기준으로 쓰지 않는다. 컬럼 추가 전 기록은 null.';
