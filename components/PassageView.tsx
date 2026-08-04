import { splitByJamoProgress } from '@/lib/hangul/jamoGroups';

interface Props {
  /** 지문의 줄들 (레슨 items) */
  lines: string[];
  /** 현재 입력 중인 줄 인덱스 */
  currentIndex: number;
  /** 현재 줄에서 맞게 입력된 자모 개수 */
  typedJamoCount: number;
}

// 행 높이를 고정해야 translateY 슬라이드 오프셋이 정확하다
const ROW_PX = 72;
const GAP_PX = 8;
const STEP_PX = ROW_PX + GAP_PX;

/**
 * 긴 글 연습용 3줄 창 뷰 — 전체 줄을 쌓아두고 컨테이너를 translateY 로 이동시켜,
 * 줄 완성 시 이전 줄이 위로 밀려 올라가는 슬라이드 전환을 만든다.
 * 뷰포트(3행 높이) 밖의 줄은 overflow 로 가려진다.
 */
export function PassageView({ lines, currentIndex, typedJamoCount }: Props) {
  const { done, current } = splitByJamoProgress(lines[currentIndex] ?? '', typedJamoCount);
  // 현재 줄이 항상 가운데(2번째 행)에 오도록 창을 이동
  const offsetPx = (currentIndex - 1) * STEP_PX;

  return (
    <div
      className="w-full max-w-xl overflow-hidden px-2"
      style={{ height: ROW_PX * 3 + GAP_PX * 2 }}
    >
      <div
        data-testid="passage-column"
        className="flex flex-col transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ gap: GAP_PX, transform: `translateY(${-offsetPx}px)` }}
      >
        {lines.map((line, i) => {
          const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'todo';
          return (
            <div
              key={i}
              data-testid={`passage-line-${i}`}
              data-state={state}
              style={{ height: ROW_PX }}
              className="flex flex-col justify-center"
            >
              {state === 'done' && (
                <p className="px-4 text-neutral-500 truncate">
                  {line} <span className="text-emerald-500">✓</span>
                </p>
              )}
              {state === 'current' && (
                <div className="h-full rounded-xl bg-amber-500/10 border-l-4 border-amber-400 px-4 flex flex-col justify-center">
                  <p className="text-lg font-medium leading-snug truncate">{line}</p>
                  <p data-testid="passage-input" className="leading-snug tracking-wide truncate">
                    <span data-testid="passage-input-done" className="text-emerald-500">{done}</span>
                    <span
                      data-testid="passage-caret"
                      aria-hidden
                      className="inline-block w-0.5 h-[1em] align-middle bg-blue-500 animate-caret-blink"
                    />
                    <span data-testid="passage-input-current" className="text-amber-500">{current}</span>
                  </p>
                </div>
              )}
              {state === 'todo' && (
                <p className="px-4 text-neutral-600 opacity-70 truncate">{line}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
