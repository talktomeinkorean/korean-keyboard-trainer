/* eslint-disable @next/next/no-img-element -- 시안 그대로의 고정 크기 픽셀 아트라 최적화 파이프라인이 필요 없다. */

interface Props {
  onStart: () => void;
}

const POPUP_SRC = '/race/popup-start.webp';

// 카드(265x300) 안에서 Game Start 버튼이 차지하는 비율 — 시안 좌표 기준.
// 이미지 크기가 바뀌어도 비율이 유지되도록 %로 배치한다.
const BTN = { width: '75.5%', height: '13.3%', bottom: '8.75%' };

/**
 * 게임 시작 팝업. 카드 본문(제목·안내)은 시안 이미지를 그대로 쓰고,
 * Game Start 버튼만 실제 버튼으로 겹쳐 놓는다.
 */
export function StartPopup({ onStart }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#36454d]/70 backdrop-blur-[10px]">
      <div className="relative w-[265px] max-w-[85vw] aspect-[265/300]">
        <img
          src={POPUP_SRC}
          alt="Find out your rank! Type Korean words to reach the finish line. Turn the Key Guide on or off anytime."
          className="absolute inset-0 h-full w-full"
          style={{ imageRendering: 'pixelated' }}
        />
        <button
          type="button"
          onClick={onStart}
          autoFocus
          style={BTN}
          className="absolute left-1/2 -translate-x-1/2 rounded-[2px] border border-[#36454d] bg-[#8ceb97]
                     font-dmmono text-[15px] text-[#36454d]
                     shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2),inset_0_2px_0_0_rgba(255,255,255,0.5)]
                     transition active:translate-y-px hover:brightness-105"
        >
          Game Start
        </button>
      </div>
    </div>
  );
}
