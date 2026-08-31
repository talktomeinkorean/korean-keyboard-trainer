/* eslint-disable @next/next/no-img-element -- 시안에서 내보낸 고정 크기 아이콘이라 최적화가 필요 없다. */
import Link from 'next/link';
import { PIXEL_BUTTON } from './pixelButton';

interface Props {
  /** 팝업 닫기 (게임으로 복귀) */
  onClose: () => void;
  /** 새 단어로 다시 시작 */
  onRestart: () => void;
}

/** 게임 중 나가기 버튼을 눌렀을 때 뜨는 팝업. */
export function ExitPopup({ onClose, onRestart }: Props) {
  return (
    <div
      data-testid="exit-popup"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#36454d]/70 backdrop-blur-[10px]"
    >
      <div className="relative w-[265px] max-w-[85vw] overflow-hidden rounded-[2px] border border-[#36454d] bg-white">
        {/* 상단 진한 바 + 닫기 */}
        <div className="flex h-[40px] items-center justify-end bg-[#36454d]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-testid="exit-popup-close"
            className="flex size-[40px] items-center justify-center"
          >
            <img src="/race/icons/close.svg" alt="" aria-hidden className="size-[9px]" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-[10px] px-[30px] py-[25px]">
          <button
            type="button"
            onClick={onRestart}
            data-testid="exit-restart"
            className={`${PIXEL_BUTTON} w-[200px] max-w-full`}
          >
            Restart
          </button>
          <Link href="/lessons" data-testid="exit-practice" className={`${PIXEL_BUTTON} w-[200px] max-w-full`}>
            Practice Typing
          </Link>
          <Link href="/" data-testid="exit-home" className={`${PIXEL_BUTTON} w-[200px] max-w-full`}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
