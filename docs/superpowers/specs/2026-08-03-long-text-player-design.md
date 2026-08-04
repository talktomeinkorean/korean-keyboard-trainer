# 긴 글 연습 지문 뷰 설계 (한컴타자 레퍼런스)

날짜: 2026-08-03
상태: 승인됨

## 목적

긴글(long_text) 레슨을 "한 줄씩 보기"에서 한컴타자 장문연습식 **지문 전체 뷰**로 전환:
지문의 모든 줄이 보이고, 현재 줄만 강조되며, 진행에 따라 자동 스크롤. 실시간 통계 표시.

## 레퍼런스에서 채택하는 것 / 제외하는 것

- 채택: 줄 나열(원문+입력 줄 쌍), 현재 줄 강조, 이전/다음 줄 구분, 자동 스크롤,
  실시간 통계(진행시간·타수/분·정확도)
- 제외(YAGNI): 도전단계(목표 타수), 키보드 스킨, 포인트, 손모양 가이드, 콘텐츠 드롭다운

## 구성 요소

### 1. 자모 진행 분할 유틸 (lib/hangul/jamoGroups.ts 에 추가)

TypingLine 내부의 "자모 소비량 → 완료/조합 중/남은 글자 분할" 로직을 순수 함수로 추출:

```ts
export interface JamoProgressSplit { done: string; current: string; todo: string }
export function splitByJamoProgress(target: string, typedJamoCount: number): JamoProgressSplit
```

TypingLine 과 신규 PassageView 가 공유. TypingLine 동작은 변하지 않는다 (기존 테스트로 보증).

### 2. PassageView (신규 components/PassageView.tsx)

Props: `{ lines: string[]; currentIndex: number; typedJamoCount: number }`

- 줄 상태:
  - 완료(`i < currentIndex`): 원문 표시 + 초록 체크 (오타 거부 방식이라 완료 = 정타)
  - 현재(`i === currentIndex`): 강조 배경(amber) 원문 줄 + 아래 입력 줄
    (splitByJamoProgress 로 완료=초록/조합 중=주황 + 깜빡이는 캐럿, TypingLine 과 동일 문법)
  - 대기(`i > currentIndex`): 흐리게
- 자동 스크롤: currentIndex 변경 시 현재 줄 `scrollIntoView({ block: 'center' })`
  (jsdom 미지원 대비 옵셔널 호출)
- `data-testid="passage-line-{i}"` + `data-state` 로 테스트

### 3. 실시간 통계 (StatsBar 확장 + LessonPlayer)

- StatsBar 에 옵션 `elapsedSec?: number` 추가 — 있으면 시간 셀 표시
- LessonPlayer: long_text 일 때 500ms tick 으로 경과시간·실시간 타수/분
  (`keystrokes / 경과분`) 계산해 StatsBar 에 전달. 완료 후에는 세션의 최종 wpm 사용

### 4. LessonPlayer 통합

- `lesson.stage === 'long_text'` 이면 TypingLine 대신 PassageView 렌더
  (JamoTrack·확장 키보드·힌트·완료 팝업·기록 저장은 공통 유지)
- 그 외 레슨은 기존 화면 그대로

## 테스트

- splitByJamoProgress: 조합 중/완료/시작 전 분할 (TypingLine 테스트와 동치)
- PassageView: 줄 상태(data-state), 현재 줄 입력부 분할 표시, 캐럿 존재
- StatsBar: elapsedSec 유무 렌더
- 브라우저: txt 레슨에서 지문 전체 표시, 줄 완성 시 다음 줄 강조 이동·자동 스크롤,
  실시간 통계 갱신, 완료 팝업
