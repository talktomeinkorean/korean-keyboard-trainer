# JamoTrack (자모 칩 트랙) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 타자 연습 화면에서 현재 단어 아래에 자모 칩을 표시해, 어느 자모까지 맞았고 어느 자모에서 틀렸는지 자모 단위로 보여준다.

**Architecture:** 세션 훅(`useLessonSession`)이 이미 내부에 갖고 있는 자모 진행 상태(`targetJamos`, `typedJamoCount`)를 노출하고, 무거운 로직 없는 표시 전용 컴포넌트 `JamoTrack`이 음절별로 그룹핑된 자모 칩을 렌더링한다. 오타 플래시는 `errorCount` 증가를 감지해 현재 칩을 300ms 빨갛게 표시한다. 기존 판정 로직은 변경하지 않는다.

**Tech Stack:** Next.js(App Router, 클라이언트 컴포넌트), es-hangul `disassemble`, Tailwind CSS v4, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-07-23-jamo-track-design.md`
(스펙과의 차이 1건: 컴포넌트 위치를 `app/lesson/[id]/JamoTrack.tsx` 대신 코드베이스 관례에 맞춰 `components/JamoTrack.tsx`로 한다. TypingLine 등 기존 표시 컴포넌트와 동일한 위치.)

**주의:** 이 저장소의 AGENTS.md에 따라 Next.js API를 새로 쓰기 전에 `node_modules/next/dist/docs/`를 확인해야 하지만, 이 계획은 Next.js 고유 API를 전혀 사용하지 않는다(순수 React 컴포넌트 + 훅 반환값 추가만).

---

## File Structure

- Create: `lib/hangul/jamoGroups.ts` — 음절별 자모 그룹핑 유틸 (순수 함수)
- Create: `lib/hangul/jamoGroups.test.ts`
- Modify: `lib/session/useLessonSession.ts` — `targetJamos`, `typedJamoCount` 노출
- Modify: `lib/session/useLessonSession.test.tsx` — 노출 값 테스트 추가
- Create: `components/JamoTrack.tsx` — 칩 표시 컴포넌트
- Create: `components/JamoTrack.test.tsx`
- Modify: `app/lesson/[id]/LessonPlayer.tsx` — TypingLine 아래에 JamoTrack 추가

---

### Task 1: 자모 그룹핑 유틸 `toJamoGroups`

**Files:**
- Create: `lib/hangul/jamoGroups.ts`
- Test: `lib/hangul/jamoGroups.test.ts`

- [ ] **Step 1: Write the failing test**

`lib/hangul/jamoGroups.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { disassemble } from 'es-hangul';
import { toJamoGroups } from './jamoGroups';

describe('toJamoGroups', () => {
  it('단어를 음절별 자모 그룹으로 분해한다', () => {
    expect(toJamoGroups('아마')).toEqual([
      ['ㅇ', 'ㅏ'],
      ['ㅁ', 'ㅏ'],
    ]);
  });

  it('받침을 포함해 분해한다', () => {
    expect(toJamoGroups('안녕')).toEqual([
      ['ㅇ', 'ㅏ', 'ㄴ'],
      ['ㄴ', 'ㅕ', 'ㅇ'],
    ]);
  });

  it('복합모음을 자모 단위로 분해한다', () => {
    expect(toJamoGroups('과')).toEqual([['ㄱ', 'ㅗ', 'ㅏ']]);
  });

  it('한글이 아닌 문자는 길이 1짜리 그룹으로 둔다', () => {
    expect(toJamoGroups('한 글')).toEqual([
      ['ㅎ', 'ㅏ', 'ㄴ'],
      [' '],
      ['ㄱ', 'ㅡ', 'ㄹ'],
    ]);
  });

  it('그룹을 평탄화하면 전체 disassemble 결과와 일치한다 (세션 인덱스 정합성)', () => {
    const items = ['아마', '안녕하세요', '과일', '한 글', '띄어 쓰기'];
    for (const item of items) {
      expect(toJamoGroups(item).flat().join('')).toBe(disassemble(item));
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/hangul/jamoGroups.test.ts`
Expected: FAIL — `Failed to resolve import "./jamoGroups"`

- [ ] **Step 3: Write minimal implementation**

`lib/hangul/jamoGroups.ts`:

```ts
import { disassemble } from 'es-hangul';

/**
 * 항목 문자열을 음절별 자모 그룹으로 분해한다.
 * 예: "아마" → [["ㅇ","ㅏ"], ["ㅁ","ㅏ"]]
 * 한글이 아닌 문자(공백, 문장부호)는 길이 1짜리 그룹으로 그대로 둔다.
 * useLessonSession 과 동일하게 글자 단위 disassemble 을 사용하므로
 * 평탄화한 인덱스가 세션의 typedJamoCount 와 1:1 대응한다.
 */
export function toJamoGroups(item: string): string[][] {
  return Array.from(item).map((ch) => disassemble(ch).split(''));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/hangul/jamoGroups.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/hangul/jamoGroups.ts lib/hangul/jamoGroups.test.ts
git commit -m "feat: 음절별 자모 그룹핑 유틸 toJamoGroups 추가"
```

---

### Task 2: 세션 훅에 `targetJamos` / `typedJamoCount` 노출

**Files:**
- Modify: `lib/session/useLessonSession.ts`
- Test: `lib/session/useLessonSession.test.tsx`

- [ ] **Step 1: Write the failing test**

`lib/session/useLessonSession.test.tsx`의 `describe('useLessonSession', ...)` 블록 안에 추가:

```tsx
  it('targetJamos 와 typedJamoCount 를 노출한다', () => {
    const { result } = renderHook(() =>
      useLessonSession({ items: ['과'], now: makeNow() }),
    );
    expect(result.current.targetJamos).toEqual(['ㄱ', 'ㅗ', 'ㅏ']);
    expect(result.current.typedJamoCount).toBe(0);

    act(() => result.current.handleKey('KeyR')); // ㄱ (맞음)
    expect(result.current.typedJamoCount).toBe(1);

    act(() => result.current.handleKey('KeyS')); // ㄴ (오타 — 진행 안 됨)
    expect(result.current.typedJamoCount).toBe(1);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/session/useLessonSession.test.tsx`
Expected: FAIL — `expected undefined to deeply equal [ 'ㄱ', 'ㅗ', 'ㅏ' ]`

- [ ] **Step 3: Write minimal implementation**

`lib/session/useLessonSession.ts` 수정 2곳.

`LessonSessionState` 인터페이스의 `nextCode` 필드 아래에 추가:

```ts
  /** 현재 항목의 자모 시퀀스 */
  targetJamos: string[];
  /** 맞게 입력된 자모 개수 (targetJamos 의 앞 몇 개가 완료됐는지) */
  typedJamoCount: number;
```

`return` 객체의 `nextCode,` 아래에 추가:

```ts
    targetJamos,
    typedJamoCount,
```

(둘 다 이미 훅 내부에 존재하는 `targetJamos` memo 와 `typedJamoCount` state — 노출만 추가, 로직 변경 없음)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/session/useLessonSession.test.tsx`
Expected: PASS (기존 테스트 포함 전부)

- [ ] **Step 5: Commit**

```bash
git add lib/session/useLessonSession.ts lib/session/useLessonSession.test.tsx
git commit -m "feat: 세션 훅에 targetJamos/typedJamoCount 노출"
```

---

### Task 3: JamoTrack 컴포넌트

**Files:**
- Create: `components/JamoTrack.tsx`
- Test: `components/JamoTrack.test.tsx`

- [ ] **Step 1: Write the failing test**

`components/JamoTrack.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JamoTrack } from './JamoTrack';

describe('JamoTrack', () => {
  it('음절별로 자모 칩을 순서대로 표시한다', () => {
    render(<JamoTrack item="아마" typedJamoCount={0} errorCount={0} />);
    const chips = screen.getAllByTestId(/^jamo-\d+$/);
    expect(chips.map((c) => c.textContent)).toEqual(['ㅇ', 'ㅏ', 'ㅁ', 'ㅏ']);
  });

  it('완료/현재/대기 상태를 data-state 로 구분한다', () => {
    render(<JamoTrack item="아마" typedJamoCount={1} errorCount={0} />);
    expect(screen.getByTestId('jamo-0')).toHaveAttribute('data-state', 'done');
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-state', 'current');
    expect(screen.getByTestId('jamo-2')).toHaveAttribute('data-state', 'todo');
    expect(screen.getByTestId('jamo-3')).toHaveAttribute('data-state', 'todo');
  });

  it('errorCount 가 증가하면 현재 칩이 플래시된다', () => {
    const { rerender } = render(
      <JamoTrack item="아마" typedJamoCount={1} errorCount={0} />,
    );
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-flash', 'false');

    rerender(<JamoTrack item="아마" typedJamoCount={1} errorCount={1} />);
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-flash', 'true');
  });

  it('처음 마운트될 때는 플래시하지 않는다 (누적 errorCount 가 있어도)', () => {
    render(<JamoTrack item="아마" typedJamoCount={1} errorCount={5} />);
    expect(screen.getByTestId('jamo-1')).toHaveAttribute('data-flash', 'false');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/JamoTrack.test.tsx`
Expected: FAIL — `Failed to resolve import "./JamoTrack"`

- [ ] **Step 3: Write minimal implementation**

`components/JamoTrack.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';
import { toJamoGroups } from '@/lib/hangul/jamoGroups';

interface Props {
  item: string;
  typedJamoCount: number;
  errorCount: number;
}

const STATE_CLASS = {
  done: 'border-emerald-600 text-emerald-500',
  current: 'border-amber-400 text-amber-300',
  todo: 'border-neutral-700 text-neutral-600',
} as const;

const FLASH_CLASS = 'border-red-500 bg-red-500/20 text-red-400';
const FLASH_MS = 300;

export function JamoTrack({ item, typedJamoCount, errorCount }: Props) {
  // 오타 플래시: errorCount 증가를 감지해 현재 칩을 잠깐 빨갛게.
  // 마운트 시점의 누적 errorCount 로는 플래시하지 않는다 (ref 초기값 = 첫 errorCount).
  const [flashing, setFlashing] = useState(false);
  const prevErrorRef = useRef(errorCount);

  useEffect(() => {
    if (errorCount > prevErrorRef.current) {
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), FLASH_MS);
      prevErrorRef.current = errorCount;
      return () => clearTimeout(t);
    }
    prevErrorRef.current = errorCount;
  }, [errorCount]);

  const groups = toJamoGroups(item);
  let jamoIndex = 0;

  return (
    <div data-testid="jamo-track" className="flex items-center gap-3">
      {groups.map((group, g) => (
        <div key={g} className="flex gap-1">
          {group.map((jamo) => {
            const idx = jamoIndex++;
            const state =
              idx < typedJamoCount ? 'done' : idx === typedJamoCount ? 'current' : 'todo';
            const flash = state === 'current' && flashing;
            return (
              <span
                key={idx}
                data-testid={`jamo-${idx}`}
                data-state={state}
                data-flash={flash}
                className={`inline-flex h-8 w-7 items-center justify-center rounded border text-base transition-colors ${
                  flash ? FLASH_CLASS : STATE_CLASS[state]
                }`}
              >
                {jamo}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/JamoTrack.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add components/JamoTrack.tsx components/JamoTrack.test.tsx
git commit -m "feat: 자모 칩 트랙 컴포넌트 JamoTrack 추가"
```

---

### Task 4: LessonPlayer 통합 + 전체 검증

**Files:**
- Modify: `app/lesson/[id]/LessonPlayer.tsx`

- [ ] **Step 1: LessonPlayer 에 JamoTrack 추가**

`app/lesson/[id]/LessonPlayer.tsx` 수정 2곳.

import 블록의 `import { TypingLine } ...` 아래에 추가:

```tsx
import { JamoTrack } from '@/components/JamoTrack';
```

JSX 에서 `<TypingLine ... />` 바로 아래에 추가:

```tsx
      <JamoTrack
        item={session.currentItem}
        typedJamoCount={session.typedJamoCount}
        errorCount={session.errorCount}
      />
```

- [ ] **Step 2: 전체 테스트 실행**

Run: `npm test`
Expected: 전체 PASS (기존 + 신규)

- [ ] **Step 3: 린트 + 빌드 확인**

Run: `npm run lint && npm run build`
Expected: 에러 없음

- [ ] **Step 4: 수동 확인 (dev server)**

`npm run dev`로 띄운 뒤 레슨 페이지에서:
1. 단어 아래 자모 칩이 음절별로 묶여 표시되는지
2. 맞는 키 입력 시 칩이 왼쪽부터 완료 색으로 바뀌고 커서가 이동하는지
3. 틀린 키 입력 시 현재 칩이 빨갛게 깜빡이는지
4. 항목 완성 시 다음 항목의 칩으로 리셋되는지

- [ ] **Step 5: Commit**

```bash
git add app/lesson/[id]/LessonPlayer.tsx
git commit -m "feat: 레슨 화면에 자모 칩 트랙 표시"
```
