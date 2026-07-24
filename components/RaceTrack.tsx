interface Props {
  /** 완성한 단어 수 */
  progress: number;
  /** 전체 단어 수 */
  total: number;
}

/**
 * 레이스 트랙 플레이스홀더 — 디자인 확정 시 이 컴포넌트만 교체한다.
 * 출발~total-1 구간 + 결승선 칸으로 구성, 러너는 progress 칸에 위치.
 */
export function RaceTrack({ progress, total }: Props) {
  const cells = Array.from({ length: total + 1 }, (_, i) => i);
  return (
    <div data-testid="race-track" className="flex w-full max-w-md items-end gap-1">
      {cells.map((i) => {
        const isFinish = i === total;
        return (
          <div
            key={i}
            data-testid={`race-cell-${i}`}
            className={`relative flex h-12 flex-1 items-center justify-center rounded border-b-4 ${
              i <= progress ? 'border-b-blue-400 bg-blue-500/10' : 'border-b-neutral-700'
            }`}
          >
            {i === progress && (
              <span data-testid="race-runner" className="text-2xl" aria-label="runner">
                🏃
              </span>
            )}
            {isFinish && i !== progress && <span className="text-2xl">🏁</span>}
            {isFinish && i === progress && (
              <span className="absolute -top-3 text-sm">🏁</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
