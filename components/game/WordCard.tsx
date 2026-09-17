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

/** 오타가 나면 카드 테두리를 이만큼 주황으로 보여준다 */
export const ERROR_FLASH_MS = 500;

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
  // 오타가 나면 카드 테두리가 잠깐 주황으로 바뀐다. 연달아 틀리면 그때부터 다시 센다.
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (errorCount > prevError.current) {
      setWrong(true);
      setFlash(true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(false), ERROR_FLASH_MS);
    } else if (typedJamoCount !== prevTyped.current) setWrong(false);
    prevError.current = errorCount;
    prevTyped.current = typedJamoCount;
  }, [errorCount, typedJamoCount]);
  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  return (
    // 시안 415:10739 — 250x149. Figma 좌표는 테두리 바깥 기준이라 여백은 테두리 1px 를 뺀 값이다.
    <div
      data-testid="word-card"
      data-error-flash={flash || undefined}
      className={`relative w-[250px] max-w-[calc(100%-2rem)] rounded-[2px] border bg-white/70 px-[4px] py-[19px] ${
        flash ? 'border-[#ff5e23]' : 'border-[#36454d]'
      }`}
    >
      {/* 문제 번호는 흐름 밖에 띄운다 — 단어 자리를 밀어내지 않는다 */}
      <p
        data-testid="word-counter"
        className="absolute top-[2.06px] right-[7.78px] text-right font-dunggeunmo text-[12px] leading-[1.8] text-[#36454d]/80"
      >
        {index}/{total}
      </p>

      <div className="flex flex-col items-center gap-[15px]">
        <div className="flex w-full flex-col text-center">
          {/* 친 글자는 진하게, 지금 칠 음절은 진하게 깜빡이고, 남은 글자는 흐리게.
              '동작 줄이기' 설정이면 깜빡이지 않는다.
              줄간격 1.8 에 아래 -10px — 시안대로 영어 뜻이 단어 줄에 살짝 겹친다. */}
          <p className="mb-[-10px] font-pretendard text-[30px] font-bold tracking-[3px] leading-[1.8]">
            <span data-testid="word-typed" className="text-[#36454d]">{done}</span>
            <span
              data-testid="word-current"
              className="text-[#36454d] animate-soft-pulse motion-reduce:animate-none"
            >
              {active}
            </span>
            <span data-testid="word-remaining" className="text-[#36454d]/50">{rest}</span>
          </p>

          {word.english && (
            <p
              data-testid="word-english"
              className="font-dmmono text-[14px] font-medium leading-[1.8] text-[#7d9fb2]"
            >
              {word.english}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-[5px]">
          {jamos.map((jamo, i) => {
            const state: ChipState =
              i < typedCount ? 'correct' : i === typedCount && wrong ? 'wrong' : 'todo';
            return (
              <span
                key={i}
                data-testid={`syllable-jamo-${i}`}
                data-state={state}
                className={`flex size-[25px] items-center justify-center rounded-[5px] border-[0.75px] font-dmsans text-[16px] font-normal ${CHIP_STATE[state]}`}
              >
                {jamo}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
