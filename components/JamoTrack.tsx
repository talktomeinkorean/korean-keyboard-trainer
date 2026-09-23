import { currentSyllableJamos } from '@/lib/hangul/jamoGroups';
import { useErrorFlash } from '@/lib/game/useErrorFlash';

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

  // 오타 표시는 레이스 단어 카드와 같은 규칙 — 틀린 자리에 머물러 있는 동안만 칠한다
  const { wrongHere } = useErrorFlash(errorCount, `${item}:${typedJamoCount}`);

  return (
    <div data-testid="jamo-track" className="flex items-center gap-[5px]">
      {jamos.map((jamo, i) => {
        const state = i < typedCount ? 'correct' : i === typedCount && wrongHere ? 'wrong' : 'todo';
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
