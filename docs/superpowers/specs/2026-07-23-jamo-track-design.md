# 자모 칩 트랙 (JamoTrack) 설계

날짜: 2026-07-23
상태: 승인됨

## 목적

타자 연습 중 오타를 자모(자음/모음) 단위로 시각적으로 보여준다. 현재 앱은 자모 단위로
판정하지만(`useLessonSession`), 화면에는 어느 자모까지 맞았고 어느 자모를 틀렸는지
표시되지 않는다. 단어 아래에 자모 칩을 나란히 표시해 이를 해결한다.

참고 사례: type.sam.today (음절 내 자모별 색칠). SVG 자모 렌더링 방식은 공수가 커서
제외하고, 자모 칩 표시 방식을 채택한다.

## 범위

- 기존 레슨 화면(`app/lesson/[id]/LessonPlayer.tsx`)의 현재 항목 아래에 JamoTrack 추가.
- 이후 미니게임(별도 프로젝트)에서 동일 컴포넌트를 재사용할 수 있게 독립 컴포넌트로 작성.
- 오타 정책은 현행 유지: 틀린 키는 반영하지 않고 거부하며 `errorCount`만 증가.
  백스페이스 강제 수정은 도입하지 않는다.

## 구성 요소

### 1. 자모 그룹핑 유틸 (신규: `lib/hangul/jamoGroups.ts`)

```ts
/** 항목 문자열을 음절별 자모 그룹으로 분해한다.
 *  예: "아마" → [["ㅇ","ㅏ"], ["ㅁ","ㅏ"]]
 *  한글이 아닌 문자(공백, 문장부호)는 길이 1짜리 그룹으로 그대로 둔다. */
export function toJamoGroups(item: string): string[][]
```

- `es-hangul`의 `disassemble`을 글자 단위로 적용.
- 기존 `useLessonSession.computeTyped`와 동일한 분해 기준을 사용하므로
  자모 인덱스가 세션의 `typedJamoCount`와 1:1 대응한다.

### 2. 세션 훅 확장 (`lib/session/useLessonSession.ts`)

`LessonSessionState`에 노출 추가 (기존 로직 변경 없음):

- `targetJamos: string[]` — 현재 항목의 자모 시퀀스 (내부 `targetJamos` memo를 그대로 노출)
- `typedJamoCount: number` — 맞게 입력된 자모 개수 (내부 state를 그대로 노출)

오류 플래시 트리거는 기존 `errorCount`의 변화를 사용한다 (별도 상태 추가하지 않음).

### 3. JamoTrack 컴포넌트 (신규: `app/lesson/[id]/JamoTrack.tsx`)

Props: `{ item: string; typedJamoCount: number; errorCount: number }`

- `toJamoGroups(item)`으로 음절별 그룹을 만들고, 그룹 사이에 간격을 둬 한 줄로 표시.
- 칩 상태 (전역 자모 인덱스 `i` 기준):
  - `i < typedJamoCount` → 완료: 채워진 스타일
  - `i === typedJamoCount` → 현재: 커서 강조
  - `i > typedJamoCount` → 대기: 흐리게
- 오타 플래시: `errorCount`가 증가하면 현재 칩에 짧은 빨간 깜빡임 애니메이션을 재생.
  (`errorCount`를 key 일부로 사용해 CSS 애니메이션을 재트리거)
- 항목이 바뀌면(`item` 변경) 상태 없이 자연히 초기화된다 (컴포넌트는 무상태).

### 4. LessonPlayer 통합

- 현재 항목 표시 아래에 `<JamoTrack item={...} typedJamoCount={...} errorCount={...} />` 추가.
- 세션 훅에서 노출한 값 전달 외에 기존 코드는 변경하지 않는다.

## 오류 처리

- 한글이 아닌 항목(공백 포함 문장 등): 비한글 문자는 자모 1개짜리 칩으로 표시되며
  세션의 분해 기준과 동일하므로 인덱스가 어긋나지 않는다.
- 항목 완성 직후(`typedJamoCount`가 0으로 리셋되고 다음 항목으로 이동): `item`이 함께
  바뀌므로 칩은 새 항목 기준으로 렌더링된다.

## 테스트

- `lib/hangul/jamoGroups.test.ts`: 단어("아마"), 받침("안녕"), 복합모음("과"),
  비한글 혼합("한 글") 그룹핑 검증. 그룹 평탄화 결과가 `disassemble` 전체 결과와
  일치함을 검증 (세션과의 인덱스 정합성).
- `useLessonSession.test.tsx`: `targetJamos`/`typedJamoCount` 노출 값 검증 추가.
- `JamoTrack` 컴포넌트 테스트: 완료/현재/대기 상태 클래스, 오타 시 플래시 재트리거.

## 제외 (YAGNI)

- SVG 자모별 렌더링(폰트 path 추출) — 미니게임에서 고정 단어 세트로 확정되면
  피그마 수작업 방식으로 별도 검토.
- 백스페이스 강제 수정 모드.
- 모바일 탭 입력에서의 칩 동작 변경 (기존 동작 그대로 따라감).
