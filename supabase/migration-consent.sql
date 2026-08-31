-- 개인정보 수집 동의 기록 추가 (기존 DB 용)
-- Supabase 대시보드 > SQL Editor 에서 1회 실행하세요.
-- 새로 구축하는 경우에는 schema.sql 에 이미 반영돼 있으므로 실행할 필요가 없습니다.

alter table race_scores
  add column if not exists consent_required boolean not null default false,
  add column if not exists consent_marketing boolean not null default false;

comment on column race_scores.consent_required is
  '(필수) 추첨을 위한 이름·이메일 수집 동의. 동의 없이는 저장할 수 없다.';
comment on column race_scores.consent_marketing is
  '(선택) 학습 팁·할인 정보 수신 동의. 마케팅 발송 대상 구분에 사용.';

-- 앞으로 저장되는 기록은 필수 동의가 반드시 있어야 한다.
-- NOT VALID: 이 컬럼이 없던 시절의 기존 행(테스트 데이터)까지 소급 검사하지 않는다.
-- 기존 행에 동의를 임의로 true 로 채우면 사실과 다른 기록이 되므로 그대로 둔다.
alter table race_scores
  add constraint race_scores_consent_required_check
  check (consent_required) not valid;
