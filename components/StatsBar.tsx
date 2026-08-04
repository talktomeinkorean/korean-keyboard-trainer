interface Props {
  wpm: number;
  accuracy: number;
  index: number;
  total: number;
  /** 경과 시간(초) — 긴 글 연습의 실시간 통계용. 없으면 시간 셀 생략 */
  elapsedSec?: number;
}

export function StatsBar({ wpm, accuracy, index, total, elapsedSec }: Props) {
  return (
    <div className="flex gap-6 text-sm">
      {elapsedSec !== undefined && (
        <div><b className="block text-xl tabular-nums">{elapsedSec.toFixed(0)}s</b>time</div>
      )}
      <div><b className="block text-xl text-blue-500">{wpm}</b>keys/min</div>
      <div><b className="block text-xl text-emerald-500">{accuracy}%</b>accuracy</div>
      <div><b className="block text-xl">{index}/{total}</b>progress</div>
    </div>
  );
}
