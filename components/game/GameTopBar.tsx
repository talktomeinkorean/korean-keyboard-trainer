/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
import Link from 'next/link';
import { formatRaceTime } from '@/lib/game/raceWord';

interface Props {
  elapsedMs: number;
  muted: boolean;
  onToggleMuted: () => void;
}

const ROUND_BTN =
  'flex size-[50px] shrink-0 items-center justify-center rounded-full border-[0.75px] ' +
  'border-[#36454d] bg-white shadow-[0px_2.5px_5px_-2.5px_rgba(0,0,0,0.1)]';

export function GameTopBar({ elapsedMs, muted, onToggleMuted }: Props) {
  return (
    <div className="flex w-full max-w-[347px] items-center justify-between">
      <button
        type="button"
        onClick={onToggleMuted}
        data-testid="sound-toggle"
        aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
        aria-pressed={muted}
        className={ROUND_BTN}
      >
        <span className="relative flex items-center gap-[4px]" aria-hidden>
          <img src="/race/icons/sound-body.svg" alt="" className="h-[15px] w-[9px]" />
          {!muted && (
            <img src="/race/icons/sound-waves.svg" alt="" className="h-[10px] w-[5px]" />
          )}
        </span>
      </button>

      <div className="flex items-center gap-[13px]">
        <img src="/race/icons/hourglass.svg" alt="" className="h-[24px] w-[15px]" aria-hidden />
        <span
          data-testid="race-timer"
          className="font-pixel text-[20px] tabular-nums text-[#36454d]"
        >
          {formatRaceTime(elapsedMs)}
        </span>
      </div>

      <Link href="/" aria-label="Exit game" className={ROUND_BTN}>
        <img src="/race/icons/exit.svg" alt="" className="h-[12px] w-[13px]" aria-hidden />
      </Link>
    </div>
  );
}
