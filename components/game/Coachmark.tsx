'use client';

/** 시안 안내 오버레이 — 폰용(393x850)과 PC용(1920x1080)을 2x 로 내보낸 것 */
const MOBILE_SRC = '/race/coachmark-mobile.webp';
const DESKTOP_SRC = '/race/coachmark-desktop.webp';

const ALT =
  'Type the word shown. The letter chips are a hint if you need it. To start, tap the first letter or press it on your keyboard.';

interface Props {
  onClose: () => void;
}

/**
 * 첫 판 시작 직후 한 번만 뜨는 조작 안내.
 *
 * 이미지 안에 카드·키보드 그림이 함께 들어 있어(시안 그대로) 실제 화면 위에 덮어 쓴다.
 * 시안의 어두운 막은 지워서 뒤 게임 화면이 그대로 비친다 — 안내 문구와 그림만 얹힌다.
 * 화면 비율이 시안과 달라도 잘리기만 하도록 cover 로 채운다.
 */
export function Coachmark({ onClose }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Close the guide"
      data-testid="coachmark"
      onClick={onClose}
      onKeyDown={(e) => {
        // 스페이스·엔터는 물론 게임 키를 눌러도 안내를 닫는다 (바로 치고 싶은 사람)
        e.preventDefault();
        onClose();
      }}
      className="fixed inset-0 z-[70] cursor-pointer"
    >
      <picture>
        <source media="(min-width: 640px)" srcSet={DESKTOP_SRC} />
        <img src={MOBILE_SRC} alt={ALT} className="h-full w-full object-cover" />
      </picture>
      <p className="pointer-events-none absolute inset-x-0 bottom-[24px] text-center font-dmmono text-[13px] text-[#8ceb97]">
        Tap anywhere to continue
      </p>
    </div>
  );
}
