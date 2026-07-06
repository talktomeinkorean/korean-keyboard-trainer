# 한글 타자 연습기 (Hangul Typing Tutor) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 한글 글자는 알지만 두벌식 자판 위치를 모르는 외국인이, 영문 키보드만으로 한글 자판 위치를 단계적으로 익히는 웹 타자 연습기를 만든다.

**Architecture:** Next.js(App Router) 단일 프론트엔드. 사용자의 물리 키 입력(`event.code`)을 직접 두벌식 자모로 매핑하고 es-hangul로 음절을 합성하므로 OS 한글 IME가 필요 없다. 순수 로직(키맵·조합엔진·커리큘럼·진행률 저장)은 React와 분리해 단위 테스트하고, React 훅과 컴포넌트가 그 위에 얹힌다. 진행률은 localStorage에 저장하되, 인터페이스로 추상화해 나중에 서버/DB로 교체할 수 있게 둔다.

**Tech Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · es-hangul · Vitest · @testing-library/react · Vercel

> **참고 — 스펙 문서:** `docs/superpowers/specs/2026-06-25-hangul-typing-tutor-design.md`. 확장 이음새(쌍자음=데이터 추가 / 랭킹=인터페이스·결과계약·익명id)는 §9 참고.

---

## File Structure

| 파일 | 책임 |
|------|------|
| `lib/keyboard/dubeolsik.ts` | 물리 키(`KeyR` 등) → 두벌식 자모/손가락/타입 키맵. 키보드 렌더링·조합이 공유하는 단일 출처 |
| `lib/keyboard/types.ts` | `KeyDef`, `Finger`, `KeyType` 타입 정의 |
| `lib/hangul/composer.ts` | 자모 시퀀스를 받아 현재 조합 문자열을 만드는 순수 함수 (es-hangul 래퍼) |
| `lib/curriculum/types.ts` | `Lesson`, `Stage` 타입 |
| `lib/curriculum/lessons.ts` | 단계형 레슨 데이터 |
| `lib/progress/types.ts` | `LessonResult`, `ProgressStore` 인터페이스 (미래 DB 계약) |
| `lib/progress/localStore.ts` | `LocalProgressStore` — localStorage 구현체 + 익명 userId 발급 |
| `lib/session/useLessonSession.ts` | 한 레슨 진행 오케스트레이션 훅 |
| `components/Keyboard.tsx` | 가상 두벌식 키보드, 다음 키·손가락 강조 |
| `components/TypingLine.tsx` | 완료/현재/남은 글자 표시 |
| `components/StatsBar.tsx` | 타수·정확도·진행률 |
| `components/NextKeyHint.tsx` | "press R (ㄱ) · 검지" 안내 |
| `components/ResultOverlay.tsx` | 레슨 완료 결과 오버레이 |
| `app/page.tsx` | 홈: 레슨 목록 + 진행률 |
| `app/lesson/[id]/page.tsx` | 연습 화면 |
| `app/lesson/[id]/LessonPlayer.tsx` | 연습 화면 클라이언트 컴포넌트 |

---

## Task 0: 프로젝트 스캐폴딩 & 테스트 환경

**Files:**
- Create: 프로젝트 전체 (Next.js 스캐폴드)
- Create: `vitest.config.ts`, `vitest.setup.ts`

- [ ] **Step 1: Next.js 앱 생성 (현재 폴더에)**

현재 폴더(`~/Desktop/hangul-typing-app`)에 이미 `.git`, `docs/`, `.gitignore`가 있으므로, 빈 디렉터리 요구를 피하려고 임시 폴더에 생성 후 병합한다.

```bash
cd ~/Desktop/hangul-typing-app
npx create-next-app@latest .tmp-next --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --no-turbopack --use-npm
# .tmp-next 내용을 현재 폴더로 이동 (기존 .git/.gitignore/docs 유지)
rsync -a --exclude='.git' --exclude='.gitignore' .tmp-next/ ./
rm -rf .tmp-next
```

Expected: `app/`, `package.json`, `tsconfig.json`, `tailwind.config.ts` 생성. 기존 `docs/`, `.gitignore` 보존.

- [ ] **Step 2: 의존성 설치**

```bash
npm install es-hangul
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

- [ ] **Step 3: Vitest 설정 작성**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

Create `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: package.json 에 test 스크립트 추가**

`package.json` 의 `"scripts"` 에 추가:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: 동작 확인용 임시 테스트**

Create `lib/_smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: 테스트 실행**

Run: `npm test`
Expected: PASS (1 passed)

- [ ] **Step 7: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공 (Next.js 기본 페이지)

- [ ] **Step 8: 스모크 테스트 삭제 후 커밋**

```bash
rm lib/_smoke.test.ts
git add -A
git commit -m "chore: Next.js + Tailwind + Vitest 스캐폴딩"
```

---

## Task 1: 키보드 타입 & 두벌식 키맵

**Files:**
- Create: `lib/keyboard/types.ts`
- Create: `lib/keyboard/dubeolsik.ts`
- Test: `lib/keyboard/dubeolsik.test.ts`

- [ ] **Step 1: 타입 정의**

Create `lib/keyboard/types.ts`:

```typescript
export type KeyType = 'consonant' | 'vowel';

export type Finger =
  | 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index'
  | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky';

export interface KeyDef {
  /** KeyboardEvent.code, e.g. "KeyR" */
  code: string;
  /** 기본(비-shift) 자모 */
  jamo: string;
  /** shift 조합 자모 (쌍자음/ㅒㅖ). MVP 입력 처리에는 미사용 — 확장 이음새(스펙 §9.1) */
  shift?: string;
  type: KeyType;
  finger: Finger;
}
```

- [ ] **Step 2: 실패하는 테스트 작성 (키맵 완전성)**

Create `lib/keyboard/dubeolsik.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { DUBEOLSIK, keyByCode, keyByJamo } from './dubeolsik';

describe('DUBEOLSIK keymap', () => {
  it('14개 기본 자음과 10개 기본 모음, 총 24개 기본 키를 매핑한다', () => {
    const consonants = DUBEOLSIK.filter((k) => k.type === 'consonant');
    const vowels = DUBEOLSIK.filter((k) => k.type === 'vowel');
    expect(consonants).toHaveLength(14);
    expect(vowels).toHaveLength(10);
  });

  it('대표 키들을 올바른 자모로 매핑한다', () => {
    expect(keyByCode('KeyR')?.jamo).toBe('ㄱ');
    expect(keyByCode('KeyK')?.jamo).toBe('ㅏ');
    expect(keyByCode('KeyD')?.jamo).toBe('ㅇ');
    expect(keyByCode('KeyS')?.jamo).toBe('ㄴ');
  });

  it('자모로 키를 역조회할 수 있다', () => {
    expect(keyByJamo('ㄱ')?.code).toBe('KeyR');
    expect(keyByJamo('ㅏ')?.code).toBe('KeyK');
  });

  it('모든 code 가 유일하다', () => {
    const codes = DUBEOLSIK.map((k) => k.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('shift 항목(쌍자음/ㅒㅖ)이 이음새로 채워져 있다', () => {
    expect(keyByCode('KeyR')?.shift).toBe('ㄲ');
    expect(keyByCode('KeyO')?.shift).toBe('ㅒ');
  });
});
```

- [ ] **Step 3: 테스트 실행 → 실패 확인**

Run: `npx vitest run lib/keyboard/dubeolsik.test.ts`
Expected: FAIL ("Cannot find module './dubeolsik'")

- [ ] **Step 4: 키맵 구현**

Create `lib/keyboard/dubeolsik.ts`:

```typescript
import { KeyDef } from './types';

// 두벌식 표준. 왼손=자음(주황), 오른손=모음(초록).
// finger 는 물리 위치 기준이라 B(ㅠ)처럼 type=vowel 이지만 left-index 인 예외가 존재한다.
export const DUBEOLSIK: KeyDef[] = [
  // 상단 자음
  { code: 'KeyQ', jamo: 'ㅂ', shift: 'ㅃ', type: 'consonant', finger: 'left-pinky' },
  { code: 'KeyW', jamo: 'ㅈ', shift: 'ㅉ', type: 'consonant', finger: 'left-ring' },
  { code: 'KeyE', jamo: 'ㄷ', shift: 'ㄸ', type: 'consonant', finger: 'left-middle' },
  { code: 'KeyR', jamo: 'ㄱ', shift: 'ㄲ', type: 'consonant', finger: 'left-index' },
  { code: 'KeyT', jamo: 'ㅅ', shift: 'ㅆ', type: 'consonant', finger: 'left-index' },
  // 상단 모음
  { code: 'KeyY', jamo: 'ㅛ', type: 'vowel', finger: 'right-index' },
  { code: 'KeyU', jamo: 'ㅕ', type: 'vowel', finger: 'right-index' },
  { code: 'KeyI', jamo: 'ㅑ', type: 'vowel', finger: 'right-middle' },
  { code: 'KeyO', jamo: 'ㅐ', shift: 'ㅒ', type: 'vowel', finger: 'right-ring' },
  { code: 'KeyP', jamo: 'ㅔ', shift: 'ㅖ', type: 'vowel', finger: 'right-pinky' },
  // 홈로우 자음
  { code: 'KeyA', jamo: 'ㅁ', type: 'consonant', finger: 'left-pinky' },
  { code: 'KeyS', jamo: 'ㄴ', type: 'consonant', finger: 'left-ring' },
  { code: 'KeyD', jamo: 'ㅇ', type: 'consonant', finger: 'left-middle' },
  { code: 'KeyF', jamo: 'ㄹ', type: 'consonant', finger: 'left-index' },
  { code: 'KeyG', jamo: 'ㅎ', type: 'consonant', finger: 'left-index' },
  // 홈로우 모음
  { code: 'KeyH', jamo: 'ㅗ', type: 'vowel', finger: 'right-index' },
  { code: 'KeyJ', jamo: 'ㅓ', type: 'vowel', finger: 'right-index' },
  { code: 'KeyK', jamo: 'ㅏ', type: 'vowel', finger: 'right-middle' },
  { code: 'KeyL', jamo: 'ㅣ', type: 'vowel', finger: 'right-ring' },
  // 하단 자음
  { code: 'KeyZ', jamo: 'ㅋ', type: 'consonant', finger: 'left-pinky' },
  { code: 'KeyX', jamo: 'ㅌ', type: 'consonant', finger: 'left-ring' },
  { code: 'KeyC', jamo: 'ㅊ', type: 'consonant', finger: 'left-middle' },
  { code: 'KeyV', jamo: 'ㅍ', type: 'consonant', finger: 'left-index' },
  // 하단 모음
  { code: 'KeyB', jamo: 'ㅠ', type: 'vowel', finger: 'left-index' },
  { code: 'KeyN', jamo: 'ㅜ', type: 'vowel', finger: 'right-index' },
  { code: 'KeyM', jamo: 'ㅡ', type: 'vowel', finger: 'right-index' },
];

const byCode = new Map(DUBEOLSIK.map((k) => [k.code, k]));
const byJamo = new Map(DUBEOLSIK.map((k) => [k.jamo, k]));

export function keyByCode(code: string): KeyDef | undefined {
  return byCode.get(code);
}

export function keyByJamo(jamo: string): KeyDef | undefined {
  return byJamo.get(jamo);
}
```

> 검증: 자음 14개(ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ), 모음 10개(ㅏㅐㅑㅓㅔㅕㅗㅛㅜㅠㅡㅣ 중 단순키 = ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣㅐㅔ... 주의: 위 표에 모음 키는 12개다). **테스트의 vowel 개수를 실제 표와 맞춰야 한다 — 아래 Step 5에서 보정.**

- [ ] **Step 5: 테스트의 모음 개수 보정 후 재실행**

`dubeolsik.test.ts` 의 첫 테스트를 실제 표(자음 14, 모음 12)에 맞게 수정:

```typescript
  it('14개 기본 자음과 12개 기본 모음, 총 26개 기본 키를 매핑한다', () => {
    const consonants = DUBEOLSIK.filter((k) => k.type === 'consonant');
    const vowels = DUBEOLSIK.filter((k) => k.type === 'vowel');
    expect(consonants).toHaveLength(14);
    expect(vowels).toHaveLength(12);
    expect(DUBEOLSIK).toHaveLength(26);
  });
```

Run: `npx vitest run lib/keyboard/dubeolsik.test.ts`
Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add lib/keyboard
git commit -m "feat: 두벌식 키맵 + 타입 (shift 이음새 포함)"
```

---

## Task 2: 한글 조합 엔진 (composer)

es-hangul 의 `assemble(jamo[])` 가 받침 이동·복합모음·겹받침을 모두 처리하므로, composer 는 자모 시퀀스를 보관하고 매번 `assemble` 로 표시 문자열을 만드는 얇은 래퍼다.

**Files:**
- Create: `lib/hangul/composer.ts`
- Test: `lib/hangul/composer.test.ts`

- [ ] **Step 1: es-hangul API 확인**

Run: `node -e "const h=require('es-hangul'); console.log(h.assemble(['ㅎ','ㅏ','ㄴ','ㄱ','ㅡ','ㄹ']))"`
Expected 출력: `한글`

> 출력이 다르면(패키지 버전 차이) `assemble` 시그니처를 `node -e "console.log(Object.keys(require('es-hangul')))"` 로 확인하고 아래 구현의 import 를 맞춘다.

- [ ] **Step 2: 실패하는 테스트 작성**

Create `lib/hangul/composer.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { createComposer } from './composer';

describe('createComposer', () => {
  it('초성+중성 을 한 음절로 합성한다', () => {
    const c = createComposer();
    c.push('ㄱ');
    c.push('ㅏ');
    expect(c.text()).toBe('가');
  });

  it('받침을 붙인다', () => {
    const c = createComposer();
    ['ㄱ', 'ㅏ', 'ㄴ'].forEach((j) => c.push(j));
    expect(c.text()).toBe('간');
  });

  it('받침 뒤 모음이 오면 다음 글자로 이동한다 (간+ㅏ → 가나)', () => {
    const c = createComposer();
    ['ㄱ', 'ㅏ', 'ㄴ', 'ㅏ'].forEach((j) => c.push(j));
    expect(c.text()).toBe('가나');
  });

  it('복합모음을 합성한다 (ㄱ ㅗ ㅏ → 과)', () => {
    const c = createComposer();
    ['ㄱ', 'ㅗ', 'ㅏ'].forEach((j) => c.push(j));
    expect(c.text()).toBe('과');
  });

  it('단어를 합성한다 (안녕)', () => {
    const c = createComposer();
    ['ㅇ', 'ㅏ', 'ㄴ', 'ㄴ', 'ㅕ', 'ㅇ'].forEach((j) => c.push(j));
    expect(c.text()).toBe('안녕');
  });

  it('pop 으로 마지막 자모를 되돌린다', () => {
    const c = createComposer();
    ['ㄱ', 'ㅏ', 'ㄴ'].forEach((j) => c.push(j));
    c.pop();
    expect(c.text()).toBe('가');
  });

  it('reset 으로 비운다', () => {
    const c = createComposer();
    c.push('ㄱ');
    c.reset();
    expect(c.text()).toBe('');
  });
});
```

- [ ] **Step 3: 테스트 실행 → 실패 확인**

Run: `npx vitest run lib/hangul/composer.test.ts`
Expected: FAIL ("Cannot find module './composer'")

- [ ] **Step 4: composer 구현**

Create `lib/hangul/composer.ts`:

```typescript
import { assemble } from 'es-hangul';

export interface Composer {
  push(jamo: string): void;
  pop(): void;
  reset(): void;
  /** 현재까지 조합된 표시 문자열 */
  text(): string;
  /** 입력된 자모 시퀀스 (디버그/테스트용) */
  jamos(): readonly string[];
}

export function createComposer(): Composer {
  let seq: string[] = [];
  return {
    push(jamo) {
      seq.push(jamo);
    },
    pop() {
      seq.pop();
    },
    reset() {
      seq = [];
    },
    text() {
      if (seq.length === 0) return '';
      return assemble(seq);
    },
    jamos() {
      return seq;
    },
  };
}
```

- [ ] **Step 5: 테스트 실행 → 통과 확인**

Run: `npx vitest run lib/hangul/composer.test.ts`
Expected: PASS (7 passed)

> 만약 '과'(복합모음) 케이스가 실패하면 es-hangul 버전이 두 모음 합성을 다르게 처리하는 것이다. 그 경우 해당 테스트의 기대값을 `node -e` 로 실제 확인한 값으로 맞추고, 주석으로 사유를 남긴다.

- [ ] **Step 6: 커밋**

```bash
git add lib/hangul
git commit -m "feat: es-hangul 기반 조합 엔진(composer)"
```

---

## Task 3: 커리큘럼 데이터

**Files:**
- Create: `lib/curriculum/types.ts`
- Create: `lib/curriculum/lessons.ts`
- Test: `lib/curriculum/lessons.test.ts`

- [ ] **Step 1: 타입 정의**

Create `lib/curriculum/types.ts`:

```typescript
export type Stage = 'consonant' | 'vowel' | 'syllable' | 'word' | 'sentence';

export interface Lesson {
  id: string;
  stage: Stage;
  title: string;
  /** 칠 대상 목록. 각 항목은 한 줄(한 글자~짧은 문장) */
  items: string[];
}
```

- [ ] **Step 2: 실패하는 테스트 작성**

Create `lib/curriculum/lessons.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { LESSONS, getLesson } from './lessons';

describe('LESSONS', () => {
  it('5개 단계가 모두 최소 1개 이상의 레슨을 가진다', () => {
    const stages = new Set(LESSONS.map((l) => l.stage));
    expect(stages).toEqual(
      new Set(['consonant', 'vowel', 'syllable', 'word', 'sentence']),
    );
  });

  it('레슨 id 가 유일하다', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('모든 레슨이 비어있지 않은 items 를 가진다', () => {
    for (const l of LESSONS) {
      expect(l.items.length).toBeGreaterThan(0);
      expect(l.items.every((i) => i.length > 0)).toBe(true);
    }
  });

  it('id 로 레슨을 조회한다', () => {
    expect(getLesson(LESSONS[0].id)?.id).toBe(LESSONS[0].id);
    expect(getLesson('does-not-exist')).toBeUndefined();
  });
});
```

- [ ] **Step 3: 테스트 실행 → 실패 확인**

Run: `npx vitest run lib/curriculum/lessons.test.ts`
Expected: FAIL ("Cannot find module './lessons'")

- [ ] **Step 4: 데이터 구현**

Create `lib/curriculum/lessons.ts`:

```typescript
import { Lesson } from './types';

export const LESSONS: Lesson[] = [
  // 1. 기초 자음 (홈로우 우선)
  { id: 'c1', stage: 'consonant', title: '자음 1 · 홈로우', items: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅁ', 'ㄴ', 'ㅇ'] },
  { id: 'c2', stage: 'consonant', title: '자음 2 · 상단', items: ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㄱ', 'ㄷ', 'ㅂ'] },
  { id: 'c3', stage: 'consonant', title: '자음 3 · 하단', items: ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅋ', 'ㅊ', 'ㅌ', 'ㅍ'] },
  // 2. 기초 모음
  { id: 'v1', stage: 'vowel', title: '모음 1 · 기본', items: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ', 'ㅏ', 'ㅗ'] },
  { id: 'v2', stage: 'vowel', title: '모음 2 · y계열', items: ['ㅑ', 'ㅕ', 'ㅛ', 'ㅠ', 'ㅐ', 'ㅔ', 'ㅑ', 'ㅔ'] },
  // 3. 자모 조합
  { id: 's1', stage: 'syllable', title: '조합 1', items: ['가', '나', '다', '라', '마', '바', '사', '아'] },
  { id: 's2', stage: 'syllable', title: '조합 2 · 받침', items: ['간', '달', '곰', '술', '밥', '눈', '문', '발'] },
  // 4. 단어
  { id: 'w1', stage: 'word', title: '단어 1', items: ['한국', '사람', '학교', '친구', '음악', '시간'] },
  { id: 'w2', stage: 'word', title: '단어 2', items: ['안녕', '커피', '주말', '여행', '사랑', '행복'] },
  // 5. 짧은 문장
  { id: 'st1', stage: 'sentence', title: '문장 1', items: ['안녕하세요', '한국어 배우기', '만나서 반가워요'] },
  { id: 'st2', stage: 'sentence', title: '문장 2', items: ['오늘 날씨 좋아요', '커피 한 잔 주세요', '한국 음악 좋아해요'] },
];

const byId = new Map(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: string): Lesson | undefined {
  return byId.get(id);
}
```

- [ ] **Step 5: 테스트 실행 → 통과 확인**

Run: `npx vitest run lib/curriculum/lessons.test.ts`
Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add lib/curriculum
git commit -m "feat: 단계형 커리큘럼 데이터"
```

---

## Task 4: 진행률 저장 (인터페이스 + localStorage 구현체)

스펙 §9.2 의 이음새: `ProgressStore` 인터페이스를 **async** 로 두고, `LessonResult` 를 공용 계약으로 고정하며, 익명 `userId` 를 발급한다.

**Files:**
- Create: `lib/progress/types.ts`
- Create: `lib/progress/localStore.ts`
- Test: `lib/progress/localStore.test.ts`

- [ ] **Step 1: 타입 & 인터페이스 정의**

Create `lib/progress/types.ts`:

```typescript
/** 미래 DB/랭킹과의 공용 계약. 모양을 바꾸지 말 것. */
export interface LessonResult {
  lessonId: string;
  /** 분당 타수 (keystrokes per minute) */
  wpm: number;
  /** 0~100 */
  accuracy: number;
  /** epoch ms */
  completedAt: number;
}

export interface ProgressStore {
  /** 익명 사용자 식별자 (없으면 발급해 보관) */
  getUserId(): Promise<string>;
  /** 레슨 결과 저장 — 기존보다 좋은 기록이면 갱신 */
  saveResult(result: LessonResult): Promise<void>;
  /** 레슨별 최고 기록 (없으면 null) */
  getBest(lessonId: string): Promise<LessonResult | null>;
  /** 완료한 레슨 id 집합 */
  getCompletedLessonIds(): Promise<string[]>;
}
```

- [ ] **Step 2: 실패하는 테스트 작성**

Create `lib/progress/localStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { LocalProgressStore } from './localStore';

describe('LocalProgressStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('userId 를 발급하고 같은 값을 반복 반환한다', async () => {
    const store = new LocalProgressStore();
    const id1 = await store.getUserId();
    const id2 = await store.getUserId();
    expect(id1).toBeTruthy();
    expect(id1).toBe(id2);
  });

  it('결과를 저장하고 최고 기록을 반환한다', async () => {
    const store = new LocalProgressStore();
    await store.saveResult({ lessonId: 'c1', wpm: 100, accuracy: 90, completedAt: 1 });
    const best = await store.getBest('c1');
    expect(best?.wpm).toBe(100);
  });

  it('더 좋은 기록(높은 타수)만 갱신한다', async () => {
    const store = new LocalProgressStore();
    await store.saveResult({ lessonId: 'c1', wpm: 100, accuracy: 90, completedAt: 1 });
    await store.saveResult({ lessonId: 'c1', wpm: 80, accuracy: 95, completedAt: 2 });
    expect((await store.getBest('c1'))?.wpm).toBe(100);
    await store.saveResult({ lessonId: 'c1', wpm: 120, accuracy: 92, completedAt: 3 });
    expect((await store.getBest('c1'))?.wpm).toBe(120);
  });

  it('완료한 레슨 id 목록을 반환한다', async () => {
    const store = new LocalProgressStore();
    await store.saveResult({ lessonId: 'c1', wpm: 100, accuracy: 90, completedAt: 1 });
    await store.saveResult({ lessonId: 'v1', wpm: 90, accuracy: 88, completedAt: 2 });
    const ids = await store.getCompletedLessonIds();
    expect(new Set(ids)).toEqual(new Set(['c1', 'v1']));
  });

  it('없는 레슨의 최고 기록은 null', async () => {
    const store = new LocalProgressStore();
    expect(await store.getBest('nope')).toBeNull();
  });
});
```

- [ ] **Step 3: 테스트 실행 → 실패 확인**

Run: `npx vitest run lib/progress/localStore.test.ts`
Expected: FAIL ("Cannot find module './localStore'")

- [ ] **Step 4: 구현**

Create `lib/progress/localStore.ts`:

```typescript
import { LessonResult, ProgressStore } from './types';

const USER_KEY = 'htt.userId';
const RESULTS_KEY = 'htt.results';

type ResultMap = Record<string, LessonResult>;

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 시크릿 모드 등 — 저장 생략 (연습은 계속 동작)
  }
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'u-' + Math.abs(hashNow()).toString(36);
}

// Math.random 없이 시간 기반 폴백 (crypto 없는 환경 대비)
function hashNow(): number {
  const s = String(performance.now()) + navigator.userAgent;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export class LocalProgressStore implements ProgressStore {
  async getUserId(): Promise<string> {
    let id = safeGet(USER_KEY);
    if (!id) {
      id = randomId();
      safeSet(USER_KEY, id);
    }
    return id;
  }

  private readResults(): ResultMap {
    const raw = safeGet(RESULTS_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as ResultMap;
    } catch {
      return {};
    }
  }

  async saveResult(result: LessonResult): Promise<void> {
    const map = this.readResults();
    const prev = map[result.lessonId];
    if (!prev || result.wpm > prev.wpm) {
      map[result.lessonId] = result;
      safeSet(RESULTS_KEY, JSON.stringify(map));
    }
  }

  async getBest(lessonId: string): Promise<LessonResult | null> {
    return this.readResults()[lessonId] ?? null;
  }

  async getCompletedLessonIds(): Promise<string[]> {
    return Object.keys(this.readResults());
  }
}
```

- [ ] **Step 5: 테스트 실행 → 통과 확인**

Run: `npx vitest run lib/progress/localStore.test.ts`
Expected: PASS (5 passed)

- [ ] **Step 6: 커밋**

```bash
git add lib/progress
git commit -m "feat: 진행률 저장 (ProgressStore 인터페이스 + localStorage 구현, 랭킹 이음새)"
```

---

## Task 5: 레슨 진행 훅 (useLessonSession)

한 레슨의 상태 기계: 현재 타깃 인덱스, composer 로 만든 입력, 정확도/타수, 완료 여부.

**Files:**
- Create: `lib/session/useLessonSession.ts`
- Test: `lib/session/useLessonSession.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

Create `lib/session/useLessonSession.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLessonSession } from './useLessonSession';

// 시간 의존(타수)을 고정하기 위해 now 주입
function makeNow() {
  let t = 0;
  return () => (t += 1000); // 호출마다 1초 경과
}

describe('useLessonSession', () => {
  it('정확한 키 입력으로 한 항목을 완성하면 다음 항목으로 진행한다', () => {
    const { result } = renderHook(() =>
      useLessonSession({ items: ['가', '나'], now: makeNow() }),
    );

    expect(result.current.currentItem).toBe('가');

    act(() => result.current.handleKey('KeyR')); // ㄱ
    act(() => result.current.handleKey('KeyK')); // ㅏ → '가' 완성

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentItem).toBe('나');
    expect(result.current.errorCount).toBe(0);
  });

  it('틀린 키는 진행하지 않고 오류로 집계한다', () => {
    const { result } = renderHook(() =>
      useLessonSession({ items: ['가'], now: makeNow() }),
    );
    act(() => result.current.handleKey('KeyR')); // ㄱ (맞음)
    act(() => result.current.handleKey('KeyS')); // ㄴ (가→간, 기대 '가' 와 불일치)
    expect(result.current.errorCount).toBe(1);
    // 잘못된 입력은 롤백되어 typed 가 여전히 '가' 진행 상태
    expect(result.current.typed).toBe('가');
  });

  it('모든 항목 완성 시 isComplete 와 정확도를 계산한다', () => {
    const { result } = renderHook(() =>
      useLessonSession({ items: ['가'], now: makeNow() }),
    );
    act(() => result.current.handleKey('KeyR'));
    act(() => result.current.handleKey('KeyK'));
    expect(result.current.isComplete).toBe(true);
    expect(result.current.accuracy).toBe(100);
  });

  it('다음에 눌러야 할 키(code)를 알려준다', () => {
    const { result } = renderHook(() =>
      useLessonSession({ items: ['가'], now: makeNow() }),
    );
    expect(result.current.nextCode).toBe('KeyR'); // 가 의 첫 자모 ㄱ
    act(() => result.current.handleKey('KeyR'));
    expect(result.current.nextCode).toBe('KeyK'); // 다음 ㅏ
  });
});
```

> `nextCode` 계산은 "타깃 항목을 disassemble 한 자모 시퀀스 중, 이미 올바르게 입력된 개수 다음 자모"를 키맵으로 역조회한다.

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run lib/session/useLessonSession.test.tsx`
Expected: FAIL ("Cannot find module './useLessonSession'")

- [ ] **Step 3: 구현**

Create `lib/session/useLessonSession.ts`:

```typescript
'use client';

import { useMemo, useRef, useState } from 'react';
import { disassemble } from 'es-hangul';
import { keyByCode, keyByJamo } from '@/lib/keyboard/dubeolsik';
import { createComposer } from '@/lib/hangul/composer';

interface Options {
  items: string[];
  /** 타수 계산용 시각 주입 (테스트에서 고정). 기본은 Date.now */
  now?: () => number;
}

export interface LessonSessionState {
  currentIndex: number;
  currentItem: string;
  /** 현재 항목에서 사용자가 입력한 표시 문자열 */
  typed: string;
  /** 다음에 눌러야 할 키 code (없으면 null) */
  nextCode: string | null;
  errorCount: number;
  keystrokes: number;
  accuracy: number; // 0~100
  wpm: number;      // 분당 타수
  isComplete: boolean;
  handleKey(code: string): void;
}

export function useLessonSession({ items, now = () => Date.now() }: Options): LessonSessionState {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const composerRef = useRef(createComposer());
  const startRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  const currentItem = items[index] ?? '';

  // 타깃 항목을 자모 시퀀스로 분해
  const targetJamos = useMemo(() => disassemble(currentItem).split(''), [currentItem]);

  // 현재까지 올바르게 입력된 자모 개수
  const correctJamoCount = composerRef.current.jamos().length;

  const nextCode = useMemo(() => {
    const nextJamo = targetJamos[correctJamoCount];
    if (!nextJamo) return null;
    return keyByJamo(nextJamo)?.code ?? null;
    // correctJamoCount 는 typed 변화에 따라 재평가되도록 deps 에 typed 포함
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetJamos, typed]);

  function handleKey(code: string) {
    if (isComplete) return;
    const key = keyByCode(code);
    if (!key) return; // 매핑 안 된 키 무시

    if (startRef.current === null) startRef.current = now();
    setKeystrokes((k) => k + 1);

    const composer = composerRef.current;
    composer.push(key.jamo);
    const candidate = composer.text();

    // 타깃의 접두사와 일치해야 올바른 입력
    if (currentItem.startsWith(candidate)) {
      setTyped(candidate);
      if (candidate === currentItem) {
        // 항목 완성
        composer.reset();
        if (index + 1 >= items.length) {
          endRef.current = now();
          setIsComplete(true);
        } else {
          setIndex((i) => i + 1);
          setTyped('');
        }
      }
    } else {
      // 오타 — 롤백
      composer.pop();
      setErrorCount((e) => e + 1);
    }
  }

  const accuracy =
    keystrokes === 0 ? 100 : Math.round(((keystrokes - errorCount) / keystrokes) * 100);

  const wpm = useMemo(() => {
    if (startRef.current === null || endRef.current === null) return 0;
    const minutes = (endRef.current - startRef.current) / 60000;
    if (minutes <= 0) return 0;
    return Math.round(keystrokes / minutes);
  }, [isComplete, keystrokes]);

  return {
    currentIndex: index,
    currentItem,
    typed,
    nextCode,
    errorCount,
    keystrokes,
    accuracy,
    wpm,
    isComplete,
    handleKey,
  };
}
```

> 주의: `disassemble('가')` 는 `'ㄱㅏ'` 를 반환한다(문자열). `.split('')` 로 자모 배열을 얻는다. 겹받침은 `disassemble` 이 `'ㄱㅏㅂㅅ'` 처럼 풀어주므로 키 단위와 일치한다.

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run lib/session/useLessonSession.test.tsx`
Expected: PASS (4 passed)

> 일부 케이스(특히 `nextCode`, 오타 롤백)가 실패하면 `correctJamoCount` 를 `composerRef.current.jamos().length` 대신 별도 state 로 추적해야 할 수 있다. 그 경우 `typedJamoCount` state 를 추가하고 push/pop 시 함께 갱신한다.

- [ ] **Step 5: 커밋**

```bash
git add lib/session
git commit -m "feat: 레슨 진행 훅(useLessonSession)"
```

---

## Task 6: 표시 컴포넌트 (TypingLine · StatsBar · NextKeyHint)

**Files:**
- Create: `components/TypingLine.tsx`, `components/StatsBar.tsx`, `components/NextKeyHint.tsx`
- Test: `components/TypingLine.test.tsx`

- [ ] **Step 1: TypingLine 실패 테스트**

Create `components/TypingLine.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingLine } from './TypingLine';

describe('TypingLine', () => {
  it('완료 텍스트와 남은 텍스트를 구분 표시한다', () => {
    render(<TypingLine target="한국어" typed="한국" />);
    expect(screen.getByTestId('done')).toHaveTextContent('한국');
    expect(screen.getByTestId('todo')).toHaveTextContent('어');
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run components/TypingLine.test.tsx`
Expected: FAIL ("Cannot find module './TypingLine'")

- [ ] **Step 3: TypingLine 구현**

Create `components/TypingLine.tsx`:

```typescript
interface Props {
  target: string;
  typed: string;
}

export function TypingLine({ target, typed }: Props) {
  const done = target.startsWith(typed) ? typed : '';
  const todo = target.slice(done.length);
  return (
    <div className="text-4xl tracking-widest font-medium">
      <span data-testid="done" className="text-emerald-500">{done}</span>
      <span data-testid="todo" className="text-gray-400">{todo}</span>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run components/TypingLine.test.tsx`
Expected: PASS

- [ ] **Step 5: StatsBar 구현 (테스트 불필요한 표시 전용)**

Create `components/StatsBar.tsx`:

```typescript
interface Props {
  wpm: number;
  accuracy: number;
  index: number;
  total: number;
}

export function StatsBar({ wpm, accuracy, index, total }: Props) {
  return (
    <div className="flex gap-6 text-sm">
      <div><b className="block text-xl text-blue-500">{wpm}</b>타/분</div>
      <div><b className="block text-xl text-emerald-500">{accuracy}%</b>정확도</div>
      <div><b className="block text-xl">{index}/{total}</b>진행</div>
    </div>
  );
}
```

- [ ] **Step 6: NextKeyHint 구현**

Create `components/NextKeyHint.tsx`:

```typescript
import { keyByCode } from '@/lib/keyboard/dubeolsik';

const FINGER_KO: Record<string, string> = {
  'left-pinky': '왼손 새끼', 'left-ring': '왼손 약지', 'left-middle': '왼손 중지', 'left-index': '왼손 검지',
  'right-index': '오른손 검지', 'right-middle': '오른손 중지', 'right-ring': '오른손 약지', 'right-pinky': '오른손 새끼',
};

export function NextKeyHint({ code }: { code: string | null }) {
  if (!code) return <div className="h-5" />;
  const key = keyByCode(code);
  if (!key) return <div className="h-5" />;
  const letter = code.replace('Key', '');
  return (
    <div className="text-sm text-gray-500">
      다음 키: <b className="text-blue-500">{letter} ({key.jamo})</b> · {FINGER_KO[key.finger]}
    </div>
  );
}
```

- [ ] **Step 7: 커밋**

```bash
git add components/TypingLine.tsx components/TypingLine.test.tsx components/StatsBar.tsx components/NextKeyHint.tsx
git commit -m "feat: 표시 컴포넌트(TypingLine, StatsBar, NextKeyHint)"
```

---

## Task 7: 가상 키보드 컴포넌트 (Keyboard)

**Files:**
- Create: `components/Keyboard.tsx`
- Test: `components/Keyboard.test.tsx`

- [ ] **Step 1: 실패 테스트**

Create `components/Keyboard.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Keyboard } from './Keyboard';

describe('Keyboard', () => {
  it('26개 키를 렌더링한다', () => {
    render(<Keyboard nextCode={null} />);
    expect(screen.getAllByTestId('kbd-key')).toHaveLength(26);
  });

  it('nextCode 키에 강조 표시를 한다', () => {
    render(<Keyboard nextCode="KeyR" />);
    const next = screen.getByTestId('kbd-key-KeyR');
    expect(next.className).toContain('bg-blue-500');
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run components/Keyboard.test.tsx`
Expected: FAIL ("Cannot find module './Keyboard'")

- [ ] **Step 3: 구현**

Create `components/Keyboard.tsx`:

```typescript
import { DUBEOLSIK } from '@/lib/keyboard/dubeolsik';
import { KeyDef } from '@/lib/keyboard/types';

const ROWS: string[][] = [
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL'],
  ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM'],
];

const byCode = new Map(DUBEOLSIK.map((k) => [k.code, k]));

function keyClasses(k: KeyDef, isNext: boolean): string {
  const base =
    'w-11 h-11 rounded-lg border flex flex-col items-center justify-center text-base select-none';
  const typeBorder = k.type === 'consonant' ? 'border-b-2 border-b-amber-500' : 'border-b-2 border-b-emerald-500';
  if (isNext) return `${base} bg-blue-500 text-white border-blue-500 ring-2 ring-blue-300`;
  return `${base} bg-neutral-800 text-neutral-100 border-white/10 ${typeBorder}`;
}

export function Keyboard({ nextCode }: { nextCode: string | null }) {
  return (
    <div className="flex flex-col gap-1.5 items-center">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1.5">
          {row.map((code) => {
            const k = byCode.get(code)!;
            const isNext = code === nextCode;
            return (
              <div
                key={code}
                data-testid="kbd-key"
                data-testid-key={code}
                {...{ 'data-testid': 'kbd-key' }}
                id={`kbd-key-${code}`}
                className={keyClasses(k, isNext)}
              >
                <span>{k.jamo}</span>
                <span className="text-[9px] opacity-40">{code.replace('Key', '')}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

> 주의: 위 테스트는 `getByTestId('kbd-key-KeyR')` 를 쓴다. 각 키에 **고유** testid 가 필요하므로 구현에서 `data-testid={\`kbd-key-${code}\`}` 와, 개수 검증용 공통 마커를 분리한다. 아래 Step 4 에서 정리한다.

- [ ] **Step 4: testid 정리 (고유 + 개수 마커 양립)**

`Keyboard.tsx` 의 키 `<div>` 를 아래로 교체:

```typescript
              <div
                key={code}
                data-testid={`kbd-key-${code}`}
                data-kbd-key
                className={keyClasses(k, isNext)}
              >
                <span>{k.jamo}</span>
                <span className="text-[9px] opacity-40">{code.replace('Key', '')}</span>
              </div>
```

그리고 `Keyboard.test.tsx` 의 개수 검증을 `data-kbd-key` 속성 기준으로 변경:

```typescript
  it('26개 키를 렌더링한다', () => {
    const { container } = render(<Keyboard nextCode={null} />);
    expect(container.querySelectorAll('[data-kbd-key]')).toHaveLength(26);
  });

  it('nextCode 키에 강조 표시를 한다', () => {
    render(<Keyboard nextCode="KeyR" />);
    expect(screen.getByTestId('kbd-key-KeyR').className).toContain('bg-blue-500');
  });
```

- [ ] **Step 5: 테스트 실행 → 통과 확인**

Run: `npx vitest run components/Keyboard.test.tsx`
Expected: PASS (2 passed)

- [ ] **Step 6: 커밋**

```bash
git add components/Keyboard.tsx components/Keyboard.test.tsx
git commit -m "feat: 가상 두벌식 키보드 컴포넌트"
```

---

## Task 8: 연습 화면 (LessonPlayer + 라우트)

**Files:**
- Create: `app/lesson/[id]/LessonPlayer.tsx`
- Create: `app/lesson/[id]/page.tsx`
- Create: `components/ResultOverlay.tsx`

- [ ] **Step 1: ResultOverlay 구현**

Create `components/ResultOverlay.tsx`:

```typescript
import Link from 'next/link';

interface Props {
  wpm: number;
  accuracy: number;
  onRetry: () => void;
}

export function ResultOverlay({ wpm, accuracy, onRetry }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-2xl p-8 w-80 text-center flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">레슨 완료! 🎉</h2>
        <div className="flex justify-center gap-8">
          <div><b className="block text-2xl text-blue-500">{wpm}</b>타/분</div>
          <div><b className="block text-2xl text-emerald-500">{accuracy}%</b>정확도</div>
        </div>
        <div className="flex gap-2 justify-center mt-2">
          <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-blue-500 text-white">다시</button>
          <Link href="/" className="px-4 py-2 rounded-lg bg-neutral-700 text-white">목록</Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: LessonPlayer 구현 (키 이벤트 캡처 + 저장)**

Create `app/lesson/[id]/LessonPlayer.tsx`:

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/lib/curriculum/types';
import { useLessonSession } from '@/lib/session/useLessonSession';
import { Keyboard } from '@/components/Keyboard';
import { TypingLine } from '@/components/TypingLine';
import { StatsBar } from '@/components/StatsBar';
import { NextKeyHint } from '@/components/NextKeyHint';
import { ResultOverlay } from '@/components/ResultOverlay';
import { LocalProgressStore } from '@/lib/progress/localStore';

const store = new LocalProgressStore();

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const session = useLessonSession({ items: lesson.items });
  const savedRef = useRef(false);

  // 키 입력 캡처 — event.code 사용, 기본 동작 차단(IME 회피)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code.startsWith('Key')) {
        e.preventDefault();
        session.handleKey(e.code);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [session]);

  // 완료 시 1회 저장
  useEffect(() => {
    if (session.isComplete && !savedRef.current) {
      savedRef.current = true;
      void store.saveResult({
        lessonId: lesson.id,
        wpm: session.wpm,
        accuracy: session.accuracy,
        completedAt: Date.now(),
      });
    }
  }, [session.isComplete, session.wpm, session.accuracy, lesson.id]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-lg text-neutral-400">{lesson.title}</h1>
      <StatsBar wpm={session.wpm} accuracy={session.accuracy} index={session.currentIndex} total={lesson.items.length} />
      <TypingLine target={session.currentItem} typed={session.typed} />
      <Keyboard nextCode={session.nextCode} />
      <NextKeyHint code={session.nextCode} />
      <p className="text-xs text-neutral-600">왼손=자음(주황) · 오른손=모음(초록)</p>

      {session.isComplete && (
        <ResultOverlay
          wpm={session.wpm}
          accuracy={session.accuracy}
          onRetry={() => router.refresh()}
        />
      )}
    </main>
  );
}
```

- [ ] **Step 3: 라우트 페이지 구현**

Create `app/lesson/[id]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import { getLesson, LESSONS } from '@/lib/curriculum/lessons';
import { LessonPlayer } from './LessonPlayer';

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

export default function LessonPage({ params }: { params: { id: string } }) {
  const lesson = getLesson(params.id);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
```

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공, `/lesson/[id]` 정적 생성

- [ ] **Step 5: 커밋**

```bash
git add app/lesson components/ResultOverlay.tsx
git commit -m "feat: 연습 화면(LessonPlayer) + 라우트 + 결과 오버레이"
```

---

## Task 9: 홈 화면 (레슨 목록 + 진행률)

**Files:**
- Create: `app/page.tsx` (기존 스캐폴드 덮어쓰기)
- Create: `app/HomeList.tsx`

- [ ] **Step 1: HomeList 구현 (완료 표시 포함)**

Create `app/HomeList.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LESSONS } from '@/lib/curriculum/lessons';
import { LocalProgressStore } from '@/lib/progress/localStore';

const store = new LocalProgressStore();
const STAGE_LABEL: Record<string, string> = {
  consonant: '기초 자음', vowel: '기초 모음', syllable: '자모 조합', word: '단어', sentence: '짧은 문장',
};

export function HomeList() {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    void store.getCompletedLessonIds().then((ids) => setDone(new Set(ids)));
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      {Object.entries(STAGE_LABEL).map(([stage, label]) => (
        <section key={stage} className="flex flex-col gap-2">
          <h2 className="text-sm uppercase tracking-wide text-neutral-500">{label}</h2>
          {LESSONS.filter((l) => l.stage === stage).map((l) => (
            <Link
              key={l.id}
              href={`/lesson/${l.id}`}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700"
            >
              <span>{l.title}</span>
              {done.has(l.id) && <span className="text-emerald-500">✓</span>}
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 홈 페이지 구현**

Replace `app/page.tsx`:

```typescript
import { HomeList } from './HomeList';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8">
      <header className="text-center mt-8">
        <h1 className="text-3xl font-bold">한글 타자 연습 ⌨️</h1>
        <p className="text-neutral-400 mt-2">Learn the Korean keyboard, one key at a time.</p>
      </header>
      <HomeList />
    </main>
  );
}
```

- [ ] **Step 3: 전체 테스트 + 빌드**

Run: `npm test`
Expected: 모든 테스트 PASS

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 4: 로컬 수동 확인**

Run: `npm run dev`
브라우저에서 `http://localhost:3000` 접속 → 레슨 선택 → 영문 키보드로 타이핑 시 한글이 조합되고, 다음 키가 강조되며, 완료 시 결과 오버레이가 뜨는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add app/page.tsx app/HomeList.tsx
git commit -m "feat: 홈 화면(레슨 목록 + 완료 표시)"
```

---

## Task 10: README & Vercel 배포 준비

**Files:**
- Create: `README.md`

- [ ] **Step 1: README 작성**

Create `README.md`:

```markdown
# 한글 타자 연습 (Korean Keyboard Trainer)

영문 키보드만으로 한글 두벌식 자판 위치를 익히는 웹 타자 연습기.
한글 IME 설치가 필요 없습니다 — 물리 키 입력을 직접 두벌식 자모로 조합합니다.

## 개발

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 단위 테스트
npm run build    # 프로덕션 빌드
```

## 기술 스택
Next.js (App Router) · TypeScript · Tailwind CSS · es-hangul · Vitest

## 배포
Vercel 에 연결된 GitHub 레포(`main`) push 시 자동 배포.
백엔드/DB 없음 (진행률은 브라우저 localStorage 에 저장).

설계 문서: `docs/superpowers/specs/`, 구현 계획: `docs/superpowers/plans/`
```

- [ ] **Step 2: 최종 테스트·빌드 확인 후 커밋·푸시**

```bash
npm test && npm run build
git add README.md
git commit -m "docs: README 추가"
git push origin main
```

- [ ] **Step 3: Vercel 연결 (수동, 사용자 작업)**

> Vercel 대시보드에서 `talktomeinkorean/korean-keyboard-trainer` 를 Import → 기본 Next.js 설정으로 Deploy. 또는 `npx vercel` CLI 사용. 이 단계는 사용자가 Vercel 계정으로 진행한다.

---

## Self-Review (계획 작성자 체크 결과)

- **스펙 커버리지:** §2 스택(Task 0) · §3 화면/레이아웃 A(Task 8) · §4 모듈 전부(Task 1~7) · §5 event.code 흐름(Task 5,8) · §6 커리큘럼(Task 3) · §7 에러처리(localStorage 폴백 Task 4, 오타 롤백 Task 5) · §8 테스트(각 Task) · §9.1 쌍자음 이음새(Task 1 shift 필드) · §9.2 랭킹 이음새(Task 4 인터페이스·LessonResult·userId) — 모두 태스크로 매핑됨.
- **플레이스홀더:** 없음. 모든 코드/명령/기대출력 명시.
- **타입 일관성:** `KeyDef`, `Composer`, `Lesson`, `LessonResult`, `ProgressStore`, `LessonSessionState` 시그니처가 사용처와 일치.
- **알려진 리스크:** es-hangul `assemble`/`disassemble` 의 정확한 동작은 Task 2 Step 1 에서 실측 검증 후 진행(버전차 대비 폴백 지시 포함). `useLessonSession` 의 `nextCode`/롤백은 Task 5 Step 4 에 대체 구현 지침 명시.
