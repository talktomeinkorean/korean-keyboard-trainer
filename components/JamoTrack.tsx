import { useEffect, useRef, useState } from 'react';
import { toJamoGroups } from '@/lib/hangul/jamoGroups';

interface Props {
  item: string;
  typedJamoCount: number;
  errorCount: number;
}

/**
 * 자모 칩 — 레이스의 단어 카드와 같은 3가지 상태다.
 * 맞음(보라 채움) / 틀림(주황 채움) / 아직 안 침(흰 바탕에 보라 테두리).
 */
const CHIP_STATE = {
  correct: 'bg-[#eae5ff] border-[#8166ff] text-[#8166ff]',
  wrong: 'bg-[#ffece5] border-[#ff5e23] text-[#ff5e23]',
  todo: 'bg-white border-[#8166ff] text-[#8166ff]',
} as const;

export function JamoTrack({ item, typedJamoCount, errorCount }: Props) {
  // 오타가 나면 지금 칠 칩을 틀림으로 두고, 올바른 입력으로 넘어가면 해제한다.
  // 마운트 시점의 누적 errorCount 로는 표시하지 않는다 (ref 초기값 = 첫 errorCount).
  const [wrong, setWrong] = useState(false);
  const prevError = useRef(errorCount);
  const prevTyped = useRef(typedJamoCount);

  useEffect(() => {
    if (errorCount > prevError.current) setWrong(true);
    else if (typedJamoCount !== prevTyped.current) setWrong(false);
    prevError.current = errorCount;
    prevTyped.current = typedJamoCount;
  }, [errorCount, typedJamoCount]);

  const groups = toJamoGroups(item);
  let jamoIndex = 0;

  return (
    <div data-testid="jamo-track" className="flex items-center gap-3">
      {groups.map((group, g) => (
        <div key={g} className="flex gap-1">
          {group.map((jamo) => {
            const idx = jamoIndex++;
            const state =
              idx < typedJamoCount ? 'correct' : idx === typedJamoCount && wrong ? 'wrong' : 'todo';
            return (
              <span
                key={idx}
                data-testid={`jamo-${idx}`}
                data-state={state}
                className={`inline-flex h-8 w-7 items-center justify-center rounded border text-base transition-colors ${CHIP_STATE[state]}`}
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
