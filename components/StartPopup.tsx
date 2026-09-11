/* eslint-disable @next/next/no-img-element -- 시안 그대로의 고정 크기 카드 아트라 최적화 파이프라인이 필요 없다. */

interface Props {
  onStart: () => void;
}

// 시안 카드를 2x(534x604)로 내보낸 것. 표시 크기(265x300)의 두 배라 레티나에서 1:1 로 찍힌다.
// pixelated 를 쓰지 않는 이유: 본문이 픽셀 아트가 아니라 안티에일리어싱된 글자·이모지라,
// 1x 화면에서 최근접 축소하면 얇은 격자선과 글자가 깨진다.
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
          alt="Find out your rank! Use your keyboard on desktop, or tap the keys on screen."
          className="absolute inset-0 h-full w-full"
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
