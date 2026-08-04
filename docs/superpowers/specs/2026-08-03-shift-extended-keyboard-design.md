# Shift 입력 + 단계별 확장 키보드 설계

날짜: 2026-08-03
상태: 승인됨 (사용자 1번 안: 자모/단어=기본 키보드, 문장/긴글=확장 키보드)

## 배경

- DB 문장/지문에 문장부호(. , ' " ? !)가 있는데 현재 엔진은 일부를 제거(sanitize)로 회피
- 더 근본적인 버그: **Shift 체계가 없어 쌍자음(ㅃㅉㄸㄲㅆ)·ㅒㅖ가 포함된 단어는 완성 불가**
  (키맵의 `shift` 필드는 이음새만 있고 입력 경로 미구현 — 스펙 §9.1)
- 사용자 결정: 느낌표(Shift+1)를 위해 숫자열까지 확장하되, 초급 단계에는 기본 키보드 유지

## 키보드 2단계

| 레슨 stage | layout |
|---|---|
| consonant / vowel / syllable / word (+레이스) | `basic` — 현행 3열 + Space + `,` `.` + **Shift 토글** |
| sentence / long_text | `extended` — basic + 숫자열(1~0) + `'` `?` 키 |

## 키맵 (lib/keyboard/dubeolsik.ts)

- 기존 자모 키의 `shift` 필드(ㅃㅉㄸㄲㅆ, ㅒㅖ)를 입력 경로에 연결
- 숫자열 추가: `Digit1~Digit0`, jamo='1'~'0', shift='!' '@' '#' '$' '%' '^' '&' '*' '(' ')'
  (type: 'digit', finger 표준 배치)
- `Quote`(' / Shift ") , `Slash`(/ / Shift ?) 추가 (type: 'punct')
- 신규 조회: `keyForChar(ch): { key: KeyDef; shift: boolean } | undefined`
  — 기본 자모 우선, 없으면 shift 문자에서 역조회

## 입력 경로

- `useLessonSession.handleKey(code, shift?: boolean)` — shift 이고 `key.shift` 있으면
  그 문자를, 없으면 기본 jamo 를 push (실제 두벌식과 동일: Shift+ㅁ=ㅁ)
- `nextCode` 계산을 `keyForChar` 로 전환, `nextShift: boolean` 노출
  (쌍자음이 다음 자모면 nextCode=해당 키, nextShift=true)
- 물리 키 캡처: `e.shiftKey` 전달. 허용 코드에 `Digit*`, `Quote`, `Slash` 추가
- 화면 키보드: Shift 토글 키(탭 입력용) — 켜면 키캡이 shift 문자로 전환되고,
  키 입력 시 `onKeyPress(code, true)` 후 자동 해제. `nextShift` 면 Shift 키도 강조

## sanitize 완화 (lib/content/sanitize.ts)

- 보존 추가: 숫자 0-9, `.` `,` `'` `"` `?` `!`
- 정규화: 둥근따옴표 ' ' → ', " " → " (키보드로 입력 가능한 형태)
- 그 외 문자는 계속 제거 (예: 물결, 이모지, 영문)

## UI

- `Keyboard` props: `layout?: 'basic' | 'extended'`(기본 basic), `nextShift?: boolean`,
  `onKeyPress?(code, shift)`
- `NextKeyHint`: shift 조합이면 "Shift + Q (ㅃ)" 형태로 표시
- LessonPlayer: `lesson.stage` 가 sentence/long_text 면 extended
- RaceGame: basic (단어) — 쌍자음 단어는 Shift 토글/물리 Shift 로 입력

## 테스트

- keymap: 숫자/문장부호 매핑, keyForChar 역조회(ㅃ→KeyQ+shift, '?'→Slash+shift)
- session: '빠' 완성(KeyQ+shift), nextShift 노출, shift 없는 키에 Shift 눌러도 기본 jamo
- sanitize: ? ! ' " 숫자 보존, 둥근따옴표 정규화, 기타 제거 유지
- Keyboard: layout 별 키 개수, Shift 토글 시 키캡 전환·자동 해제, nextShift 강조
- 브라우저: 쌍자음 단어 레슨, "왜 앉지 않아요?" 문장 완성(Shift+/), 숫자 포함 항목

## 제외

- 한/영 전환, 영문 타이핑 모드
- 실제 IME 연동
