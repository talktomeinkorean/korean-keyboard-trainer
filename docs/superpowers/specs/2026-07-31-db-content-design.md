# DB 콘텐츠 전환 설계 (레이스 단어 풀 + 타자연습 레슨)

날짜: 2026-07-31
상태: 승인됨 (사용자: "1, 2번 모두 진행")

## 목적

`practice_texts`(2,166행)를 실제 서비스에 연결:
1. 레이스 게임 단어 풀 — 하드코딩 12단어 → DB vocabulary 998단어
2. 타자연습 — Vocabulary/Short Sentences 레슨을 DB 기반 자동 생성으로 교체,
   Long Text 카테고리(지문 49개)를 오픈

## 데이터 사실 (임포트 결과 기준)

- vocabulary: 998행, level 1~4 (333/306/350/9)
- sentence: 500행, level 1~10 (Core Grammar 레슨 출처)
- long_text: 49행, 지문 하나가 여러 줄(\n 구분), source 에 아티클 제목
  ("TTMIK Stories Level 1 Articles 보리차를 마셔요")
- 문장/지문에 구두점 포함 (. , ? ! 따옴표 등)

## 구두점 처리 (신규 제약)

현 키보드 엔진에는 문장부호 키가 없어 구두점 있는 항목은 완성 불가.

- 키맵에 `Comma(,)` / `Period(.)` 추가 — 실제 두벌식 배열 위치(하단 우측), 화면 키보드에도 표시
- 그 외 키가 없는 문자(? ! " ' 등)는 콘텐츠 로드 시 제거하는 `sanitizeTypable()` 적용
  - 허용: 한글 음절/자모, 공백, `.`, `,`
  - 제거 후 이중 공백 정리. 원본 DB 는 수정하지 않고 표시 단계에서만 정리
- Shift 입력(?, 쌍자음 직접 입력 등)은 이벤트 범위 밖 — 추후 과제

## 구성 요소

### 1. 서버 데이터 접근 (신규 `lib/content/db.ts`, 서버 전용)

- `getTexts(kind)` — practice_texts 조회, `order by level, source, text_korean` (결정적 순서)
- kind 별 `unstable_cache` 1시간(`revalidate: 3600`, tags: ['practice-texts'])
  — 트래픽과 무관하게 Supabase 조회는 시간당 kind 별 1회
- 미설정 시 null 반환 → 호출부 폴백

### 2. 레슨 자동 생성 (신규 `lib/content/lessonGen.ts`, 순수 함수 + 테스트)

- `buildSetLessons(rows, {kind, chunkSize, idPrefix, titlePrefix})`
  — 레벨별로 chunkSize 개씩 세트 분할.
  id: `voc-{level}-{set}` / `sen-{level}-{set}`, title: "Level {n} · Set {m}"
  - vocabulary: 10개/세트, sentence: 5개/세트
- `buildPassageLessons(rows)` — 지문 1개 = 레슨 1개. items = 줄 단위 분할.
  id: `txt-{n}`, title: source 의 "Articles " 뒤 제목 (없으면 "Story {n}")
- 모든 items 는 `sanitizeTypable` 통과. 빈 항목 제거
- 한계(문서화): 세트 분할 순서는 (level, source, text_korean) 정렬 기준 —
  시트 수정 시 세트 구성이 밀릴 수 있음 (진행 체크 어긋남 가능, 허용)

### 3. 카테고리/레슨 라우팅

- `Category` 에 `dbKind?` 추가: vocabulary→'vocabulary', short-sentences→'sentence',
  long-text→'long_text'. consonants-vowels 는 기존 정적 커리큘럼 유지
- 카테고리 페이지: dbKind 있으면 DB 레슨 목록(레벨별 섹션 헤더로 그룹), 없으면 기존 정적 목록.
  DB 미설정/빈 데이터 시 "Coming soon" 동일 처리
- `/lesson/[id]`: 정적 id 우선 조회 → 실패 시 db id 패턴(voc-/sen-/txt-) 해석.
  기존 w1/w2/st1/st2 URL 은 그대로 동작(목록에서만 DB 레슨으로 대체)
- Stage 타입에 'long_text' 추가

### 4. 레이스 단어 풀 (신규 `app/api/race-words/route.ts`)

- vocabulary 의 text_korean 목록을 1시간 캐시 → 요청마다 서버에서 5개 랜덤 추출
  (응답은 no-store, Supabase 조회는 시간당 1회)
- 단어도 `sanitizeTypable` 적용
- `RaceGame`: `/api/race-words` fetch, 실패 시 기존 하드코딩 풀 폴백 (dev/미설정 안전)
- `lib/game/words.ts`: `pickRandom(pool, count)` 로 일반화, 기존 풀은 폴백용 유지

## 테스트

- `sanitizeTypable`: 구두점 제거/보존, 공백 정리
- `lessonGen`: 레벨별 세트 분할, id/title, 지문 줄 분할, 제목 추출
- `pickRandom`: 개수/중복/풀 제한 (기존 pickRaceWords 테스트 이관)
- 키맵/키보드: Comma/Period 추가 반영
- 통합: 브라우저에서 카테고리 목록 → DB 레슨 플레이, 레이스 DB 단어 확인

## 제외 (YAGNI)

- Shift 입력 체계 (?, 쌍자음 물리 입력)
- 레슨 난이도 재편(문장 출처 순 정렬 고도화), 진행률 이전
- 관리자용 콘텐츠 편집 UI
