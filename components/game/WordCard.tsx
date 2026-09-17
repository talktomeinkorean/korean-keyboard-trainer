'use client';

import { useEffect, useRef, useState } from 'react';
import { splitByJamoProgress, currentSyllableJamos } from '@/lib/hangul/jamoGroups';
import type { RaceWord } from '@/lib/game/raceWord';

interface Props {
  word: RaceWord;
  typedJamoCount: number;
  /** 현재 문제 번호 (1부터) */
  index: number;
  total: number;
  /** 누적 오타 수 — 늘어나면 지금 칠 자모를 '틀렸을 때'로 표시한다 */
  errorCount?: number;
}

/** 시안의 자모음 블럭 3가지 상태 */
const CHIP_STATE = {
  correct: 'bg-[#eae5ff] border-[#8166ff] text-[#8166ff]',
  wrong: 'bg-[#ffece5] border-[#ff5e23] text-[#ff5e23]',
  todo: 'bg-white border-[#8166ff] text-[#8166ff]',
} as const;

type ChipState = keyof typeof CHIP_STATE;

/**
 * 배경 씬 위에 겹치는 단어 카드 — 문제 번호, 한글 단어(입력 진행에 따라 진하기 구분),
 * 영어 뜻, 그리고 지금 치고 있는 음절의 자모 칩을 보여준다.
 */
export function WordCard({ word, typedJamoCount, index, total, errorCount = 0 }: Props) {
  const { done, current, todo } = splitByJamoProgress(word.korean, typedJamoCount);
  // 지금 칠 음절 — 조합 중이면 그 글자, 아니면 다음 글자
  const active = current || todo.slice(0, 1);
  const rest = current ? todo : todo.slice(1);
  const { jamos, typedCount } = currentSyllableJamos(word.korean, typedJamoCount);

  // 오타가 나면 표시했다가, 올바른 입력으로 진행하면 해제한다.
  const [wrong, setWrong] = useState(false);
  const prevError = useRef(errorCount);
  const prevTyped = useRef(typedJamoCount);
  useEffect(() => {
    if (errorCount > prevError.current) setWrong(true);
    else if (typedJamoCount !== prevTyped.current) setWrong(false);
    prevError.current = errorCount;
    prevTyped.current = typedJamoCount;
  }, [errorCount, typedJamoCount]);

  return (
    <div
      data-testid="word-card"
      className="w-[250px] max-w-[calc(100%-2rem)] rounded-b-[2px] border border-[#36454d] bg-white/70 px-[5px] pt-[5px] pb-[20px]"
    >
      <p
        data-testid="word-counter"
        className="pr-[5px] text-right font-pixel text-[15px] text-[#36454d]/80"
      >
        {index}/{total}
      </p>

      <p className="text-center text-[30px] font-bold tracking-[3px] leading-[1.4]">
        {/* 친 글자는 진하게, 지금 칠 음절은 진하게 깜빡이고, 남은 글자는 흐리게.
            '동작 줄이기' 설정이면 깜빡이지 않는다. */}
        <span data-testid="word-typed" className="text-[#36454d]">{done}</span>
        <span
          data-testid="word-current"
          className="text-[#36454d] animate-soft-pulse motion-reduce:animate-none"
        >
          {active}
        </span>
        <span data-testid="word-remaining" className="text-[#36454d]/40">{rest}</span>
      </p>

      {word.english && (
        <p data-testid="word-english" className="text-center font-pixel text-[15px] text-[#36454d]/80">
          {word.english}
        </p>
      )}

      <div className="mt-[10px] flex items-center justify-center gap-[5px]">
        {jamos.map((jamo, i) => {
          const state: ChipState =
            i < typedCount ? 'correct' : i === typedCount && wrong ? 'wrong' : 'todo';
          return (
            <span
              key={i}
              data-testid={`syllable-jamo-${i}`}
              data-state={state}
              className={`flex h-[29px] w-[25px] items-center justify-center rounded-[5px] border-[0.75px] text-[16px] font-bold ${CHIP_STATE[state]}`}
            >
              {jamo}
            </span>
          );
        })}
      </div>
    </div>
  );
}
