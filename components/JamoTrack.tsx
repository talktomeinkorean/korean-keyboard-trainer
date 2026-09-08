import { useEffect, useRef, useState } from 'react';
import { currentSyllableJamos } from '@/lib/hangul/jamoGroups';

interface Props {
  item: string;
  typedJamoCount: number;
  errorCount: number;
}

/**
 * 지금 치고 있는 음절의 자모 칩 (시안 519:13449).
 * 레이스 단어 카드와 같은 3상태 — 맞음 / 틀림 / 아직 안 침.
 */
const CHIP_STATE = {
  correct: 'bg-[#eae5ff] border-[#8166ff] text-[#8166ff]',
  wrong: 'bg-[#ffece5] border-[#ff5e23] text-[#ff5e23]',
  todo: 'bg-white border-[#8166ff] text-[#8166ff]',
} as const;

export function JamoTrack({ item, typedJamoCount, errorCount }: Props) {
  const { jamos, typedCount } = currentSyllableJamos(item, typedJamoCount);

  // 오타가 나면 지금 칠 칩을 틀림으로 두고, 올바른 입력으로 넘어가면 해제한다.
  // 마운트 시점의 누적 errorCount 로는 표시하지 않는다.
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
    <div data-testid="jamo-track" className="flex items-center gap-[5px]">
      {jamos.map((jamo, i) => {
        const state = i < typedCount ? 'correct' : i === typedCount && wrong ? 'wrong' : 'todo';
        return (
          <span
            key={i}
            data-testid={`jamo-${i}`}
            data-state={state}
            className={`inline-flex size-[25px] items-center justify-center rounded-[5px] border-[0.75px] font-dmsans text-[16px] transition-colors ${CHIP_STATE[state]}`}
          >
            {jamo}
          </span>
        );
      })}
    </div>
  );
}
