-- 레이스 스코어 저장 스키마
-- Supabase 대시보드 > SQL Editor 에서 1회 실행하세요.

create table race_scores (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nickname text not null,
  time_ms integer not null check (time_ms between 3000 and 3600000),
  accuracy integer not null check (accuracy between 0 and 100),
  -- (필수) 추첨을 위한 이름·이메일 수집 동의. 동의 없이는 저장할 수 없다.
  consent_required boolean not null check (consent_required),
  -- (선택) 학습 팁·할인 정보 수신 동의. 마케팅 발송 대상 구분에 사용.
  consent_marketing boolean not null default false,
  -- 동의 시각은 저장 시각과 같으므로 created_at 을 그대로 근거로 쓴다.
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

-- 완주 수 익명 집계.
-- 기록을 저장(이메일 제출)하지 않고 완주만 한 사람까지 세기 위한 테이블이다.
-- 행 하나 = 완주 한 번. 개인 식별 정보를 담지 않으므로 race_scores 의 동의 체계와 무관하다.
create table race_finishes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table race_finishes enable row level security;
revoke all on race_finishes from anon, authenticated;
