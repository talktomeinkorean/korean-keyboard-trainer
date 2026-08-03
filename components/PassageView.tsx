'use client';

import { useEffect, useRef } from 'react';
import { splitByJamoProgress } from '@/lib/hangul/jamoGroups';

interface Props {
  /** 지문의 줄들 (레슨 items) */
  lines: string[];
  /** 현재 입력 중인 줄 인덱스 */
  currentIndex: number;
  /** 현재 줄에서 맞게 입력된 자모 개수 */
  typedJamoCount: number;
}

/**
 * 긴 글 연습용 지문 전체 뷰 (한컴타자 장문연습 참고).
 * 완료 줄은 체크, 현재 줄은 강조 + 아래 입력 줄, 대기 줄은 흐리게.
 */
export function PassageView({ lines, currentIndex, typedJamoCount }: Props) {
  const currentRef = useRef<HTMLDivElement>(null);

  // 진행에 따라 현재 줄을 화면 중앙으로 (jsdom 등 미지원 환경 대비 옵셔널)
  useEffect(() => {
    currentRef.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }, [currentIndex]);

  const { done, current, todo } = splitByJamoProgress(lines[currentIndex] ?? '', typedJamoCount);

  return (
    <div className="w-full max-w-xl max-h-72 overflow-y-auto flex flex-col gap-1 px-2">
      {lines.map((line, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'todo';
        return (
          <div
            key={i}
            ref={state === 'current' ? currentRef : undefined}
            data-testid={`passage-line-${i}`}
            data-state={state}
          >
            {state === 'done' && (
              <p className="px-3 py-1.5 text-neutral-400">
                {line} <span className="text-emerald-500">✓</span>
              </p>
            )}
            {state === 'current' && (
              <>
                <p className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 font-medium">
                  {line}
                </p>
                <p data-testid="passage-input" className="px-3 py-1.5 tracking-wide">
                  <span data-testid="passage-input-done" className="text-emerald-500">{done}</span>
                  <span
                    data-testid="passage-caret"
                    aria-hidden
                    className="inline-block w-0.5 h-[1em] align-middle bg-blue-500 animate-caret-blink"
                  />
                  <span data-testid="passage-input-current" className="text-amber-500">{current}</span>
                  <span className="sr-only">{todo}</span>
                </p>
              </>
            )}
            {state === 'todo' && <p className="px-3 py-1.5 text-neutral-600">{line}</p>}
          </div>
        );
      })}
    </div>
  );
}
