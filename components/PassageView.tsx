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
 * 긴 글 연습용 3줄 창 뷰 — 이전(완료)/현재(강조+입력 줄)/다음(대기)만 보여준다.
 * 진행하면 창이 한 줄씩 내려가므로 스크롤이 없다.
 */
export function PassageView({ lines, currentIndex, typedJamoCount }: Props) {
  const { done, current } = splitByJamoProgress(lines[currentIndex] ?? '', typedJamoCount);
  const windowIndices = [currentIndex - 1, currentIndex, currentIndex + 1];

  return (
    <div className="w-full max-w-xl min-h-48 flex flex-col justify-center gap-2 px-2">
      {windowIndices.map((i) => {
        if (i < 0 || i >= lines.length) {
          // 첫/마지막 줄에서도 현재 줄이 가운데 오도록 자리를 유지한다
          return <div key={i} aria-hidden className="h-9" />;
        }
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'todo';
        return (
          <div key={i} data-testid={`passage-line-${i}`} data-state={state}>
            {state === 'done' && (
              <p className="px-4 py-1.5 text-neutral-500 truncate">
                {lines[i]} <span className="text-emerald-500">✓</span>
              </p>
            )}
            {state === 'current' && (
              <div className="rounded-xl bg-amber-500/10 border-l-4 border-amber-400 px-4 py-2">
                <p className="text-xl font-medium">{lines[i]}</p>
                <p data-testid="passage-input" className="mt-1 min-h-6 tracking-wide">
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
              <p className="px-4 py-1.5 text-neutral-600 opacity-70 truncate">{lines[i]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
