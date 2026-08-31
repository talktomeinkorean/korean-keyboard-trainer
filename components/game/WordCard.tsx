import { splitByJamoProgress, currentSyllableJamos } from '@/lib/hangul/jamoGroups';
import type { RaceWord } from '@/lib/game/raceWord';

interface Props {
  word: RaceWord;
  typedJamoCount: number;
  /** 현재 문제 번호 (1부터) */
  index: number;
  total: number;
}

/**
 * 배경 씬 위에 겹치는 단어 카드 — 문제 번호, 한글 단어(입력 진행에 따라 진하기 구분),
 * 영어 뜻, 그리고 지금 치고 있는 음절의 자모 칩을 보여준다.
 */
export function WordCard({ word, typedJamoCount, index, total }: Props) {
  const { done, current, todo } = splitByJamoProgress(word.korean, typedJamoCount);
  const { jamos, typedCount } = currentSyllableJamos(word.korean, typedJamoCount);

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
        {/* 입력이 끝났거나 진행 중인 글자는 진하게, 아직 안 친 글자는 흐리게 */}
        <span data-testid="word-typed" className="text-[#36454d]">{done + current}</span>
        <span data-testid="word-remaining" className="text-[#36454d]/40">{todo}</span>
      </p>

      {word.english && (
        <p data-testid="word-english" className="text-center font-pixel text-[15px] text-[#36454d]/80">
          {word.english}
        </p>
      )}

      <div className="mt-[10px] flex items-center justify-center gap-[7px]">
        {jamos.map((jamo, i) => {
          const typed = i < typedCount;
          return (
            <span
              key={i}
              data-testid={`syllable-jamo-${i}`}
              data-typed={typed}
              className={`flex h-[29px] w-[25px] items-center justify-center rounded-[5px] border-[0.75px] bg-white text-[16px] font-bold ${
                typed ? 'border-[#ff5e23] text-[#ff5e23]' : 'border-[#36454d] text-[#36454d]'
              }`}
            >
              {jamo}
            </span>
          );
        })}
      </div>
    </div>
  );
}
