# 레이싱 미니게임 설계

날짜: 2026-07-24
상태: 승인됨

## 목적

랜덤 단어 5개를 타자로 완성할 때마다 러너가 전진해 결승선에 도달하는 레이스 게임.
완주까지 걸린 총 시간이 스코어. 첫 화면에서 게임을 먼저 접하고, 이후 타자연습으로
이동하는 흐름 (10월 이벤트의 코어 게임 프로토타입, 디자인 미확정 → 플레이스홀더 비주얼).

## 라우팅

- `/` : 레이스 게임 (신규 `app/RaceGame.tsx` 를 `app/page.tsx` 에서 렌더)
- `/lessons` : 기존 레슨 목록 이동 (`app/lessons/page.tsx`, 기존 홈 콘텐츠 그대로)
- `components/ResultOverlay.tsx` 의 "All lessons" 링크 `/` → `/lessons` 수정

## 구성 요소

### 1. 단어 선택 (신규: `lib/game/words.ts`)

```ts
/** 게임용 단어 풀 — 현재는 word 단계 레슨(w1/w2) 단어 12개. 추후 외부 데이터로 교체 지점. */
export const RACE_WORD_POOL: string[]
/** 풀에서 중복 없이 count개 랜덤 추출 (Fisher-Yates 셔플 후 슬라이스) */
export function pickRaceWords(count?: number): string[]  // 기본 5
```

- 셔플에 `Math.random` 사용. 테스트에서는 결과의 성질(개수·중복 없음·풀 소속)만 검증.
- 추후 TTMIK 데이터 연동 시 `RACE_WORD_POOL` 공급부만 교체.

### 2. 세션 훅 타이밍 노출 (`lib/session/useLessonSession.ts`)

내부 `startRef`/`endRef` 를 노출만 추가 (로직 변경 없음):

- `startedAt: number | null` — 첫 유효 키 입력 시각
- `finishedAt: number | null` — 마지막 항목 완성 시각

경과시간 = `finishedAt - startedAt`. 진행 중 실시간 타이머는 UI 레벨 interval 로 계산.

### 3. RaceTrack (신규: `components/RaceTrack.tsx`)

Props: `{ progress: number; total: number }` (완성한 단어 수 / 전체)

- 가로 트랙에 `total`개 구간 표시, 러너(🏃)가 `progress` 위치, 끝에 결승선(🏁)
- 완주(`progress === total`) 시 러너가 결승선 칸에 위치
- 플레이스홀더 비주얼 — 디자인 확정 시 이 컴포넌트만 교체
- `data-testid="race-runner"` 를 가진 요소의 위치(구간 인덱스)로 테스트

### 4. RaceGame (신규: `app/RaceGame.tsx`, 클라이언트 컴포넌트)

- 마운트 시 `pickRaceWords(5)` 를 state 초기값으로 1회 실행
- `useLessonSession({ items: words })` 재사용 — 자모 판정·오타 거부·스페이스 모두 상속
- 키 캡처는 LessonPlayer 와 동일 (`Key*` + `Space`, preventDefault)
- 화면: RaceTrack + 경과 타이머(초, 첫 키부터 100ms interval) + TypingLine + JamoTrack
  + Keyboard + NextKeyHint
- 완주 오버레이: 기록(초, 소수 1자리), Retry(새 랜덤 단어로 리셋), "Start typing practice"
  → `/lessons` 링크
- Retry: `pickRaceWords` 재실행 + `session.reset()` — words 가 바뀌므로 key 로 세션 리마운트

## 오류 처리

- 오타: 기존 정책 유지 (틀린 키 거부, errorCount 증가) — 지체 시간이 자연 페널티
- 단어 풀이 5개 미만이면 풀 전체 사용 (pickRaceWords 는 `min(count, pool.length)` 반환)

## 테스트

- `lib/game/words.test.ts`: 개수(5), 중복 없음, 모두 풀에 속함, count > 풀 크기일 때 풀 크기로 제한
- `useLessonSession.test.tsx`: startedAt/finishedAt 노출 (입력 전 null → 첫 키에 startedAt
  → 완료 시 finishedAt, 주입한 now 기준 경과 검증)
- `RaceTrack.test.tsx`: progress 별 러너 위치, 완주 시 결승 칸
- RaceGame 은 통합 성격 → 브라우저 수동 검증 (단어 5개 완주 → 기록 표시 → Retry → /lessons 이동)

## 제외 (YAGNI)

- 스코어 저장/리더보드 (Supabase 연동은 별도 프로젝트)
- 이메일/닉네임 입력
- 단어 세트 공정성 장치 (랜덤 확정, 추후 데이터 연동 시 재검토)
- 레이스 애니메이션/사운드 (디자인 확정 후)
