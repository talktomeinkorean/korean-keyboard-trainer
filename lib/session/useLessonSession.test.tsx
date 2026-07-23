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
});
