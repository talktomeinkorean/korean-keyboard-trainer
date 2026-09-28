/**
 * 연습 진행 바 (시안 597:5948) — 트랙 위를 달리는 캐릭터가 진행도를 가리킨다.
 * 스프라이트 시트는 레이스 화면과 같은 것을 쓰되 30px 로 줄여 쓴다.
 */
const RUN_SHEET_SRC = '/race/run_sheet.webp';
const SPRITE = 30;

/**
 * 캐릭터의 가로 위치 — 채워진 끝을 몸 가운데로 짚는다.
 * 왼쪽 끝을 맞추면 진행보다 앞서 달리는 것처럼 보인다.
 * 양 끝에서는 트랙 밖으로 나가지 않도록 붙잡아 둔다.
 */
export function runnerLeft(ratio: number, sprite = SPRITE): string {
  return `clamp(0px, calc(${ratio * 100}% - ${sprite / 2}px), calc(100% - ${sprite}px))`;
}

interface Props {
  /** 완료한 항목 수 */
  done: number;
  total: number;
  /** 타이핑 중일 때만 달린다 */
  running: boolean;
}

export function PracticeProgress({ done, total, running }: Props) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, done / total)) : 0;

  return (
    <div
      data-testid="practice-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      className="relative h-[38px] w-[330px] max-w-full shrink-0"
    >
      <div
        aria-hidden
        data-testid="practice-progress-runner"
        className="absolute top-0 bg-no-repeat transition-[left] duration-300"
        style={{
          width: SPRITE,
          height: SPRITE,
          left: runnerLeft(ratio),
          backgroundImage: `url(${RUN_SHEET_SRC})`,
          backgroundSize: `${SPRITE * 4}px ${SPRITE}px`,
          animation: running ? 'sprite-run-sm 0.5s steps(4) infinite' : undefined,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[6.6px] rounded-full bg-[#dfd9ff]">
        <div
          className="h-full rounded-full bg-[#9680ff] transition-[width] duration-300"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
