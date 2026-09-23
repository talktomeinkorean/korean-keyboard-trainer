/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
import { formatRaceTime } from '@/lib/game/raceWord';

interface Props {
  elapsedMs: number;
  muted: boolean;
  onToggleMuted: () => void;
  /** 나가기 — 바로 이동하지 않고 확인 팝업을 연다 */
  onExit: () => void;
}

// 시안 320:22623 — 원은 40px 이고 아이콘 크기는 그대로다. 원이 줄어든 만큼 아이콘이 커 보인다.
const ROUND_BTN =
  'flex size-[40px] shrink-0 items-center justify-center rounded-full border-[0.75px] ' +
  'border-[#36454d] bg-white shadow-[0px_2.5px_5px_-2.5px_rgba(0,0,0,0.1)]';

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
        className={ROUND_BTN}
      >
        {/* 음소거는 별도 아이콘(스피커+X), 켜짐은 스피커+음파 조합 */}
        {muted ? (
          <img
            src="/race/icons/sound-off.svg"
            alt=""
            aria-hidden
            data-testid="sound-icon-off"
            className="h-[15px] w-[20px]"
          />
        ) : (
          <span className="flex items-center gap-[4px]" aria-hidden data-testid="sound-icon-on">
            <img src="/race/icons/sound-body.svg" alt="" className="h-[15px] w-[9px]" />
            <img src="/race/icons/sound-waves.svg" alt="" className="h-[10px] w-[5px]" />
          </span>
        )}
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

      <button type="button" onClick={onExit} aria-label="Exit game" data-testid="exit-button" className={ROUND_BTN}>
        <img src="/race/icons/exit.svg" alt="" className="h-[12px] w-[13px]" aria-hidden />
      </button>
    </div>
  );
}
