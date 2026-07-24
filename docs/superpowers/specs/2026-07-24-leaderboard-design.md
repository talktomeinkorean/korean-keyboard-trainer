# 레이스 스코어 저장 + 리더보드 설계 (Supabase)

날짜: 2026-07-24
상태: 승인됨 (브레인스토밍 결정 반영)

## 결정 사항 (이전 브레인스토밍에서 확정)

- 이메일 + 닉네임 입력, **인증 없음** (추후 Supabase Auth 매직링크로 확장 대비)
- 개인 최고 기록 + 공개 리더보드 (닉네임만 노출, **이메일 비공개**)
- 리더보드는 완주 시간 오름차순 단일 랭킹, 플레이어당 최고 기록 1개
- 조회는 Supabase 직접 호출 금지 → **Next.js API + 60초 캐시** (free 티어 egress 5GB 병목 회피)

## 아키텍처

클라이언트 → Next.js Route Handler → Supabase (service role key, 서버 전용).
클라이언트에 Supabase 키를 노출하지 않는다. anon/authenticated 롤은 테이블 접근 불가
(RLS 활성 + 정책 없음 + grant revoke). 이메일이 클라이언트로 나가는 경로 없음.

## DB 스키마 (`supabase/schema.sql` — 사용자가 Supabase SQL Editor 에서 1회 실행)

```sql
create table race_scores (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nickname text not null,
  time_ms integer not null check (time_ms between 3000 and 3600000),
  accuracy integer not null check (accuracy between 0 and 100),
  created_at timestamptz not null default now()
);
create index on race_scores (email, time_ms);
alter table race_scores enable row level security;

create view race_best with (security_invoker = true) as
  select distinct on (email) email, nickname, time_ms
  from race_scores order by email, time_ms asc, created_at asc;

revoke all on race_scores, race_best from anon, authenticated;
```

`race_best` = 플레이어(email)별 최고 기록 뷰. security_invoker 로 RLS 우회 차단.

## 환경 변수 (서버 전용, NEXT_PUBLIC 아님)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

로컬 `.env.local` + Vercel 프로젝트 설정에 등록. 미설정 시 API 는 503을 반환하고
클라이언트는 스코어 저장 UI 를 숨긴다 (게임 자체는 정상 동작).

## API

### POST `/api/scores`

Body: `{ email, nickname, timeMs, accuracy }`

- 검증 (`lib/game/score.ts`, 순수 함수로 분리해 단위 테스트):
  email 형식 / nickname 1~20자(trim) / timeMs 정수 3,000~3,600,000 / accuracy 정수 0~100
- insert 후 응답: `{ bestMs, rank }` — bestMs = 해당 email 의 최고 기록,
  rank = race_best 에서 bestMs 보다 빠른 플레이어 수 + 1
- 400(검증 실패) / 503(미설정) / 500(DB 오류)

### GET `/api/leaderboard`

- `race_best` 상위 10개 `{ nickname, timeMs }` 배열 (이메일 미포함)
- `unstable_cache(..., { revalidate: 60 })` 로 60초 캐시 — 트래픽과 무관하게
  Supabase 조회는 분당 1회 수준

## 클라이언트

### RaceResultCard (신규: `components/RaceResultCard.tsx`)

완주 오버레이 내용을 담당. Props: `{ timeMs, accuracy, onRetry }`

- 상태: 입력 폼 → 제출 중 → 완료(내 순위/최고 기록 + 리더보드) | 오류(재시도 안내)
- 닉네임/이메일 입력값은 `localStorage('race-player')` 에 저장해 다음 판에 프리필
- 제출 성공 시: "Your best: Xs · Rank #N" + 리더보드 top 10 표시
- `/api/leaderboard` 가 503 이면 폼을 숨기고 기록/Retry 만 표시 (게임은 저장 없이 동작)
- RaceGame 의 기존 오버레이 내부를 이 컴포넌트로 교체

## 검증

- `lib/game/score.test.ts`: 검증 규칙 단위 테스트 (정상/이메일 오형식/닉네임 길이/시간 범위/타입 오류)
- 빌드 + 미설정(503) 상태에서 브라우저 확인: 게임 정상, 저장 UI 숨김
- Supabase 연결 후 e2e (제출 → 순위 → 리더보드) 는 사용자 프로젝트 생성 후 확인

## 제외 (YAGNI)

- 레이트리밋/봇 방어, 이메일 인증 (이벤트 전 별도 검토)
- 리더보드 페이지네이션, 기간별 랭킹
- 닉네임 중복 처리 (email 기준 기록이므로 표시만 중복될 수 있음 — 허용)
