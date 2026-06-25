'use client';

import { useMemo, useRef, useState, useCallback } from 'react';
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
  /** 현재 항목에서 사용자가 입력한 표시 문자열 (진행 중인 음절은 대상 글자로 표시) */
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

/**
 * 현재까지 올바르게 입력된 자모 개수를 바탕으로 target 항목에서 몇 글자까지
 * 표시할지 계산한다.
 * 진행 중인 음절은 target 글자 전체를 보여준다 (IME 미리보기 방식).
 */
function computeTyped(target: string, typedJamoCount: number): string {
  if (typedJamoCount === 0) return '';
  let completedChars = 0;
  let consumedJamos = 0;
  for (let i = 0; i < target.length; i++) {
    const charJamos = disassemble(target[i]).split('');
    const nextConsumed = consumedJamos + charJamos.length;
    if (nextConsumed <= typedJamoCount) {
      consumedJamos = nextConsumed;
      completedChars = i + 1;
    } else {
      // This char is partially typed — show it as in-progress
      return target.slice(0, completedChars) + target[i];
    }
  }
  // All chars completed
  return target.slice(0, completedChars);
}

export function useLessonSession({ items, now = () => Date.now() }: Options): LessonSessionState {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  // Track typed jamo count in state so nextCode and typed re-render correctly
  const [typedJamoCount, setTypedJamoCount] = useState(0);

  const composerRef = useRef(createComposer());
  const startRef = useRef<number | null>(null);
  const endRef = useRef<number | null>(null);

  // Keep refs in sync with state so handleKey closure always reads latest values
  const indexRef = useRef(index);
  indexRef.current = index;
  const isCompleteRef = useRef(isComplete);
  isCompleteRef.current = isComplete;
  const nowRef = useRef(now);
  nowRef.current = now;

  const currentItem = items[index] ?? '';

  // 타깃 항목을 자모 시퀀스로 분해
  const targetJamos = useMemo(() => disassemble(currentItem).split(''), [currentItem]);

  const nextCode = useMemo(() => {
    const nextJamo = targetJamos[typedJamoCount];
    if (!nextJamo) return null;
    return keyByJamo(nextJamo)?.code ?? null;
  }, [targetJamos, typedJamoCount]);

  const handleKey = useCallback((code: string) => {
    if (isCompleteRef.current) return;
    const key = keyByCode(code);
    if (!key) return; // 매핑 안 된 키 무시

    const nowFn = nowRef.current;
    if (startRef.current === null) startRef.current = nowFn();
    setKeystrokes((k) => k + 1);

    const currentIdx = indexRef.current;
    const target = items[currentIdx] ?? '';
    // Disassemble target at call time (not from stale closure)
    const tJamos = disassemble(target).split('');

    const composer = composerRef.current;
    composer.push(key.jamo);
    const typedJamos = composer.jamos();
    const count = typedJamos.length;

    // Check if typed jamos are a prefix of target jamos
    const isPrefix = tJamos.slice(0, count).every((j, i) => j === typedJamos[i]);

    if (isPrefix) {
      setTypedJamoCount(count);
      // Show in-progress syllable as the full target character (IME preview style)
      setTyped(computeTyped(target, count));
      if (count === tJamos.length) {
        // 항목 완성
        composer.reset();
        setTypedJamoCount(0);
        if (currentIdx + 1 >= items.length) {
          endRef.current = nowFn();
          setIsComplete(true);
        } else {
          setIndex(currentIdx + 1);
          setTyped('');
        }
      }
    } else {
      // 오타 — 롤백 (typed 와 typedJamoCount 는 변경하지 않음)
      composer.pop();
      setErrorCount((e) => e + 1);
    }
  }, [items]);

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
