/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
import { formatRaceTime } from '@/lib/game/raceWord';

interface Props {
  elapsedMs: number;
  muted: boolean;
  onToggleMuted: () => void;
  /** 나가기 — 바로 이동하지 않고 확인 팝업을 연다 */
  onExit: () => void;
}

/**
 * 상단 원형 버튼 — 흰 원·테두리·그림자·아이콘이 한 장의 SVG 에 들어 있다 (시안 320:22623).
 * 캔버스 46px 안에 원이 40px 로 들어앉아 있고(왼쪽 2.75 · 오른쪽 3.25 · 위 0.75), 남는 자리는 그림자 몫이다.
 * 음수 여백으로 그 치우침을 상쇄해 원이 시안 좌표(좌우 24px)에 놓이게 한다.
 */
const ROUND_BTN = 'block size-[46px] shrink-0 -my-[0.75px]';

export function GameTopBar({ elapsedMs, muted, onToggleMuted, onExit }: Props) {
  return (
    // 시안은 393 화면에 좌우 24px 여백 — 안쪽 폭 345px
    <div className="flex w-full max-w-[345px] items-center justify-between">
      <button
        type="button"
        onClick={onToggleMuted}
        data-testid="sound-toggle"
        aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
        aria-pressed={muted}
        className={`${ROUND_BTN} -ml-[2.75px]`}
      >
        <img
          src={muted ? '/race/icons/btn-sound-off.svg' : '/race/icons/btn-sound-on.svg'}
          alt=""
          aria-hidden
          data-testid={muted ? 'sound-icon-off' : 'sound-icon-on'}
          className="size-full"
        />
      </button>

      <div className="flex items-center gap-[13px]">
        <img src="/race/icons/hourglass.svg" alt="" className="h-[24px] w-[15px]" aria-hidden />
        <span
          data-testid="race-timer"
          // leading-none: 줄 상자(45px)가 40px 버튼보다 높아 줄 전체를 2.5px 내려 앉혔다
          className="font-vt323 text-[30px] leading-none tabular-nums text-[#36454d]"
        >
          {formatRaceTime(elapsedMs)}
        </span>
      </div>

      <button
        type="button"
        onClick={onExit}
        aria-label="Exit game"
        data-testid="exit-button"
        className={`${ROUND_BTN} -mr-[3.25px]`}
      >
        <img src="/race/icons/btn-exit.svg" alt="" aria-hidden className="size-full" />
      </button>
    </div>
  );
}
